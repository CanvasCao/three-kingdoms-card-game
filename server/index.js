// Setup basic express server
const {emitRefreshRooms, emitRefreshRoomPlayers, emitRejoinInit} = require("./utils/emitUtils");
const {v4: uuidv4} = require('uuid');
const {differenceBy} = require("lodash/array");
const {GameEngine} = require("./model/GameEngine");
const express = require('express');
const app = express();
const path = require('path');
const {Rooms} = require("./model/Rooms");
const {GAME_STATUS} = require("./config/gameAndStageConfig");
const {getNextEmptyTeamMemberSlot} = require("./utils/roomUtils");
const {goToNextStage} = require("./event/gameStageEvent");
const {emitRefreshStatus} = require("./utils/emitUtils");
const {EMIT_TYPE} = require("./config/emitConfig");
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        // origin: "http://localhost:9000",
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: false
    },
});
const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, '../client')));

const rooms = new Rooms();
io.on('connection', (socket) => {
    let playerId, roomId;

    socket.on(EMIT_TYPE.REJOIN_ROOM, (data) => {
        const room = rooms.getRoom(data.roomId)
        if (!room) {
            return;
        }

        const roomStatus = rooms.getRoomStatus(data.roomId)
        if (roomStatus !== GAME_STATUS.PLAYING) {
            return
        }

        const roomEngine = rooms.getRoomEngine(data.roomId)
        const quitedPlayer = roomEngine?.players[data.playerId];
        if (quitedPlayer) {
            playerId = quitedPlayer.playerId
            roomId = data.roomId

            rooms.setRoomPlayers(roomId,
                [...rooms.getRoomPlayers(roomId),
                    {
                        playerId: quitedPlayer.playerId,
                        playerName: quitedPlayer.playerName,
                        teamMember: quitedPlayer.teamMember,
                    }]
            )
            socket.join(roomId);
            emitRejoinInit(roomEngine.gameStatus)
        }
    })

    socket.on(EMIT_TYPE.REFRESH_ROOMS, () => {
        emitRefreshRooms(io)
    })

    socket.on(EMIT_TYPE.JOIN_ROOM, (data) => {
        playerId = data.playerId
        const playerName = data.playerName
        roomId = data.roomId

        if (!playerId || !playerName || !roomId) {
            return;
        }

        const roomStatus = rooms.getRoomStatus(data.roomId)
        if (roomStatus === GAME_STATUS.PLAYING) {
            return;
        }

        const roomPlayers = rooms.getRoomPlayers(data.roomId)
        if (roomPlayers.length >= 8) {
            return;
        }

        const teamMember = getNextEmptyTeamMemberSlot(roomPlayers);
        rooms.setRoomPlayers(roomId,
            [...rooms.getRoomPlayers(roomId),
                {playerId, playerName, teamMember}]
        )

        socket.join(roomId);
        emitRefreshRooms(io)
        emitRefreshRoomPlayers(io, roomId)
    })

    socket.on(EMIT_TYPE.SWITCH_TEAM_MEMBER, (data) => {
        playerId = data.playerId
        roomId = data.roomId
        const teamMember = data.teamMember;

        const roomStatus = rooms.getRoomStatus(data.roomId)
        if (roomStatus == GAME_STATUS.PLAYING) {
            return
        }

        const roomPlayer = rooms.getRoomPlayers(data.roomId).find((player) => player.playerId == playerId);
        roomPlayer.teamMember = teamMember;
        emitRefreshRoomPlayers(io, roomId)
    })

    socket.on(EMIT_TYPE.DISCONNECT, () => {
        if (!playerId || !roomId) {
            return
        }

        const roomPlayers = rooms.getRoomPlayers(roomId)
        rooms.setRoomPlayers(roomId, differenceBy(roomPlayers, [{playerId}], 'playerId'))
        socket.leave(roomId);

        if (rooms.getRoomPlayers(roomId).length <= 0) {
            if (process.env.NODE_ENV == 'production') {
                rooms.setRoomEngine(roomId, null)
            } else {
                // keepalive for FE debug
            }
        }
        emitRefreshRooms(io)
        emitRefreshRoomPlayers(io, roomId)
    });

    socket.on(EMIT_TYPE.INIT, () => {
        if (!playerId || !roomId) {
            return
        }
        const gameEngine = new GameEngine(io);
        rooms.setRoomEngine(roomId, gameEngine)
        gameEngine.setPlayers(rooms.getRoomPlayers(roomId))
        gameEngine.startEngine(roomId);
        emitRefreshRooms(io);
    });

    socket.on(EMIT_TYPE.ACTION, (action) => {
        rooms.getRoomEngine(roomId)?.handleAction(action);
    });

    socket.on(EMIT_TYPE.RESPONSE, (response) => {
        rooms.getRoomEngine(roomId)?.handleResponse(response);
    });

    socket.on(EMIT_TYPE.CARD_BOARD_ACTION, (data) => {
        rooms.getRoomEngine(roomId)?.handleCardBoardAction(data);
    });

    socket.on(EMIT_TYPE.WUGU_BOARD_ACTION, (data) => {
        rooms.getRoomEngine(roomId)?.handleWuguBoardAction(data);
    });

    socket.on(EMIT_TYPE.HERO_SELECT_BOARD_ACTION, (data) => {
        rooms.getRoomEngine(roomId)?.handleHeroSelectBoardAction(data);
    });

    socket.on(EMIT_TYPE.END_PLAY, () => {
        rooms.getRoomEngine(roomId)?.handleEndPlay();
    });

    socket.on(EMIT_TYPE.THROW, (data) => {
        rooms.getRoomEngine(roomId)?.handleThrowCards(data);
    });

    // debug
    socket.on(EMIT_TYPE.GO_NEXT_STAGE, () => {
        if (rooms.getRoomEngine(roomId)) {
            goToNextStage(rooms.getRoomEngine(roomId).gameStatus);
            emitRefreshStatus(rooms.getRoomEngine(roomId).gameStatus);
        }
    });
});

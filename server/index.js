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

const {rooms} = new Rooms();

io.on('connection', (socket) => {
    let playerId, roomId;

    socket.on(EMIT_TYPE.REJOIN_ROOM, (data) => {
        const room = rooms[data.roomId]
        if (!room) {
            return;
        }
        const {gameEngine, roomPlayers} = room;
        if (!gameEngine || gameEngine?.gameStatus?.room?.status !== GAME_STATUS.PLAYING) {
            return
        }
        const player = gameEngine?.gameStatus?.players[data.playerId];
        if (player) {
            playerId = player.playerId
            roomId = data.roomId
            roomPlayers.push({playerId: player.playerId, playerName: player.playerName})
            socket.join(roomId);
            emitRejoinInit(gameEngine.gameStatus)
        }
    })

    socket.on(EMIT_TYPE.REFRESH_ROOMS, () => {
        emitRefreshRooms(io, rooms)
    })

    socket.on(EMIT_TYPE.JOIN_ROOM, (data) => {
        playerId = data.playerId
        const playerName = data.playerName
        roomId = data.roomId

        if (!playerId || !playerName || !roomId) {
            return;
        }
        if (!rooms[roomId]) {
            return;
        }

        const room = rooms[roomId]
        const {gameEngine, roomPlayers} = room
        const roomStatus = gameEngine?.gameStatus?.room?.status
        if (roomStatus === GAME_STATUS.PLAYING) {
            return;
        }
        if (roomPlayers.length >= 8) {
            return
        }

        const teamMember = getNextEmptyTeamMemberSlot(roomPlayers);
        roomPlayers.push({playerId, playerName, teamMember})
        socket.join(roomId);
        emitRefreshRooms(io, rooms)
        emitRefreshRoomPlayers(io, rooms, roomId)
    })

    socket.on(EMIT_TYPE.SWITCH_TEAM_MEMBER, (data) => {
        playerId = data.playerId
        roomId = data.roomId
        const teamMember = data.teamMember;

        const room = rooms[data.roomId]
        const roomStatus = room.gameEngine?.gameStatus?.room?.status
        if (!room || roomStatus == GAME_STATUS.PLAYING) {
            return
        }

        const roomPlayer = room.roomPlayers.find((player) => player.playerId == playerId);
        roomPlayer.teamMember = teamMember;
        emitRefreshRoomPlayers(io, rooms, roomId)
    })

    socket.on(EMIT_TYPE.DISCONNECT, () => {
        if (playerId && roomId) {
            rooms[roomId].roomPlayers = differenceBy(rooms[roomId].roomPlayers, [{playerId}], 'playerId');
            socket.leave(roomId);
            if (rooms[roomId].roomPlayers.length <= 0) {
                if (process.env.NODE_ENV == 'production') {
                    rooms[roomId].gameEngine = null
                }
            }
            emitRefreshRooms(io, rooms)
            emitRefreshRoomPlayers(io, rooms, roomId)
        }
    });

    socket.on(EMIT_TYPE.INIT, () => {
        if (!playerId || !roomId) {
            return
        }
        const gameEngine = new GameEngine(io);
        rooms[roomId].gameEngine = gameEngine;
        const roomPlayers = rooms[roomId].roomPlayers

        gameEngine.setPlayers(roomPlayers)
        gameEngine.startEngine(roomId);
        emitRefreshRooms(io, rooms);
    });

    socket.on(EMIT_TYPE.ACTION, (action) => {
        rooms?.[roomId]?.gameEngine?.handleAction(action);
    });

    socket.on(EMIT_TYPE.RESPONSE, (response) => {
        rooms?.[roomId]?.gameEngine?.handleResponse(response);
    });

    socket.on(EMIT_TYPE.CARD_BOARD_ACTION, (data) => {
        rooms?.[roomId]?.gameEngine?.handleCardBoardAction(data);
    });

    socket.on(EMIT_TYPE.WUGU_BOARD_ACTION, (data) => {
        rooms?.[roomId]?.gameEngine?.handleWuguBoardAction(data);
    });

    socket.on(EMIT_TYPE.HERO_SELECT_BOARD_ACTION, (data) => {
        rooms?.[roomId]?.gameEngine?.handleHeroSelectBoardAction(data);
    });

    socket.on(EMIT_TYPE.END_PLAY, () => {
        rooms?.[roomId]?.gameEngine?.handleEndPlay();
    });

    socket.on(EMIT_TYPE.THROW, (data) => {
        rooms?.[roomId]?.gameEngine?.handleThrowCards(data);
    });

    // debug
    socket.on(EMIT_TYPE.GO_NEXT_STAGE, () => {
        rooms?.[roomId]?.gameEngine && goToNextStage(rooms[roomId].gameEngine.gameStatus);
        emitRefreshStatus(rooms[roomId].gameEngine.gameStatus);
    });
});

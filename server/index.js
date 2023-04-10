// Setup basic express server
const {emitRefreshRooms, emitRefreshRoomPlayers, emitRejoinInit, emitInit} = require("./utils/emitUtils");
const {v4: uuidv4} = require('uuid');
const {differenceBy} = require("lodash/array");
const {shuffle} = require("lodash/collection");
const {goToNextStage} = require("./utils/stageUtils");
const {GameEngine} = require("./model/GameEngine");
const emitMap = require("./config/emitMap.json");
const express = require('express');
const app = express();
const path = require('path');
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
const {Player} = require('./model/Player.js')

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, '../client')));


const rooms = {
    '1': {gameEngine: null, players: []},
    '2': {gameEngine: null, players: []},
}

io.on('connection', (socket) => {
    let playerId;
    let playerName;
    let roomId;

    socket.on(emitMap.REJOIN_ROOM, (data) => {
        const room = rooms[data.roomId]
        if (!room || !room.gameEngine || !room.gameEngine?.gameStatus?.players) {
            return
        }
        const player = room.gameEngine?.gameStatus?.players[data.playerId];
        if (player) {
            playerId = player.playerId
            playerName = player.name
            roomId = data.roomId
            rooms[roomId].players.push({playerId: player.playerId, playerName: player.name})
            socket.join(roomId);
            emitRejoinInit(room.gameEngine.gameStatus, socket)
        }
    })

    socket.on(emitMap.REFRESH_ROOMS, () => {
        emitRefreshRooms(io, rooms)
    })

    socket.on(emitMap.JOIN_ROOM, (data) => {
        playerId = data.playerId
        playerName = data.playerName
        roomId = data.roomId
        if (playerId && playerName && roomId && rooms[roomId] && (rooms[roomId].gameEngine == null)) {
            rooms[roomId].players.push({playerId, playerName})
            socket.join(roomId);
            emitRefreshRooms(io, rooms)
            emitRefreshRoomPlayers(io, rooms, roomId)
        }
    })

    socket.on(emitMap.DISCONNECT, () => {
        if (playerId && roomId) {
            rooms[roomId].players = differenceBy(rooms[roomId].players, [{playerId}], 'playerId');
            socket.leave(roomId);
            if (rooms[roomId].players.length <= 0) {
                rooms[roomId].gameEngine = null
            }
            emitRefreshRooms(io, rooms)
            emitRefreshRoomPlayers(io, rooms, roomId)
        }
    });

    socket.on(emitMap.INIT, () => {
        if (!playerId || !roomId) {
            return
        }
        // startEngine
        const gameEngine = new GameEngine(io);
        rooms[roomId].gameEngine = gameEngine;

        const roomPlayers = rooms[roomId].players
        // for (let i = 0; i < 7; i++) {
        //     roomPlayers.push({name: uuidv4(), playerId: uuidv4()})
        // }
        // let locations = ([0, 1, 2, 3, 4, 5, 6, 7].slice(0, roomPlayers.length));
        let locations = shuffle([0, 1, 2, 3, 4, 5, 6, 7].slice(0, roomPlayers.length));
        roomPlayers.forEach((p, i) => {
            const newPlayer = new Player({
                imageName: "SHU001",
                name: p.playerName,
                playerId: p.playerId,
                location: locations[i]
            }, gameEngine.generateNewRoundQiuTaoResponseStages.bind(gameEngine));
            gameEngine.gameStatus.players[newPlayer.playerId] = newPlayer;
        })

        gameEngine.startEngine(roomId);
        emitRefreshRooms(io, rooms)
    });

    socket.on(emitMap.GO_NEXT_STAGE, () => {
        rooms?.[roomId]?.gameEngine && goToNextStage(rooms[roomId].gameEngine.gameStatus);
    });

    socket.on(emitMap.ACTION, (action) => {
        rooms?.[roomId]?.gameEngine?.handleAction(action);
    });

    socket.on(emitMap.RESPONSE, (response) => {
        rooms?.[roomId]?.gameEngine?.handleResponse(response);
    });

    socket.on(emitMap.CARD_BOARD_ACTION, (data) => {
        rooms?.[roomId]?.gameEngine?.handleCardBoardAction(data);
    });

    socket.on(emitMap.WUGU_BOARD_ACTION, (data) => {
        rooms?.[roomId]?.gameEngine?.handleWuguBoardAction(data);
    });

    socket.on(emitMap.THROW, (data) => {
        rooms?.[roomId]?.gameEngine?.handleThrowCards(data);
    });
});

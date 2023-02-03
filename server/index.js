// Setup basic express server
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
    1: {gameEngine: null, players: []},
    2: {gameEngine: null, players: []},
}

io.on('connection', (socket) => {
    let playerId;
    let playerName;
    let roomId;
    let gameEngine;
    socket.on(emitMap.REFRESH_ROOMS, () => {
        io.emit(emitMap.REFRESH_ROOMS, [
                {roomId: 1, players: rooms[1].players},
                {roomId: 2, players: rooms[2].players}
            ]
        );
    })

    socket.on(emitMap.JOIN_ROOM, (data) => {
        playerId = data.playerId
        playerName = data.playerName
        roomId = data.roomId
        if (playerId && playerName && roomId && rooms[roomId]) {
            rooms[roomId].players.push({playerId, playerName})
            socket.join(roomId);
            io.to(roomId).emit(emitMap.REFRESH_ROOM, rooms[roomId]);

            io.emit(emitMap.REFRESH_ROOMS, [
                    {roomId: 1, players: rooms[1].players},
                    {roomId: 2, players: rooms[2].players}
                ]
            );
        }
    })

    socket.on(emitMap.DISCONNECT, () => {
        if (playerId && roomId) {
            rooms[roomId].players = differenceBy(rooms[roomId].players, [{playerId}], 'playerId');
            socket.leave(roomId);
        }
    });

    socket.on(emitMap.INIT, () => {
        const roomPlayers = rooms[roomId].players
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

        // startEngine
        const gameEngine = new GameEngine(io)
        rooms[roomId].gameEngine = gameEngine;
        gameEngine.startEngine(roomId);
    });

    socket.on(emitMap.GO_NEXT_STAGE, () => {
        goToNextStage(gameEngine.gameStatus);
    });

    socket.on(emitMap.ACTION, (action) => {
        gameEngine.handleAction(action);
    });

    socket.on(emitMap.RESPONSE, (response) => {
        gameEngine.handleResponse(response);
    });

    socket.on(emitMap.CARD_BOARD_ACTION, (data) => {
        gameEngine.handleCardBoardAction(data);
    });

    socket.on(emitMap.WUGU_BOARD_ACTION, (data) => {
        gameEngine.handleWuguBoardAction(data);
    });

    socket.on(emitMap.THROW, (data) => {
        gameEngine.handleThrowCards(data);
    });
});

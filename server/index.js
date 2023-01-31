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

let roomPlayers = [];
const gameEngine = new GameEngine(io);

io.on('connection', (socket) => {
    let playerId;
    socket.on(emitMap.REFRESH_ROOM_PLAYERS, (data) => {
        playerId = data.playerId
        roomPlayers.push({playerId: data.playerId, playerName: data.playerName})
        io.emit(emitMap.REFRESH_ROOM_PLAYERS, roomPlayers);
    })

    socket.on(emitMap.DISCONNECT, () => {
        if (playerId) {
            roomPlayers = differenceBy(roomPlayers, [{playerId}], 'playerId');
        }
        io.emit(emitMap.REFRESH_ROOM_PLAYERS, roomPlayers);
    });

    socket.on(emitMap.INIT, () => {
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
        gameEngine.startEngine();
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

// Setup basic express server
const {emitInit} = require("./utils/emitUtils");
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

const gameEngine = new GameEngine(io);

io.on('connection', (socket) => {
    let addedPlayer = false;
    let location = 0;

    socket.on(emitMap.INIT, (data) => {
        // data { playerId: '22c3d181-5d60-4283-a4ce-6f2b14d772bc' }
        if (Object.keys(gameEngine.gameStatus.players).length >= 2) {
            emitInit(gameEngine.gameStatus)
            return;
        }

        if (addedPlayer) {
            emitInit(gameEngine.gameStatus)
            return;
        }

        // hardcode 只有两个角色
        const newPlayer = new Player({
            imageName: "SHU001",
            name: "刘备",
            playerId: data.playerId,
            location: location++
        }, gameEngine.generateNewRoundQiuTaoResponseStages.bind(gameEngine));
        gameEngine.gameStatus.players[newPlayer.playerId] = newPlayer;

        const newPlayer2 = new Player({
            imageName: "SHU002",
            name: "关羽",
            playerId: 'player2',
            location: location++
        }, gameEngine.generateNewRoundQiuTaoResponseStages.bind(gameEngine));
        if (gameEngine.gameStatus.players[newPlayer2.playerId]) {
            throw new Error("player2 id already exist")
        }
        gameEngine.gameStatus.players[newPlayer2.playerId] = newPlayer2;

        for (i = 0; i < 0; i++) {
            const newPlayer = new Player({
                imageName: "SHU003",
                name: "张飞",
                playerId: 'player' + (i + 3),
                location: location++
            }, gameEngine.generateNewRoundQiuTaoResponseStages.bind(gameEngine));
            gameEngine.gameStatus.players[newPlayer.playerId] = newPlayer;
        }

        addedPlayer = true;

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

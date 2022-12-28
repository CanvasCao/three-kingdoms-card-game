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
const {User} = require('./model/User.js')

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, '../client')));

const gameEngine = new GameEngine(io);

io.on('connection', (socket) => {
    let addedUser = false;
    let location = 0;

    socket.on(emitMap.INIT, (data) => {
        // data { userId: '22c3d181-5d60-4283-a4ce-6f2b14d772bc' }
        if (Object.keys(gameEngine.gameStatus.users).length >= 2) {
            emitInit(gameEngine.gameStatus)
            return;
        }

        if (addedUser) {
            emitInit(gameEngine.gameStatus)
            return;
        }

        // hardcode 只有两个角色
        const newUser = new User({
            cardId: "SHU001",
            name: "刘备",
            userId: data.userId,
            location: location++
        }, gameEngine.generateNewRoundQiuTaoResponseStages.bind(gameEngine));
        gameEngine.gameStatus.users[newUser.userId] = newUser;

        const newUser2 = new User({
            cardId: "SHU002",
            name: "关羽",
            userId: 'user2',
            location: location++
        }, gameEngine.generateNewRoundQiuTaoResponseStages.bind(gameEngine));
        if (gameEngine.gameStatus.users[newUser2.userId]) {
            throw new Error("user2 id already exist")
        }
        gameEngine.gameStatus.users[newUser2.userId] = newUser2;

        for (i = 0; i < 6; i++) {
            const newUser = new User({
                cardId: "SHU003",
                name: "张飞",
                userId: 'user' + (i + 3),
                location: location++
            }, gameEngine.generateNewRoundQiuTaoResponseStages.bind(gameEngine));
            gameEngine.gameStatus.users[newUser.userId] = newUser;
        }

        addedUser = true;

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

    socket.on(emitMap.THROW, (data) => {
        gameEngine.handleThrowCards(data);
    });
});

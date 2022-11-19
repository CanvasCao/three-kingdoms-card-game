// Setup basic express server
const {GameEngine} = require("./model/GameEngine");
const emitMap = require("./data/emitMap.json");
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

    socket.on(emitMap.INIT, (data) => {
        // data { userId: '22c3d181-5d60-4283-a4ce-6f2b14d772bc' }
        if (Object.keys(gameEngine.gameStatus.users).length >= 2) {
            io.emit(emitMap.INIT, gameEngine.gameStatus);
            return;
        }

        if (addedUser) {
            io.emit(emitMap.INIT, gameEngine.gameStatus);
            return;
        }


        // hardcode 只有两个角色
        const newUser = new User();
        newUser.maxBlood = 4;
        newUser.name = "关羽";
        newUser.cardId = "SHU002";
        newUser.userId = data.userId;
        newUser.cards = [];
        newUser.index = 0;
        gameEngine.gameStatus.users[newUser.userId] = newUser;

        const newUser2 = new User();
        newUser2.maxBlood = 4;
        newUser2.name = "刘备";
        newUser2.cardId = "SHU001";
        newUser2.userId = "user2";
        newUser2.cards = [];
        newUser2.index = 1;
        gameEngine.gameStatus.users[newUser2.userId] = newUser2;

        addedUser = true;

        // startEngine
        gameEngine.startEngine();
    });

    socket.on(emitMap.GO_NEXT_STAGE, (data) => {
        gameEngine.goNextStage();
    });
});

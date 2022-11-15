// Setup basic express server
const {gameStatus, startEngine} = require("./engine");
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:9000",
        methods: ["GET", "POST"]
    }
});
const port = process.env.PORT || 3000;
const {User} = require('./model/User.js')

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, '../client')));


io.on('connection', (socket) => {
    let addedUser = false;

    socket.on('init', (data) => {
        // data { userId: '22c3d181-5d60-4283-a4ce-6f2b14d772bc' }

        if (gameStatus.users.length >= 2) {
            io.emit("init", gameStatus);
            return;
        }

        if (addedUser) {
            io.emit("init", gameStatus);
            return;
        }


        // hardcode 只有两个角色
        const newUser = new User();
        newUser.blood = 4;
        newUser.name = "关羽";
        newUser.cardId = "SHU002";
        newUser.userId = data.userId;
        newUser.cards = [];
        newUser.index = 0;
        gameStatus.users.push(newUser);

        const newUser2 = new User();
        newUser2.blood = 4;
        newUser2.name = "关羽";
        newUser2.cardId = "SHU002";
        newUser2.userId = "user2";
        newUser2.cards = [];
        newUser2.index = 1;
        gameStatus.users.push(newUser2);

        addedUser = true;

        //startEngine
        startEngine(io);
        io.emit("init", gameStatus);
    });

    socket.on('refreshStatus', (data) => {
        io.emit("refreshStatus", gameStatus);
    });

});

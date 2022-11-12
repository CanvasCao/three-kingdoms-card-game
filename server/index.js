// Setup basic express server
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

// Source
let cards = [];
let actions = [];// {type:'sha',cards:['1','2'],target:['1'],origin:"2"}
let users = [];
let logs = [];
let whoseTurn;
let whichStage;
const gameStatus = {
    users,
}


io.on('connection', (socket) => {
    let addedUser = false;

    socket.on('init', (data) => {
        if (addedUser) return;

        // hardcode 只有两个角色
        const name = `U${users.length + 1}`
        const newUser = new User(name);
        newUser.blood = 4;
        newUser.cards = ['杀', '闪', '🍑'];
        users.push(newUser);

        const newUser2 = new User(name);
        newUser2.blood = 4;
        newUser2.cards = ['杀', '闪', '🍑'];
        users.push(newUser);

        addedUser = true;

        io.emit("init", gameStatus);
    });

    socket.on('refreshStatus', (data) => {
        io.emit("refreshStatus", gameStatus);
    });

    socket.on('sha', (data) => {
        blood--;
        io.emit('new message', {
            message: 'sha',
        });
    });

});

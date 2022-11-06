// Setup basic express server
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const {User} = require('../shared/User.js')

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, '../client')));

// Source

let users = [];
const gameStatus = {
    users,
}


io.on('connection', (socket) => {
    let addedUser = false;

    socket.on('addUser', (data) => {
        if (addedUser) return;
        addedUser = true;
        const name = `U${users.length + 1}`
        const newUser=new User(name);
        newUser.blood=4;
        newUser.cards=['杀','闪','🍑'];
        users.push(newUser);
        io.emit("addUser", gameStatus);
    });

    socket.on('sha', (data) => {
        blood--;
        io.emit('new message', {
            message: 'sha',
        });
    });

});

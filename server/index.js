// Setup basic express server
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, '../client')));

// Source
let cards=['杀','杀','杀','杀','杀','杀'];
let numUsers = ['user1'];
let blood=4;

io.on('connection', (socket) => {

  socket.on('init', (data) => {
    io.emit("init", {
      message: `你是${numUsers[0]} 你有${blood}点血`,
    });
  });


  // when the client emits 'new message', this listens and executes
  socket.on('sha', (data) => {
    blood--;
    io.emit('new message', {
      message: `你是${numUsers[0]} 你有${blood}点血`,
    });
  });

});

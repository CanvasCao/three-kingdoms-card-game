$(function () {
    const socket = io();

    const $sha = $("#sha");
    const $users = $("#users");
    $sha.click(() => {
        socket.emit('sha');
    })

    socket.emit('addUser');
    socket.on('addUser', (data) => {
        console.log('addUser', data);
        console.log('addUser', data.users.map((user)=>renderUser(user)).join(''));

        $users.html(data.users.map((user)=>renderUser(user)).join(''));
    });

    socket.on('new message', (data) => {
        console.log(data.message)
    });
});

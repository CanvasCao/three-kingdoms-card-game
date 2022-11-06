$(function() {

  var randomColor ="#"+((1<<24)*Math.random()|0).toString(16);

  document.documentElement.style.setProperty('color', randomColor);

  const socket = io();

  const $sha=$("#sha");


  $sha.click(()=>{
    socket.emit('sha');
  })

  socket.emit('init');

  socket.on('init', (data) => {
    console.log(data.message)
  });

  socket.on('new message', (data) => {
    console.log(data.message)
  });
});

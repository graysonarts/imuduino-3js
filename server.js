var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    connection = null,
    yaw = 0,
    roll = 0,
    pitch = 0

server.listen(4200)

app.use(express.static('public'))

io.on('connection', function (socket) {
  if (connection) {
      socket.emit('device_status', connection)
  }
  var interval = setInterval(function() {
    yaw += 0.1
    pitch += 0.1
    socket.emit('position', {
      yaw: yaw,
      pitch: pitch,
      roll: roll
    })
  }, 100)
  socket.on('disconnect', function () {
    clearInterval(interval)
  })
})


var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    connection = null

server.listen(4200)
console.log('server url http://localhost:' + 4200)

app.use(express.static('public/playback'))

io.on('connection', function (socket) {
  if (connection) {
      socket.emit('device_status', connection)
  }
})


var ble_package_name = './lib/imuduino'

var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    ble = require(ble_package_name),
    _ = require('lodash'),
    connection = null,
    radianScale = (Math.PI / 180.0)

var start = new Date().getTime()
server.listen(4200)
console.log('server url http://localhost:' + 4200)

app.use(express.static('public'))


function degreeToRadians(n) {
  if (isNaN(n)) {
    return n
  }
  return n * radianScale
}

var IMUduino = new ble()
IMUduino.on('packet', function (p) {
  p = _.mapValues(p, degreeToRadians)
  p.time = new Date().getTime()
  p.duration = (new Date().getTime()) - start
  io.emit(p.type || 'unknown', p)
  start = new Date().getTime() // Times are deltas
})

io.on('connection', function (socket) {
  if (connection) {
      socket.emit('device_status', connection)
  }
})


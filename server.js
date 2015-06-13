var ble_package_name = './lib/imuduino',
    record = false,
    record_filename = process.env.npm_package_config_playback_file || 'imu.record'

switch (process.env.npm_package_config_mode) {
  case 'record':
    console.log('running in record mode')
    record = true
    break
  case 'playback':
    console.log('running with playback: ' + record_filename)
    ble_package_name = './lib/playback_imuduino'
    break
}

var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    ble = require(ble_package_name),
    _ = require('lodash'),
    fs = require('fs'),
    connection = null,
    radianScale = (Math.PI / 180.0)

var start = new Date().getTime()
server.listen(4200)
console.log('server url http://localhost:' + 4200)

app.use(express.static('public'))

if (record) {
  if (fs.existsSync(record_filename)) {
    fs.renameSync(record_filename, record_filename + '.old')
  }
}

function degreeToRadians(n) {
  return n * radianScale
}

var IMUduino = new ble()
IMUduino.on('packet', function (p) {
  p = _.mapValues(p, degreeToRadians)
  if (record) {
    p.duration = (new Date().getTime()) - start
    fs.appendFileSync(record_filename, JSON.stringify(p) + '\n')
  }
  io.emit('position', p)
  start = new Date().getTime() // Times are deltas
})

io.on('connection', function (socket) {
  if (connection) {
      socket.emit('device_status', connection)
  }
})


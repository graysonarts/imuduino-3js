/* jshint browserify: true */
/* jshint jquery: true */
/* jshint unused: false */
/* global io */
var d3 = require('d3')
window.jQuery = require('jquery')
require('../contrib/epoch/epoch.min.js')

var accelData = [
  {
    label: 'x',
    values: [ { time: 0, y: 0 } ]
  },
  {
    label: 'y',
    values: [ { time: 0, y: 0 } ]
  },
  {
    label: 'z',
    values: [ { time: 0, y: 0 } ]
  }
]

var accelChart = $('#accel').epoch({
  type: 'time.line',
  data: accelData
})

var socket = io.connect()
socket.on('position', function (data) {
  accelChart.push([
    {time: data.time, y: data.accel_x},
    {time: data.time, y: data.accel_y},
    {time: data.time, y: data.accel_z}
  ])
})

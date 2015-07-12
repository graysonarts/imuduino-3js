/* jshint browserify: true */
/* jshint unused: false */
/* global io */
var _ = require('lodash')
var AudioContext = (window.AudioContext || window.webkitAudioContext)

var audioCtx = new AudioContext(),
    maxBufferSize = 2*audioCtx.sampleRate,
    dataBuffer, accel = { x: null, y: null, z: null },
    source = audioCtx.createBufferSource(),
    analyzers = {
      x: audioCtx.createAnalyser(),
      y: audioCtx.createAnalyser(),
      z: audioCtx.createAnalyser()
    },
    splitter = audioCtx.createChannelSplitter(3),
    WIDTH = 600, HEIGHT = 300

_.map(analyzers, function(n) { n.fftsize = 3 })
var analyzerLength = analyzers.x.frequencyBinCount
var analyzerData = new Uint8Array(analyzerLength)
var canvas = document.getElementById('accel').getContext('2d')
var barWidth = (WIDTH / analyzerLength) * 2.5


function drawChannel(analyzer, y_offset, y_height, color_fn) {
  var barHeight, x=0

  analyzer.getByteFrequencyData(analyzerData)

  for(var i=0; i<analyzerLength; i++) {
    barHeight = analyzerData[i] / 3
    canvas.fillStyle = color_fn(barHeight)
    canvas.fillRect(x, (y_height - barHeight + y_offset)/2, barWidth, barHeight + y_offset)
    x += barWidth + 1
  }
}

function draw() {
  requestAnimationFrame(draw)

  canvas.fillStyle = 'rgb(0,0,0)'
  canvas.fillRect(0, 0, WIDTH, HEIGHT)

  drawChannel(analyzers.x, 0, HEIGHT/2, function(n) {
    return 'rgba(' + (n + 100) + ',50, 50, .5)'
  })

  drawChannel(analyzers.y, 0, HEIGHT/2, function(n) {
    return 'rgba(50,' + (n + 100) + ', 50, .5)'
  })

  drawChannel(analyzers.y, 0, HEIGHT/2, function(n) {
    return 'rgba(50,50,' + (n + 100) + ', .5)'
  })
}


// Load buffer
var req = new XMLHttpRequest()
req.open('GET', '/samples/hi-up.imurec', true)
req.send()
req.onreadystatechange = function() {
  if (req.status == 200 && req.readyState == 4) {
    var data = _.filter(
      _.map(req.responseText.split('\n'), function(n) {
        if (n) {

          var p = JSON.parse(n)
          if (p.type == 'position') {
            return {
              x: p.accel_x/100.0,
              y: p.accel_y/100.0,
              z: p.accel_z/100.0
            }
          }
        }
      }), function(n) {
      return n !== undefined
    })

    dataBuffer = audioCtx.createBuffer(3, data.length, audioCtx.sampleRate)
    accel.x = dataBuffer.getChannelData(0)
    accel.y = dataBuffer.getChannelData(1)
    accel.z = dataBuffer.getChannelData(2)

    for(var i=0; i<data.length;i++) {
        accel.x[i] = data[i].x
        accel.y[i] = data[i].y
        accel.z[i] = data[i].z
    }

    source.buffer = dataBuffer
    source.loop = true
    source.start(0)    
    source.connect(splitter)
    splitter.connect(analyzers.x, 0)
    splitter.connect(analyzers.y, 1)
    splitter.connect(analyzers.z, 2)

    canvas.clearRect(0,0, WIDTH, HEIGHT)
    draw()
  }
}
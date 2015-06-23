var ble_package_name = '../lib/imuduino'

var keypress = require('keypress'),
    ble = require(ble_package_name),
    _ = require('lodash'),
    fs = require('fs'),
    colors = require('colors'),
    radianScale = (Math.PI / 180.0)

var start = null,
    filenameCount = 0,
    recording = false,
    recordFile = null,
    display = false,
    waitingForDevice = true


function degreeToRadians(n) {
  if (isNaN(n)) {
    return n
  }
  return n * radianScale
}

keypress(process.stdin)

function paddy(n, p) {
    var pad = new Array(1 + p).join('0')
    return (pad + n).slice(-pad.length)
}

function nextFile() {
  ++filenameCount
  recordFile = paddy(filenameCount, 5) + '.imurec'
}

function handleRecordingKey(ch, key) {
  if (key.name !== 'space' && key.name !== 'return') {
    return
  }

  recording = false
  console.log('Recording Stopped\n'.cyan)
  nextFile()

  if (key.name === 'return') {
    recording = true
    console.log(colors.cyan('Recording to %s'), recordFile)
  }
}

function handleIdleKey(ch, key) {
  if (key.name === 'space') {
    recording = true
    if (filenameCount === 1) {
      console.log('To stop recording, press space'.yellow)
      console.log('To start a new file, press enter\n'.yellow)
    }
    console.log(colors.cyan('Recording to %s'), recordFile)
  } else if (key.name === 'd') {
    display = !display
    console.log('display == ' + display)
  }
}

process.stdin.on('keypress', function (ch, key) {
  console.log(key)
  if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause()
    process.exit()
  }

  if (waitingForDevice || !key) {
    return
  }

  if (recording) {
    handleRecordingKey(ch, key)
  } else {
    handleIdleKey(ch, key)
  }
})

var IMUduino = new ble()

IMUduino.on('connected', function () {
  waitingForDevice = false
  nextFile()
  console.log('BLE device connected'.yellow)
  console.log('press space to begin recording'.yellow)
  console.log('press d to display values\n'.yellow)
})

IMUduino.on('packet', function (p) {
  if (!recording && !display) {
    return
  }

  p = _.mapValues(p, degreeToRadians)
  p.time = new Date().getTime()
  p.duration = (new Date().getTime()) - start

  if (recording) {
    fs.appendFileSync(recordFile, JSON.stringify(p) + '\n')
  } else if (display) {
    console.log(JSON.stringify(p))
  }

  start = new Date().getTime() // Times are deltas
})

process.stdin.setRawMode(true)
process.stdin.resume()
console.log('Waiting on BLE device, please wait'.cyan)

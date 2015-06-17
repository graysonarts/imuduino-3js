var emitter = require('events').EventEmitter,
  _ = require('lodash'),
    noble = require('noble'),
    service_info = require('./service-info')

// TODO: Do I make this a stream?

function Imuduino(peripheral_id, packet_type) {
  if (!(this instanceof Imuduino)) {
    return new Imuduino(peripheral_id)
  }

  peripheral_id = peripheral_id || service_info.peripheralUUID
  this.parser = packet_type || require('./pitch-roll-yaw')

  var self = this
  this.buffer = []

  noble.on('discover', function (peripheral) {
    if (peripheral.uuid == peripheral_id) {
      self.emit('peripheralDiscovered', peripheral)
      self.connect(peripheral)
    }
  })
  noble.on('stateChange', function (state) {
    if (state == 'poweredOn') {
      noble.startScanning()
    }
  })
}

module.exports = Imuduino
Imuduino.prototype = new emitter()

Imuduino.prototype.connect = function (p) {
  var self = this
  p.connect(function() {
    self.emit('connected', p)
    p.discoverServices([], function(err, all_services) {
      if (err) {
        throw err
      }
      var services = _.select(all_services, 'uuid', service_info.serviceUUID)
      services[0].discoverCharacteristics([], function(err, all_chars) {
        if (err) {
          throw err
        }
        var characteristics = _.select(all_chars, 'uuid', service_info.rxCharacteristic)
        var characteristic = characteristics[0]
        characteristic.on('read', function(data) {
          self.parser.parse_buffer(data, function(p) {
            self.emit('packet', p)
          })
        })
        characteristic.notify(true) // Start Receiving
      })
    })
  })
}

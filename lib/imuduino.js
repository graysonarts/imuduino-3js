var emitter = require('events').EventEmitter,
	_ = require('lodash'),
    noble = require('noble'),
    service_info = require('./service-info'),
    PACKET_STATES = {
    	not_started: 0,
    	started: 1,
    	finished: 2
    }

// TODO: Do I make this a stream?

function Imuduino(peripheral_id) {
	if (!(this instanceof Imuduino)) {
		return new Imuduino(peripheral_id)
	}

	peripheral_id = peripheral_id || service_info.peripheralUUID

	var self = this
	this.buffer = []
	this.packet_state = PACKET_STATES.not_started

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
				characteristic.on('read', self.do_read.bind(self))
				characteristic.notify(true) // Start Receiving
			})
		})
	})
}

var PROPS = [
   'yaw',
   'pitch',
   'roll'
]

Imuduino.prototype.do_read = function (data) {
	var input = data.toString()
	this.parse_packet(input)
}

Imuduino.prototype.parse_packet = function (input) {
	var data = input.split('|')
	var p = _.zipObject(PROPS,
		    _.map(data, function (n) { return parseFloat(n) }))
	this.emit('packet', p)
	
}

// Imuduino(service_info.peripheralUUID).on('packet', function (p) {
// 	console.log(p)
// }).on('error', function (e, packet) {
// 	console.error(e + '\n' + packet)
// })


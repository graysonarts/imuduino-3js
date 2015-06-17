var position_fields = [
      'accel_x',
      'accel_y',
      'accel_z',
      'gyro_x',
      'gyro_y',
      'gyro_z',
      'mag_x',
      'mag_y',
      'mag_z'
    ],
    atmosphere_fields = [
      'temperature',
      'pressure'
    ]

function parse_string() {
  throw 'raw only works with buffers'
}

function parse_int(data, index) {
  return data.readInt16LE(index)
}

function parse_packet(data, type, fields) {
  var retval = {
    'type': type
  }
  var index = 1
  for(var i=0; i < fields.length; i++) {
    retval[fields[i]] = parse_int(data, index)
    index += 2
  }

  return retval
}

function parse_position(data) {
  return parse_packet(data, 'position', position_fields)
}

function parse_atmosphere(data) {
  return parse_packet(data, 'atmosphere', atmosphere_fields)
}

function parse_buffer(data, cb) {
  var value = null
  switch(String.fromCharCode(data[0])) {
    case 'P':
      value = parse_position(data)
      break
    case 'A':
      value = parse_atmosphere(data)
      break
  }

  if (value) {
    cb(value)
  }
}

module.exports = {
  'parse_string': parse_string,
  'parse_buffer': parse_buffer
}

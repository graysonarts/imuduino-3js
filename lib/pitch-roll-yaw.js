var _ = require('lodash'),
    PROPS = [
      'yaw',
      'pitch',
      'roll'
    ]

function parse_string(input, cb) {
  var data = input.split('|')
  var p = _.zipObject(PROPS,
          _.map(data, function (n) { return parseFloat(n) }))
  if (cb instanceof Function) {
    cb(p)
  }
}

function parse_buffer(data, cb) {
  parse_string(data.toString(), cb)
}

module.exports = {
  'parse_string': parse_string,
  'parse_buffer': parse_buffer
}

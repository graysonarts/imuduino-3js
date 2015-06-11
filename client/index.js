/* jshint browserify: true */
/* global io */
var three = require('three'),
    scene = new three.Scene(),
    camera = new three.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000),
    renderer = new three.WebGLRenderer(),
    pitch = 0,
    yaw = 0,
    roll = 0

renderer.setSize( window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

var geometry = new three.BoxGeometry(1, 1, 1),
    material = new three.MeshBasicMaterial( { color: 0x00ff00 }),
    cube = new three.Mesh(geometry, material)

scene.add( cube )
camera.position.z = 5

function render() {
  requestAnimationFrame( render )
  cube.rotation.x = pitch
  cube.rotation.y = yaw
  cube.rotation.z = roll
  renderer.render( scene, camera)
}

var socket = io.connect()
socket.on('position', function (data) {
  pitch = data.pitch
  yaw = data.yaw
  roll = data.roll
})

render()

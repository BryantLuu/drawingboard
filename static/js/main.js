var socket = io.connect();
var color = $('#color').val('000000');
var canvas = document.getElementById('myCanvas');
var path;
var currentMode = "drawing"

$('#close_modal').click(function(e){

  var name = $('#name').val();
  socket.emit('user_joined', {name: name, room: window.location.pathname});
})
// chatting

$('#send').submit(function(){
  socket.emit("send_message", {message:$('#message').val()});
  $('#message').val('');
  return false;
})

socket.on("sent_message", function (data){
  $('#messages').append($('<p>').text(data.message));
  var elem = document.getElementById('messages'); // = $('#history')
  elem.scrollTop = elem.scrollHeight;
  $('.chatbox').scrollTop = $('.chatbox').scrollHeight; 
});

socket.on('update_user_list', function (data){
  var users_list = "<ul>"
  for (var i = 0; i < data.length; i++){
    users_list += '<li>' + data[i] + '</li>';
  }
  users_list += '</ul>';
  $("#users").html(users_list);

  var elem = document.getElementById('users'); // = $('#history')
  elem.scrollTop = elem.scrollHeight;
  $('.chatbox').scrollTop = $('.chatbox').scrollHeight; 
})

// drawing

function onMouseDown(event) {
  var color = $('#color').spectrum('get').toHexString();
  var range = $('#range');
  var signal = {}

  signal.currentMode = currentMode;
  signal.point = event.point;
  signal.color = color;
  signal.range = range.val();
  socket.emit('onMouseDown', signal);

  if (signal.currentMode == 'drawing'){
    path = new Path();
    path.strokeCap = 'round';
    path.strokeJoin = 'round';
    path.strokeColor = signal.color;
    path.strokeWidth = signal.range;
    path.add(signal.point);
  } else {

    path = new Path();
    path.strokeCap = 'round';
    path.strokeJoin = 'round';
    path.strokeColor = '#FFFFFF';
    path.strokeWidth = signal.range;
    path.add(signal.point);
  }

}

function onMouseDrag(event) {
  var point = {x:event[1], y:event[2]};
  path.add(event.point);
  socket.emit('onMouseDrag', event.point);
}
function serialize(canvas) {
  return canvas.toDataURL();
}



socket.on('OtherOnMouseDown', function (event){
  if (event.currentMode == 'drawing'){
    
    var point = {x:event.point[1], y:event.point[2]}
    path = new Path();
    path.strokeCap = 'round';
    path.strokeJoin = 'round';
    path.strokeColor = event.color;
    path.strokeWidth = event.range;
    path.add(point);
  } else {

    var point = {x:event.point[1], y:event.point[2]}
    path = new Path();
    path.strokeCap = 'round';
    path.strokeJoin = 'round';
    path.strokeColor = '#FFFFFF';
    path.strokeWidth = event.range;
    path.add(point);
  }

})
socket.on('OtherOnMouseDrag', function (event){
  var point = {x:event[1], y:event[2]};
  path.add(point);
  paper.view.update();
})

socket.on('clear', function(){
  project.clear()
  paper.view.update();
})

$('#clear').click(function(){
  project.clear();
  paper.view.update();
  socket.emit('clear');
})

socket.emit('need_drawing',{room: window.location.pathname});

socket.on('get_drawing', function() {
  var img_code = serialize(canvas);
  socket.emit('return_drawing', {img: img_code });
})

socket.on('insert_drawing', function(data) {
  var raster = new Raster(data.img, view.center );
})

$('#brush').click(function(){
  currentMode = 'drawing';
  $('#myCanvas').css('cursor', 'url(/img/pen.png), auto');
})

$('#eraser').click(function(){
  currentMode ='eraser'
  $('#myCanvas').css('cursor', 'url(/img/cursor-eraser.png), auto');
})

// Color

$("#color").spectrum({
  color: "#000000"
});

// Brush

var $circle = $('#circle');

$("#color").on('change', function(){
  var color = $(this).spectrum('get').toHexString();
  $circle.css('background', color);
})

$("#range").on('change', function(){
  var size = $(this).val();
  $circle.css('width', size);
  $circle.css('height', size);
})





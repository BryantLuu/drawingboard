// require express and path
var express = require("express");
var path = require("path");
// create the express app
var app = express();

app.set('port', (process.env.PORT || 5000));
// static content 
app.use(express.static(__dirname + "/static"));
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// root route to render the index.ejs view
app.get('/', function (req, res) {
 res.render("index");
})
app.get('/drawingboard/:id', function (req, res) {
 res.render("drawingboard");
})
// tell the express app to listen on port 8000
var server = app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket){
  console.log(socket.id, "has connected");

  socket.on('onMouseDown', function (eventpoint){
    io.to(socket.room).emit('OtherOnMouseDown', eventpoint)
  })

  socket.on('onMouseDrag', function (eventpoint){
    io.to(socket.room).emit('OtherOnMouseDrag', eventpoint)
  })

  socket.on('clear', function(){
    io.to(socket.room).emit('clear');
  })

  socket.on('need_drawing', function (room){
    socket.room = room.room;
    socket.join(room.room);
    // console.log(room);
    socket.to(socket.room).broadcast.emit('get_drawing');
  })

  socket.on('return_drawing', function (data){
    socket.to(socket.room).broadcast.emit('insert_drawing', data)
  })

  socket.on('user_joined', function (data){
    socket.name = data.name;
  })

  socket.on('send_message', function (data){
    var string = "";
    string += socket.name + ": " + data.message;
    io.to(socket.room).emit("sent_message", {message:string});
    // io.to(user_list[socket.id].room).emit("sent_message", {message:string})

  })
})
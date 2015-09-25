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

var users = {};

io.sockets.on('connection', function (socket){
  console.log(socket.id, "has connected");

  socket.on('onMouseDown', function (eventpoint){
    socket.to(socket.room).broadcast.emit('OtherOnMouseDown', eventpoint)
  })

  socket.on('onMouseDrag', function (eventpoint){
    socket.to(socket.room).broadcast.emit('OtherOnMouseDrag', eventpoint)
  })

  socket.on('clear', function(){
    socket.to(socket.room).broadcast.emit('clear');
  })

// Socket joins room and gets previous drawing
  socket.on('need_drawing', function (room){
    
  })

  socket.on('return_drawing', function (data){
    socket.to(socket.room).broadcast.emit('insert_drawing', data)
  })

  socket.on('user_joined', function (data){
    socket.room = data.room;
    socket.join(data.room);

    socket.to(socket.room).broadcast.emit('get_drawing');
    socket.name = data.name;

    if (!users[data.room]){
      users[data.room] = [socket.name];
    } else {
      users[data.room].push(socket.name);
    }
    console.log(data);
    io.to(data.room).emit('update_user_list', users[data.room])
  })

  socket.on('send_message', function (data){
    var string = "";
    string += socket.name + ": " + data.message;
    io.to(socket.room).emit("sent_message", {message:string});
  })

  socket.on("disconnect", function (data){
    if(users[socket.room]){
      for (var i = 0; i < users[socket.room].length; i++){
        if (users[socket.room][i] == socket.name){
          users[socket.room].splice(i,1)
          break;
        }
      }  
    }
    io.to(socket.room).emit('update_user_list', users[socket.room])
  })
})
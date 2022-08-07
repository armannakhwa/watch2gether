const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({
  extended: true
}))

let rooms = {}
rooms[0] = {
  users: {}
}


app.get('/', (req, res) => {
  res.render('index', {
    rooms: rooms
  })
})

app.post('/room', (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = {
    users: {}
  }
  let url = req.body.room;
  console.log(req.body.room);
  res.redirect(url)

  // Send message that new room was created
  io.emit('room-created', req.body.room)

  // console.log(encodeURIComponent(req.body.vdourl))
})

app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }

  console.log(req.params.room)
  res.render('room', {
    roomName: req.params.room
  })
})



let acusers = {};
io.on('connection', socket => {

  socket.on('new-user', (room, name) => {
    socket.join(room)
    rooms[room].users[socket.id] = name

    acusers[socket.id] = {
      name,
      room
    };
    io.to(room).emit("allusers", acusers);

    socket.to(room).broadcast.emit('user-connected', name)



    socket.on("play_pause", ({
      msg: msg,
      name: name
    }) => {
      socket.to(room).broadcast.emit("ppstatus", {
        msg,
        name
      });

    });

    socket.on("track", ({
      msg: msg,
      name: name
    }) => {
      socket.to(room).broadcast.emit("trackstatus", {
        msg,
        name
      });
      console.log(msg)

    });

    socket.on('send-chat-message', (room, message) => {
      socket.to(room).broadcast.emit('chat-message', {
        message: message,
        name: rooms[room].users[socket.id]
      })
    })

  })






  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}

server.listen(process.env.PORT ||3000)

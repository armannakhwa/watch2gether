const express = require('express')
const app = express()


var server = require("http").createServer(app);
var io = require("socket.io")(server);

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


let vdourl;
app.post('/room', (req, res) => {
  if (req.body.vdourl.length == 5) {
    return res.redirect(req.body.vdourl)

  } else {
    if (rooms[req.body.room] != null) {
      return res.redirect('/')
    }
    rooms[req.body.room] = {
      users: {}
    }
    let url = req.body.room;
    vdourl = req.body.vdourl;
    console.log(vdourl);
    res.redirect(url)

    // Send message that new room was created
    io.emit('room-created', {
      room: url,
      videourl: vdourl
    })

    // console.log(encodeURIComponent(req.body.vdourl))
  }
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

server.listen(process.env.PORT || 3000, () => {
  console.log("Server is running")
})


let acusers = {};
io.on('connect', (sockets) => {

  sockets.on('new-user', (room, name) => {
    sockets.join(room)
    rooms[room].users[sockets.id] = name

    acusers[sockets.id] = {
      name,
      room,
      videourl: vdourl
    };
    io.to(room).emit("allusers", acusers);

    sockets.to(room).broadcast.emit('user-connected', name)



    sockets.on("play_pause", ({
      msg: msg,
      name: name,
      vt
    }) => {
      sockets.to(room).broadcast.emit("ppstatus", {
        msg,
        name,
        vt
      });

    });

    // sockets.on("track", ({
    //   msg: msg,
    //   name: name
    // }) => {
    //   sockets.to(room).broadcast.emit("trackstatus", {
    //     msg,
    //     name
    //   });
    //   console.log(msg)

    // });

    sockets.on('send-chat-message', (room, message) => {
      sockets.to(room).broadcast.emit('chat-message', {
        message: message,
        name: rooms[room].users[sockets.id]
      })
    })

  })






  sockets.on('disconnect', () => {
    getUserRooms(sockets).forEach(room => {
      sockets.to(room).broadcast.emit('user-disconnected', rooms[room].users[sockets.id])
      delete rooms[room].users[sockets.id]
    })
  })
})

function getUserRooms(sockets) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[sockets.id] != null) names.push(name)
    return names
  }, [])
}
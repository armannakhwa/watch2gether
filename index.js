const cors = require("cors");
var express = require("express");
var app = express();

var server = require("http").createServer(app);
var io = require("socket.io")(server);

app.use(express.static(__dirname + "/public"));

app.use(cors());
let users = {};

io.on("connection", (socket) => {
    socket.on("users", (name) => {
        users[socket.id] = name;
        console.log(users[socket.id]);
        socket.broadcast.emit("user", name);
        io.emit("allusers", users);
    });

    socket.on("play_pause", ({ msg: msg, name: name }) => {
        socket.broadcast.emit("ppstatus", { msg, name });
        console.log(msg)

    });


    socket.on("track", ({ msg: msg, name: name }) => {
      socket.broadcast.emit("trackstatus", { msg, name });
      console.log(msg)

  });



    socket.on("disconnect", (name) => {
        socket.broadcast.emit("leave", users[socket.id]);
        delete users[socket.id];
        io.emit("allusers", users);
    });
});

app.get("/", function (req, res, next) {
    res.sendFile(__dirname + "/index.html");
});

// http://localhost:30/
server.listen(process.env.PORT || 30);
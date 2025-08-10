const { Socket } = require("dgram");
const express = require("express");
const app = express();
const path = require("path");
  

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});

const io = require("socket.io")(server);

const connectedSockets = new Set();

io.on("connection", onConnected);

function onConnected(socket) {
  connectedSockets.add(socket.id);

  io.emit("clients-total", connectedSockets.size);

  socket.on("disconnect", () => {
    if (connectedSockets.has(socket.id)) {
      connectedSockets.delete(socket.id);
      io.emit("clients-total", connectedSockets.size);
    }
  });

  socket.on("message", (data) => {
    socket.broadcast.emit("chat-message", data);
  });

  socket.on("feedback", (data) => {
    socket.broadcast.emit("feedback", data);
  });
}

const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');
const { join } = require('path');

const server = http.createServer(app);

const io = new Server(server);

const userSocketMap = {};
const roomDrawingState = {}; // To keep track of the drawing state per room

function getAllConnectedClients(roomid) {
  return Array.from(io.sockets.adapter.rooms.get(roomid) || []).map((socketid) => {
    return {
      socketid,
      username: userSocketMap[socketid],
    };
  });
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on(ACTIONS.JOIN, ({ roomid, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomid);
    const clients = getAllConnectedClients(roomid);
    console.log(clients);
    clients.forEach(({ socketid }) => {
      io.to(socketid).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketid: socket.id,
      });
    });

    // Emit current drawing state to the newly joined user
    if (roomDrawingState[roomid]) {
      socket.emit(ACTIONS.SYNC_DRAWING, roomDrawingState[roomid]);
    }
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomid, code }) => {
    socket.in(roomid).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Handle drawing actions
  socket.on(ACTIONS.DRAW_ACTION, (data) => {
    const { roomid } = data;
    // Update the drawing state for the room
    if (!roomDrawingState[roomid]) {
      roomDrawingState[roomid] = [];
    }
    roomDrawingState[roomid].push(data);
    // Emit drawing action to all clients in the room
    socket.in(roomid).emit(ACTIONS.DRAW_ACTION, data);
  });

  // Handle synchronization of drawing state
  socket.on(ACTIONS.SYNC_DRAWING, (drawingData) => {
    const { roomid } = drawingData;
    roomDrawingState[roomid] = drawingData;
    socket.broadcast.to(roomid).emit(ACTIONS.SYNC_DRAWING, drawingData);
  });

  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomid) => {
      socket.in(roomid).emit(ACTIONS.DISCONNECTED, {
        socketid: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});

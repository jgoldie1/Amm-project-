// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let state = {
  hearts: 0,
  gifts: 0,
  coins: 0,
};

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  // Send initial state
  socket.emit('update', { ...state });

  // Listen for chat messages
  socket.on('chat', (data = {}) => {
    if (!data.text || typeof data.text !== 'string') return;
    let msg = { text: data.text };
    io.emit('chat', msg);
    // Bot responses
    if (msg.text === '/genz') {
      setTimeout(() => io.emit('chat', { text: 'no cap 🔥' }), 500);
    }
    if (msg.text === '/genx') {
      setTimeout(() => io.emit('chat', { text: 'back in my day 😎' }), 500);
    }
  });

  // Heart button tap
  socket.on('heart', () => {
    state.hearts += 1;
    io.emit('update', { ...state });
    io.emit('fx', { type: 'heart', power: 1 });
    io.emit('sound', 'heart');
  });

  // Gift button tap. data: { amount }
  socket.on('gift', (amount = 1) => {
    amount = Number(amount) || 1;
    if (amount < 1) amount = 1;
    if (amount > 99) amount = 99;
    state.gifts += amount;
    state.coins += amount * 10;
    io.emit('update', { ...state });
    io.emit('fx', { type: 'gift', power: amount });
    io.emit('sound', 'gift');
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server on http://localhost:' + PORT);
});

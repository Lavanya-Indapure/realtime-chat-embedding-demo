const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, '../client')));

// Basic route for the core chat UI
app.get('/chat-ui', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/chat-ui.html'));
});

// Broadcast messages to all connected clients
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', (msg) => {
    console.log('message: ' + JSON.stringify(msg));
    io.emit('chat message', msg);
  });

  socket.on('start-stream', (fullText) => {
    console.log('Starting stream for: ' + fullText);
    const streamId = Date.now();
    let currentText = '';
    const words = fullText.split(' ');
    let wordIndex = 0;

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
        io.emit('stream-chunk', {
          streamId,
          text: currentText,
          source: 'AI Stream',
          timestamp: Date.now()
        });
        wordIndex++;
      } else {
        clearInterval(interval);
        io.emit('stream-end', { streamId });
      }
    }, 200); // 200ms per word for better visibility
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

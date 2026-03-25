const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// 🔑 Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'your_api_key_here') {
  console.warn('WARNING: GEMINI_API_KEY is not set properly in server/.env');
} else {
  console.log('Gemini API Key detected (starts with: ' + apiKey.substring(0, 4) + '...)');
}

const genAI = new GoogleGenerativeAI(apiKey);

// ✅ Use the latest stable "flash" alias which supports streaming
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash" 
}, { apiVersion: "v1" });

// Serve frontend
app.use(express.static(path.join(__dirname, '../client')));

app.get('/chat-ui', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/chat-ui.html'));
});

// 🔌 Socket connection
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('chat message', async (msg) => {
    console.log('📩 Message from User:', msg.text);

    // Broadcast user's message to others
    socket.broadcast.emit('chat message', msg);

    // Prevent loop and only respond to real users
    if (msg.source === 'Gemini AI') return;

    try {
      const prompt = msg.text;
      
      // ✅ Using native streaming for better performance
      const result = await model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      const streamId = Date.now();
      let fullText = '';

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        
        // Emit chunks as they arrive from Gemini
        io.emit('stream-chunk', {
          streamId,
          text: fullText,
          source: 'Gemini AI',
          timestamp: Date.now()
        });
      }
      
      io.emit('stream-end', { streamId });

    } catch (error) {
      console.error('❌ Gemini Error:', error.message);
      io.emit('chat message', {
        text: `AI Error: ${error.message}. Please verify your API key and model access.`,
        source: 'Gemini AI',
        timestamp: Date.now()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// 🚀 Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

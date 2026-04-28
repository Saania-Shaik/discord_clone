const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');

const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));
app.set('io', io);

// Routes
const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/server');
const channelRoutes = require('./routes/channel');
const messageRoutes = require('./routes/message');
const userRoutes = require('./routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Discord Clone API Running');
});

const Channel = require('./models/Channel');
const ServerModel = require('./models/Server');

// Presence Tracking
const onlineUsers = new Map(); // userId -> socketId

// Setup Socket.io
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('setup', (userId) => {
    if (!userId) return;
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    
    // Broadcast all online users to everyone
    io.emit('online_users_update', Array.from(onlineUsers.keys()));
    console.log(`User ${userId} is online`);
  });

  socket.on('join_channel', (channelId) => {
    socket.join(channelId);
  });

  socket.on('send_message', async (data) => {
    try {
      const channel = await Channel.findById(data.channelId);
      if (channel) {
        if (channel.type === 'dm') {
          channel.members.forEach(memberId => {
            io.to(memberId.toString()).emit('receive_message', data);
          });
        } else if (channel.serverId) {
          const serverData = await ServerModel.findById(channel.serverId);
          if (serverData) {
            serverData.members.forEach(memberId => {
              io.to(memberId.toString()).emit('receive_message', data);
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('online_users_update', Array.from(onlineUsers.keys()));
      console.log(`User ${socket.userId} went offline`);
    }
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/discord-clone';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));

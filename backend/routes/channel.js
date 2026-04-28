const express = require('express');
const Channel = require('../models/Channel');
const Server = require('../models/Server');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Get DM channels for current user
router.get('/dms', auth, async (req, res) => {
  try {
    const dms = await Channel.find({ type: 'dm', members: req.user.id }).populate('members', 'username displayName avatar');
    res.json(dms);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start or get a DM channel
router.post('/dms', auth, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    let channel = await Channel.findOne({
      type: 'dm',
      members: { $all: [req.user.id, targetUserId] }
    }).populate('members', 'username displayName avatar');

    if (!channel) {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) return res.status(404).json({ error: 'User not found' });
      
      channel = new Channel({
        channelName: `${targetUser.username}, ${req.user.username}`, // arbitrary internal name
        type: 'dm',
        members: [req.user.id, targetUserId]
      });
      await channel.save();
      channel = await channel.populate('members', 'username displayName avatar');

      // Notify both members via socket
      const io = req.app.get('io');
      channel.members.forEach(member => {
        io.to(member._id.toString()).emit('dm_created', channel);
      });
    }
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get channels for a server
router.get('/:serverId', auth, async (req, res) => {
  if (req.params.serverId === 'dms') return res.json([]); // prevent collision
  try {
    const channels = await Channel.find({ serverId: req.params.serverId });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a channel
router.post('/', auth, async (req, res) => {
  try {
    const { serverId, channelName, type } = req.body;
    
    const server = await Server.findById(serverId);
    if (!server) return res.status(404).json({ error: 'Server not found' });
    
    // Admin check: Only the server owner can create channels
    if (server.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the server admin can create channels' });
    }

    const newChannel = new Channel({
      serverId,
      channelName,
      type: type || 'text'
    });

    await newChannel.save();
    
    server.channels.push(newChannel._id);
    await server.save();

    // Notify all server members via socket
    const io = req.app.get('io');
    const populatedServer = await Server.findById(serverId).populate('members', 'username displayName avatar');
    populatedServer.members.forEach(member => {
      io.to(member._id.toString()).emit('channel_created', { serverId, channel: newChannel });
    });

    res.status(201).json(newChannel);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

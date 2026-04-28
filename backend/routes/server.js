const express = require('express');
const Server = require('../models/Server');
const Channel = require('../models/Channel');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Get all servers user is a part of
router.get('/', auth, async (req, res) => {
  try {
    const servers = await Server.find({ members: req.user.id });
    res.json(servers);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific server details with populated members
router.get('/:id', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id).populate('members', 'username displayName avatar');
    if (!server) return res.status(404).json({ error: 'Server not found' });
    res.json(server);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a server
router.post('/', auth, async (req, res) => {
  try {
    const { serverName } = req.body;
    const newServer = new Server({
      serverName,
      ownerId: req.user.id,
      admins: [req.user.id],
      members: [req.user.id]
    });
    
    await newServer.save();

    // Create default general channel
    const generalChannel = new Channel({
      serverId: newServer._id,
      channelName: 'general'
    });
    await generalChannel.save();

    newServer.channels.push(generalChannel._id);
    await newServer.save();

    res.status(201).json(newServer);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Join a server
router.post('/:id/join', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found' });

    if (!server.members.includes(req.user.id)) {
      server.members.push(req.user.id);
      await server.save();
    }
    
    // Notify all members via socket
    const io = req.app.get('io');
    const updatedServer = await Server.findById(server._id).populate('members', 'username displayName avatar');
    updatedServer.members.forEach(member => {
      const memberId = member._id || member;
      io.to(memberId.toString()).emit('server_update', updatedServer);
    });

    res.json(updatedServer);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle admin status for a member
router.post('/:id/admin', auth, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const server = await Server.findById(req.params.id).populate('members', 'username displayName avatar');
    if (!server) return res.status(404).json({ error: 'Server not found' });

    // Only owner can promote/demote admins
    if (server.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the server owner can manage admins.' });
    }

    if (targetUserId === server.ownerId.toString()) {
      return res.status(400).json({ error: 'Cannot change owner admin status.' });
    }

    const isAdmin = server.admins.includes(targetUserId);
    if (isAdmin) {
      server.admins = server.admins.filter(id => id.toString() !== targetUserId);
    } else {
      server.admins.push(targetUserId);
    }

    await server.save();

    // Notify all members via socket
    const io = req.app.get('io');
    server.members.forEach(member => {
      const memberId = member._id || member;
      io.to(memberId.toString()).emit('server_update', server);
    });

    res.json(server);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

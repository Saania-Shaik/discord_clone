const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get messages for a channel
router.get('/:channelId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ channelId: req.params.channelId })
                                  .populate('senderId', 'username displayName avatar')
                                  .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a message (supports text and/or multiple images)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { channelId, message } = req.body;
    const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    if (!message && imageUrls.length === 0) {
      return res.status(400).json({ error: 'Message or at least one image is required' });
    }
    
    const newMessage = new Message({
      channelId,
      senderId: req.user.id,
      message,
      imageUrls
    });

    await newMessage.save();
    const populatedMessage = await Message.findById(newMessage._id).populate('senderId', 'username displayName avatar');

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error('MESSAGE_POST_ERROR:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;

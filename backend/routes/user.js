const express = require('express');
const User = require('../models/User');
const Note = require('../models/Note');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Get all users (except current user) to start a DM
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile including notes
router.get('/:id/profile', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id).select('-password');
    if (!targetUser) return res.status(404).json({ error: 'User not found' });
    
    // Find note written by current user about target user
    const note = await Note.findOne({ authorId: req.user.id, targetUserId: req.params.id });
    
    res.json({
      ...targetUser.toObject(),
      note: note ? note.content : ''
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update own profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { displayName, pronouns, bio } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, {
      $set: { displayName, pronouns, bio }
    }, { new: true }).select('-password');
    
    // Emit user update to all users
    const io = req.app.get('io');
    if (io) io.emit('user_update', user);
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update note for a user
router.put('/:id/note', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const targetUserId = req.params.id;
    const authorId = req.user.id;
    
    let note = await Note.findOne({ authorId, targetUserId });
    if (note) {
      note.content = content;
      await note.save();
    } else {
      note = await Note.create({ authorId, targetUserId, content });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

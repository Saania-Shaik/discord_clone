const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const email = req.body.email?.toLowerCase();
    
    // Strict Email Validation
    const validateEmail = (email) => {
      if (!email || !email.includes('@')) return false;
      if (email.length > 320) return false;
      const [local, domain] = email.split('@');
      if (!local || !domain || local.length > 64) return false;
      if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
      if (domain.startsWith('-') || domain.endsWith('-')) return false;
      const domainParts = domain.split('.');
      if (domainParts.length < 2) return false; 
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      return emailRegex.test(email);
    };

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address (e.g., name@example.com).' });
    }

    // Check if email is already used
    let existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: 'An account with this email already exists.' });

    // Check if username is already used
    let existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ error: 'This username is already taken.' });

    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, username, email, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const password = req.body.password;
    const email = req.body.email?.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

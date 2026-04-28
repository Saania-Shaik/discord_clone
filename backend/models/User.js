const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://cdn.discordapp.com/embed/avatars/0.png' },
  displayName: { type: String },
  pronouns: { type: String },
  bio: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

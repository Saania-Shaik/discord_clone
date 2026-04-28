const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: false }, // Optional for DMs
  channelName: { type: String, required: true },
  type: { type: String, enum: ['text', 'voice', 'dm'], default: 'text' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Used for DMs
}, { timestamps: true });

module.exports = mongoose.model('Channel', channelSchema);

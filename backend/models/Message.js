const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  imageUrls: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);

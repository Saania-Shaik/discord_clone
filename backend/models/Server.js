const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  serverName: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }]
}, { timestamps: true });

module.exports = mongoose.model('Server', serverSchema);

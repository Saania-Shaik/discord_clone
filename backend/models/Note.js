const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' }
}, { timestamps: true });

// Ensure one note per author-target pair
noteSchema.index({ authorId: 1, targetUserId: 1 }, { unique: true });

module.exports = mongoose.model('Note', noteSchema);

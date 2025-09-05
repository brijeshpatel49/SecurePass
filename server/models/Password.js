const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  username: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  encryptedPassword: {
    type: String,
    required: [true, 'Password is required']
  },
  category: {
    type: String,
    enum: ['social', 'work', 'finance', 'entertainment', 'shopping', 'other'],
    default: 'other'
  },
  notes: {
    type: String,
    trim: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better search performance
passwordSchema.index({ userId: 1, title: 'text', website: 'text' });

module.exports = mongoose.model('Password', passwordSchema);
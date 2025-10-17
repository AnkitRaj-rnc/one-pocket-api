const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
categorySchema.index({ userId: 1 });

// Unique compound index to prevent duplicate category names per user (case-insensitive)
categorySchema.index(
  { userId: 1, name: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 } // strength: 2 makes it case-insensitive
  }
);

// Transform _id to id in JSON responses
categorySchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Category', categorySchema);

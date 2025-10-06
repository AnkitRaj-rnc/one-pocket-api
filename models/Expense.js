const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'upi'],
    default: 'upi'
  },
  note: {
    type: String,
    default: ''
  },
  reimbursable: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Transform _id to id in JSON responses
expenseSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Expense', expenseSchema);

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true
  },
  class: {
    type: String,
    required: [true, 'Class is required']
  },
  section: {
    type: String,
    default: 'A'
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  address: {
    type: String
  },
  // Parent / Guardian Info
  parentName: {
    type: String,
    required: [true, 'Parent name is required']
  },
  parentEmail: {
    type: String,
    required: [true, 'Parent email is required'],
    lowercase: true
  },
  parentPhone: {
    type: String,
    required: [true, 'Parent phone is required']
  },
  // Fee Info
  feeAmount: {
    type: Number,
    required: [true, 'Fee amount is required'],
    default: 0
  },
  feePaid: {
    type: Number,
    default: 0
  },
  feeStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue'],
    default: 'Pending'
  },
  feeDueDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Virtual: fee balance
studentSchema.virtual('feeBalance').get(function () {
  return this.feeAmount - this.feePaid;
});

module.exports = mongoose.model('Student', studentSchema);

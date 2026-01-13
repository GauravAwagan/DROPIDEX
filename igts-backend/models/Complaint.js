const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true }, // e.g. "TICKET-888"
  
  // Who reported the issue?
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['sender', 'driver'], required: true },

  // The Issue
  subject: { type: String, required: true },
  description: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },

  // Resolution Status
  status: { 
    type: String, 
    enum: ['pending', 'resolved'], 
    default: 'pending' 
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);
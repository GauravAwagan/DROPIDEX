const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  // --- CORE INFO ---
  shipmentId: { type: String, required: true, unique: true }, // e.g. "SHP-1001"
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // --- CARGO DETAILS ---
  from: { type: String, required: true },
  to: { type: String, required: true },
  productName: { type: String, required: true },
  weight: { type: Number, required: true }, // In KG
  dimensions: { type: String }, // "10x10x10"
  
  // --- COST & PAYMENT ---
  cost: { type: Number, required: true }, // Calculated cost
  paymentStatus: { 
    type: String, 
    enum: ['Unpaid', 'Paid'], 
    default: 'Unpaid' 
  },

  // --- TRACKING STATUS ---
  status: { 
    type: String, 
    enum: [
      'Pending',          // Created by Sender
      'Payment Pending',  // Admin assigned driver, waiting for payment
      'Assigned',         // Paid, visible to Driver
      'Picked',           // Driver picked up
      'In-Transit',       // Journey started
      'Delivered',        // Completed
      'Cancelled'
    ], 
    default: 'Pending' 
  },

  // --- SECURITY ---
  pickupOtp: { type: String }, 
  deliveryOtp: { type: String },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Shipment', shipmentSchema);
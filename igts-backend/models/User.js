const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store hashed passwords in real app
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['sender', 'driver', 'admin'], 
    default: 'sender' 
  },
  
  // --- DRIVER SPECIFIC DATA ---
  // This allows the Admin to check capacity before assigning
  driverDetails: {
    vehicleType: { type: String }, // e.g., "Tata Ace", "Truck"
    vehicleNumber: { type: String }, // e.g., "MH-12-AB-9999"
    totalCapacity: { type: Number }, // Max weight in KG (e.g., 2000)
    currentLoad: { type: Number, default: 0 }, // Current weight on truck
    isAvailable: { type: Boolean, default: true },
    currentRoute: {
      from: String, // e.g. "Mumbai"
      to: String    // e.g. "Delhi"
    }
  },

  // --- SENDER SPECIFIC DATA ---
  address: { type: String },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
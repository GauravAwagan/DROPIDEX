const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer'); 

// --- MODELS ---
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, 
  phone: String,
  role: { type: String, enum: ['sender', 'admin', 'driver'], default: 'sender' },
  address: String,
  driverDetails: {
    licenseNumber: String,
    isAvailable: { type: Boolean, default: true },
    currentLocation: { type: String, default: 'Pune' },
    currentLoad: { type: Number, default: 0 },
    assignedVehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null }
  },
  createdAt: { type: Date, default: Date.now }
});

const VehicleSchema = new mongoose.Schema({
  number: { type: String, unique: true, required: true },
  type: { type: String, required: true }, 
  capacity: { type: Number, required: true },
  fuelType: { type: String, default: 'Diesel' },
  status: { type: String, enum: ['Available', 'In-Use', 'Maintenance'], default: 'Available' },
  currentDriverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

// NEW: Route Schema with Designated Driver
const RouteSchema = new mongoose.Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  distance: { type: Number, required: true }, // in km
  preferredDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } 
});

const ShipmentSchema = new mongoose.Schema({
  shipmentId: String,
  from: String, to: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productName: String, weight: Number, cost: Number,
  pickupOtp: String, deliveryOtp: String,
  status: { type: String, default: 'Pending' }, 
  paymentStatus: { type: String, default: 'Unpaid' },
  createdAt: { type: Date, default: Date.now },
  deliveredAt: Date
});

const ComplaintSchema = new mongoose.Schema({
  ticketId: String,
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: String, description: String, status: { type: String, default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Vehicle = mongoose.model('Vehicle', VehicleSchema);
const Route = mongoose.model('Route', RouteSchema);
const Shipment = mongoose.model('Shipment', ShipmentSchema);
const Complaint = mongoose.model('Complaint', ComplaintSchema);

// --- APP SETUP ---
const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = '';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ DB Error:', err));

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: ' ', // <--- REPLACE WITH YOUR GMAIL
    pass: ' '     // <--- REPLACE WITH YOUR 16-CHAR APP PASSWORD
  }
});

// --- ROUTES ---

// 1. AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json(newUser);
  } catch (err) { res.status(400).json({ error: 'Email already exists' }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).populate('driverDetails.assignedVehicleId');
  
  if (!user || user.password !== password) return res.status(400).json({ error: 'Invalid credentials' });
  
  res.json({ 
    id: user._id, 
    name: user.name, 
    email: user.email, 
    role: user.role, 
    phone: user.phone,
    driverDetails: user.role === 'driver' ? {
      ...user.driverDetails.toObject(),
      vehicleNumber: user.driverDetails.assignedVehicleId?.number || 'No Vehicle',
      vehicleType: user.driverDetails.assignedVehicleId?.type || '',
      totalCapacity: user.driverDetails.assignedVehicleId?.capacity || 0
    } : null
  });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const mailOptions = {
      from: 'IGTS Support <no-reply@igts.com>',
      to: email,
      subject: 'Password Reset Request - IGTS',
      text: `Hello ${user.name},\n\nWe received a request to reset your password.\n\nPlease contact admin to manually reset it.\n\nRegards,\nIGTS Team`
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// 2. VEHICLE ROUTES
app.get('/api/vehicles', async (req, res) => {
  const vehicles = await Vehicle.find().populate('currentDriverId', 'name phone');
  res.json(vehicles);
});

app.post('/api/vehicles', async (req, res) => {
  try { await new Vehicle(req.body).save(); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/vehicles/assign', async (req, res) => {
  const { vehicleId, driverId } = req.body;
  try {
    await Vehicle.updateMany({ currentDriverId: driverId }, { $set: { currentDriverId: null, status: 'Available' } });
    await User.findByIdAndUpdate(driverId, { 'driverDetails.assignedVehicleId': null });

    if (!vehicleId) return res.json({ message: 'Driver unassigned' });

    await Vehicle.findByIdAndUpdate(vehicleId, { currentDriverId: driverId, status: 'In-Use' });
    await User.findByIdAndUpdate(driverId, { 'driverDetails.assignedVehicleId': vehicleId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. DRIVER ROUTES
app.get('/api/drivers/active', async (req, res) => {
  // Only return drivers who are currently marked as available
  const drivers = await User.find({ role: 'driver', 'driverDetails.isAvailable': true }).populate('driverDetails.assignedVehicleId');
  res.json(drivers);
});

app.put('/api/drivers/:id', async (req, res) => {
  try {
    const { name, email, phone, location, password } = req.body;
    const updateData = { name, email, phone, address: location };
    if (password && password.trim() !== '') updateData.password = password;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    if (!updatedUser) return res.status(404).json({ error: 'Driver not found' });
    res.json(updatedUser);
  } catch (err) { res.status(500).json({ error: 'Failed to update driver' }); }
});

// 4. SHIPMENT ROUTES
app.post('/api/shipments', async (req, res) => {
  try {
    const { senderId, ...data } = req.body;
    const newShipment = new Shipment({
      shipmentId: `SHP-${Math.floor(Math.random() * 100000)}`,
      sender: senderId,
      pickupOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      ...data
    });
    await newShipment.save();
    res.json(newShipment);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/shipments/all', async (req, res) => {
  const shipments = await Shipment.find().populate('sender', 'name').populate('driver', 'name');
  res.json(shipments);
});

app.get('/api/shipments/sender/:senderId', async (req, res) => {
  const shipments = await Shipment.find({ sender: req.params.senderId }).populate('driver', 'name');
  res.json(shipments);
});

// --- UPDATED: ASSIGN DRIVER (Marks Driver as BUSY) ---
app.put('/api/shipments/assign', async (req, res) => {
  const { shipmentId, driverId } = req.body;
  try {
    // 1. Assign Driver
    await Shipment.findByIdAndUpdate(shipmentId, { driver: driverId, status: 'Payment Pending' });
    
    // 2. Mark Driver as Unavailable (Busy)
    await User.findByIdAndUpdate(driverId, { 'driverDetails.isAvailable': false });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/shipments/pay/:id', async (req, res) => {
  await Shipment.findByIdAndUpdate(req.params.id, { paymentStatus: 'Paid', status: 'Assigned' });
  res.json({ success: true });
});

app.get('/api/driver/jobs/:driverId', async (req, res) => {
  const jobs = await Shipment.find({ 
    driver: req.params.driverId, 
    status: { $in: ['Assigned', 'Picked', 'In-Transit', 'Delivered'] } 
  }).populate('sender', 'name phone').sort({ createdAt: -1 });
  res.json(jobs);
});

// --- UPDATED: STATUS UPDATE (Frees Driver on Delivery/Cancel) ---
app.put('/api/shipments/status', async (req, res) => {
  const { shipmentId, status, otp } = req.body;
  try {
    const shipment = await Shipment.findById(shipmentId);
    
    if (status === 'Delivered' && shipment.deliveryOtp !== otp) {
      return res.status(400).json({ error: 'Invalid PIN' });
    }

    shipment.status = status;
    if (status === 'Picked') shipment.pickedAt = new Date();
    
    // IF Finished, Make Driver Available Again
    if (status === 'Delivered' || status === 'Cancelled') {
        shipment.deliveredAt = new Date();
        if (shipment.driver) {
            await User.findByIdAndUpdate(shipment.driver, { 'driverDetails.isAvailable': true });
        }
    }

    await shipment.save();
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. COMPLAINT ROUTES
app.get('/api/complaints', async (req, res) => {
  const tickets = await Complaint.find().populate('reportedBy', 'name email');
  res.json(tickets);
});

app.post('/api/complaints', async (req, res) => {
  await new Complaint({ ...req.body, ticketId: `TKT-${Math.floor(Math.random()*9000)}` }).save();
  res.json({ success: true });
});

app.put('/api/complaints/resolve/:id', async (req, res) => {
  await Complaint.findByIdAndUpdate(req.params.id, { status: 'Resolved' });
  res.json({ success: true });
});

// 6. ROUTE MANAGEMENT ROUTES
app.get('/api/routes', async (req, res) => {
  try {
    // Populate preferred driver details
    const routes = await Route.find().populate('preferredDriver', 'name phone');
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NEW: Get ALL Drivers (for Admin Dashboard)
app.get('/api/drivers/all', async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' })
      .populate('driverDetails.assignedVehicleId')
      .sort({ name: 1 }); // Sort alphabetically
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/routes', async (req, res) => {
  const { origin, destination, distance, preferredDriver } = req.body;
  try {
    const existing = await Route.findOne({
      $or: [
        { origin, destination },
        { origin: destination, destination: origin }
      ]
    });

    if (existing) return res.status(400).json({ error: 'Route already exists!' });

    // Save route with driver preference
    const newRoute = new Route({ origin, destination, distance, preferredDriver });
    await newRoute.save();
    res.json(newRoute);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE ROUTE
app.put('/api/routes/:id', async (req, res) => {
  const { origin, destination, distance, preferredDriver } = req.body;
  try {
    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id, 
      { origin, destination, distance, preferredDriver },
      { new: true }
    );
    res.json(updatedRoute);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/routes/:id', async (req, res) => {
  try {
    await Route.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('🚀 IGTS Server Running'));

// const mongoose = require('mongoose');
// const User = require('./models/User');
// const Shipment = require('./models/Shipment');
// const Complaint = require('./models/Complaint');

// // --- YOUR ATLAS CONNECTION STRING ---
// // REPLACE <db_password> with your actual password!
// const MONGO_URI = 'mongodb+srv://nitinpanzade185:root@cluster0.wux8pno.mongodb.net/igts_db?appName=Cluster0';

// const seedDatabase = async () => {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log('✅ Connected to MongoDB Atlas');

//     // 1. Clear existing data (Optional: Be careful!)
//     await User.deleteMany({});
//     await Shipment.deleteMany({});
//     await Complaint.deleteMany({});
//     console.log('🧹 Cleared old data');

//     // 2. Create Users (Sender, Driver, Admin)
//     const sender = await User.create({
//       name: 'Priya Sender',
//       email: 'sender@test.com',
//       password: '123',
//       phone: '9876543210',
//       role: 'sender',
//       address: 'Mumbai, Andheri East'
//     });

//     const driver = await User.create({
//       name: 'Rajesh Driver',
//       email: 'driver@test.com',
//       password: '123',
//       phone: '9123456789',
//       role: 'driver',
//       driverDetails: {
//         vehicleType: 'Tata Ace',
//         vehicleNumber: 'MH-04-XY-5555',
//         totalCapacity: 1000, // 1000 kg capacity
//         currentLoad: 0,
//         currentRoute: { from: 'Mumbai', to: 'Pune' }
//       }
//     });

//     const admin = await User.create({
//       name: 'Super Admin',
//       email: 'admin@test.com',
//       password: '123',
//       phone: '1111111111',
//       role: 'admin'
//     });

//     console.log('👥 Users Created');

//     // 3. Create a Shipment
//     const shipment = await Shipment.create({
//       shipmentId: 'SHP-1001',
//       sender: sender._id,
//       driver: driver._id, // Assigned to Rajesh
//       from: 'Mumbai',
//       to: 'Pune',
//       productName: 'Office Chairs',
//       weight: 200,
//       cost: 2500,
//       status: 'Pending',
//       paymentStatus: 'Unpaid',
//       pickupOtp: '1234',
//       deliveryOtp: '9999'
//     });

//     console.log('📦 Shipment Created');

//     // 4. Create a Complaint
//     await Complaint.create({
//       ticketId: 'TICKET-001',
//       reportedBy: sender._id,
//       role: 'sender',
//       subject: 'Late Pickup',
//       description: 'Driver was supposed to arrive at 10 AM.',
//       priority: 'medium'
//     });

//     console.log('⚠️ Complaint Created');
//     console.log('✅ DATABASE SEEDING COMPLETE!');
//     process.exit();

//   } catch (error) {
//     console.error('❌ Error:', error);
//     process.exit(1);
//   }
// };

// seedDatabase();
const mongoose = require('mongoose');

// --- CONFIG ---
const MONGO_URI = 'mongodb+srv://nitinpanzade185:root@cluster0.wux8pno.mongodb.net/igts_db?appName=Cluster0'; 

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({}, { strict: false });
const vehicleSchema = new mongoose.Schema({}, { strict: false });
const shipmentSchema = new mongoose.Schema({}, { strict: false });
const complaintSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const Vehicle = mongoose.model('Vehicle', vehicleSchema);
const Shipment = mongoose.model('Shipment', shipmentSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to DB.');

    // --- STEP 1: CLEANUP (Delete old data) ---
    console.log('🧹 Cleaning old data...');
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Shipment.deleteMany({});
    await Complaint.deleteMany({});
    console.log('✨ Old data cleared.');

    // --- STEP 2: CREATE DATA ---
    
    // 1. Create a Vehicle
    const truck = await new Vehicle({
      number: 'MH-12-DE-2026',
      type: 'Tata Ace',
      capacity: 1000,
      status: 'In-Use'
    }).save();
    console.log('🚛 Vehicle Created');

    // 2. Create a Driver
    const driver = await new User({
      name: 'Rajesh Driver',
      email: 'driver@test.com',
      password: '123',
      role: 'driver',
      phone: '9876543210',
      driverDetails: {
        isAvailable: true,
        currentLocation: 'Pune',
        assignedVehicleId: truck._id,
        currentLoad: 0
      },
      createdAt: new Date('2026-01-01')
    }).save();
    console.log('👤 Driver Created');

    // Link driver back to truck
    truck.currentDriverId = driver._id;
    await truck.save();

    // 3. Create a Sender
    const sender = await new User({
      name: 'Amit Sender',
      email: 'sender@test.com',
      password: '123',
      role: 'sender',
      createdAt: new Date('2026-01-01')
    }).save();
    console.log('👤 Sender Created');

    // 4. Create Shipments (Jan 2026)
    const shipments = [
        { id: 'SHP-101', status: 'Delivered', cost: 1500, date: '2026-01-02' },
        { id: 'SHP-102', status: 'Delivered', cost: 2500, date: '2026-01-03' },
        { id: 'SHP-103', status: 'Delivered', cost: 1200, date: '2026-01-04' },
        { id: 'SHP-104', status: 'Pending', cost: 3000, date: '2026-01-05' },
    ];

    for (let s of shipments) {
        await new Shipment({
            shipmentId: s.id,
            from: 'Mumbai',
            to: 'Pune',
            productName: 'Electronics Package', // <--- ADDED THIS
            weight: 50,
            cost: s.cost,
            status: s.status,
            paymentStatus: 'Paid',
            sender: sender._id,
            driver: driver._id,
            createdAt: new Date(s.date),
            deliveredAt: s.status === 'Delivered' ? new Date(s.date) : null
        }).save();
    }
    console.log('📦 4 Shipments Created');

    // 5. Create Complaints
    const complaints = [
        { id: 'TKT-901', subject: 'Package Damaged', status: 'Open', desc: 'Box was crushed upon arrival.' },
        { id: 'TKT-902', subject: 'Late Delivery', status: 'Resolved', desc: 'Driver arrived 2 hours late.' }
    ];

    for (let c of complaints) {
        await new Complaint({
            ticketId: c.id,
            reportedBy: sender._id,
            subject: c.subject,
            description: c.desc,
            status: c.status,
            createdAt: new Date('2026-01-06')
        }).save();
    }
    console.log('⚠️ 2 Complaints Created');

    console.log('✅ Database Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

seedDatabase();
import React, { useState, useEffect } from 'react';
import { MapPin, Scale, IndianRupee, Truck, Package, Ruler, MessageSquare, AlertTriangle, Plus, Trash2, Loader2, ArrowRight } from 'lucide-react'; 
import { StatusStepper, Modal } from './Shared';
import axios from 'axios';

const SenderDashboard = ({ onShowToast, onBookShipment }) => {
  const [activeShipments, setActiveShipments] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [fetching, setFetching] = useState(true);
  
  // --- DYNAMIC ROUTES STATE ---
  const [dbRoutes, setDbRoutes] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  // Location State
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  
  // Items State
  const [items, setItems] = useState([
    { id: 1, name: '', weight: '', unit: 'kg', dimensions: '' }
  ]);

  const [calculatedCost, setCalculatedCost] = useState(0);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [complaint, setComplaint] = useState({ subject: '', message: '' });

  const user = JSON.parse(localStorage.getItem('user')) || {};

  // --- 1. FETCH DATA (Shipments & Routes) ---
  const fetchInitialData = async () => {
    if (!user.id) return;

    try {
      const [shipmentRes, routesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/shipments/sender/${user.id}`),
        axios.get('http://localhost:5000/api/routes')
      ]);

      // Process Shipments
      const sorted = shipmentRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setActiveShipments(sorted.slice(0, 3));

      // Process Routes
      setDbRoutes(routesRes.data);
      
      // Extract Unique Cities for Dropdown
      const cities = new Set();
      routesRes.data.forEach(r => {
        cities.add(r.origin);
        cities.add(r.destination);
      });
      setAvailableCities(Array.from(cities).sort());

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- COST CALCULATION LOGIC ---
  useEffect(() => {
    if (pickupLocation && dropLocation && items.length > 0) {
      
      // Find Distance from DB Routes (Bidirectional search)
      const route = dbRoutes.find(r => 
        (r.origin === pickupLocation && r.destination === dropLocation) ||
        (r.origin === dropLocation && r.destination === pickupLocation)
      );

      if (!route) {
        setCalculatedCost(0); // If route doesn't exist in DB, cost is 0 (button disabled)
        return; 
      }

      const distance = route.distance;
      let totalCargoCost = 0;

      items.forEach(item => {
        if(item.weight && item.dimensions) {
          let weightInKg = parseFloat(item.weight);
          if (item.unit === 'tonnes') weightInKg = weightInKg * 1000;
          
          // Volume Score Calculation logic
          let volumeScore = 200; 
          const dims = item.dimensions.toLowerCase().split('x').map(d => parseFloat(d));
          if (dims.length === 3 && !dims.some(isNaN)) volumeScore = (dims[0] * dims[1] * dims[2]) / 5;
          
          totalCargoCost += (weightInKg * 15) + volumeScore;
        }
      });
      
      const baseCost = (distance * 5); 
      setCalculatedCost(totalCargoCost > 0 ? Math.round(baseCost + totalCargoCost) : 0);
    } else {
      setCalculatedCost(0);
    }
  }, [pickupLocation, dropLocation, items, dbRoutes]);

  // --- HANDLERS ---
  const handleItemChange = (id, field, value) => {
    const newItems = items.map(item => item.id === id ? { ...item, [field]: value } : item);
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { id: Date.now(), name: '', weight: '', unit: 'kg', dimensions: '' }]);
  
  const removeItem = (id) => {
    if(items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  const handleBookShipment = async () => {
    const invalidItems = items.some(i => !i.name || !i.weight || !i.dimensions);
    if (!pickupLocation || !dropLocation || invalidItems) {
      onShowToast('Please fill all details for all items', 'error');
      return;
    }

    setLoading(true);
    const productSummary = items.map(i => `${i.name} (${i.weight}${i.unit})`).join(', ');
    const totalWeight = items.reduce((sum, i) => {
        let w = parseFloat(i.weight);
        if (i.unit === 'tonnes') w = w * 1000;
        return sum + w;
    }, 0);

    const payload = {
      senderId: user.id,
      from: pickupLocation,
      to: dropLocation,
      productName: productSummary,
      weight: totalWeight,
      dimensions: `${items.length} Packages`,
      cost: calculatedCost
    };

    try {
      const res = await axios.post('http://localhost:5000/api/shipments', payload);
      onShowToast(`Shipment Confirmed! ₹${calculatedCost}`);
      if (onBookShipment) onBookShipment(res.data);
      fetchInitialData();
      setPickupLocation(''); 
      setDropLocation(''); 
      setItems([{ id: Date.now(), name: '', weight: '', unit: 'kg', dimensions: '' }]); 
      setCalculatedCost(0);
    } catch (err) {
      onShowToast(err.response?.data?.error || "Booking Failed", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Complaint Handler
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/complaints', {
        reportedBy: user.id,
        role: 'sender',
        subject: complaint.subject,
        description: complaint.message,
        status: 'Open'
      });
      onShowToast(`Complaint Submitted`);
      setIsSupportOpen(false);
      setComplaint({ subject: '', message: '' });
    } catch (err) { onShowToast("Failed to submit", 'error'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setIsSupportOpen(true)} className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors shadow-sm">
          <AlertTriangle className="w-4 h-4" /> Help & Support
        </button>
      </div>

      {/* BOOKING CARD */}
      <div className="bg-white rounded-xl shadow-md p-8 border-t-4 border-blue-900 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2"><Truck className="w-6 h-6 text-blue-900" /> Book New Shipment</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">Pickup City</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <select value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer">
                    <option value="">Select Origin...</option>
                    {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">Drop City</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <select value={dropLocation} onChange={(e) => setDropLocation(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer">
                    <option value="">Select Destination...</option>
                    {availableCities.map(c => <option key={c} value={c} disabled={c === pickupLocation}>{c}</option>)}
                </select>
            </div>
          </div>
        </div>

        {/* ITEMS LIST */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Package Details</h3>
            <button onClick={addItem} className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"><Plus className="w-4 h-4" /> Add Another Package</button>
          </div>
          {items.map((item, index) => (
            <div key={item.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative animate-slide-up">
              <div className="flex justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">Package #{index + 1}</span>
                {items.length > 1 && <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div><div className="relative"><Package className="absolute left-3 top-3 w-4 h-4 text-gray-400" /><input type="text" placeholder="Item Name" value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div></div>
                <div><div className="flex"><div className="relative flex-1"><Scale className="absolute left-3 top-3 w-4 h-4 text-gray-400" /><input type="number" placeholder="Weight" value={item.weight} onChange={(e) => handleItemChange(item.id, 'weight', e.target.value)} className="w-full pl-9 pr-3 py-2 border-y border-l rounded-l-lg text-sm outline-none" /></div><select value={item.unit} onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)} className="bg-white border border-gray-200 text-gray-700 text-sm px-2 rounded-r-lg font-bold"><option value="kg">KG</option><option value="tonnes">T</option></select></div></div>
                <div><div className="relative"><Ruler className="absolute left-3 top-3 w-4 h-4 text-gray-400" /><input type="text" placeholder="L x W x H (ft)" value={item.dimensions} onChange={(e) => handleItemChange(item.id, 'dimensions', e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div></div>
              </div>
            </div>
          ))}
        </div>

        {calculatedCost > 0 ? (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 animate-scale-in">
              <div className="flex items-center gap-4"><div className="p-3 bg-blue-100 rounded-full text-blue-700"><IndianRupee className="w-6 h-6" /></div><div><p className="text-sm font-bold text-blue-900 uppercase tracking-wide">Total Shipment Cost</p><p className="text-3xl font-extrabold text-blue-800">₹{calculatedCost.toLocaleString()}</p></div></div>
              <button onClick={handleBookShipment} disabled={loading} className="px-8 py-3 bg-blue-900 text-white rounded-lg font-bold shadow-lg hover:bg-blue-800 active:scale-95 transition-all flex items-center gap-2">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm & Book <ArrowRight className="w-5 h-5" /></>}</button>
          </div>
        ) : (
            <div className="p-4 bg-gray-100 rounded-xl text-center text-gray-500 text-sm italic">
                {pickupLocation && dropLocation ? "Route not found in database. Contact admin." : "Select locations and add items to see price."}
            </div>
        )}
      </div>
      
      {/* RECENT ACTIVITY */}
      <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
      <div className="space-y-4">
        {fetching ? <div className="text-center py-10 text-gray-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" /> Loading History...</div> : activeShipments.length === 0 ? <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">No recent shipments found.</div> : activeShipments.map(shipment => (
            <div key={shipment._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
              <div className="flex justify-between items-start mb-4">
                <div><h4 className="text-lg font-bold text-gray-800">{shipment.shipmentId}</h4><div className="flex items-center gap-2 text-sm text-gray-600 mt-1"><span className="font-medium">{shipment.from}</span><ArrowRight className="w-3 h-3 text-gray-300" /><span className="font-medium">{shipment.to}</span></div></div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${shipment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{shipment.status}</span>
              </div>
              <StatusStepper currentStatus={shipment.status} />
            </div>
        ))}
      </div>

      <Modal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} title="Report an Issue">
        <form onSubmit={handleSubmitComplaint} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-800 border border-blue-100"><MessageSquare className="w-5 h-5 shrink-0" /><p>Please describe your issue clearly.</p></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">Subject</label><input required type="text" className="w-full px-4 py-2 border rounded-lg" value={complaint.subject} onChange={(e) => setComplaint({...complaint, subject: e.target.value})} /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">Description</label><textarea required rows="4" className="w-full px-4 py-2 border rounded-lg" value={complaint.message} onChange={(e) => setComplaint({...complaint, message: e.target.value})} /></div>
          <button className="w-full bg-red-600 text-white py-3 rounded-lg font-bold shadow-lg">Submit Complaint</button>
        </form>
      </Modal>
    </div>
  );
};

export default SenderDashboard;
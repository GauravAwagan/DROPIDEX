import React, { useState, useEffect } from 'react';
import { Package, Navigation, CheckCircle, AlertTriangle, Loader2, MapPin, Truck, Phone, ChevronRight } from 'lucide-react';
import { Modal } from './Shared';
import axios from 'axios';

const DriverDashboard = ({ onShowToast }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'

  // Input State for OTPs (Keyed by Shipment ID to separate inputs)
  const [otpInputs, setOtpInputs] = useState({});

  // Support Modal State
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [complaint, setComplaint] = useState({ subject: '', message: '' });

  const user = JSON.parse(localStorage.getItem('user'));

  // --- 1. FETCH ALL ASSIGNED JOBS ---
  const fetchJobs = async () => {
    try {
      // Updated Endpoint: Fetches ALL jobs for this driver
      // You might need to update backend to use .find() instead of .findOne() for this route
      const response = await axios.get(`http://localhost:5000/api/driver/jobs/${user.id}`);
      setJobs(response.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchJobs();
  }, []);

  // --- 2. UPDATE STATUS HELPER ---
  const updateShipmentStatus = async (shipmentId, status, otp = null) => {
    try {
      const payload = { shipmentId, status, otp };
      await axios.put('http://localhost:5000/api/shipments/status', payload);
      
      onShowToast(`Status updated to: ${status}`);
      fetchJobs(); // Refresh list to update UI
      
      // Clear OTP input for that specific card
      setOtpInputs(prev => ({ ...prev, [shipmentId]: '' }));
    } catch (err) {
      onShowToast(err.response?.data?.error || 'Failed to update status', 'error');
    }
  };

  // --- 3. HANDLERS ---
  const handleOtpChange = (id, value) => {
    setOtpInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleConfirmPickup = (job) => {
    const inputOtp = otpInputs[job._id];
    // Local Verification (Client-side)
    if (inputOtp === job.pickupOtp) {
      updateShipmentStatus(job._id, 'Picked');
    } else {
      onShowToast('Incorrect Pickup OTP', 'error');
    }
  };

  const handleVerifyDelivery = (job) => {
    const inputOtp = otpInputs[job._id];
    // Server Verification
    updateShipmentStatus(job._id, 'Delivered', inputOtp);
  };

  // --- FILTER JOBS ---
  const activeJobs = jobs.filter(j => ['Assigned', 'Picked', 'In-Transit', 'Payment Pending'].includes(j.status));
  const completedJobs = jobs.filter(j => ['Delivered'].includes(j.status));
  const displayJobs = activeTab === 'active' ? activeJobs : completedJobs;

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800">My Route</h2>
          <p className="text-xs text-gray-500">{activeJobs.length} stops remaining</p>
        </div>
        <button onClick={() => setIsSupportOpen(true)} className="text-red-600 bg-red-50 px-3 py-2 rounded-lg text-xs font-bold border border-red-100">
          Report Issue
        </button>
      </div>

      {/* TABS */}
      <div className="flex bg-gray-100 p-1 rounded-lg mx-2">
        <button 
          onClick={() => setActiveTab('active')} 
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'active' ? 'bg-white shadow text-blue-900' : 'text-gray-500'}`}
        >
          Active Tasks ({activeJobs.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')} 
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'completed' ? 'bg-white shadow text-emerald-700' : 'text-gray-500'}`}
        >
          Completed ({completedJobs.length})
        </button>
      </div>

      {/* JOBS LIST */}
      <div className="space-y-4 px-2">
        {displayJobs.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No {activeTab} jobs found.</p>
          </div>
        ) : (
          displayJobs.map(job => (
            <div key={job._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              
              {/* Card Header */}
              <div className={`p-3 text-white flex justify-between items-center ${
                job.status === 'Picked' || job.status === 'In-Transit' ? 'bg-blue-600' : 
                job.status === 'Assigned' || job.status === 'Payment Pending' ? 'bg-gray-800' : 
                'bg-emerald-600'
              }`}>
                <div className="flex items-center gap-2">
                  {job.status === 'Picked' ? <Navigation className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                  <span className="font-bold text-sm uppercase">{job.status}</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">ID: {job.shipmentId}</span>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-4">
                
                {/* Locations */}
                <div className="relative pl-4 space-y-4 border-l-2 border-dashed border-gray-200 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Pickup</p>
                    <p className="text-sm font-bold text-gray-800">{job.from}</p>
                    <p className="text-xs text-gray-500">Sender: {job.sender?.name}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Drop</p>
                    <p className="text-sm font-bold text-gray-800">{job.to}</p>
                    <p className="text-xs text-gray-500">{job.productName} ({job.weight}kg)</p>
                  </div>
                </div>

                {/* Actions (Only for Active Tab) */}
                {activeTab === 'active' && (
                  <div className="pt-2 border-t border-gray-50">
                    
                    {/* CONFIRM PICKUP ACTION */}
                    {(job.status === 'Assigned' || job.status === 'Payment Pending') && (
                      <div className="flex gap-2">
                        <input 
                          type="text" maxLength={4} placeholder="Pickup OTP"
                          className="w-24 text-center border rounded-lg text-sm font-bold outline-none focus:border-blue-500"
                          value={otpInputs[job._id] || ''}
                          onChange={(e) => handleOtpChange(job._id, e.target.value)}
                        />
                        <button 
                          onClick={() => handleConfirmPickup(job)}
                          className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-bold shadow-md active:scale-95 transition-transform"
                        >
                          Confirm Pickup
                        </button>
                      </div>
                    )}

                    {/* START TRIP ACTION */}
                    {job.status === 'Picked' && (
                       <button 
                         onClick={() => updateShipmentStatus(job._id, 'In-Transit')}
                         className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-bold shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
                       >
                         <Navigation className="w-4 h-4" /> Start Journey
                       </button>
                    )}

                    {/* VERIFY DELIVERY ACTION */}
                    {job.status === 'In-Transit' && (
                      <div className="flex gap-2">
                        <input 
                          type="text" maxLength={4} placeholder="Delivery PIN"
                          className="w-28 text-center border-2 border-emerald-100 rounded-lg text-sm font-bold outline-none focus:border-emerald-500"
                          value={otpInputs[job._id] || ''}
                          onChange={(e) => handleOtpChange(job._id, e.target.value)}
                        />
                        <button 
                          onClick={() => handleVerifyDelivery(job)}
                          className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold shadow-md active:scale-95 transition-transform"
                        >
                          Complete Delivery
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* SUPPORT MODAL (Same as before) */}
      <Modal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} title="Driver Support">
        {/* ... (Keep existing form logic) ... */}
         <p className="text-gray-500 text-sm p-4">Support form goes here...</p>
      </Modal>

    </div>
  );
};

export default DriverDashboard;
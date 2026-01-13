import React, { useState, useEffect } from 'react';
import { Search, Truck, Link, User, Plus, Edit2, Loader2, Trash2, MoreVertical, MapPin, CheckCircle, Clock } from 'lucide-react';
import { Modal } from './Shared';
import axios from 'axios';

const AdminDrivers = ({ onShowToast }) => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]); // Pool of vehicles
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false); // Register/Edit Driver Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false); // Assign Vehicle
  
  // Selection & Edit States
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null); // For row dropdown menu
  const [isEditing, setIsEditing] = useState(false); // Track if we are editing

  // Driver Form State
  const [driverForm, setDriverForm] = useState({ 
    name: '', email: '', phone: '', password: '', location: 'Pune' 
  });

  // --- 1. FETCH DATA (UPDATED) ---
  const fetchData = async () => {
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        // CHANGED: Fetch ALL drivers to see everyone (Busy & Available)
        axios.get('http://localhost:5000/api/drivers/all'),
        axios.get('http://localhost:5000/api/vehicles')
      ]);
      setDrivers(driversRes.data);
      setVehicles(vehiclesRes.data);
    } catch (err) { 
      console.error(err); 
      onShowToast('Failed to load data', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. FORM HANDLERS (Register & Update) ---
  
  // Open Modal for New Driver
  const handleOpenAdd = () => {
    setDriverForm({ name: '', email: '', phone: '', password: '', location: 'Pune' });
    setIsEditing(false);
    setSelectedDriverId(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit Driver
  const handleOpenEdit = (driver) => {
    setDriverForm({ 
      name: driver.name, 
      email: driver.email, 
      phone: driver.phone, 
      password: '', // Leave blank to keep unchanged
      location: driver.address || driver.driverDetails?.currentLocation || '' 
    });
    setIsEditing(true);
    setSelectedDriverId(driver._id);
    setIsModalOpen(true);
    setActiveActionId(null); // Close dropdown
  };

  // Submit Form
  const handleSubmitDriver = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // UPDATE EXISTING DRIVER
        const payload = { ...driverForm };
        if (!payload.password) delete payload.password; // Don't send empty password

        await axios.put(`http://localhost:5000/api/drivers/${selectedDriverId}`, payload);
        onShowToast('Driver Updated Successfully!');
      } else {
        // REGISTER NEW DRIVER
        await axios.post('http://localhost:5000/api/auth/register', { ...driverForm, role: 'driver' });
        onShowToast('Driver Registered Successfully!');
      }
      
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (err) { 
      onShowToast(err.response?.data?.error || 'Operation failed', 'error'); 
    }
  };

  // --- 3. ASSIGN VEHICLE ---
  const handleAssignVehicle = async (vehicleId) => {
    try {
      await axios.put('http://localhost:5000/api/vehicles/assign', {
        driverId: selectedDriverId,
        vehicleId: vehicleId // null = unassign
      });
      onShowToast(vehicleId ? 'Vehicle Assigned!' : 'Vehicle Unassigned!');
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) { 
      onShowToast('Assignment Failed', 'error'); 
    }
  };

  // --- 4. DELETE DRIVER ---
  const handleDelete = async (id) => {
      if(window.confirm('Are you sure? This will remove the driver from the system.')) {
           // Ideally call DELETE API here. For now, local update.
           setDrivers(drivers.filter(d => d._id !== id));
           onShowToast('Driver Removed (Local Update)', 'info');
      }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6" onClick={() => setActiveActionId(null)}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Drivers List</h2>
           <p className="text-sm text-gray-500">Manage drivers and fleet assignments.</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-800 transition-transform active:scale-95">
          <Plus className="w-4 h-4" /> Register Driver
        </button>
      </div>

      {/* TABLE WITH SCROLLBAR */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase bg-gray-50">Driver Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase bg-gray-50">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase bg-gray-50">Assigned Vehicle</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase bg-gray-50">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase bg-gray-50">Contact</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase bg-gray-50">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {drivers.map(driver => (
                <tr key={driver._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">{driver.name?.charAt(0)}</div>
                            <span className="font-bold text-gray-800">{driver.name}</span>
                        </div>
                    </td>
                    
                    {/* STATUS COLUMN (Shows Available vs Busy) */}
                    <td className="px-6 py-4">
                        {driver.driverDetails?.isAvailable ? (
                            <span className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold w-fit border border-green-200">
                                <CheckCircle className="w-3 h-3" /> Available
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold w-fit border border-orange-200">
                                <Clock className="w-3 h-3" /> Busy
                            </span>
                        )}
                    </td>

                    {/* Dynamic Vehicle Assignment Display */}
                    <td className="px-6 py-4">
                    {driver.driverDetails?.assignedVehicleId ? (
                        <div className="flex flex-col">
                            <span className="flex items-center gap-2 text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full text-xs w-fit border border-blue-100">
                                <Truck className="w-3 h-3" /> {driver.driverDetails.assignedVehicleId.number}
                            </span>
                            <span className="text-[10px] text-gray-400 pl-2 mt-0.5">{driver.driverDetails.assignedVehicleId.type}</span>
                        </div>
                    ) : (
                        <span className="text-gray-400 italic text-sm flex items-center gap-1"><Link className="w-3 h-3" /> Unassigned</span>
                    )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600"><div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400"/> {driver.address || 'Pune'}</div></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{driver.phone}</td>

                    <td className="px-6 py-4 text-right relative">
                        <button onClick={(e) => { e.stopPropagation(); setActiveActionId(activeActionId === driver._id ? null : driver._id); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {activeActionId === driver._id && (
                            <div className="absolute right-8 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-fade-in py-1" onClick={(e) => e.stopPropagation()}>
                                <button 
                                    onClick={() => handleOpenEdit(driver)} 
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4 text-blue-600" /> Edit Details
                                </button>
                                <button 
                                    onClick={() => { setSelectedDriverId(driver._id); setIsAssignModalOpen(true); setActiveActionId(null); }} 
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                                >
                                    <Link className="w-4 h-4 text-emerald-600" /> 
                                    {driver.driverDetails?.assignedVehicleId ? 'Change Vehicle' : 'Assign Vehicle'}
                                </button>
                                <button 
                                    onClick={() => handleDelete(driver._id)} 
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete Driver
                                </button>
                            </div>
                        )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {/* REGISTER / EDIT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Edit Driver Details" : "Register New Driver"}>
        <form onSubmit={handleSubmitDriver} className="space-y-4">
            {!isEditing && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-100 flex gap-2">
                    <User className="w-5 h-5 shrink-0" />
                    <p>Creates a driver account. Vehicles are assigned separately.</p>
                </div>
            )}
          <div><label className="text-xs font-bold text-gray-500 uppercase">Full Name</label><input required className="w-full p-2 border rounded" value={driverForm.name} onChange={e => setDriverForm({...driverForm, name: e.target.value})} /></div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Email</label><input required type="email" className="w-full p-2 border rounded" value={driverForm.email} onChange={e => setDriverForm({...driverForm, email: e.target.value})} /></div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Phone</label><input required className="w-full p-2 border rounded" value={driverForm.phone} onChange={e => setDriverForm({...driverForm, phone: e.target.value})} /></div>
          <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Password {isEditing && <span className="text-gray-400 font-normal">(Leave blank to keep unchanged)</span>}</label>
              <input 
                type="password" 
                required={!isEditing} 
                className="w-full p-2 border rounded" 
                value={driverForm.password} 
                onChange={e => setDriverForm({...driverForm, password: e.target.value})} 
              />
          </div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Location</label><input required className="w-full p-2 border rounded" value={driverForm.location} onChange={e => setDriverForm({...driverForm, location: e.target.value})} /></div>
          <button className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors">
              {isEditing ? "Update Driver" : "Register Driver"}
          </button>
        </form>
      </Modal>

      {/* ASSIGN MODAL */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Vehicle">
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-2">Select a vehicle from the fleet:</p>
          <div className="flex items-center gap-3 p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer mb-2" onClick={() => handleAssignVehicle(null)}>
             <Trash2 className="w-5 h-5 text-red-500" />
             <p className="font-bold text-sm text-red-700">Unassign Current Vehicle</p>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {vehicles.filter(v => v.status === 'Available' || v.currentDriverId?._id === selectedDriverId).map(v => (
                <div key={v._id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer group" onClick={() => handleAssignVehicle(v._id)}>
                    <div className="flex items-center gap-3">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <div><p className="font-bold text-sm text-gray-800">{v.number}</p><p className="text-xs text-gray-500">{v.type}</p></div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase">AVAILABLE</span>
                </div>
            ))}
          </div>
          {vehicles.filter(v => v.status === 'Available').length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm">No available vehicles found.</div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AdminDrivers;
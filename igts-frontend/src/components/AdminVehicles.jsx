import React, { useState, useEffect } from 'react';
import { Truck, Plus, Loader2, X } from 'lucide-react';
import { Modal } from './Shared';
import axios from 'axios';

const AdminVehicles = ({ onShowToast }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for form (Added fuelType back)
  const [newVehicle, setNewVehicle] = useState({ number: '', type: '', capacity: '', fuelType: 'Diesel' });
  
  // State for Custom Type Logic
  const [isCustomType, setIsCustomType] = useState(false);
  // Initial list matches your DB enums/common types
  const [vehicleTypes, setVehicleTypes] = useState(['Tata Ace', 'Ashok Leyland', 'Tata 407', 'Eicher Pro']);

  // 1. Fetch Vehicles
  const fetchVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/vehicles');
      setVehicles(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  // 2. Add Vehicle
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      // 1. Send Data (Flow preserved: POST /api/vehicles)
      await axios.post('http://localhost:5000/api/vehicles', newVehicle);
      
      // 2. UX Improvement: If it was a custom type, add it to the local dropdown list
      if (isCustomType && newVehicle.type && !vehicleTypes.includes(newVehicle.type)) {
          setVehicleTypes([...vehicleTypes, newVehicle.type]);
      }

      onShowToast('Vehicle Added Successfully!');
      setIsModalOpen(false);
      fetchVehicles(); // Refresh List
      
      // 3. Reset Form (Reset fuelType to default)
      setNewVehicle({ number: '', type: '', capacity: '', fuelType: 'Diesel' });
      setIsCustomType(false);

    } catch (err) {
      onShowToast(err.response?.data?.error || 'Failed to add vehicle', 'error');
    }
  };

  // Helper to toggle between Dropdown and Text Input
  const handleTypeChange = (e) => {
      const val = e.target.value;
      if (val === 'custom') {
          setIsCustomType(true);
          setNewVehicle({ ...newVehicle, type: '' }); // Clear for typing
      } else {
          setIsCustomType(false);
          setNewVehicle({ ...newVehicle, type: val });
      }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Fleet Vehicles</h2>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-800">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-gray-800">{vehicle.number}</h3>
              </div>
              <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${vehicle.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                {vehicle.status}
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type:</span>
                <span className="font-bold">{vehicle.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Capacity:</span>
                <span className="font-bold">{vehicle.capacity} kg</span>
              </div>
              {/* Display Fuel Type in Card */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fuel:</span>
                <span className="font-bold">{vehicle.fuelType || 'Diesel'}</span>
              </div>
              <div className="pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Current Driver</p>
                {vehicle.currentDriverId ? (
                   <p className="text-sm font-bold text-blue-800">{vehicle.currentDriverId.name}</p>
                ) : (
                   <p className="text-sm italic text-gray-400">Unassigned</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Vehicle">
        <form onSubmit={handleAddVehicle} className="space-y-4">
          
          {/* 1. Vehicle Number */}
          <div>
            <label className="text-xs font-bold text-gray-500">Vehicle Number</label>
            <input 
              required 
              className="w-full p-2 border rounded" 
              placeholder="MH-12-XX-1234" 
              value={newVehicle.number} 
              onChange={(e) => setNewVehicle({...newVehicle, number: e.target.value})} 
            />
          </div>
          
          {/* 2. Vehicle Type (Dynamic: Dropdown OR Text Input) */}
          <div>
            <label className="text-xs font-bold text-gray-500">Vehicle Type</label>
            {!isCustomType ? (
                // OPTION A: Dropdown List
                <select 
                    className="w-full p-2 border rounded bg-white" 
                    value={newVehicle.type} 
                    onChange={handleTypeChange}
                    required
                >
                    <option value="" disabled>Select Vehicle Type</option>
                    {vehicleTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                    <option disabled className="text-gray-300">──────────</option>
                    <option value="custom" className="text-blue-600 font-bold">+ Other (Add New)</option>
                </select>
            ) : (
                // OPTION B: Text Input for Custom Type
                <div className="flex gap-2 animate-fade-in">
                    <input 
                        autoFocus
                        required 
                        className="w-full p-2 border rounded border-blue-500 ring-1 ring-blue-100" 
                        placeholder="Enter vehicle model name..." 
                        value={newVehicle.type} 
                        onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})} 
                    />
                    <button 
                        type="button" 
                        onClick={() => setIsCustomType(false)} 
                        className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                        title="Cancel custom input"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
          </div>

          {/* 3. Capacity */}
          <div>
            <label className="text-xs font-bold text-gray-500">Capacity (kg)</label>
            <input 
              required 
              type="number" 
              className="w-full p-2 border rounded" 
              placeholder="e.g., 1000" 
              value={newVehicle.capacity} 
              onChange={(e) => setNewVehicle({...newVehicle, capacity: e.target.value})} 
            />
          </div>

          {/* 4. Fuel Type (Added Back) */}
          <div>
             <label className="text-xs font-bold text-gray-500">Fuel Type</label>
             <select 
               className="w-full p-2 border rounded bg-white" 
               value={newVehicle.fuelType} 
               onChange={(e) => setNewVehicle({...newVehicle, fuelType: e.target.value})}
             >
                <option>Diesel</option>
                <option>Petrol</option>
                <option>Electric</option>
                <option>CNG</option>
             </select>
          </div>

          <button className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-lg active:scale-95">
            Add Vehicle
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminVehicles;
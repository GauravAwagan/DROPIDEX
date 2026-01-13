import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Loader2, User, Edit2 } from 'lucide-react'; // Added Edit2 icon
import axios from 'axios';
import { Modal } from './Shared';

const AdminRoutes = ({ onShowToast }) => {
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  const [routeForm, setRouteForm] = useState({ 
    origin: '', 
    destination: '', 
    distance: '', 
    preferredDriver: '' 
  });

  // 1. Fetch Routes & Drivers
  const fetchData = async () => {
    try {
      const [routesRes, driversRes] = await Promise.all([
        axios.get('http://localhost:5000/api/routes'),
        axios.get('http://localhost:5000/api/drivers/active')
      ]);
      setRoutes(routesRes.data);
      setDrivers(driversRes.data);
    } catch (err) {
      console.error(err);
      onShowToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Open Handlers
  const handleOpenAdd = () => {
    setRouteForm({ origin: '', destination: '', distance: '', preferredDriver: '' });
    setIsEditing(false);
    setSelectedRouteId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (route) => {
    setRouteForm({ 
      origin: route.origin, 
      destination: route.destination, 
      distance: route.distance, 
      preferredDriver: route.preferredDriver?._id || '' 
    });
    setIsEditing(true);
    setSelectedRouteId(route._id);
    setIsModalOpen(true);
  };

  // 3. Submit Handler (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // UPDATE EXISTING ROUTE
        await axios.put(`http://localhost:5000/api/routes/${selectedRouteId}`, routeForm);
        onShowToast('Route Updated Successfully!');
      } else {
        // CREATE NEW ROUTE
        await axios.post('http://localhost:5000/api/routes', routeForm);
        onShowToast('Route Added Successfully!');
      }
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (err) {
      onShowToast(err.response?.data?.error || 'Operation Failed', 'error');
    }
  };

  // 4. Delete Route
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this route?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/routes/${id}`);
      onShowToast('Route Deleted');
      fetchData();
    } catch (err) {
      onShowToast('Failed to delete', 'error');
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manage Routes & Drivers</h2>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-800 transition-transform active:scale-95">
          <Plus className="w-4 h-4" /> Add New Route
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Origin</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Destination</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Distance</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Designated Driver</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {routes.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-400">No routes defined.</td></tr>
            ) : routes.map(route => (
              <tr key={route._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500"/> {route.origin}
                </td>
                <td className="px-6 py-4 font-medium text-gray-800">{route.destination}</td>
                <td className="px-6 py-4 text-gray-600">{route.distance} km</td>
                
                <td className="px-6 py-4">
                    {route.preferredDriver ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 w-fit">
                            <User className="w-3 h-3" /> {route.preferredDriver.name}
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400 italic pl-1">Any Available</span>
                    )}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenEdit(route)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(route._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Edit Route Details" : "Add Route & Assign Driver"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Origin City</label>
                <input required className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Mumbai" value={routeForm.origin} onChange={(e) => setRouteForm({...routeForm, origin: e.target.value})} />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Destination City</label>
                <input required className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Pune" value={routeForm.destination} onChange={(e) => setRouteForm({...routeForm, destination: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Distance (in km)</label>
            <input required type="number" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 150" value={routeForm.distance} onChange={(e) => setRouteForm({...routeForm, distance: e.target.value})} />
          </div>

          {/* Driver Dropdown */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Designated Driver (Optional)</label>
            <select 
                className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={routeForm.preferredDriver}
                onChange={(e) => setRouteForm({...routeForm, preferredDriver: e.target.value})}
            >
                <option value="">-- No Specific Driver --</option>
                {drivers.map(d => (
                    <option key={d._id} value={d._id}>
                        {d.name} {d.driverDetails?.assignedVehicleId ? `(${d.driverDetails.assignedVehicleId.number})` : '(No Vehicle)'}
                    </option>
                ))}
            </select>
            <p className="text-[10px] text-gray-400 mt-1">Leave empty to allow any driver to take this route.</p>
          </div>

          <button className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-md">
              {isEditing ? "Update Route" : "Save Route Configuration"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminRoutes;
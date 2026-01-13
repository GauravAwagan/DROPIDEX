import React, { useState, useEffect } from 'react';
import { Search, MapPin, Truck, CheckCircle, Download, FileText, Loader2, AlertCircle, Package, X, User } from 'lucide-react';
import { Modal } from './Shared';
import axios from 'axios';

const AdminShipments = ({ onShowToast, initialFilter }) => {
  const [shipments, setShipments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]); // Store Routes Config
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtered Driver List for Modal
  const [compatibleDrivers, setCompatibleDrivers] = useState([]);
  const [assignmentMessage, setAssignmentMessage] = useState('');

  // Handle Initial Filter
  useEffect(() => {
    if (initialFilter) setSearchTerm(initialFilter); 
  }, [initialFilter]);

  // --- 1. FETCH REAL DATA ---
  const fetchData = async () => {
    try {
      const [shipmentsRes, driversRes, routesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/shipments/all'),
        axios.get('http://localhost:5000/api/drivers/active'),
        axios.get('http://localhost:5000/api/routes') // Fetch Routes
      ]);
      setShipments(shipmentsRes.data.reverse()); // Newest first
      setDrivers(driversRes.data);
      setRoutes(routesRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      if (onShowToast) onShowToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. EXPORT TO CSV ---
  const downloadCSV = () => {
    const headers = ["ID,Product,Weight (kg),Origin,Destination,Status,Sender,Driver,Cost"];
    const rows = filteredShipments.map(s => 
      `${s.shipmentId},"${s.productName}",${s.weight},"${s.from}","${s.to}",${s.status},"${s.sender?.name || 'Unknown'}","${s.driver?.name || 'Unassigned'}",${s.cost}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "IGTS_Shipments_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
  };

  // --- 3. ASSIGNMENT LOGIC (With Route Checking) ---
  const handleOpenAssignModal = (shipment) => {
    setSelectedShipment(shipment);
    setSelectedDriverId('');

    // --- ROUTE FILTERING LOGIC ---
    // 1. Find if this shipment's route exists in DB configuration
    const matchedRoute = routes.find(r => 
        (r.origin === shipment.from && r.destination === shipment.to) ||
        (r.origin === shipment.to && r.destination === shipment.from)
    );

    let filteredList = drivers; // Start with all active drivers
    let msg = "";

    if (matchedRoute && matchedRoute.preferredDriver) {
        // 2. If route has a preferred driver, restrict list
        // Note: We check against 'drivers' (active list). If preferred driver is inactive, list will be empty.
        filteredList = drivers.filter(d => d._id === matchedRoute.preferredDriver._id);
        
        if (filteredList.length > 0) {
            msg = `Restricted to designated driver: ${matchedRoute.preferredDriver.name}`;
        } else {
            msg = `Designated driver (${matchedRoute.preferredDriver.name}) is currently unavailable or busy.`;
        }
    } else {
        // 3. No restriction
        msg = "Showing all available drivers (No specific driver assigned to this route).";
    }

    setCompatibleDrivers(filteredList);
    setAssignmentMessage(msg);
    setIsModalOpen(true);
  };

  const confirmAssignment = async () => {
    const driver = drivers.find(d => d._id === selectedDriverId);
    if (!driver) return;

    // Vehicle Check
    const vehicle = driver.driverDetails?.assignedVehicleId;
    if (!vehicle) {
        alert("Error: This driver does not have a vehicle assigned.");
        return;
    }

    // Capacity Check
    const currentLoad = driver.driverDetails.currentLoad || 0;
    const capacity = vehicle.capacity || 0;

    if ((currentLoad + selectedShipment.weight) > capacity) {
      if(!window.confirm(`Warning: Truck Capacity Limit!\n\nVehicle: ${vehicle.number}\nCapacity: ${capacity}kg\nCurrent Load: ${currentLoad}kg\nNew Item: ${selectedShipment.weight}kg\n\nThis will exceed the limit. Proceed anyway?`)) {
        return;
      }
    }

    try {
      await axios.put('http://localhost:5000/api/shipments/assign', {
        shipmentId: selectedShipment._id,
        driverId: selectedDriverId
      });

      onShowToast(`Assigned ${driver.name} to shipment`);
      setIsModalOpen(false);
      fetchData(); // Refresh

    } catch (err) {
      console.error("Assignment Error:", err);
      onShowToast(err.response?.data?.error || "Failed to assign driver", 'error');
    }
  };

  const getStatusBadge = (status) => {
    const styles = { 
      'Pending': 'bg-yellow-100 text-yellow-800', 
      'Payment Pending': 'bg-orange-100 text-orange-800',
      'Assigned': 'bg-blue-100 text-blue-800', 
      'Picked': 'bg-indigo-100 text-indigo-800',
      'In-Transit': 'bg-purple-100 text-purple-800', 
      'Delivered': 'bg-emerald-100 text-emerald-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  // --- 4. FILTER LOGIC ---
  const filteredShipments = shipments.filter(s => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    // Month Filter
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthIndex = months.findIndex(m => m === term);
    if (monthIndex !== -1) {
        const date = new Date(s.createdAt);
        return date.getMonth() === monthIndex;
    }

    // General Search
    return (
      s.shipmentId.toLowerCase().includes(term) ||
      s.productName.toLowerCase().includes(term) ||
      (s.from && s.from.toLowerCase().includes(term)) ||
      (s.to && s.to.toLowerCase().includes(term)) ||
      s.status.toLowerCase().includes(term)
    );
  });

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Shipment Management</h2>
            {initialFilter && searchTerm === initialFilter && (
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg flex items-center gap-1">
                        Filtered by Month: {initialFilter}
                        <button onClick={() => setSearchTerm('')} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
                    </span>
                </div>
            )}
        </div>
        
        {/* Export Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Data
          </button>

          {isExportOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in py-1">
              <button onClick={downloadCSV} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 transition-colors">
                <FileText className="w-4 h-4 text-green-600" /> Export to Excel
              </button>
            </div>
          )}
          {isExportOpen && <div className="fixed inset-0 z-40" onClick={() => setIsExportOpen(false)}></div>}
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by ID, Product, Month (e.g. 'Jan') or Status..." 
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
            <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-3.5 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
            >
                Clear
            </button>
        )}
      </div>

      {/* SHIPMENT TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Shipment Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Route</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Weight</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredShipments.length > 0 ? filteredShipments.map(shipment => (
                <tr key={shipment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800">{shipment.shipmentId}</span>
                        {((new Date() - new Date(shipment.createdAt)) < 86400000) && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 rounded">NEW</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                        <Package className="w-3 h-3" />
                        {shipment.productName}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 ml-5">Sender: {shipment.sender?.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {shipment.from} ➜ {shipment.to}</div>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(shipment.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">{shipment.weight} kg</td>
                  <td className="px-6 py-4">{getStatusBadge(shipment.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {shipment.status === 'Pending' ? (
                      <button onClick={() => handleOpenAssignModal(shipment)} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-800 shadow-sm transition-transform active:scale-95">
                        Assign Driver
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded">
                        Driver: {shipment.driver?.name || 'Assigned'}
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No shipments found matching "{searchTerm}".</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- SMART ASSIGNMENT MODAL --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Assigning Shipment ${selectedShipment?.shipmentId}`}>
        <div className="space-y-4">
          
          {/* Shipment Summary */}
          <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center border border-blue-100">
              <div className="space-y-1">
                <p className="text-[10px] text-blue-500 uppercase font-bold tracking-wide">Required Route</p>
                <p className="font-bold text-blue-900 text-sm flex items-center gap-1"><MapPin className="w-3 h-3"/> {selectedShipment?.from} ➜ {selectedShipment?.to}</p>
                
                <div className="flex items-center gap-1 mt-2 text-xs text-blue-700 bg-blue-100/50 px-2 py-1 rounded w-fit">
                    <Package className="w-3 h-3" />
                    <span className="font-bold">Package:</span> {selectedShipment?.productName}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-blue-500 uppercase font-bold tracking-wide">Load Weight</p>
                <p className="font-bold text-blue-900 text-sm">{selectedShipment?.weight} kg</p>
              </div>
          </div>

          {/* Logic Explanation Box */}
          <div className={`p-3 rounded text-xs border flex gap-2 ${compatibleDrivers.length === 0 ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
             <AlertCircle className="w-4 h-4 shrink-0" />
             <p>{assignmentMessage}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700">Select Available Driver:</p>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {compatibleDrivers.length > 0 ? compatibleDrivers.map(driver => {
                
                // --- VEHICLE DATA ACCESS ---
                const vehicle = driver.driverDetails?.assignedVehicleId;
                if (!vehicle) return null; // Skip drivers without vehicles

                const currentLoad = driver.driverDetails.currentLoad || 0;
                const availableSpace = (vehicle.capacity || 0) - currentLoad;
                const hasSpace = availableSpace >= selectedShipment?.weight;
                
                return (
                  <div 
                    key={driver._id}
                    onClick={() => setSelectedDriverId(driver._id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedDriverId === driver._id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    } ${!hasSpace ? 'opacity-50' : ''}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-sm text-gray-800 flex items-center gap-2">
                          {driver.name}
                          {hasSpace && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 rounded font-bold">Fit</span>}
                      </p>
                      {!hasSpace && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Full</span>}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 bg-white px-2 py-1 rounded border border-gray-100 w-fit">
                      <Truck className="w-3 h-3 text-blue-500" /> 
                      <span className="font-medium">{vehicle.number}</span> 
                      <span className="text-gray-400">({vehicle.type})</span>
                    </div>

                    {/* Capacity Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1 overflow-hidden">
                      <div 
                        className={`h-full ${hasSpace ? 'bg-emerald-500' : 'bg-red-500'}`} 
                        style={{ width: `${Math.min(100, ((currentLoad) / (vehicle.capacity || 1)) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-400">
                        <span>Used: {currentLoad}kg</span>
                        <span className={hasSpace ? 'text-emerald-600' : 'text-red-500'}>
                          Free: {availableSpace}kg
                        </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Truck className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500">No available drivers found for this route.</p>
                </div>
              )}
            </div>
          </div>

          <button 
            disabled={!selectedDriverId} 
            onClick={confirmAssignment} 
            className="w-full bg-blue-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold shadow-lg transition-all active:scale-95 hover:bg-blue-800"
          >
            Confirm Assignment
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminShipments;
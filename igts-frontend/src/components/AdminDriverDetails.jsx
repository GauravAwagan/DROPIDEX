import React from 'react';
import { ArrowLeft, Phone, Truck, Star, CheckCircle, XCircle, MapPin, Mail, Calendar } from 'lucide-react';

const AdminDriverDetails = ({ driver, onBack }) => {
  // Safe Access to nested data
  const details = driver.driverDetails || {};
  
  // Mock History Data (Since we don't have a real backend endpoint for this yet)
  const tripHistory = [
    { id: 'TRIP-8850', date: '24 Dec, 2025', from: 'Pune', to: 'Mumbai', status: 'completed', amount: '₹4,500' },
    { id: 'TRIP-8848', date: '22 Dec, 2025', from: 'Nashik', to: 'Pune', status: 'cancelled', amount: '₹0' },
    { id: 'TRIP-8845', date: '20 Dec, 2025', from: 'Mumbai', to: 'Surat', status: 'completed', amount: '₹6,200' },
    { id: 'TRIP-8810', date: '15 Dec, 2025', from: 'Delhi', to: 'Jaipur', status: 'completed', amount: '₹8,100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header / Back Button */}
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-gray-600 hover:text-blue-900 font-bold transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Fleet
      </button>

      {/* Driver Hero Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Blue Banner */}
        <div className="bg-blue-900 h-24 relative">
            <div className="absolute inset-0 bg-blue-900/50"></div>
        </div>
        
        {/* Driver Info Section */}
        <div className="p-8 flex flex-col md:flex-row items-start md:items-center gap-6 -mt-12 relative z-10">
          {/* Profile Picture */}
          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md border border-gray-100">
            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-900 uppercase">
              {driver.name?.charAt(0)}
            </div>
          </div>
          
          {/* Name and ID */}
          <div className="flex-1 mt-8 md:mt-0">
            <h2 className="text-3xl font-bold text-gray-800">{driver.name}</h2>
            <p className="text-gray-500 flex items-center gap-2 mt-1 text-sm">
              ID: <span className="font-mono bg-gray-100 px-1 rounded">{driver._id?.slice(-6).toUpperCase()}</span> • Role: Driver
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 w-full md:w-auto justify-start md:justify-end mt-4 md:mt-0">
            <div className="text-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Total Trips</p>
              <p className="text-xl font-bold text-gray-800">142</p>
            </div>
            <div className="text-center bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
              <p className="text-[10px] text-emerald-600 uppercase font-bold">Earnings</p>
              <p className="text-xl font-bold text-emerald-700">₹8.4L</p>
            </div>
            <div className="text-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
              <p className="text-[10px] text-blue-600 uppercase font-bold">Rating</p>
              <div className="flex items-center gap-1 justify-center">
                 <span className="text-xl font-bold text-blue-700">4.9</span>
                 <Star className="w-4 h-4 text-yellow-400 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Details */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <h3 className="font-bold text-gray-800 border-b pb-3 mb-4">Driver Information</h3>
             <div className="space-y-4">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-gray-50 rounded text-gray-500"><Phone className="w-4 h-4" /></div>
                 <div>
                   <p className="text-xs text-gray-400 uppercase font-bold">Phone</p>
                   <p className="font-medium text-gray-800">{driver.phone}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-gray-50 rounded text-gray-500"><Mail className="w-4 h-4" /></div>
                 <div>
                   <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                   <p className="font-medium text-gray-800 truncate w-40">{driver.email}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-gray-50 rounded text-gray-500"><Truck className="w-4 h-4" /></div>
                 <div>
                   <p className="text-xs text-gray-400 uppercase font-bold">Assigned Truck</p>
                   <p className="font-medium text-gray-800">{details.vehicleNumber || 'N/A'}</p>
                   <p className="text-xs text-gray-500">{details.vehicleType || 'Standard Truck'}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-gray-50 rounded text-gray-500"><CheckCircle className="w-4 h-4" /></div>
                 <div>
                   <p className="text-xs text-gray-400 uppercase font-bold">Current Status</p>
                   <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-bold uppercase ${
                      details.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                   }`}>
                     {details.isAvailable ? 'Available' : 'On-Trip'}
                   </span>
                 </div>
               </div>
               {details.currentLocation && (
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-gray-50 rounded text-gray-500"><MapPin className="w-4 h-4" /></div>
                   <div>
                     <p className="text-xs text-gray-400 uppercase font-bold">Last Location</p>
                     <p className="font-medium text-gray-800">{details.currentLocation}</p>
                   </div>
                 </div>
               )}
             </div>
           </div>
        </div>

        {/* Right Column: Trip History */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-gray-800">Recent Activity</h3>
               <button className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md font-bold text-gray-600 transition-colors">Download Report</button>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Trip ID</th>
                     <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                     <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Route</th>
                     <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                     <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Amount</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {tripHistory.map(trip => (
                     <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4 font-bold text-gray-800 text-sm">{trip.id}</td>
                       <td className="px-6 py-4 text-xs text-gray-500">{trip.date}</td>
                       <td className="px-6 py-4 text-sm text-gray-600">
                         {trip.from} <span className="text-gray-300">➜</span> {trip.to}
                       </td>
                       <td className="px-6 py-4">
                          {trip.status === 'completed' && <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase"><CheckCircle className="w-3 h-3" /> Done</span>}
                          {trip.status === 'cancelled' && <span className="flex items-center gap-1 text-red-600 text-[10px] font-bold uppercase"><XCircle className="w-3 h-3" /> Cancelled</span>}
                       </td>
                       <td className="px-6 py-4 text-right font-bold text-gray-800 text-sm">{trip.amount}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDriverDetails;
import React from 'react';
import { User, Mail, Phone, Shield, Truck, Star, LogOut, MapPin } from 'lucide-react';

const Profile = ({ user, onLogout }) => {
  if (!user) return null;

  // Helper to safely get driver details (if they exist)
  const driverInfo = user.driverDetails || {};

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="h-32 bg-blue-900 relative">
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
              <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-blue-900 font-bold text-2xl border-4 border-white uppercase">
                {user.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>
        <div className="pt-12 pb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${
              user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
              user.role === 'driver' ? 'bg-emerald-100 text-emerald-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              <Shield className="w-3 h-3" /> {user.role}
            </span>
          </div>
          
          {user.role === 'driver' && (
             <div className="flex justify-center gap-1 mt-3">
               {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />)}
               <span className="text-xs text-gray-400 ml-1">(5.0)</span>
             </div>
          )}
        </div>
      </div>

      {/* Details List */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h3 className="font-bold text-gray-800 border-b pb-2">Personal Details</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400"><User className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Full Name</p>
              <p className="font-medium text-gray-800">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400"><Mail className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Email Address</p>
              <p className="font-medium text-gray-800">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400"><Phone className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Phone Number</p>
              <p className="font-medium text-gray-800">{user.phone || 'Not Provided'}</p>
            </div>
          </div>

          {user.address && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400"><MapPin className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Address</p>
                <p className="font-medium text-gray-800">{user.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Driver Specific Info (Only shows if role is 'driver') */}
      {user.role === 'driver' && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 border-l-4 border-blue-600">
          <h3 className="font-bold text-gray-800 border-b pb-2">Vehicle Information</h3>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><Truck className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Truck Details</p>
              {/* Uses data from backend or fallback text */}
              <p className="font-medium text-gray-800">{driverInfo.vehicleNumber || 'No Vehicle Assigned'}</p>
              <p className="text-xs text-gray-500">{driverInfo.vehicleType || driverInfo.truckType || 'Standard Truck'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
             <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500 font-bold">CAPACITY</p>
                <p className="text-blue-900 font-bold">{driverInfo.totalCapacity || 0} kg</p>
             </div>
             <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500 font-bold">CURRENT LOAD</p>
                <p className="text-emerald-600 font-bold">{driverInfo.currentLoad || 0} kg</p>
             </div>
          </div>
        </div>
      )}

      {/* Logout Action */}
      <button onClick={onLogout} className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
        <LogOut className="w-5 h-5" /> Logout
      </button>
    </div>
  );
};

export default Profile;
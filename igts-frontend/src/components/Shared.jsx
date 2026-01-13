import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// --- TOAST NOTIFICATION COMPONENT ---
export const Toast = ({ message, type = 'success', onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const borderColors = {
    success: 'border-emerald-500',
    error: 'border-red-500',
    info: 'border-blue-500'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 bg-white p-4 rounded-xl shadow-lg border-l-4 ${borderColors[type]} animate-slide-in`}>
      {icons[type]}
      <p className="font-bold text-gray-800">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// --- MODAL COMPONENT ---
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} 
      onClick={onClose}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="bg-blue-900 p-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-blue-200 hover:text-white hover:bg-blue-800 rounded-full p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- STATUS STEPPER COMPONENT (UPDATED) ---
export const StatusStepper = ({ currentStatus }) => {
  // Normalize status to lowercase for comparison
  const status = currentStatus?.toLowerCase() || 'pending';

  const steps = [
    { id: 'pending', label: 'Booked' },
    { id: 'payment pending', label: 'Payment' }, // Added this step
    { id: 'assigned', label: 'Assigned' },
    { id: 'picked', label: 'Picked' },
    { id: 'in-transit', label: 'Transit' },
    { id: 'delivered', label: 'Done' }
  ];

  // Find index (default to 0 if not found)
  let currentIndex = steps.findIndex(s => s.id === status);
  if (currentIndex === -1) currentIndex = 0;

  return (
    <div className="flex items-center justify-between relative mt-6 px-2">
       {/* Background Line */}
      <div className="absolute left-2 right-2 top-4 h-1 bg-gray-200 z-0"></div>
      
      {/* Colored Progress Line */}
      <div 
        className="absolute left-2 top-4 h-1 bg-blue-600 z-0 transition-all duration-500"
        style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
      ></div>

      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs transition-all bg-white ${
              isCompleted ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-300'
            } ${isActive ? 'ring-4 ring-blue-100 scale-110 bg-blue-600 text-white border-blue-600' : ''}`}>
              {index < currentIndex ? <CheckCircle className="w-5 h-5 fill-blue-600 text-white" /> : index + 1}
            </div>
            <p className={`text-[10px] font-bold mt-2 uppercase tracking-wide ${isActive ? 'text-blue-700' : 'text-gray-400'}`}>{step.label}</p>
          </div>
        );
      })}
    </div>
  );
};
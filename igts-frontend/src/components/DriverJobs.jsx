import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, CheckCircle, XCircle, Clock, Filter, Wallet, IndianRupee, ChevronDown, Loader2 } from 'lucide-react';
import axios from 'axios';

const DriverJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FILTER STATES ---
  const [selectedYear, setSelectedYear] = useState('2026'); // Defaults to current year
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Get Logged In User
  const user = JSON.parse(localStorage.getItem('user'));

  // --- 1. FETCH REAL DATA ---
  useEffect(() => {
    if (user?.id) {
      fetchDriverHistory();
    }
  }, []);

  const fetchDriverHistory = async () => {
    try {
      // Fetch ALL shipments
      const response = await axios.get('http://localhost:5000/api/shipments/all');
      const allShipments = response.data;

      // --- ROBUST FILTERING ---
      const myHistory = allShipments.filter(shipment => {
        // 1. Check if Driver ID matches (Handle both Object and String formats)
        const shipmentDriverId = shipment.driver?._id || shipment.driver;
        const isMyShipment = shipmentDriverId === user.id;

        // 2. Check Status (Must be Delivered or Cancelled)
        const isFinished = ['Delivered', 'Cancelled', 'completed'].includes(shipment.status);

        return isMyShipment && isFinished;
      });

      // Map to UI format
      const formattedJobs = myHistory.map(s => ({
        id: s.shipmentId,
        // Use updated date (Delivery Date) or fallback to Created Date
        date: new Date(s.deliveredAt || s.updatedAt || s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        rawDate: new Date(s.deliveredAt || s.updatedAt || s.createdAt),
        from: s.from,
        to: s.to,
        status: s.status === 'Delivered' ? 'completed' : 'cancelled',
        amount: s.cost || 0,
        duration: 'N/A'
      }));

      // Sort by newest first
      formattedJobs.sort((a, b) => b.rawDate - a.rawDate);

      setJobs(formattedJobs);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- FILTER LOGIC ---
  const filteredJobs = jobs.filter(job => {
    const jobYear = job.rawDate.getFullYear().toString();
    const jobMonth = job.rawDate.getMonth(); // 0 = Jan, 11 = Dec

    if (jobYear !== selectedYear) return false;
    if (selectedMonth !== 'all' && jobMonth !== parseInt(selectedMonth)) return false;

    return true;
  });

  // --- CALCULATE EARNINGS ---
  const totalEarnings = filteredJobs
    .filter(job => job.status === 'completed')
    .reduce((sum, job) => sum + job.amount, 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold uppercase border border-emerald-100"><CheckCircle className="w-3 h-3" /> Delivered</span>;
      case 'cancelled': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold uppercase border border-red-100"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default: return <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded text-xs font-bold uppercase border border-gray-100"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  const getMonthName = (monthIndex) => {
    if (monthIndex === 'all') return 'Entire Year';
    const date = new Date();
    date.setMonth(monthIndex);
    return date.toLocaleString('default', { month: 'long' });
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-fade-in">
      
      {/* 1. EARNINGS CARD */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
               <Wallet className="w-6 h-6 text-emerald-100" />
             </div>
             <span className="text-xs font-bold bg-black/20 px-3 py-1 rounded-full text-emerald-100 border border-white/10 flex items-center gap-1">
               <Calendar className="w-3 h-3" />
               {selectedYear} • {getMonthName(selectedMonth)}
             </span>
          </div>
          <p className="text-emerald-100 text-sm font-medium mb-1">Total Earnings</p>
          <div className="flex items-baseline gap-1">
             <IndianRupee className="w-6 h-6 md:w-8 md:h-8" />
             <h2 className="text-4xl md:text-5xl font-bold">{totalEarnings.toLocaleString('en-IN')}</h2>
          </div>
        </div>
      </div>

      {/* 2. FILTERS */}
      <div className="flex flex-col gap-4 px-1">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Trip History <span className="text-sm font-normal text-gray-400">({filteredJobs.length})</span>
        </h2>
        
        <div className="flex gap-3">
          <div className="relative w-1/3">
            <select 
              value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 outline-none shadow-sm appearance-none cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative w-2/3">
            <select 
              value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 outline-none shadow-sm appearance-none cursor-pointer"
            >
              <option value="all">Entire Year</option>
              <option disabled>──────────</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{getMonthName(i)}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
      
      {/* 3. JOBS LIST */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">No completed trips found.</p>
            <p className="text-xs text-gray-400 mt-1">Complete a job to see it here.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all group animate-slide-up">
              <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center font-bold text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Trip ID</p>
                    <p className="font-bold text-gray-800">{job.id}</p>
                  </div>
                </div>
                <div className="text-right">
                   {getStatusBadge(job.status)}
                   <p className="text-xs text-gray-400 mt-1 font-medium">{job.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-5 pl-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="h-8 w-0.5 bg-gray-200 border-l border-dashed"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-gray-500">{job.from}</p>
                  <p className="text-base font-bold text-gray-800">{job.to}</p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-white rounded text-gray-500 shadow-sm"><Calendar className="w-4 h-4" /></div>
                   <div>
                     <p className="text-[10px] text-gray-400 uppercase font-bold">Status</p>
                     <p className="text-xs font-bold text-gray-700 capitalize">{job.status}</p>
                   </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Trip Earnings</p>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <IndianRupee className="w-3 h-3" />
                    <span className="text-lg font-bold">{job.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DriverJobs;
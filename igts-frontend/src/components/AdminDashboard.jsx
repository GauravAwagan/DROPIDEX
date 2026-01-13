import React, { useState, useEffect } from 'react';
import { 
  Users, Package, Truck, IndianRupee, TrendingUp, 
  Calendar, ArrowUpRight, ArrowDownRight, Activity, Download, FileText, Loader2, ChevronDown
} from 'lucide-react';
import axios from 'axios';

// onBarClick: Callback for chart navigation (passed from App.jsx)
const AdminDashboard = ({ onBarClick }) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // --- YEAR FILTER STATE ---
  // Defaults to current year (e.g., 2026)
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Real Stats State
  const [stats, setStats] = useState({
    revenue: 0,
    activeShipments: 0,
    activeDrivers: 0,
    pendingIssues: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  
  // Chart Data State
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  // --- 1. FETCH ALL DATA & CALCULATE STATS ---
  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear]); // Re-run whenever the year is changed

  const fetchDashboardData = async () => {
    try {
      // Parallel Fetch for Speed
      const [shipmentsRes, driversRes, complaintsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/shipments/all'),
        axios.get('http://localhost:5000/api/drivers/active'),
        axios.get('http://localhost:5000/api/complaints')
      ]);

      const shipments = shipmentsRes.data;
      const drivers = driversRes.data;
      const complaints = complaintsRes.data;

      // 1. Calculate Total Revenue (All Time)
      const totalRevenueAllTime = shipments.reduce((acc, curr) => acc + (curr.cost || 0), 0);

      // 2. Calculate Active Shipments
      const activeShipmentCount = shipments.filter(s => 
        !['Delivered', 'Cancelled'].includes(s.status)
      ).length;

      // 3. Pending Issues
      const pendingCount = complaints.filter(c => c.status === 'Open' || c.status === 'pending').length;

      setStats({
        revenue: totalRevenueAllTime,
        activeShipments: activeShipmentCount,
        activeDrivers: drivers.length,
        pendingIssues: pendingCount
      });

      // 4. Generate Recent Activity Feed
      const activities = [
        ...shipments.map(s => ({ type: 'booking', text: `New Shipment #${s.shipmentId}`, date: new Date(s.createdAt) })),
        ...complaints.map(c => ({ type: 'alert', text: `Ticket #${c.ticketId}: ${c.subject}`, date: new Date(c.createdAt) })),
        ...drivers.map(d => ({ type: 'user', text: `New Driver: ${d.name}`, date: new Date(d.createdAt || Date.now()) }))
      ];
      // Sort by newest first and take top 5
      activities.sort((a, b) => b.date - a.date);
      setRecentActivity(activities.slice(0, 5));

      // 5. Calculate Monthly Revenue for Chart (FILTERED BY SELECTED YEAR)
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const revenueArray = new Array(12).fill(0);

      shipments.forEach(s => {
        if(s.createdAt) {
          const d = new Date(s.createdAt);
          // Only add cost if the shipment year matches the selected year
          if(!isNaN(d) && d.getFullYear() === parseInt(selectedYear)) { 
            const monthIndex = d.getMonth();
            revenueArray[monthIndex] += (s.cost || 0);
          }
        }
      });

      const chartData = monthNames.map((m, i) => ({ month: m, value: revenueArray[i] }));
      setMonthlyRevenue(chartData);

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const maxVal = Math.max(...monthlyRevenue.map(d => d.value));
  const maxRevenue = maxVal === 0 ? 100 : maxVal;

  const statCards = [
    { label: 'Total Revenue (All Time)', value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: 'bg-blue-500', trend: '+12%', trendUp: true },
    { label: 'Active Shipments', value: stats.activeShipments, icon: Package, color: 'bg-orange-500', trend: 'Live', trendUp: true },
    { label: 'Active Drivers', value: stats.activeDrivers, icon: Truck, color: 'bg-emerald-500', trend: 'Online', trendUp: true },
    { label: 'Pending Issues', value: stats.pendingIssues, icon: Activity, color: 'bg-red-500', trend: 'Action Req', trendUp: false },
  ];

  const downloadCSV = () => {
    const headers = ["Month,Revenue (INR)"];
    const rows = monthlyRevenue.map(row => `${row.month},${row.value}`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `IGTS_Revenue_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm">Welcome back, Admin</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString()}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-800 transition-colors"
            >
              <Download className="w-4 h-4" /> Export
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
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} text-white shadow-lg shadow-${stat.color}/30`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className={`mt-4 flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
              {stat.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* REVENUE CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART AREA */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Revenue Analytics</h3>
              <p className="text-sm text-gray-500">Monthly earnings for {selectedYear} <span className="text-blue-500 text-xs font-bold ml-1">(Click bar to filter shipments)</span></p>
            </div>
            
            {/* YEAR SELECTOR DROPDOWN */}
            <div className="relative">
                <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value={currentYear}>{currentYear}</option>
                    <option value={currentYear - 1}>{currentYear - 1}</option>
                    <option value={currentYear - 2}>{currentYear - 2}</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* CUSTOM BAR CHART */}
          <div className="flex items-end justify-between h-64 gap-2 pt-4 border-b border-gray-100 pb-2">
            {monthlyRevenue.map((data, index) => {
              const heightPercent = (data.value / maxRevenue) * 100;
              const visualHeight = heightPercent < 2 ? 2 : heightPercent; 
              
              return (
                <div 
                  key={index} 
                  className="w-full flex flex-col items-center gap-2 group relative h-full justify-end cursor-pointer"
                  onClick={() => onBarClick && onBarClick(data.month)}
                >
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded mb-2 absolute -top-8 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                    ₹{data.value.toLocaleString()}
                  </div>
                  
                  {/* The Bar */}
                  <div 
                    className={`w-full rounded-t-md transition-all duration-300 relative group-hover:shadow-lg ${data.value > 0 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    style={{ height: `${visualHeight}%` }}
                  >
                    {data.value > 0 && <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-t-md"></div>}
                  </div>
                  
                  <span className={`text-[10px] md:text-xs font-bold ${data.value > 0 ? 'text-gray-600' : 'text-gray-300'} group-hover:text-blue-600`}>
                    {data.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((item, i) => (
              <div key={i} className="flex gap-3 items-start pb-3 border-b border-gray-50 last:border-0 last:pb-0 animate-fade-in">
                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                  item.type === 'booking' ? 'bg-blue-500' : 
                  item.type === 'delivery' ? 'bg-emerald-500' : 
                  item.type === 'alert' ? 'bg-red-500' : 'bg-gray-400'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-700 line-clamp-1">{item.text}</p>
                  <p className="text-xs text-gray-400">
                    {item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {item.date.toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-4">No recent activity.</p>
            )}
          </div>
          <button className="w-full mt-6 py-2 border border-gray-200 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors">View All Activity</button>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
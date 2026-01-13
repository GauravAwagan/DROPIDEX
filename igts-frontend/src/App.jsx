import React, { useState, useEffect } from 'react';
import { Menu, X, Home as HomeIcon, Package, Truck, Users, User, Bell, LogOut, AlertTriangle, Globe, Phone, Map } from 'lucide-react';

// Auth
import Login from './components/Login';

// Public Pages
import { PublicNavbar, Home, About, Contact } from './components/PublicPages';

// Dashboards
import SenderDashboard from './components/SenderDashboard';
import DriverDashboard from './components/DriverDashboard';
import AdminDashboard from './components/AdminDashboard';

// Sub-Pages
import AdminShipments from './components/AdminShipments';
import AdminDrivers from './components/AdminDrivers';
import AdminVehicles from './components/AdminVehicles'; 
import AdminComplaints from './components/AdminComplaints';
import AdminRoutes from './components/AdminRoutes'; 
import DriverJobs from './components/DriverJobs';
import Profile from './components/Profile';
import SenderMyShipments from './components/SenderMyShipments';

import { Toast } from './components/Shared';

const App = () => {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); 
  const [toast, setToast] = useState(null);
  
  const [adminShipmentFilter, setAdminShipmentFilter] = useState('');
  const [allShipments, setAllShipments] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedShipments = localStorage.getItem('igts_shipments');
    if (savedShipments) setAllShipments(JSON.parse(savedShipments));
  }, []);

  const addNewShipment = (newShipment) => {
    const updatedList = [newShipment, ...allShipments];
    setAllShipments(updatedList);
    localStorage.setItem('igts_shipments', JSON.stringify(updatedList));
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('home');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDashboardChartClick = (month) => {
    setAdminShipmentFilter(month);
    setCurrentPage('shipments');
    showToast(`Filtering shipments for ${month}`, 'info');
  };

  // --- NAVIGATION CONFIG ---
  const getNavItems = (role) => {
    const common = [{ id: 'profile', icon: User, label: 'My Profile' }];
    const publicLinks = [
      { id: 'home', icon: Globe, label: 'Website Home' },
      { id: 'contact', icon: Phone, label: 'Contact Support' }
    ];

    switch (role) {
      case 'sender': 
        return [
          { id: 'dashboard', icon: HomeIcon, label: 'Dashboard' }, 
          { id: 'my-shipments', icon: Package, label: 'My Shipments' }, 
          ...common,
          { isDivider: true }, 
          ...publicLinks 
        ];
      case 'driver': 
        return [
          { id: 'dashboard', icon: HomeIcon, label: 'Current Job' }, 
          { id: 'history', icon: Truck, label: 'Trip History' }, 
          ...common
        ];
      case 'admin': 
        return [
          { id: 'dashboard', icon: HomeIcon, label: 'Dashboard' }, 
          { id: 'shipments', icon: Package, label: 'All Shipments' }, 
          { id: 'drivers', icon: Users, label: 'Drivers List' }, 
          { id: 'vehicles', icon: Truck, label: 'Fleet Vehicles' },
          { id: 'routes', icon: Map, label: 'Manage Routes' }, 
          { id: 'complaints', icon: AlertTriangle, label: 'Complaints' }, 
          ...common,
          { isDivider: true },
          ...publicLinks 
        ];
      default: return [];
    }
  };

  const isPublicPage = ['home', 'about', 'contact', 'login'].includes(currentPage);

  if (isPublicPage) {
    if (currentPage === 'login') return <Login onLoginSuccess={handleLoginSuccess} />;

    return (
      <>
        <PublicNavbar onNavigate={setCurrentPage} user={user} />
        {currentPage === 'home' && <Home onNavigate={setCurrentPage} user={user} />}
        {currentPage === 'about' && <About onNavigate={setCurrentPage} />}
        {currentPage === 'contact' && <Contact onNavigate={setCurrentPage} />}
      </>
    );
  }

  if (!user) {
    setCurrentPage('login');
    return null;
  }

  const canViewWebsite = user.role === 'sender' || user.role === 'admin';

  const renderDashboardContent = () => {
    if (currentPage === 'profile') return <Profile user={user} onLogout={handleLogout} />;
    
    if (user.role === 'sender') {
      if (currentPage === 'dashboard') return <SenderDashboard onShowToast={showToast} onBookShipment={addNewShipment} />;
      if (currentPage === 'my-shipments') return <SenderMyShipments shipments={allShipments} />;
    }
    if (user.role === 'driver') {
      if (currentPage === 'dashboard') return <DriverDashboard onShowToast={showToast} />;
      if (currentPage === 'history') return <DriverJobs />;
    }
    if (user.role === 'admin') {
      if (currentPage === 'dashboard') return <AdminDashboard onBarClick={handleDashboardChartClick} />;
      if (currentPage === 'shipments') return <AdminShipments onShowToast={showToast} initialFilter={adminShipmentFilter} />;
      if (currentPage === 'drivers') return <AdminDrivers onShowToast={showToast} />;
      if (currentPage === 'vehicles') return <AdminVehicles onShowToast={showToast} />;
      if (currentPage === 'routes') return <AdminRoutes onShowToast={showToast} />;
      if (currentPage === 'complaints') return <AdminComplaints />;
    }
    return <div className="p-10 text-center">Page Not Found</div>;
  };

  const navItems = getNavItems(user.role);

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>
        
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-800 shrink-0">
          <h1 className="text-2xl font-bold cursor-pointer" onClick={() => canViewWebsite && setCurrentPage('home')}>IGTS</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden"><X className="w-6 h-6" /></button>
        </div>
        
        {/* Scrollable Content Area with THEMED Scrollbar */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-400/30 hover:[&::-webkit-scrollbar-thumb]:bg-blue-400/50 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="p-6 bg-blue-800">
              <p className="text-xs text-blue-300 uppercase font-bold">Logged in as</p>
              <p className="font-bold text-lg truncate">{user.name}</p>
              <p className="text-xs text-blue-200 capitalize badge bg-blue-700 px-2 py-1 rounded inline-block mt-1">{user.role}</p>
            </div>
            
            <nav className="p-4 space-y-2">
              {navItems.map((item, idx) => (
                 item.isDivider ? (
                   <div key={idx} className="h-px bg-blue-800 my-2 mx-4"></div>
                 ) : (
                   <button 
                     key={item.id} 
                     onClick={() => { setCurrentPage(item.id); setIsSidebarOpen(false); }} 
                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === item.id ? 'bg-blue-700 text-white shadow-md' : 'hover:bg-blue-800 text-blue-100'}`}
                   >
                     <item.icon className="w-5 h-5" />
                     <span className="font-medium">{item.label}</span>
                   </button>
                 )
              ))}
            </nav>
        </div>
        
        {/* Fixed Footer (Logout) */}
        <div className="p-4 border-t border-blue-800 shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-all shadow-lg active:scale-95">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>

      </aside>

      <div className="lg:ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600"><Menu className="w-6 h-6" /></button>
            <div className="flex-1"></div>
            <div className="flex items-center gap-4">
              
              {canViewWebsite && (
                <button onClick={() => setCurrentPage('home')} className="text-sm font-bold text-blue-900 hidden md:block hover:underline">
                  Go to Website
                </button>
              )}
              
              {/*<button className="relative text-gray-600 hover:text-gray-900"><Bell className="w-6 h-6" /><span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">2</span></button> */}
              <button onClick={() => setCurrentPage('profile')} className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm">{user.name.charAt(0)}</button>
            </div>
          </div>
        </header>
        <main className="p-6">{renderDashboardContent()}</main>
      </div>
      
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default App;
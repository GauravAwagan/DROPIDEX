import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, User, Truck, Clock, MessageSquare, Loader2, RefreshCcw } from 'lucide-react';
import axios from 'axios';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // FIX 1: Default state matches DB value 'Open' (Capitalized)
  const [filter, setFilter] = useState('Open'); 

  // --- 1. FETCH COMPLAINTS ---
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/complaints');
      setComplaints(response.data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // --- 2. RESOLVE COMPLAINT ---
  const handleResolve = async (id) => {
    if(window.confirm('Mark this ticket as Resolved?')) {
      try {
        await axios.put(`http://localhost:5000/api/complaints/resolve/${id}`);
        
        // FIX 2: Optimistic Update sets status to 'Resolved' (Capitalized)
        setComplaints(prev => prev.map(ticket => 
          ticket._id === id ? { ...ticket, status: 'Resolved' } : ticket
        ));
      } catch (err) {
        alert('Failed to update status');
      }
    }
  };

  const getPriorityColor = (p) => {
    switch(p) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  // FIX 3: Filter Logic now matches 'Open' or 'Resolved' exactly
  const filteredList = complaints.filter(c => c.status === filter);

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Support Tickets
          <button onClick={fetchComplaints} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <RefreshCcw className="w-4 h-4" />
          </button>
        </h2>
        
        {/* Filter Tabs - Updated to use Capitalized values */}
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <button 
            onClick={() => setFilter('Open')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${filter === 'Open' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Pending ({complaints.filter(c => c.status === 'Open').length})
          </button>
          <button 
            onClick={() => setFilter('Resolved')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${filter === 'Resolved' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Resolved ({complaints.filter(c => c.status === 'Resolved').length})
          </button>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300 animate-fade-in">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No {filter} tickets found.</p>
          </div>
        ) : (
          filteredList.map(ticket => (
            <div key={ticket._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                
                {/* Left: Icon & Details */}
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${ticket.role === 'sender' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {ticket.role === 'sender' ? <User className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-800">{ticket.subject}</h3>
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority || 'Medium'} Priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {/* reportedBy is populated from backend (User Object) */}
                      <span className="flex items-center gap-1 font-bold text-gray-500">
                        <User className="w-3 h-3" /> {ticket.reportedBy?.name || 'Unknown User'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-mono bg-gray-100 px-1 rounded">ID: {ticket.ticketId}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                  {ticket.status === 'Open' ? (
                    <>
                      <a href={`mailto:${ticket.reportedBy?.email}`} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                        <MessageSquare className="w-4 h-4" /> Reply
                      </a>
                      <button 
                        onClick={() => handleResolve(ticket._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-sm transition-transform active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" /> Resolve
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                      <CheckCircle className="w-5 h-5" /> Resolved
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminComplaints;
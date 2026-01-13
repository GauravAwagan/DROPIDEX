import React, { useState, useEffect } from 'react';
import { Package, Truck, CreditCard, CheckCircle, Loader2, XCircle, X, ChevronRight, Smartphone, Wallet, Building2 } from 'lucide-react';
import axios from 'axios';

// --- FAKE RAZORPAY CLONE COMPONENT ---
const RazorpayCloneModal = ({ isOpen, onClose, amount, orderId, onSuccess }) => {
  const [screen, setScreen] = useState('methods'); // methods | card | processing | success
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setLoading(true);
    // Simulate Network Delay
    setTimeout(() => {
      setLoading(false);
      setScreen('success');
      // Close after success message
      setTimeout(() => {
        onSuccess();
        onClose();
        setScreen('methods'); // Reset
      }, 2000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl overflow-hidden relative">
        
        {/* TOP STRIP: Merchant Info */}
        <div className="bg-blue-900 text-white p-4 flex justify-between items-start relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="font-bold text-lg">IGTS Logistics</h3>
              <p className="text-blue-200 text-xs mt-1">Order #{orderId}</p>
              <div className="mt-4">
                 <p className="text-xs text-blue-300">Amount to Pay</p>
                 <p className="text-2xl font-bold">₹{amount}.00</p>
              </div>
           </div>
           <button onClick={onClose} className="text-white/70 hover:text-white z-10"><X className="w-5 h-5"/></button>
           
           {/* Decorative Circle */}
           <div className="absolute -right-6 -top-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        </div>

        {/* BODY CONTENT */}
        <div className="h-[400px] bg-gray-50 flex flex-col">
            
            {/* SCREEN 1: Payment Methods */}
            {screen === 'methods' && (
                <div className="p-4 space-y-3 overflow-y-auto">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Preferred Payment Methods</p>
                    
                    <button onClick={() => setScreen('card')} className="w-full bg-white p-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-600"><CreditCard className="w-5 h-5"/></div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-800">Card</p>
                                <p className="text-xs text-gray-500">Visa, MasterCard, RuPay</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600"/>
                    </button>

                    <button onClick={handlePay} className="w-full bg-white p-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-emerald-50 flex items-center justify-center text-emerald-600"><Smartphone className="w-5 h-5"/></div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-800">UPI / QR</p>
                                <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600"/>
                    </button>

                    <button onClick={handlePay} className="w-full bg-white p-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-orange-50 flex items-center justify-center text-orange-600"><Building2 className="w-5 h-5"/></div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-800">Netbanking</p>
                                <p className="text-xs text-gray-500">All Indian Banks</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-600"/>
                    </button>
                </div>
            )}

            {/* SCREEN 2: Card Input */}
            {screen === 'card' && (
                <div className="p-6 flex flex-col h-full">
                    <button onClick={() => setScreen('methods')} className="text-xs text-blue-600 font-bold mb-4 flex items-center gap-1">← Back to methods</button>
                    
                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Card Number</label>
                            <div className="relative">
                                <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:border-blue-500 outline-none transition-colors" />
                                <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-3.5"/>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Expiry</label>
                                <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 border border-gray-300 rounded focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">CVV</label>
                                <input type="password" placeholder="123" maxLength="3" className="w-full px-4 py-3 border border-gray-300 rounded focus:border-blue-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Card Holder's Name</label>
                            <input type="text" placeholder="John Doe" className="w-full px-4 py-3 border border-gray-300 rounded focus:border-blue-500 outline-none" />
                        </div>
                    </div>

                    <button onClick={handlePay} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded font-bold shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ₹${amount}`}
                    </button>
                </div>
            )}

            {/* SCREEN 3: Success */}
            {screen === 'success' && (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-scale-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Payment Successful</h3>
                    <p className="text-gray-500 mt-2 text-sm">Transaction ID: pay_sim_{Math.floor(Math.random()*10000)}</p>
                    <p className="text-xs text-gray-400 mt-4">Redirecting...</p>
                </div>
            )}

        </div>

        {/* Fake Footer */}
        <div className="bg-gray-100 p-2 text-center border-t border-gray-200">
            <p className="text-[10px] text-gray-400 font-bold flex items-center justify-center gap-1 opacity-70">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> Secured by IGTS Pay
            </p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN SENDER COMPONENT ---
const SenderMyShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Payment States
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentShipment, setPaymentShipment] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  // --- 1. FETCH SHIPMENTS ---
  const fetchShipments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/shipments/sender/${user.id}`);
      const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setShipments(sorted);
    } catch (err) {
      console.error("Error fetching shipments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchShipments();
  }, []);

  // --- 2. OPEN PAYMENT MODAL ---
  const handleOpenPayment = (shipment) => {
    setPaymentShipment(shipment);
    setIsPaymentOpen(true);
  };

  // --- 3. HANDLE SUCCESS (Called by Mock Modal) ---
  const handlePaymentSuccess = async () => {
    if (!paymentShipment) return;

    try {
        const fakePaymentId = `pay_sim_${Math.floor(Math.random() * 1000000)}`;
        await axios.put(`http://localhost:5000/api/shipments/pay/${paymentShipment._id}`, {
            paymentId: fakePaymentId
        });
        await fetchShipments();
    } catch (err) {
        alert("Payment recorded failed on server.");
    }
  };

  // --- 4. HANDLE CANCEL ---
  const handleCancel = async (shipmentId) => {
    if(!window.confirm("Are you sure you want to cancel this shipment request?")) return;

    try {
        await axios.put('http://localhost:5000/api/shipments/status', {
            shipmentId,
            status: 'Cancelled'
        });
        await fetchShipments();
    } catch (err) {
        alert("Failed to cancel request.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Payment Pending': return 'bg-orange-100 text-orange-800 border-orange-200 animate-pulse';
      case 'Assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Picked': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'In-Transit': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">My Shipments</h2>
        <button onClick={fetchShipments} className="text-sm text-blue-600 font-bold hover:underline">Refresh List</button>
      </div>

      {shipments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">You haven't booked any shipments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shipments.map(shipment => (
            <div key={shipment._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              
              <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-lg">#{shipment.shipmentId}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{new Date(shipment.createdAt).toLocaleDateString()} • {shipment.productName} ({shipment.weight}kg)</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {(shipment.status === 'Pending' || shipment.status === 'Payment Pending') && (
                        <button onClick={() => handleCancel(shipment._id)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                            <XCircle className="w-4 h-4" /> Cancel
                        </button>
                    )}

                    {shipment.status === 'Payment Pending' && (
                        <button 
                            onClick={() => handleOpenPayment(shipment)} 
                            className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:bg-orange-700 active:scale-95 transition-all"
                        >
                            <CreditCard className="w-4 h-4" /> Pay ₹{shipment.cost}
                        </button>
                    )}
                </div>
                
                {(shipment.status === 'Assigned' || shipment.status === 'Picked' || shipment.status === 'In-Transit') && (
                  <div className="flex items-center gap-2 text-sm text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    <Truck className="w-4 h-4" />
                    <span className="font-bold">Driver: {shipment.driver?.name || 'Assigned'}</span>
                  </div>
                )}
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1"><div className="w-2 h-2 rounded-full bg-gray-400"></div></div>
                    <div><p className="text-xs text-gray-400 uppercase font-bold">Pickup</p><p className="font-medium text-gray-800">{shipment.from}</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1"><div className="w-2 h-2 rounded-full bg-blue-600"></div></div>
                    <div><p className="text-xs text-gray-400 uppercase font-bold">Drop</p><p className="font-medium text-gray-800">{shipment.to}</p></div>
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center space-y-3">
                   {shipment.status === 'Assigned' && (
                     <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                       <p className="text-xs text-blue-600 font-bold uppercase mb-1">Pickup OTP</p>
                       <p className="text-2xl font-mono font-bold text-blue-900 tracking-widest">{shipment.pickupOtp}</p>
                       <p className="text-[10px] text-blue-500 mt-1">Share with driver</p>
                     </div>
                   )}
                   {shipment.status === 'In-Transit' && (
                     <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                       <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Delivery PIN</p>
                       <p className="text-2xl font-mono font-bold text-emerald-900 tracking-widest">{shipment.deliveryOtp}</p>
                       <p className="text-[10px] text-emerald-500 mt-1">Share to verify delivery</p>
                     </div>
                   )}
                   {shipment.status === 'Delivered' && (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 p-3 rounded-lg"><CheckCircle className="w-5 h-5" /> Delivered</div>
                   )}
                   {shipment.status === 'Cancelled' && (
                      <div className="flex items-center gap-2 text-red-600 font-bold bg-red-50 p-3 rounded-lg border border-red-100"><XCircle className="w-5 h-5" /> Cancelled</div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RAZORPAY CLONE MODAL */}
      <RazorpayCloneModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        amount={paymentShipment?.cost || 0}
        orderId={paymentShipment?.shipmentId || '000'}
        onSuccess={handlePaymentSuccess}
      />

    </div>
  );
};

export default SenderMyShipments;
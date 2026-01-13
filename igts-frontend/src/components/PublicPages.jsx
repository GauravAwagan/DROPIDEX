import React from 'react';
import { Truck, MapPin, Clock, Shield, Phone, Mail, CheckCircle, ArrowRight, Star, LayoutDashboard } from 'lucide-react';

// --- SHARED FOOTER ---
const Footer = ({ onNavigate }) => (
  <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
    <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 mb-12">
      {/* Brand */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-600 p-2 rounded-lg"><Truck className="w-5 h-5 text-white" /></div>
          <span className="text-xl font-bold">IGTS</span>
        </div>
        <p className="text-gray-400 text-sm">
          Making transport simple, fast, and safe for everyone in India.
        </p>
      </div>

      {/* Links */}
      <div>
        <h4 className="font-bold text-blue-100 mb-4">Quick Links</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li><button onClick={() => onNavigate('home')} className="hover:text-blue-400 transition-colors">Home</button></li>
          <li><button onClick={() => onNavigate('about')} className="hover:text-blue-400 transition-colors">About Us</button></li>
          <li><button onClick={() => onNavigate('contact')} className="hover:text-blue-400 transition-colors">Contact Support</button></li>
          <li><button onClick={() => onNavigate('login')} className="hover:text-blue-400 transition-colors">Login / Register</button></li>
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h4 className="font-bold text-blue-100 mb-4">Need Help?</h4>
        <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" /> +91 7249699574
        </p>
        <p className="text-sm text-gray-400 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Dropexsupport@gmail.com
        </p>
        <div className="mt-4">
            <a href="https://wa.me/7249699574" target="_blank" rel="noreferrer" className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-full transition-colors inline-flex items-center gap-1">
                Chat on WhatsApp
            </a>
        </div>
      </div>
    </div>
    <div className="text-center text-xs text-gray-500 pt-8 border-t border-gray-800">
      &copy; {new Date().getFullYear()} IGTS Logistics. Simple & Secure.
    </div>
  </footer>
);

// --- 1. NAVBAR ---
export const PublicNavbar = ({ onNavigate, user }) => {
  const isLoggedIn = !!user;

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <div onClick={() => onNavigate('home')} className="flex items-center gap-2 cursor-pointer select-none">
          <div className="bg-blue-900 p-2 rounded-lg">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-blue-900">IGTS</span>
        </div>

        {/* Right Side Menu */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-6">
            {['Home', 'About', 'Contact'].map((item) => (
              <button 
                key={item}
                onClick={() => onNavigate(item.toLowerCase())} 
                className="text-gray-600 font-medium hover:text-blue-900 transition-colors text-sm uppercase tracking-wide"
              >
                {item}
              </button>
            ))}
          </div>
          
          <div className="hidden md:block w-px h-6 bg-gray-200"></div>

          {isLoggedIn ? (
             <button 
               onClick={() => onNavigate('dashboard')}
               className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md transition-all flex items-center gap-2"
             >
               <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
             </button>
          ) : (
             <button 
               onClick={() => onNavigate('login')}
               className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md transition-all flex items-center gap-2"
             >
               Login <ArrowRight className="w-4 h-4" />
             </button>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- 2. HOME PAGE ---
export const Home = ({ onNavigate, user }) => {
  const getHeroButtonConfig = () => {
    if (!user) return { text: 'Book Now', action: 'login' };
    if (user.role === 'driver') {
      return { text: 'View Current Jobs', action: 'dashboard' };
    }
    return { text: 'Book Now (Dashboard)', action: 'dashboard' };
  };

  const heroBtn = getHeroButtonConfig();

  return (
    <div className="animate-fade-in font-sans text-gray-800">
      
      {/* HERO SECTION */}
      <div className="relative bg-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-900/40" />

        <div className="relative max-w-4xl mx-auto px-6 py-32 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
            Transport Made <span className="text-blue-200">Simple.</span>
          </h1>
          <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Book trucks, track your goods, and deliver anywhere in India without the headache. Fast, Reliable, and Secure.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => onNavigate(heroBtn.action)} 
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-1 border border-blue-400"
            >
              {heroBtn.text}
            </button>
            <button onClick={() => onNavigate('about')} className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/50 px-8 py-3 rounded-full font-bold backdrop-blur-md transition-all">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* TRUST STRIP */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div><p className="text-2xl font-bold text-blue-900">50+</p><p className="text-xs text-gray-500 uppercase">Cities</p></div>
          <div><p className="text-2xl font-bold text-blue-900">12k+</p><p className="text-xs text-gray-500 uppercase">Trips</p></div>
          <div><p className="text-2xl font-bold text-blue-900">800+</p><p className="text-xs text-gray-500 uppercase">Trucks</p></div>
          <div><p className="text-2xl font-bold text-blue-900">4.9/5</p><p className="text-xs text-gray-500 uppercase">Rating</p></div>
        </div>
      </div>

      {/* WHY CHOOSE US */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose IGTS?</h2>
            <p className="text-gray-500 mt-2">We deliver excellence with every mile.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: "On-Time Delivery", desc: "98% of our shipments arrive before the estimated time." },
              { icon: Shield, title: "Secure & Verified", desc: "Every driver is verified and every shipment is insured." },
              { icon: MapPin, title: "Live Tracking", desc: "Monitor your goods in real-time with our advanced GPS." }
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all text-center group hover:bg-white border border-transparent hover:border-gray-100">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="py-20 bg-blue-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "1. Book", desc: "Choose your pickup & drop location.", icon: MapPin },
              { title: "2. Track", desc: "See exactly where your truck is.", icon: Truck },
              { title: "3. Deliver", desc: "Secure delivery with OTP verification.", icon: CheckCircle }
            ].map((step, i) => (
              <div key={i} className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="py-20 bg-white">
         <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">Trusted by Businesses</h2>
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { text: "IGTS revolutionized how we manage our supply chain. The tracking feature is a game changer.", name: "Rahul Mehta", role: "FreshMart" },
                 { text: "Finding reliable trucks used to be a nightmare. With IGTS, it's just a few clicks. Recommended!", name: "Sarah Jenkins", role: "Alpha Corp" },
                 { text: "Cost-effective and extremely professional drivers. The OTP verification adds great security.", name: "Vikram Singh", role: "Singh Textiles" }
               ].map((t, i) => (
                 <div key={i} className="bg-gray-50 p-8 rounded-2xl relative">
                    <div className="flex text-yellow-400 mb-4 gap-1"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
                    <p className="text-gray-700 mb-6 italic">"{t.text}"</p>
                    <div>
                        <p className="font-bold text-gray-900">{t.name}</p>
                        <p className="text-xs text-blue-600 font-bold uppercase">{t.role}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

// --- 3. ABOUT PAGE ---
export const About = ({ onNavigate }) => (
  <div className="animate-fade-in font-sans">
    
    <div className="relative bg-gray-900 text-white py-24 px-6 text-center overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center" />
      <div className="relative z-10">
        <h1 className="text-4xl font-bold mb-4">About Us</h1>
        <p className="text-xl text-gray-300">Simple, Reliable, and Transparent Transportation.</p>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 py-16">
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 mb-16 flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1 space-y-6 text-gray-600 leading-relaxed text-lg">
           <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Who We Are</span>
           <h2 className="text-3xl font-bold text-gray-900">Making Transport Easy</h2>
           <p>
             We provide a simple and reliable online platform designed to make transportation services easy and transparent for our clients. Our system allows customers to manage their profiles, book shipments, and transport their goods from one city to another without hassle. By moving transportation processes online, we reduce delays and improve communication.
           </p>
           <p>
             Clients can track their shipments in real time and stay informed at every stage of delivery. Our platform ensures proper coordination between drivers, vehicles, and administrators to provide safe and timely transportation. With a strong focus on convenience, reliability, and customer satisfaction, we aim to deliver a smooth transportation experience while saving time and effort for our clients.
           </p>
        </div>
        <div className="w-full md:w-2/5">
           <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1190&q=80" alt="Team Meeting" className="rounded-xl shadow-lg" />
        </div>
      </div>

      <div className="mb-20">
        <div className="bg-blue-50 p-10 rounded-2xl border-l-8 border-blue-900">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our story began with the vision to simplify transportation agency operations through digital technology. Traditional methods involving paperwork and manual coordination often caused delays and inefficiency. To solve this, we created an online platform that brings client management, shipment handling, driver coordination, and vehicle assignment into one system. 
              <br/><br/>
              Our goal is to make transportation services faster, more transparent, and easier to manage. By connecting clients, drivers, and administrators digitally, we reduce effort and improve reliability. Today, we continue to focus on innovation and efficiency, helping transportation agencies deliver better service through a simple and fully online solution.
            </p>
        </div>
      </div>

      {/* CONTACT CTA */}
      <div className="text-center py-10 border-t border-gray-200">
         <h3 className="text-xl font-bold text-gray-800 mb-4">Have questions? Reach out to us directly.</h3>
         <div className="flex flex-col md:flex-row justify-center gap-6">
            <a href="mailto:Dropexsupport@gmail.com" className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-full font-bold hover:bg-red-100 transition-colors">
                <Mail className="w-5 h-5" /> Dropexsupport@gmail.com
            </a>
            <a href="https://wa.me/7249699574" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-full font-bold hover:bg-green-100 transition-colors">
                <Phone className="w-5 h-5" /> WhatsApp Support
            </a>
         </div>
      </div>

    </div>
    <Footer onNavigate={onNavigate} />
  </div>
);

// --- 4. CONTACT PAGE ---
export const Contact = ({ onNavigate }) => (
  <div className="animate-fade-in bg-gray-50 min-h-screen font-sans">
    
    {/* HERO HEADER */}
    <div className="bg-blue-900 text-white py-16">
       <div className="max-w-4xl mx-auto px-6 text-center">
         <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
         <p className="text-blue-200">Our support team is available to assist you.</p>
       </div>
    </div>

    <div className="max-w-6xl mx-auto px-6 -mt-10 mb-20">
      
      {/* CONTACT INFO CARDS */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
         <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900">Call / WhatsApp</h3>
            <p className="text-blue-600 font-bold text-lg my-1">+91 7249699574</p>
            <a href="https://wa.me/7249699574" target="_blank" rel="noreferrer" className="text-sm text-green-600 font-bold hover:underline">
                Chat on WhatsApp →
            </a>
         </div>

         <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900">Email Us</h3>
            <p className="text-blue-600 font-bold text-lg my-1">Dropexsupport@gmail.com</p>
            <p className="text-gray-400 text-sm">Response within 24 hours</p>
         </div>

         <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900">Visit HQ</h3>
            <p className="text-blue-600 font-bold text-lg my-1">Amravati, Maharashtra</p>
            <p className="text-gray-400 text-sm">Main Logistics Hub</p>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
         
         {/* CONTACT FORM */}
         <div className="bg-white rounded-2xl shadow-lg p-10 md:w-1/2 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Message Sent!'); }}>
               <div className="grid md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">First Name</label><input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label><input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Doe" /></div>
               </div>
               <div><label className="block text-sm font-bold text-gray-700 mb-1">Email</label><input type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@example.com" /></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                  <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                      <option>Support Issue</option>
                      <option>Sales Inquiry</option>
                      <option>Driver Partnership</option>
                      <option>Other</option>
                  </select>
               </div>
               <div><label className="block text-sm font-bold text-gray-700 mb-1">Message</label><textarea rows="4" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="How can we help?"></textarea></div>
               <button className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-lg font-bold shadow-md transition-all">Send Message</button>
            </form>
         </div>

         {/* FAQ SECTION (Moved Here) */}
         <div className="md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {[
                    { q: "How can I book a shipment?", a: "Log into your account, fill in the pickup/drop details, and submit. The system handles the rest." },
                    { q: "Can I track my shipment?", a: "Yes, you can track it in real-time through your dashboard once booked." },
                    { q: "Who do I contact for delays?", a: "Contact our support team via this form or call/WhatsApp us directly." },
                    { q: "What goods can be transported?", a: "We support a wide range of goods, excluding restricted/illegal items." },
                    { q: "Can I modify my booking?", a: "Yes, modifications are allowed before a driver is assigned." }
                ].map((item, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="font-bold text-blue-900 text-sm mb-2">{item.q}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                    </div>
                ))}
            </div>
         </div>

      </div>
    </div>
    <Footer onNavigate={onNavigate} />
  </div>
);
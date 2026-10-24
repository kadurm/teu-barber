import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ClientBooking from './components/client/ClientBooking';
import AdminDashboard from './components/admin/AdminDashboard';
import { Scissors, ShieldCheck, MapPin, Phone, Instagram, Heart } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('client'); // 'client' or 'admin'
  const { shopInfo } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c0e] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Navbar Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1">
        {activeTab === 'client' ? (
          <ClientBooking onOpenAdmin={() => setActiveTab('admin')} />
        ) : (
          <AdminDashboard onBackToClient={() => setActiveTab('client')} />
        )}
      </main>

      {/* Barbershop Footer */}
      <footer className="border-t border-white/10 bg-[#08090b] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700">
              <img src={shopInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-serif font-bold text-slate-300 block">
                {shopInfo.name}
              </span>
              <span className="text-[11px] text-slate-500">
                Excelência em cortes masculinos, barboterapia e visagismo.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a
              href={`https://wa.me/${shopInfo.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{shopInfo.displayPhone}</span>
            </a>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>{shopInfo.address}</span>
            </span>
          </div>

          <div className="text-center sm:text-right text-[11px]">
            <p>© {new Date().getFullYear()} {shopInfo.name}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

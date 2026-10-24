import React from 'react';
import { useApp } from '../context/AppContext';
import { Scissors, ShieldCheck, Calendar, Phone, Clock, Instagram } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { shopInfo, appointments } = useApp();

  const pendingAppointmentsCount = appointments.filter(a => a.status === 'pendente' || a.status === 'confirmado').length;

  return (
    <header className="sticky top-0 z-50 bg-[#0c0d0f]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('client')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-400/40 shadow-lg shadow-black/50 group-hover:border-amber-400/60 transition-all">
              <img 
                src={shopInfo.logoUrl} 
                alt="Teu Barber Studio" 
                className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-300" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif tracking-widest text-lg sm:text-xl font-extrabold silver-text-gradient uppercase">
                  Teu Barber
                </span>
                <span className="text-[10px] tracking-widest font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                  STUDIO
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {shopInfo.openTime} às {shopInfo.closeTime} • {shopInfo.displayPhone}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('client')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'client'
                  ? 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-900 shadow-lg shadow-white/10 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>Agendar</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Painel Gestão</span>
              {pendingAppointmentsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-bold rounded-full">
                  {pendingAppointmentsCount}
                </span>
              )}
            </button>

            {/* Direct WhatsApp Call */}
            <a
              href={`https://wa.me/${shopInfo.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
              title="Falar no WhatsApp"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </nav>

        </div>
      </div>
    </header>
  );
}

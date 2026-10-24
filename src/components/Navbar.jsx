import React from 'react';
import { useApp } from '../context/AppContext';
import { Phone, Clock, MapPin, Instagram } from 'lucide-react';

export default function Navbar() {
  const { shopInfo } = useApp();
  const instagramHandle = shopInfo?.instagram ? shopInfo.instagram.replace('@', '').trim() : 'teu_barber.studio';
  const instagramUrl = shopInfo?.instagramUrl || `https://instagram.com/${instagramHandle}`;

  return (
    <header className="sticky top-0 z-50 bg-[#0c0d0f]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <a 
            href="./" 
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20 shadow-lg shadow-black/50 group-hover:border-amber-400/60 transition-all flex items-center justify-center bg-black/40">
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
            </div>
          </a>

          {/* Customer Navigation Contacts */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
              title="Acessar Instagram @teu_barber.studio"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span>Instagram</span>
            </a>

            <a
              href={`https://wa.me/${shopInfo.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
              title="Falar no WhatsApp"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ClientBooking from './components/client/ClientBooking';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import { MapPin, Phone, Instagram, Lock } from 'lucide-react';

function AppContent() {
  const { shopInfo } = useApp();

  // Route state
  const checkIsAdmin = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return path.endsWith('/admin') || hash === '#admin' || hash.startsWith('#/admin') || search.includes('admin');
  };

  const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdmin);
  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    return sessionStorage.getItem('teu_barber_admin_auth') === 'true';
  });

  // Listen to url changes (hash or popstate)
  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminRoute(checkIsAdmin());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateToAdmin = () => {
    window.location.hash = 'admin';
    setIsAdminRoute(true);
  };

  const navigateToClient = () => {
    window.location.hash = '';
    setIsAdminRoute(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('teu_barber_admin_auth');
    setIsAdminAuth(false);
    navigateToClient();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c0e] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* If in admin route */}
      {isAdminRoute ? (
        isAdminAuth ? (
          <div className="flex-1 py-4">
            <AdminDashboard
              onBackToClient={navigateToClient}
              onLogout={handleLogout}
            />
          </div>
        ) : (
          <div className="flex-1">
            <AdminLogin
              onLoginSuccess={() => setIsAdminAuth(true)}
              onBackToSite={navigateToClient}
            />
          </div>
        )
      ) : (
        /* Client Portal */
        <>
          <Navbar />
          
          <main className="flex-1">
            <ClientBooking />
          </main>

          {/* Barbershop Footer with updated official info */}
          <footer className="border-t border-white/10 bg-[#08090b] py-8 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-center md:text-left">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 shrink-0">
                    <img src={shopInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-slate-300 block text-sm">
                      {shopInfo.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Excelência em cortes masculinos, barboterapia e visagismo.
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-400 text-xs">
                  <a
                    href={`https://wa.me/${shopInfo.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{shopInfo.displayPhone}</span>
                  </a>

                  <span>•</span>

                  <a
                    href={shopInfo.instagramUrl || "https://instagram.com/teu_barber.oficial"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    <span>{shopInfo.instagram}</span>
                  </a>
                </div>
              </div>

              {/* Address & Hours row */}
              <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-center sm:text-left">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{shopInfo.address}</span>
                </div>

                <div>
                  <span>Seg a Sex: 09:00 às 20:00 • Sáb: 09:00 às 18:00</span>
                </div>
              </div>

              {/* Copyright & Discreet Admin Access Link */}
              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-600">
                <p>© {new Date().getFullYear()} {shopInfo.name}. Todos os direitos reservados.</p>
                
                {/* Discreet Admin Lock Link for the Barber */}
                <button
                  onClick={navigateToAdmin}
                  className="text-slate-600 hover:text-slate-400 flex items-center gap-1 transition-colors p-1"
                  title="Acesso Administrativo"
                >
                  <Lock className="w-3 h-3" />
                  <span className="hover:underline">Acesso Barbeiro</span>
                </button>
              </div>

            </div>
          </footer>
        </>
      )}

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

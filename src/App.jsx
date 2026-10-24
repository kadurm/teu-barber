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

          {/* Barbershop Footer */}
          <footer className="border-t border-white/10 bg-[#08090b] py-6 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
              
              {/* Address & Hours row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopInfo?.address || 'Rua dos Mangabeiras, Sagrada Família, Montes Claros - MG, CEP 39401-018')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-center sm:text-left hover:text-amber-400 transition-colors cursor-pointer group"
                  title="Abrir no Google Maps"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:underline">{shopInfo?.address || "Rua dos Mangabeiras, Sagrada Família, Montes Claros - MG, CEP 39401-018"}</span>
                </a>

                <div>
                  <span>Seg a Sex: 09:00 às 20:00 • Sáb: 09:00 às 18:00</span>
                </div>
              </div>

              {/* Copyright Centralizado */}
              <div className="pt-2 border-t border-white/5 text-center text-[11px] text-slate-500">
                <p>© 2026 Teu Barber Studio. Todos os direitos reservados.</p>
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

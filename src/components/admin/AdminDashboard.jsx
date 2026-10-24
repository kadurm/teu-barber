import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  DollarSign,
  Sparkles,
  TrendingUp,
  Settings,
  ShieldCheck,
  Scissors,
  ArrowLeft,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import DashboardOverviewTab from './DashboardOverviewTab';
import AppointmentsTab from './AppointmentsTab';
import ScheduleTab from './ScheduleTab';
import FinancialTab from './FinancialTab';
import AcquisitionsTab from './AcquisitionsTab';
import IntelligenceTab from './IntelligenceTab';
import SettingsTab from './SettingsTab';
import NewAppointmentModal from './NewAppointmentModal';

export default function AdminDashboard({ onBackToClient, onLogout }) {
  const { shopInfo, appointments } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pendingCount = appointments.filter(a => a.status === 'pendente' || a.status === 'confirmado').length;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard Geral', icon: LayoutDashboard },
    { id: 'appointments', label: 'Agenda & Atendimentos', icon: Calendar, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'schedule', label: 'Horários & Expediente', icon: Clock },
    { id: 'financial', label: 'Financeiro & Caixa', icon: DollarSign },
    { id: 'acquisitions', label: 'Melhoria do Espaço', icon: Sparkles },
    { id: 'intelligence', label: 'Inteligência & Sazonalidade', icon: TrendingUp },
    { id: 'settings', label: 'Catálogo & Configurações', icon: Settings },
  ];

  const handleSelectTab = (tabId) => {
    setActiveAdminTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const activeTabObj = tabs.find(t => t.id === activeAdminTab) || tabs[0];

  return (
    <div className="min-h-screen bg-[#08090b] text-slate-100 flex flex-col">
      
      {/* Mobile Top Navigation Bar (< lg) */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0e1014]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-amber-400 active:scale-95 transition-all cursor-pointer"
            title="Abrir Menu de Tópicos"
            aria-label="Abrir Menu Lateral"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/15 shrink-0 bg-black/40">
              <img src={shopInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block leading-tight">
                Painel Admin
              </span>
              <span className="text-xs font-bold text-white truncate max-w-[160px] block">
                {activeTabObj.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToClient}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Ir para Área do Cliente"
          >
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Área do Cliente</span>
          </button>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all cursor-pointer"
            title="Sair (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Sidebar (< lg) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Off-canvas Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-[#111317] border-r border-white/10 flex flex-col h-full shadow-2xl animate-slideRight z-10">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 shrink-0">
                  <img src={shopInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white text-sm">
                    {shopInfo.name}
                  </h3>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                    Menu Administrativo
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Fechar Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Menu Topics */}
            <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 block">
                Tópicos de Gestão
              </span>
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeAdminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`w-full px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        isActive ? 'bg-slate-950 text-amber-400' : 'bg-red-500 text-white'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Drawer Bottom Actions */}
            <div className="p-3 border-t border-white/10 space-y-1.5 bg-black/20">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onBackToClient();
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2.5"
              >
                <Scissors className="w-4 h-4 text-amber-400" />
                <span>Área do Cliente</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-2.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair (Logout)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Layout Container (Desktop Sidebar + Content Area) */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6 items-start flex-1">
        
        {/* Desktop Lateral Sidebar (Hidden on Mobile, Visible on lg+) */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 bg-[#111317]/95 backdrop-blur-md border border-white/10 rounded-3xl sticky top-6 shadow-2xl overflow-hidden h-[calc(100vh-3rem)]">
          
          {/* Sidebar Header: Studio Info */}
          <div className="p-5 border-b border-white/10 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/20 shadow-md shrink-0 bg-black/40">
              <img src={shopInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif font-bold text-white text-base truncate">
                  {shopInfo.name}
                </h3>
              </div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                Painel Studio
              </span>
            </div>
          </div>

          {/* Sidebar Navigation: Topics Menu */}
          <nav className="p-3.5 space-y-1.5 flex-1 overflow-y-auto scrollbar-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 block">
              Módulos do Sistema
            </span>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeAdminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`w-full px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between group cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-red-500 text-white'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Bottom Actions */}
          <div className="p-3.5 border-t border-white/10 space-y-1.5 bg-black/20">
            <button
              onClick={onBackToClient}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2.5 cursor-pointer font-medium"
            >
              <Scissors className="w-4 h-4 text-amber-400" />
              <span>Área do Cliente</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-2.5 cursor-pointer font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair (Logout)</span>
            </button>
          </div>

        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {/* Active Tab Component */}
          <div className="animate-fadeIn">
            {activeAdminTab === 'dashboard' && (
              <DashboardOverviewTab
                onNavigateTab={handleSelectTab}
                onOpenNewAppointment={() => setIsNewAppointmentModalOpen(true)}
              />
            )}
            {activeAdminTab === 'appointments' && <AppointmentsTab />}
            {activeAdminTab === 'schedule' && <ScheduleTab />}
            {activeAdminTab === 'financial' && <FinancialTab />}
            {activeAdminTab === 'acquisitions' && <AcquisitionsTab />}
            {activeAdminTab === 'intelligence' && <IntelligenceTab />}
            {activeAdminTab === 'settings' && <SettingsTab />}
          </div>

        </main>

      </div>

      {/* Manual Appointment Modal */}
      {isNewAppointmentModalOpen && (
        <NewAppointmentModal onClose={() => setIsNewAppointmentModalOpen(false)} />
      )}

    </div>
  );
}

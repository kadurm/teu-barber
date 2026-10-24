import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  DollarSign,
  Sparkles,
  Settings,
  ShieldCheck,
  Scissors,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import AppointmentsTab from './AppointmentsTab';
import ScheduleTab from './ScheduleTab';
import FinancialTab from './FinancialTab';
import AcquisitionsTab from './AcquisitionsTab';
import SettingsTab from './SettingsTab';

export default function AdminDashboard({ onBackToClient, onLogout }) {
  const { shopInfo, appointments } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState('appointments');

  const pendingCount = appointments.filter(a => a.status === 'pendente' || a.status === 'confirmado').length;

  const tabs = [
    { id: 'appointments', label: 'Agenda & Atendimentos', icon: Calendar, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'schedule', label: 'Horários & Expediente', icon: Clock },
    { id: 'financial', label: 'Financeiro & Caixa', icon: DollarSign },
    { id: 'acquisitions', label: 'Melhoria do Espaço', icon: Sparkles },
    { id: 'settings', label: 'Catálogo & Configurações', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Admin Top Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#171920] via-[#1a1d24] to-[#121418] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/20 shadow-lg shrink-0">
            <img src={shopInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-serif silver-text-gradient">
                Painel Administrativo
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Gestão Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {shopInfo.name} • Controle total da barbearia em tempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            onClick={onBackToClient}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span>Visão do Cliente</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Sair do painel administrativo"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair (Logout)</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id)}
              className={`px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 font-black'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? 'bg-slate-950 text-amber-400' : 'bg-red-500 text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="animate-fadeIn">
        {activeAdminTab === 'appointments' && <AppointmentsTab />}
        {activeAdminTab === 'schedule' && <ScheduleTab />}
        {activeAdminTab === 'financial' && <FinancialTab />}
        {activeAdminTab === 'acquisitions' && <AcquisitionsTab />}
        {activeAdminTab === 'settings' && <SettingsTab />}
      </div>

    </div>
  );
}

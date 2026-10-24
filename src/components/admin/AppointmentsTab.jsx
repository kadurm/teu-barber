import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDateBR,
  formatPhone,
  generateWhatsAppLink,
  createReminderWhatsAppMessage,
  create2HourReminderWhatsAppMessage
} from '../../utils/formatters';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Plus,
  Trash2,
  Filter,
  Search,
  Check,
  ChevronDown
} from 'lucide-react';
import NewAppointmentModal from './NewAppointmentModal';

export default function AppointmentsTab() {
  const { shopInfo, appointments, updateAppointmentStatus, deleteAppointment, barbers } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterBarber, setFilterBarber] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateMode, setFilterDateMode] = useState('today'); // 'today', 'tomorrow', 'all', 'custom'
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Target date based on mode
  const targetDate = useMemo(() => {
    const today = new Date();
    if (filterDateMode === 'today') {
      return today.toISOString().split('T')[0];
    }
    if (filterDateMode === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    if (filterDateMode === 'custom') {
      return customDate;
    }
    return null; // 'all'
  }, [filterDateMode, customDate]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // Date filter
      if (targetDate && apt.date !== targetDate) return false;

      // Barber filter
      if (filterBarber !== 'all' && apt.barberId !== filterBarber) return false;

      // Status filter
      if (filterStatus !== 'all' && apt.status !== filterStatus) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = apt.clientName.toLowerCase().includes(q);
        const matchPhone = apt.clientPhone.includes(q);
        const matchService = apt.serviceName.toLowerCase().includes(q);
        const matchId = apt.id.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchService && !matchId) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by date then time
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
  }, [appointments, targetDate, filterBarber, filterStatus, searchTerm]);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif silver-text-gradient">
            Agenda de Atendimentos
          </h2>
          <p className="text-xs text-slate-400">
            Gerencie e confirme os horários agendados pelos clientes
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Agendamento Manual</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        
        {/* Date Mode Quick Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Período:</span>
          {[
            { id: 'today', label: 'Hoje' },
            { id: 'tomorrow', label: 'Amanhã' },
            { id: 'all', label: 'Todos os Dias' },
            { id: 'custom', label: 'Data Específica' },
          ].map(d => (
            <button
              key={d.id}
              onClick={() => setFilterDateMode(d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                filterDateMode === d.id
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {d.label}
            </button>
          ))}

          {filterDateMode === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={e => setCustomDate(e.target.value)}
              className="bg-slate-900 border border-white/15 text-white text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:border-amber-400"
            />
          )}
        </div>

        {/* Secondary filters: Barber, Status, Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5 text-xs">
          
          {/* Barber filter */}
          <div>
            <label className="text-slate-400 font-medium block mb-1">Filtrar por Barbeiro:</label>
            <select
              value={filterBarber}
              onChange={e => setFilterBarber(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todos os Barbeiros</option>
              {barbers.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="text-slate-400 font-medium block mb-1">Status:</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todos os Status</option>
              <option value="confirmado">Confirmado</option>
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Search box */}
          <div>
            <label className="text-slate-400 font-medium block mb-1">Buscar Cliente ou Serviço:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nome, celular ou serviço..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 text-slate-200 pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Appointments List / Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>{filteredAppointments.length} agendamento(s) encontrado(s)</span>
          {targetDate && <span>Exibindo: <strong>{formatDateBR(targetDate)}</strong></span>}
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white/5 border border-white/10 text-center text-slate-400 space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300">Nenhum agendamento encontrado para este filtro.</p>
            <p className="text-xs">Clique no botão "Novo Agendamento Manual" para adicionar um cliente ou altere os filtros acima.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map(apt => {
              const isFinished = apt.status === 'concluido';
              const isCancelled = apt.status === 'cancelado';

  const isWithin2Hours = (appointment) => {
    if (appointment.status === 'cancelado' || appointment.status === 'concluido') return false;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (appointment.date !== todayStr) return false;
    const [h, m] = (appointment.time || '').split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return false;
    const aptDateTime = new Date();
    aptDateTime.setHours(h, m, 0, 0);
    const diff = Math.floor((aptDateTime.getTime() - now.getTime()) / (1000 * 60));
    return diff > 0 && diff <= 120;
  };

  const in2h = isWithin2Hours(apt);

              return (
                <div
                  key={apt.id}
                  className={`p-4 sm:p-5 rounded-2xl border metallic-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isFinished
                      ? 'border-emerald-500/20 bg-emerald-950/10 opacity-80'
                      : isCancelled
                      ? 'border-red-500/20 bg-red-950/10 opacity-60'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  
                  {/* Left Column: Time & Client */}
                  <div className="flex items-start gap-3.5">
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-slate-800/80 border border-white/10 text-center shrink-0">
                      <Clock className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
                      <span className="text-sm font-black text-white">{apt.time}</span>
                      <span className="text-[9px] text-slate-400 font-medium">{formatDateBR(apt.date).slice(0, 5)}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                          {apt.clientName}
                        </h4>
                        
                        {/* Status Badge */}
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          apt.status === 'concluido'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : apt.status === 'cancelado'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : apt.status === 'confirmado'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {apt.status}
                        </span>

                        {in2h && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-400" /> Em menos de 2h
                          </span>
                        )}

                        <span className="text-[10px] text-slate-500 font-mono">
                          #{apt.id}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                        <span className="text-amber-400 font-semibold">{apt.serviceName}</span>
                        <span>•</span>
                        <span>Barbeiro: <strong className="text-slate-200">{apt.barberName}</strong></span>
                        {apt.clientPhone && (
                          <>
                            <span>•</span>
                            <span className="text-slate-300">{formatPhone(apt.clientPhone)}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold font-serif">{formatCurrency(apt.price)}</span>
                      </div>

                      {apt.notes && (
                        <p className="text-[11px] text-slate-400 italic mt-1 bg-black/20 px-2 py-0.5 rounded">
                          Obs: {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 flex-wrap md:flex-nowrap justify-end pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                    
                    {/* WhatsApp 2h Prior Reminder Button */}
                    {apt.clientPhone && !isFinished && !isCancelled && in2h && (
                      <a
                        href={generateWhatsAppLink(
                          apt.clientPhone,
                          create2HourReminderWhatsAppMessage(apt, shopInfo)
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer animate-pulse"
                        title="Disparar Lembrete WhatsApp (2 Horas Antes)"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Disparar Lembrete 2h</span>
                      </a>
                    )}

                    {/* WhatsApp Reminder Button */}
                    {apt.clientPhone && !isFinished && !isCancelled && !in2h && (
                      <a
                        href={generateWhatsAppLink(
                          apt.clientPhone,
                          createReminderWhatsAppMessage(apt, shopInfo)
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        title="Enviar Lembrete pelo WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Lembrete</span>
                      </a>
                    )}

                    {/* Mark as Finished (Auto triggers Cash Flow Entry) */}
                    {!isFinished && !isCancelled && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'concluido')}
                        className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                        title="Concluir atendimento e lançar no Caixa"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Concluir</span>
                      </button>
                    )}

                    {/* Cancel appointment */}
                    {!isFinished && !isCancelled && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'cancelado')}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-400 text-xs transition-all"
                        title="Cancelar Agendamento"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete entry */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Excluir agendamento de ${apt.clientName}?`)) {
                          deleteAppointment(apt.id);
                        }
                      }}
                      className="p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 text-xs transition-all"
                      title="Excluir Registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Manual Appointment Modal */}
      <NewAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
}

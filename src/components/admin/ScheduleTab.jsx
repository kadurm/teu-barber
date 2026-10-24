import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateBR, generateTimeSlots } from '../../utils/formatters';
import {
  Clock,
  Calendar,
  Lock,
  Unlock,
  AlertTriangle,
  User,
  Settings2,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export default function ScheduleTab() {
  const { shopInfo, setShopInfo, barbers, appointments, blockedSlots, toggleBlockedSlot, isSlotAvailable, timeToMinutes, getAppointmentDuration } = useApp();

  const [selectedBarberId, setSelectedBarberId] = useState('user1');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Form for shop operating hours
  const [openTime, setOpenTime] = useState(shopInfo.openTime);
  const [closeTime, setCloseTime] = useState(shopInfo.closeTime);
  const [lunchStart, setLunchStart] = useState(shopInfo.lunchStart);
  const [lunchEnd, setLunchEnd] = useState(shopInfo.lunchEnd);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(shopInfo.slotDurationMinutes);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Time slots for the selected date
  const slots = useMemo(() => {
    return generateTimeSlots(
      shopInfo.openTime,
      shopInfo.closeTime,
      shopInfo.slotDurationMinutes,
      shopInfo.lunchStart,
      shopInfo.lunchEnd
    );
  }, [shopInfo]);

  // Handle saving general shop schedule
  const handleSaveShopHours = (e) => {
    e.preventDefault();
    setShopInfo(prev => ({
      ...prev,
      openTime,
      closeTime,
      lunchStart,
      lunchEnd,
      slotDurationMinutes: Number(slotDurationMinutes)
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const selectedBarber = barbers.find(b => b.id === selectedBarberId) || barbers[0];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="pb-2 border-b border-white/10">
        <h2 className="text-xl sm:text-2xl font-bold font-serif silver-text-gradient">
          Gestão de Horários & Expediente
        </h2>
        <p className="text-xs text-slate-400">
          Configure a grade de horários de funcionamento e bloqueie intervalos de folga ou compromisso
        </p>
      </div>

      {/* Part 1: Block Specific Time Slots (Visual Grid) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              Grade de Horários & Bloqueio Rápido
            </h3>
            <p className="text-xs text-slate-400">
              Clique em qualquer horário para bloquear ou liberar agendamentos online na data escolhida
            </p>
          </div>

          {/* Barber Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Barbeiro:</span>
            <select
              value={selectedBarberId}
              onChange={e => setSelectedBarberId(e.target.value)}
              className="bg-slate-900 border border-white/15 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
            >
              {barbers.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 font-semibold">Data Selecionada:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-slate-900 border border-white/15 text-white text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-400"
          />
          <span className="text-xs text-slate-400">({formatDateBR(selectedDate)})</span>
        </div>

        {/* Slots Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Clique para alternar [Livre / Bloqueado]:</span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Disponível
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Bloqueado
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
            {slots.map(time => {
              const isBlocked = blockedSlots.some(b => b.date === selectedDate && b.time === time && b.barberId === selectedBarberId);
              const available = isSlotAvailable(selectedDate, time, selectedBarberId);

              // Find appointment occupying this slot if any
              const occupyingApt = (!available && !isBlocked && appointments) ? appointments.find(apt => {
                if (apt.date !== selectedDate || apt.barberId !== selectedBarberId || apt.status === 'cancelado') return false;
                const aptStart = timeToMinutes(apt.time);
                const aptDuration = getAppointmentDuration ? getAppointmentDuration(apt) : (Number(apt.duration) || 30);
                const aptEnd = aptStart + aptDuration;
                const slotStart = timeToMinutes(time);
                const slotEnd = slotStart + Number(shopInfo.slotDurationMinutes || 30);
                return slotStart < aptEnd && aptStart < slotEnd;
              }) : null;

              return (
                <button
                  key={time}
                  onClick={() => toggleBlockedSlot(selectedDate, time, selectedBarberId, "Bloqueado pelo barbeiro")}
                  title={
                    isBlocked
                      ? 'Horário bloqueado manualmente'
                      : occupyingApt
                      ? `Agendado: ${occupyingApt.clientName} (${occupyingApt.serviceName} • ${occupyingApt.duration || 30} min)`
                      : 'Disponível para agendamento'
                  }
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                    isBlocked
                      ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                      : available
                      ? 'bg-white/5 border-white/10 hover:border-amber-400/50 hover:bg-white/10 text-slate-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isBlocked ? <Lock className="w-3 h-3 text-red-400" /> : <Clock className="w-3 h-3 text-slate-500" />}
                    <span>{time}</span>
                  </div>
                  <span className="text-[9px] font-normal">
                    {isBlocked ? 'Bloqueado' : available ? 'Disponível' : 'Agendado'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Part 2: Shop Operating Hours Configuration */}
      <form onSubmit={handleSaveShopHours} className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-amber-400" />
              Parâmetros de Funcionamento do Estúdio
            </h3>
            <p className="text-xs text-slate-400">
              Horário de abertura, fechamento e intervalo de almoço do Teu Barber
            </p>
          </div>

          {savedSuccess && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" /> Salvo com sucesso!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Horário de Abertura</label>
            <input
              type="time"
              value={openTime}
              onChange={e => setOpenTime(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Horário de Fechamento</label>
            <input
              type="time"
              value={closeTime}
              onChange={e => setCloseTime(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Início Almoço</label>
            <input
              type="time"
              value={lunchStart}
              onChange={e => setLunchStart(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Fim Almoço</label>
            <input
              type="time"
              value={lunchEnd}
              onChange={e => setLunchEnd(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
          >
            Salvar Horários de Funcionamento
          </button>
        </div>
      </form>

    </div>
  );
}

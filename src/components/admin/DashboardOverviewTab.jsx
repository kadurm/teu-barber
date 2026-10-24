import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateBR } from '../../utils/formatters';
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Scissors,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Lock,
  PiggyBank,
  AlertCircle,
  Star,
  Check
} from 'lucide-react';

export default function DashboardOverviewTab({ onNavigateTab, onOpenNewAppointment }) {
  const { shopInfo, appointments, services, barbers, financialRecords, acquisitions } = useApp();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Today's appointments
  const todayAppointments = useMemo(() => {
    return appointments
      .filter(a => a.date === todayStr && a.status !== 'cancelado')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, todayStr]);

  // General Metrics
  const metrics = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Month revenue from financial records
    const monthIncome = financialRecords
      .filter(f => f.type === 'entrada' && f.date.startsWith(currentMonth))
      .reduce((acc, f) => acc + Number(f.amount || 0), 0);

    // Month expenses
    const monthExpense = financialRecords
      .filter(f => f.type === 'saida' && f.date.startsWith(currentMonth))
      .reduce((acc, f) => acc + Number(f.amount || 0), 0);

    const netProfit = monthIncome - monthExpense;

    // Completed appointments this month
    const monthAppointments = appointments.filter(a => 
      a.date.startsWith(currentMonth) && (a.status === 'concluido' || a.status === 'confirmado')
    );

    const averageTicket = monthAppointments.length > 0 
      ? monthIncome / monthAppointments.length 
      : 0;

    return {
      monthIncome,
      monthExpense,
      netProfit,
      monthCount: monthAppointments.length,
      averageTicket,
      todayCount: todayAppointments.length
    };
  }, [financialRecords, appointments, todayAppointments]);

  // Top Services Ranking
  const topServices = useMemo(() => {
    const counts = {};
    appointments.forEach(apt => {
      if (apt.status === 'cancelado') return;
      const key = apt.serviceName || 'Serviço';
      if (!counts[key]) {
        counts[key] = { count: 0, revenue: 0, serviceId: apt.serviceId };
      }
      counts[key].count += 1;
      counts[key].revenue += Number(apt.price || 0);
    });

    return Object.entries(counts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [appointments]);

  // Barbers Performance
  const barbersPerformance = useMemo(() => {
    return barbers.map(barber => {
      const barberApts = appointments.filter(a => a.barberId === barber.id && a.status !== 'cancelado');
      const totalRevenue = barberApts.reduce((acc, a) => acc + Number(a.price || 0), 0);
      const commissionRate = barber.commissionRate || 50;
      const commission = (totalRevenue * commissionRate) / 100;

      return {
        ...barber,
        cutsCount: barberApts.length,
        totalRevenue,
        commission
      };
    });
  }, [barbers, appointments]);

  // Acquisitions Overview
  const acquisitionsSummary = useMemo(() => {
    const totalTarget = acquisitions.reduce((acc, a) => acc + Number(a.targetCost || 0), 0);
    const totalSaved = acquisitions.reduce((acc, a) => acc + Number(a.savedAmount || 0), 0);
    const progress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    const nextGoal = acquisitions.find(a => a.status === 'em_economia') || acquisitions[0];

    return {
      totalTarget,
      totalSaved,
      progress: Math.min(100, Math.round(progress)),
      nextGoal
    };
  }, [acquisitions]);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif silver-text-gradient flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Visão Geral do Teu Barber
          </h2>
          <p className="text-xs text-slate-400">
            Métricas executivas, agenda do dia e desempenho do estúdio em tempo real
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenNewAppointment && (
            <button
              onClick={onOpenNewAppointment}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('intelligence')}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Planejamento</span>
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Faturamento do Mês */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 metallic-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Receita do Mês</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-lg sm:text-2xl font-black text-emerald-400 font-serif block">
            {formatCurrency(metrics.monthIncome)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Líquido: {formatCurrency(metrics.netProfit)}
          </span>
        </div>

        {/* Atendimentos do Mês */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 metallic-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Cortes no Mês</span>
            <Scissors className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-lg sm:text-2xl font-black text-white font-serif block">
            {metrics.monthCount} atendimentos
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Média de {Math.round(metrics.monthCount / 26 || 1)} clientes/dia útil
          </span>
        </div>

        {/* Ticket Médio */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 metallic-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Ticket Médio</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-lg sm:text-2xl font-black text-sky-400 font-serif block">
            {formatCurrency(metrics.averageTicket)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Por cliente atendido
          </span>
        </div>

        {/* Agendamentos Hoje */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 metallic-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Agenda de Hoje</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-lg sm:text-2xl font-black text-white font-serif block">
            {metrics.todayCount} clientes
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {formatDateBR(todayStr)}
          </span>
        </div>

      </div>

      {/* Main Content: Agenda de Hoje + Serviços Mais Vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Today's Live Schedule */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Próximos Clientes de Hoje
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Ver agenda completa</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Nenhum agendamento ativo para hoje ainda.
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayAppointments.map(apt => (
                <div
                  key={apt.id}
                  className="p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-amber-400 font-mono">{apt.time}</span>
                      <span className="text-[9px] text-slate-500">{apt.duration || 30}m</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{apt.clientName}</h4>
                      <p className="text-[11px] text-slate-400">
                        {apt.serviceName} • <span className="text-amber-400/90">{apt.barberName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-white font-serif block">
                      {formatCurrency(apt.price)}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
                      apt.status === 'concluido'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : apt.status === 'confirmado'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 col): Ranking dos Serviços Mais Vendidos */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Serviços Mais Pedidos
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('settings')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Catálogo</span>
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {topServices.map((service, idx) => {
              const maxCount = topServices[0]?.count || 1;
              const percent = Math.round((service.count / maxCount) * 100);

              return (
                <div key={service.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white truncate max-w-[170px]">
                      {idx + 1}. {service.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      <strong>{service.count}x</strong> • {formatCurrency(service.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Barbers Comparison */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Equipe do Estúdio
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {barbersPerformance.map(b => (
                <div key={b.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                  <div className="font-bold text-white truncate">{b.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{b.cutsCount} atendimentos</div>
                  <div className="text-xs font-bold text-emerald-400 font-serif mt-1">
                    {formatCurrency(b.totalRevenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row: Melhoria do Espaço (Metas) Preview */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <PiggyBank className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm">
                Melhoria do Espaço Teu Barber
              </h4>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                {acquisitionsSummary.progress}% Concluído
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Guardado: <strong className="text-emerald-400">{formatCurrency(acquisitionsSummary.totalSaved)}</strong> de {formatCurrency(acquisitionsSummary.totalTarget)} planejados
              {acquisitionsSummary.nextGoal && ` • Próxima meta: "${acquisitionsSummary.nextGoal.title}"`}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('acquisitions')}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all self-start md:self-auto cursor-pointer"
        >
          <span>Gerenciar Metas</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}

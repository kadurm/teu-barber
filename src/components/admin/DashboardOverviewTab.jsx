import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateBR } from '../../utils/formatters';
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Compass,
  Scissors,
  ArrowRight,
  Plus,
  PiggyBank,
  Layers,
  ChevronRight
} from 'lucide-react';
import SalesPerformanceChart from './SalesPerformanceChart';

export default function DashboardOverviewTab({ onNavigateTab, onOpenNewAppointment }) {
  const { shopInfo, appointments, services, barbers, financialRecords, acquisitions } = useApp();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Helper para formatar data em YYYY-MM-DD para inputs
  const formatDateToInput = (d) => {
    const date = new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Estados do Filtro de Período do Dashboard (padrão: Últimos 7 dias, como no NuuPrensado)
  const [dashDatePreset, setDashDatePreset] = useState('7days');
  const [dashStartDate, setDashStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return formatDateToInput(d);
  });
  const [dashEndDate, setDashEndDate] = useState(() => todayStr);
  const [chartType, setChartType] = useState('line'); // 'line' | 'bar'

  // Troca rápida de períodos predefinidos
  const handleSelectDatePreset = (preset) => {
    setDashDatePreset(preset);
    const today = new Date();

    if (preset === 'today') {
      const str = formatDateToInput(today);
      setDashStartDate(str);
      setDashEndDate(str);
    } else if (preset === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const str = formatDateToInput(y);
      setDashStartDate(str);
      setDashEndDate(str);
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      setDashStartDate(formatDateToInput(d));
      setDashEndDate(formatDateToInput(today));
    } else if (preset === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      setDashStartDate(formatDateToInput(d));
      setDashEndDate(formatDateToInput(today));
    } else if (preset === 'thisMonth') {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setDashStartDate(formatDateToInput(first));
      setDashEndDate(formatDateToInput(last));
    } else if (preset === 'lastMonth') {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      setDashStartDate(formatDateToInput(first));
      setDashEndDate(formatDateToInput(last));
    }
  };

  // Limites em timestamp para filtragem precisa
  const dashStartBoundary = useMemo(() => {
    const parts = (dashStartDate || todayStr).split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  }, [dashStartDate, todayStr]);

  const dashEndBoundary = useMemo(() => {
    const parts = (dashEndDate || todayStr).split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999);
  }, [dashEndDate, todayStr]);

  const dashDiffDays = useMemo(() => {
    return Math.max(1, Math.round((dashEndBoundary.getTime() - dashStartBoundary.getTime()) / (1000 * 60 * 60 * 24)));
  }, [dashStartBoundary, dashEndBoundary]);

  // Atendimentos filtrados no período
  const periodAppointments = useMemo(() => {
    return appointments.filter(a => {
      if (a.status === 'cancelado') return false;
      const aptDate = a.date || '';
      return aptDate >= dashStartDate && aptDate <= dashEndDate;
    });
  }, [appointments, dashStartDate, dashEndDate]);

  // Transações financeiras filtradas no período
  const periodFinancial = useMemo(() => {
    return financialRecords.filter(f => {
      const fDate = f.date || '';
      return fDate >= dashStartDate && fDate <= dashEndDate;
    });
  }, [financialRecords, dashStartDate, dashEndDate]);

  // Indicadores do Período Filtrado
  const periodMetrics = useMemo(() => {
    // Faturamento via atendimentos
    const salesFromApts = periodAppointments.reduce((acc, a) => acc + (Number(a.price) || 0), 0);

    // Receitas extras (ex: vendas de pomadas) não vinculadas diretamente a agendamento
    const extraIncome = periodFinancial
      .filter(f => f.type === 'entrada' && !f.appointmentId)
      .reduce((acc, f) => acc + (Number(f.amount) || 0), 0);

    const totalIncome = salesFromApts > 0 ? (salesFromApts + extraIncome) : periodFinancial
      .filter(f => f.type === 'entrada')
      .reduce((acc, f) => acc + (Number(f.amount) || 0), 0);

    const totalExpenses = periodFinancial
      .filter(f => f.type === 'saida')
      .reduce((acc, f) => acc + (Number(f.amount) || 0), 0);

    const netProfit = totalIncome - totalExpenses;
    const margin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';
    const totalCount = periodAppointments.length;
    const avgTicket = totalCount > 0 ? totalIncome / totalCount : 0;

    // Barbeiros ativos no período
    const activeBarbersSet = new Set(periodAppointments.map(a => a.barberId).filter(Boolean));

    // Serviço mais pedido no período
    const serviceCounts = {};
    periodAppointments.forEach(a => {
      const name = a.serviceName || 'Corte';
      serviceCounts[name] = (serviceCounts[name] || 0) + 1;
    });
    const sortedServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]);
    const topService = sortedServices.length > 0 ? sortedServices[0][0] : 'Corte + Barba';

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      margin,
      totalCount,
      avgTicket,
      activeBarbersCount: Math.max(activeBarbersSet.size, 1),
      topService
    };
  }, [periodAppointments, periodFinancial]);

  // Pontos reais do gráfico conforme o período (Diário ou Horário se <= 1 dia)
  const chartPoints = useMemo(() => {
    const points = [];

    if (dashDiffDays <= 1) {
      // Visão Horária para 1 único dia (Hoje ou Ontem)
      for (let h = 8; h <= 20; h++) {
        const hourStr = String(h).padStart(2, '0');
        const matched = periodAppointments.filter(a => {
          const aptTime = a.time || '';
          return aptTime.startsWith(`${hourStr}:`);
        });

        const hourSales = matched.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
        points.push({
          key: `h-${h}`,
          label: `${h}h`,
          fullLabel: `${hourStr}:00 às ${hourStr}:59`,
          value: Number(hourSales.toFixed(2)),
          count: matched.length
        });
      }
    } else {
      // Visão Diária para múltiplos dias (7 dias, 30 dias, este mês, etc.)
      const weekDaysMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const curDate = new Date(dashStartBoundary);
      curDate.setHours(0, 0, 0, 0);
      const lastDate = new Date(dashEndBoundary);
      lastDate.setHours(0, 0, 0, 0);

      while (curDate <= lastDate) {
        const dateStr = formatDateToInput(curDate);
        const dw = weekDaysMap[curDate.getDay()];
        const dd = String(curDate.getDate()).padStart(2, '0');
        const mm = String(curDate.getMonth() + 1).padStart(2, '0');
        const shortDate = `${dd}/${mm}`;

        const dayAppointments = periodAppointments.filter(a => a.date === dateStr);
        const dayAptSales = dayAppointments.reduce((sum, a) => sum + (Number(a.price) || 0), 0);

        const dayExtra = periodFinancial
          .filter(f => f.type === 'entrada' && !f.appointmentId && f.date === dateStr)
          .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

        const totalDayValue = dayAptSales + dayExtra;

        points.push({
          key: dateStr,
          label: dashDiffDays <= 7 ? `${dw} ${shortDate}` : shortDate,
          fullLabel: `${dw}, ${shortDate}/${curDate.getFullYear()}`,
          value: Number(totalDayValue.toFixed(2)),
          count: dayAppointments.length
        });

        curDate.setDate(curDate.getDate() + 1);
      }
    }

    return points;
  }, [dashDiffDays, dashStartBoundary, dashEndBoundary, periodAppointments, periodFinancial]);

  // Cálculo de pico e teto arredondado para escala Y
  const chartMaxSale = useMemo(() => {
    return Math.max(...chartPoints.map(p => p.value), 0);
  }, [chartPoints]);

  const chartNiceMax = useMemo(() => {
    if (chartMaxSale <= 0) return 100;
    return Math.ceil(chartMaxSale / 50) * 50 || 100;
  }, [chartMaxSale]);

  const periodTitle = useMemo(() => {
    if (dashDiffDays <= 1) return 'Horário do Dia';
    if (dashDatePreset === '7days') return 'Últimos 7 dias';
    if (dashDatePreset === '30days') return 'Últimos 30 dias';
    if (dashDatePreset === 'thisMonth') return 'Este Mês';
    if (dashDatePreset === 'lastMonth') return 'Mês Anterior';
    return `${dashDiffDays} dias`;
  }, [dashDiffDays, dashDatePreset]);

  // Today's live appointments for schedule card
  const todayAppointments = useMemo(() => {
    return appointments
      .filter(a => a.date === todayStr && a.status !== 'cancelado')
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [appointments, todayStr]);

  // Top Services Ranking (Geral)
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

  // Barbers Performance (Geral)
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
            Acompanhamento em tempo real dos agendamentos, faturamento e indicadores da operação.
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
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Planejamento</span>
          </button>
        </div>
      </div>

      {/* BARRA DE FILTRO DE PERÍODO (Idêntica ao padrão do NuuPrensado) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Filtrar Período de Atendimentos
            </h3>
          </div>

          {/* Badge Informativo do Intervalo */}
          <div className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl font-mono font-semibold self-start sm:self-auto">
            {formatDateBR(dashStartDate)} até {formatDateBR(dashEndDate)} • {periodMetrics.totalCount} atendimento(s)
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Botões de Período Rápido */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'today', label: 'Hoje' },
              { id: 'yesterday', label: 'Ontem' },
              { id: '7days', label: 'Últimos 7 dias' },
              { id: '30days', label: 'Últimos 30 dias' },
              { id: 'thisMonth', label: 'Este Mês' },
              { id: 'lastMonth', label: 'Mês Anterior' }
            ].map(preset => {
              const isSelected = dashDatePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectDatePreset(preset.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 border border-amber-400'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Seletores de Data Personalizados */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold">De:</span>
            <input
              type="date"
              value={dashStartDate}
              onChange={(e) => {
                setDashStartDate(e.target.value);
                setDashDatePreset('custom');
              }}
              className="bg-black/50 border border-white/15 px-2.5 py-1.5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-400"
            />
            <span className="font-semibold">Até:</span>
            <input
              type="date"
              value={dashEndDate}
              onChange={(e) => {
                setDashEndDate(e.target.value);
                setDashDatePreset('custom');
              }}
              className="bg-black/50 border border-white/15 px-2.5 py-1.5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* CARDS DE MÉTRICAS DO PERÍODO FILTRADO (Como no NuuPrensado) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Vendas no Período */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 metallic-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vendas no Período</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-base sm:text-xl font-black text-emerald-400 font-serif block">
              {formatCurrency(periodMetrics.totalIncome)}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block font-medium">
            {periodMetrics.totalCount} apurados
          </span>
        </div>

        {/* Despesas no Período */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 metallic-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Despesas Período</span>
              <DollarSign className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <span className="text-base sm:text-xl font-black text-rose-400 font-serif block">
              {formatCurrency(periodMetrics.totalExpenses)}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block font-medium">
            Gastos lançados
          </span>
        </div>

        {/* Resultado Líquido */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 metallic-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resultado Líquido</span>
              <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className={`text-base sm:text-xl font-black font-serif block ${
              periodMetrics.netProfit >= 0 ? 'text-white' : 'text-rose-400'
            }`}>
              {formatCurrency(periodMetrics.netProfit)}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 mt-2 block font-bold">
            Margem: {periodMetrics.margin}%
          </span>
        </div>

        {/* Atendimentos & Ticket Médio */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 metallic-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Atendimentos</span>
              <Scissors className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <span className="text-base sm:text-xl font-black text-white font-serif block">
              {periodMetrics.totalCount} cortes
            </span>
          </div>
          <span className="text-[10px] text-amber-400 mt-2 block font-medium">
            Ticket: {formatCurrency(periodMetrics.avgTicket)}
          </span>
        </div>

        {/* Procedimentos Realizados */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 metallic-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mais Pedido</span>
              <Layers className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-white truncate block">
              {periodMetrics.topService}
            </span>
          </div>
          <span className="text-[10px] text-purple-300 mt-2 block font-medium">
            No período filtrado
          </span>
        </div>

        {/* Equipe Ativa */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 metallic-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Equipe Ativa</span>
              <Users className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-base sm:text-xl font-black text-white font-serif block">
              {periodMetrics.activeBarbersCount} barbeiros
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 block font-medium">
            Produzindo no estúdio
          </span>
        </div>

      </div>

      {/* GRÁFICO DINÂMICO DE VENDAS & ATENDIMENTOS (Como nos prints do NuuPrensado) */}
      <SalesPerformanceChart
        chartPoints={chartPoints}
        chartType={chartType}
        setChartType={setChartType}
        chartMaxSale={chartMaxSale}
        chartNiceMax={chartNiceMax}
        totalSales={periodMetrics.totalIncome}
        totalCount={periodMetrics.totalCount}
        periodTitle={periodTitle}
      />

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
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
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
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
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
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Equipe & Parceiros
              </span>
              <button
                onClick={() => onNavigateTab('partners')}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>Ver Comissões</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
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

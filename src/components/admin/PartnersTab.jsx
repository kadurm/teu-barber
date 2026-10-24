import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, UserCheck, DollarSign, Scissors, TrendingUp, 
  Calendar, Phone, Copy, Check, Plus, Edit2, ShieldAlert,
  Award, ArrowUpRight, FileText, Key, Percent, CheckCircle2,
  ExternalLink, MessageSquare
} from 'lucide-react';
import EditPartnerModal from './EditPartnerModal';

export default function PartnersTab() {
  const { barbers, appointments, addBarber, updateBarber } = useApp();

  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState(barbers[0]?.id || 'all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barberToEdit, setBarberToEdit] = useState(null);
  
  // Copy state feedback
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Helper date boundaries
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const periodDates = useMemo(() => {
    const now = new Date();
    if (selectedPeriod === 'today') {
      return { start: todayStr, end: todayStr, label: 'Hoje' };
    }
    if (selectedPeriod === 'week') {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const monday = new Date(d.setDate(diff)).toISOString().split('T')[0];
      const sunday = new Date(d.setDate(diff + 6)).toISOString().split('T')[0];
      return { start: monday, end: sunday, label: 'Esta Semana' };
    }
    if (selectedPeriod === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return { start: firstDay, end: lastDay, label: `Mês de ${monthNames[now.getMonth()]}` };
    }
    if (selectedPeriod === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      return { start: firstDay, end: lastDay, label: 'Mês Passado' };
    }
    if (selectedPeriod === 'custom') {
      return { start: customStart || '2000-01-01', end: customEnd || '2099-12-31', label: 'Período Personalizado' };
    }
    return { start: '2000-01-01', end: '2099-12-31', label: 'Todo o Histórico' };
  }, [selectedPeriod, customStart, customEnd, todayStr]);

  // Filter valid appointments in period
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      if (apt.status === 'cancelled') return false;
      const aptDate = apt.date;
      return aptDate >= periodDates.start && aptDate <= periodDates.end;
    });
  }, [appointments, periodDates]);

  // Aggregate stats per barber
  const statsPerBarber = useMemo(() => {
    const map = {};
    barbers.forEach(b => {
      map[b.id] = {
        barber: b,
        totalServices: 0,
        grossRevenue: 0,
        partnerCommission: 0,
        studioRetention: 0,
        servicesMap: {}, // serviceName -> { count, unitPrice, totalGross }
        appointmentsList: [],
      };
    });

    filteredAppointments.forEach(apt => {
      const bId = apt.barberId;
      if (!map[bId]) {
        // In case barber was deleted or mismatched
        map[bId] = {
          barber: { id: bId, name: apt.barberName || 'Barbeiro', commissionRate: 50 },
          totalServices: 0,
          grossRevenue: 0,
          partnerCommission: 0,
          studioRetention: 0,
          servicesMap: {},
          appointmentsList: [],
        };
      }

      const rate = (map[bId].barber.commissionRate !== undefined) ? map[bId].barber.commissionRate : 50;
      const price = Number(apt.price) || 0;
      const commVal = (price * rate) / 100;
      const retVal = price - commVal;

      map[bId].totalServices += 1;
      map[bId].grossRevenue += price;
      map[bId].partnerCommission += commVal;
      map[bId].studioRetention += retVal;
      map[bId].appointmentsList.push(apt);

      const sName = apt.serviceName || 'Serviço';
      if (!map[bId].servicesMap[sName]) {
        map[bId].servicesMap[sName] = {
          name: sName,
          count: 0,
          unitPrice: price,
          totalGross: 0,
        };
      }
      map[bId].servicesMap[sName].count += 1;
      map[bId].servicesMap[sName].totalGross += price;
    });

    return map;
  }, [barbers, filteredAppointments]);

  // Team totals
  const teamTotals = useMemo(() => {
    let services = 0;
    let gross = 0;
    let commission = 0;
    let retention = 0;
    Object.values(statsPerBarber).forEach(stat => {
      services += stat.totalServices;
      gross += stat.grossRevenue;
      commission += stat.partnerCommission;
      retention += stat.studioRetention;
    });
    return { services, gross, commission, retention };
  }, [statsPerBarber]);

  // Ranking sorted by gross revenue
  const ranking = useMemo(() => {
    return Object.values(statsPerBarber).sort((a, b) => b.grossRevenue - a.grossRevenue);
  }, [statsPerBarber]);

  // Current active barber for detail view
  const activeBarberData = statsPerBarber[selectedBarberId] || statsPerBarber[barbers[0]?.id] || null;

  const handleOpenEdit = (barber) => {
    setBarberToEdit(barber);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setBarberToEdit(null);
    setIsModalOpen(true);
  };

  const handleSavePartner = (data) => {
    if (barberToEdit) {
      updateBarber(barberToEdit.id, data);
    } else {
      addBarber(data);
    }
    setIsModalOpen(false);
  };

  const copyPixKey = (key) => {
    if (!key) return;
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyWhatsAppReport = () => {
    if (!activeBarberData) return;
    const b = activeBarberData.barber;
    const servicesList = Object.values(activeBarberData.servicesMap)
      .map(s => `  • ${s.count}x ${s.name} - R$ ${s.totalGross.toFixed(2).replace('.', ',')}`)
      .join('\n');

    const msg = `✂️ *RELATÓRIO DE FECHAMENTO - TEU BARBER STUDIO* 💈\n` +
      `👤 *Profissional:* ${b.name} (${b.role || 'Barbeiro'})\n` +
      `📅 *Período:* ${periodDates.label} (${periodDates.start} até ${periodDates.end})\n` +
      `---------------------------------------\n` +
      `💈 *Total de Serviços Realizados:* ${activeBarberData.totalServices}\n` +
      `💵 *Faturamento Bruto Gerado:* R$ ${activeBarberData.grossRevenue.toFixed(2).replace('.', ',')}\n` +
      `⭐ *Taxa de Comissão Acordada:* ${b.commissionRate || 50}%\n` +
      `💰 *VALOR LÍQUIDO A REPASSAR:* R$ ${activeBarberData.partnerCommission.toFixed(2).replace('.', ',')}\n` +
      `🏦 *Retenção Estúdio (Custos & Estrutura):* R$ ${activeBarberData.studioRetention.toFixed(2).replace('.', ',')}\n` +
      `---------------------------------------\n` +
      `📊 *Detalhamento por Serviço:*\n${servicesList || '  • Nenhum serviço no período'}\n` +
      `---------------------------------------\n` +
      `🔑 *Chave Pix para Depósito:* ${b.pixKey || 'Não cadastrada'} (${b.pixKeyType || 'CPF'})\n` +
      `📄 *CPF/Doc:* ${b.document || 'Não cadastrado'}\n\n` +
      `Obrigado pelo empenho e excelência no Teu Barber Studio! 🚀🔥`;

    navigator.clipboard.writeText(msg);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Parceiros & Gestão de Comissões
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Relatórios individuais por barbeiro, percentual de comissão, registro de documentos e repasse Pix.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Parceiro
          </button>
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 mr-2">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            Filtrar Período:
          </span>
          {[
            { id: 'today', label: 'Hoje' },
            { id: 'week', label: 'Esta Semana' },
            { id: 'month', label: 'Este Mês' },
            { id: 'last_month', label: 'Mês Passado' },
            { id: 'all', label: 'Todo o Histórico' },
            { id: 'custom', label: 'Personalizado' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriod(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedPeriod === p.id 
                  ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20' 
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700/80'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {selectedPeriod === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-amber-500"
            />
            <span className="text-zinc-500">até</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        )}
      </div>

      {/* Global Team KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total de Atendimentos</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{teamTotals.services}</div>
          <p className="text-xs text-zinc-500 mt-1">Serviços executados no período</p>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Faturamento Bruto</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            R$ {teamTotals.gross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Receita total da equipe</p>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Repasse de Comissões</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400">
            R$ {teamTotals.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">A pagar aos profissionais</p>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Retenção Barbearia</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            R$ {teamTotals.retention.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Margem do estúdio / custos</p>
        </div>
      </div>

      {/* Team Ranking & Comparison */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-white">Ranking de Produção por Membro</h3>
          </div>
          <span className="text-xs text-zinc-500">{periodDates.label}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ranking.map((stat, idx) => {
            const b = stat.barber;
            const isSelected = selectedBarberId === b.id;
            const isFirst = idx === 0 && stat.grossRevenue > 0;
            return (
              <div 
                key={b.id}
                onClick={() => setSelectedBarberId(b.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected 
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5' 
                    : 'bg-zinc-900/80 border-white/5 hover:border-white/20'
                }`}
              >
                {isFirst && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg flex items-center gap-1">
                    <Award className="w-3 h-3" /> #1 Produtor
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={b.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                      alt={b.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                      #{idx + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white truncate">{b.name}</h4>
                      {b.id === 'user1' && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-bold">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 truncate">{b.role || 'Barbeiro'}</p>
                    <p className="text-[11px] text-amber-500 font-medium mt-0.5">
                      Comissão: {b.commissionRate || 50}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Atendimentos</span>
                    <span className="font-bold text-white text-sm">{stat.totalServices}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Bruto Gerado</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      R$ {stat.grossRevenue.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Comissão a Pagar</span>
                    <span className="font-bold text-amber-400 text-sm">
                      R$ {stat.partnerCommission.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Retenção Studio</span>
                    <span className="font-bold text-zinc-300 text-sm">
                      R$ {stat.studioRetention.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/5">
                  <span className="hover:text-amber-400 flex items-center gap-1">
                    Ver relatório individual <ArrowUpRight className="w-3 h-3" />
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(b);
                    }}
                    className="p-1 hover:text-white text-zinc-400 transition-colors"
                    title="Editar Cadastro"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Barber Detailed Report Area */}
      {activeBarberData && (
        <div className="space-y-6">
          {/* Barber Header Card */}
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img
                  src={activeBarberData.barber.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                  alt={activeBarberData.barber.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{activeBarberData.barber.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {activeBarberData.barber.commissionRate || 50}% de Comissão
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-0.5">{activeBarberData.barber.role || 'Barbeiro Parceiro'}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-zinc-400">
                    {activeBarberData.barber.phone && (
                      <a 
                        href={`https://wa.me/55${activeBarberData.barber.phone.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-emerald-400 hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {activeBarberData.barber.phone}
                      </a>
                    )}
                    {activeBarberData.barber.document && (
                      <span className="flex items-center gap-1 text-zinc-300">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        CPF/Doc: {activeBarberData.barber.document}
                      </span>
                    )}
                    {activeBarberData.barber.admissionDate && (
                      <span className="text-zinc-500">
                        Desde: {activeBarberData.barber.admissionDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit, Copy Pix, Send WhatsApp */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                {activeBarberData.barber.pixKey && (
                  <button
                    onClick={() => copyPixKey(activeBarberData.barber.pixKey)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Key className="w-3.5 h-3.5 text-amber-400" />}
                    {copiedKey ? 'Chave Copiada!' : `Pix (${activeBarberData.barber.pixKeyType || 'CPF'}): ${activeBarberData.barber.pixKey.slice(0, 10)}...`}
                  </button>
                )}

                <button
                  onClick={copyWhatsAppReport}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                  {copiedSummary ? 'Fechamento Copiado!' : 'Copiar Fechamento p/ WhatsApp'}
                </button>

                <button
                  onClick={() => handleOpenEdit(activeBarberData.barber)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                  Editar Cadastro
                </button>
              </div>
            </div>
          </div>

          {/* Breakdown: Quanto de Cada Serviço Ele Fez */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-amber-500" />
                  Produção por Tipo de Serviço ({periodDates.label})
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Detalhamento exato de quantos serviços foram prestados por {activeBarberData.barber.name} e divisão de valores.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-950/60 text-zinc-400 text-xs uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Serviço Realizado</th>
                    <th className="px-6 py-3.5 font-semibold text-center">Quantidade</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Preço Unit. Médio</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Total Bruto</th>
                    <th className="px-6 py-3.5 font-semibold text-right text-amber-400">
                      Comissão ({activeBarberData.barber.commissionRate || 50}%)
                    </th>
                    <th className="px-6 py-3.5 font-semibold text-right text-zinc-400">Retenção Barbearia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {Object.values(activeBarberData.servicesMap).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 text-xs">
                        Nenhum atendimento finalizado por este barbeiro no período selecionado ({periodDates.label}).
                      </td>
                    </tr>
                  ) : (
                    Object.values(activeBarberData.servicesMap).map((srv, idx) => {
                      const commVal = (srv.totalGross * (activeBarberData.barber.commissionRate || 50)) / 100;
                      const retVal = srv.totalGross - commVal;
                      const avgUnit = srv.totalGross / (srv.count || 1);
                      return (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            {srv.name}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-white border border-white/5">
                              {srv.count}x
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-zinc-300">
                            R$ {avgUnit.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-white">
                            R$ {srv.totalGross.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-amber-400">
                            R$ {commVal.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-zinc-400">
                            R$ {retVal.toFixed(2).replace('.', ',')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {Object.values(activeBarberData.servicesMap).length > 0 && (
                  <tfoot className="bg-zinc-950/80 border-t border-white/10 font-bold text-sm">
                    <tr>
                      <td className="px-6 py-4 text-white uppercase text-xs">Totalizador do Período</td>
                      <td className="px-6 py-4 text-center text-white font-bold">
                        {activeBarberData.totalServices} serviços
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-400">-</td>
                      <td className="px-6 py-4 text-right text-emerald-400 text-base">
                        R$ {activeBarberData.grossRevenue.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-6 py-4 text-right text-amber-400 text-base">
                        R$ {activeBarberData.partnerCommission.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-300 text-base">
                        R$ {activeBarberData.studioRetention.toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Individual Client Appointments Log */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Histórico de Clientes Atendidos ({activeBarberData.appointmentsList.length})
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Lista nominal dos clientes atendidos por {activeBarberData.barber.name} no período
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-950/60 text-zinc-400 text-xs uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Data & Horário</th>
                    <th className="px-6 py-3.5 font-semibold">Cliente</th>
                    <th className="px-6 py-3.5 font-semibold">Serviço</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Valor</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Comissão (R$)</th>
                    <th className="px-6 py-3.5 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeBarberData.appointmentsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-6 text-center text-zinc-500 text-xs">
                        Nenhum agendamento encontrado no período.
                      </td>
                    </tr>
                  ) : (
                    activeBarberData.appointmentsList.map((apt) => {
                      const comm = ((Number(apt.price) || 0) * (activeBarberData.barber.commissionRate || 50)) / 100;
                      return (
                        <tr key={apt.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-3.5 text-zinc-300 font-medium">
                            {apt.date.split('-').reverse().join('/')} às {apt.time}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="font-semibold text-white block">{apt.clientName}</span>
                            <span className="text-xs text-zinc-500">{apt.clientPhone}</span>
                          </td>
                          <td className="px-6 py-3.5 text-zinc-300">{apt.serviceName}</td>
                          <td className="px-6 py-3.5 text-right font-semibold text-white">
                            R$ {Number(apt.price || 0).toFixed(2).replace('.', ',')}
                          </td>
                          <td className="px-6 py-3.5 text-right font-bold text-amber-400">
                            R$ {comm.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              apt.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : apt.status === 'confirmed'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {apt.status === 'completed' ? 'Finalizado' : apt.status === 'confirmed' ? 'Confirmado' : apt.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit / New Partner Modal */}
      <EditPartnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePartner}
        barberToEdit={barberToEdit}
      />
    </div>
  );
}

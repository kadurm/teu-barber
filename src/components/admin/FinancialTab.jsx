import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateBR } from '../../utils/formatters';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Banknote,
  QrCode,
  PieChart
} from 'lucide-react';
import NewTransactionModal from './NewTransactionModal';

export default function FinancialTab() {
  const { financialRecords, deleteFinancialRecord, barbers, appointments } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'entrada', 'saida'

  const todayStr = new Date().toISOString().split('T')[0];

  // Financial Metrics
  const metrics = useMemo(() => {
    let totalEntradas = 0;
    let totalSaidas = 0;
    let totalHoje = 0;
    let countServicos = 0;
    let sumServicos = 0;

    financialRecords.forEach(r => {
      const amt = Number(r.amount) || 0;
      if (r.type === 'entrada') {
        totalEntradas += amt;
        if (r.date === todayStr) {
          totalHoje += amt;
        }
        if (r.category === 'Serviço') {
          countServicos += 1;
          sumServicos += amt;
        }
      } else if (r.type === 'saida') {
        totalSaidas += amt;
      }
    });

    const lucroLiquido = totalEntradas - totalSaidas;
    const ticketMedio = countServicos > 0 ? sumServicos / countServicos : 0;

    return {
      totalEntradas,
      totalSaidas,
      totalHoje,
      lucroLiquido,
      ticketMedio
    };
  }, [financialRecords, todayStr]);

  // Performance per Barber
  const barberStats = useMemo(() => {
    return barbers.map(barber => {
      const barberRecords = financialRecords.filter(
        r => r.type === 'entrada' && r.barberId === barber.id
      );
      const totalGenerated = barberRecords.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
      const totalServices = barberRecords.length;
      const commissionAmount = barber.commissionRate === 100 
        ? totalGenerated 
        : (totalGenerated * (barber.commissionRate / 100));

      return {
        ...barber,
        totalGenerated,
        totalServices,
        commissionAmount
      };
    });
  }, [barbers, financialRecords]);

  // Filtered transactions list
  const filteredRecords = useMemo(() => {
    return financialRecords.filter(r => {
      if (filterType === 'all') return true;
      return r.type === filterType;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [financialRecords, filterType]);

  return (
    <div className="space-y-8">
      
      {/* Header & New Transaction Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif silver-text-gradient">
            Gestão Financeira & Fluxo de Caixa
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhe receitas, despesas operacionais, comissões e balanço financeiro
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Transação / Despesa</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Faturamento Hoje */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 metallic-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Hoje</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-lg sm:text-2xl font-black text-white font-serif block">
            {formatCurrency(metrics.totalHoje)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Entradas confirmadas hoje</span>
        </div>

        {/* Total Entradas */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 metallic-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Entradas Totais</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-lg sm:text-2xl font-black text-emerald-400 font-serif block">
            {formatCurrency(metrics.totalEntradas)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Receitas acumuladas</span>
        </div>

        {/* Total Despesas */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 metallic-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Despesas / Saídas</span>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-lg sm:text-2xl font-black text-red-400 font-serif block">
            {formatCurrency(metrics.totalSaidas)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Insumos, produtos e custos</span>
        </div>

        {/* Lucro Líquido */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 metallic-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Saldo Líquido</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <span className={`text-lg sm:text-2xl font-black font-serif block ${
            metrics.lucroLiquido >= 0 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {formatCurrency(metrics.lucroLiquido)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Receitas menos despesas</span>
        </div>

        {/* Ticket Médio */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 metallic-card col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Ticket Médio</span>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-lg sm:text-2xl font-black text-slate-200 font-serif block">
            {formatCurrency(metrics.ticketMedio)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Média por atendimento</span>
        </div>

      </div>

      {/* Production & Commission by Barber */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          Produção & Comissões dos Barbeiros
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {barberStats.map(b => (
            <div
              key={b.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={b.avatar}
                  alt={b.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {b.name}
                    <span className="text-[10px] bg-white/10 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                      {b.commissionRate}% comissão
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {b.totalServices} atendimento(s) computado(s)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Gerado:</span>
                <span className="text-sm font-bold text-slate-200 block font-serif">
                  {formatCurrency(b.totalGenerated)}
                </span>
                <span className="text-xs text-amber-400 font-bold block mt-0.5">
                  Comissão: {formatCurrency(b.commissionAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions History Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            Extrato de Movimentações (Fluxo de Caixa)
          </h3>

          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'entrada', label: 'Entradas' },
              { id: 'saida', label: 'Saídas' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  filterType === t.id
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Nenhuma transação registrada nesta categoria.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(rec => {
                    const isEntrada = rec.type === 'entrada';
                    return (
                      <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-mono">
                          {formatDateBR(rec.date)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full ${
                            isEntrada
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {isEntrada ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {isEntrada ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-300">
                          {rec.category}
                        </td>
                        <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                          {rec.description}
                          {rec.barberName && (
                            <span className="text-[10px] text-slate-500 block">
                              Barbeiro: {rec.barberName}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 uppercase font-mono text-[10px]">
                          {rec.paymentMethod || 'Pix'}
                        </td>
                        <td className={`py-3 px-4 text-right font-black font-serif ${
                          isEntrada ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {isEntrada ? '+' : '-'}{formatCurrency(rec.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm("Excluir esta transação financeira?")) {
                                deleteFinancialRecord(rec.id);
                              }
                            }}
                            className="p-1 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
                            title="Excluir Transação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* New Transaction Modal */}
      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
}

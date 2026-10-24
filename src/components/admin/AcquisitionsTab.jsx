import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateBR } from '../../utils/formatters';
import {
  Sparkles,
  PiggyBank,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Check,
  TrendingUp,
  Tag,
  Scissors,
  Layers,
  ArrowRight
} from 'lucide-react';
import NewAcquisitionModal from './NewAcquisitionModal';
import ContributeModal from './ContributeModal';

export default function AcquisitionsTab() {
  const { acquisitions, updateAcquisitionGoal, deleteAcquisitionGoal } = useApp();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [contributeTargetGoal, setContributeTargetGoal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'em_economia', 'adquirido', 'planejado'

  // Summary Metrics
  const summary = useMemo(() => {
    let totalTarget = 0;
    let totalSaved = 0;
    let totalAcquired = 0;
    let countAcquired = 0;

    acquisitions.forEach(item => {
      totalTarget += Number(item.targetCost) || 0;
      totalSaved += Number(item.savedAmount) || 0;
      if (item.status === 'adquirido') {
        totalAcquired += Number(item.targetCost) || 0;
        countAcquired += 1;
      }
    });

    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return {
      totalTarget,
      totalSaved,
      totalAcquired,
      countAcquired,
      overallProgress: Math.min(100, overallProgress)
    };
  }, [acquisitions]);

  // Filtered acquisitions
  const filteredAcquisitions = useMemo(() => {
    return acquisitions.filter(item => {
      if (filterStatus === 'all') return true;
      return item.status === filterStatus;
    });
  }, [acquisitions, filterStatus]);

  return (
    <div className="space-y-8">
      
      {/* Top Header & New Goal Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif silver-text-gradient flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Planejamento de Aquisições & Melhoria do Espaço
          </h2>
          <p className="text-xs text-slate-400">
            Metas de infraestrutura, reformas, novos maquinários e conforto para elevar o padrão do Teu Barber
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Meta de Aquisição</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 metallic-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total em Metas</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-lg sm:text-2xl font-black text-white font-serif block">
            {formatCurrency(summary.totalTarget)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Valor total dos planos</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 metallic-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Guardado / Reservado</span>
            <PiggyBank className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-lg sm:text-2xl font-black text-emerald-400 font-serif block">
            {formatCurrency(summary.totalSaved)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Economia acumulada</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 metallic-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Já Conquistado</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-lg sm:text-2xl font-black text-blue-400 font-serif block">
            {formatCurrency(summary.totalAcquired)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">{summary.countAcquired} melhoria(s) entregue(s)</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 metallic-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Progresso Geral</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-lg sm:text-2xl font-black text-amber-400 font-serif block">
            {summary.overallProgress.toFixed(0)}%
          </span>
          {/* Visual Mini Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary.overallProgress}%` }}
            />
          </div>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold mr-1">Exibir:</span>
        {[
          { id: 'all', label: 'Todas as Metas' },
          { id: 'em_economia', label: 'Em Economia' },
          { id: 'adquirido', label: 'Já Conquistadas' },
          { id: 'planejado', label: 'Planejadas' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filterStatus === f.id
                ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Acquisition Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredAcquisitions.map(item => {
          const isDone = item.status === 'adquirido';
          const progress = Math.min(100, Math.round((item.savedAmount / item.targetCost) * 100));
          const remaining = Math.max(0, item.targetCost - item.savedAmount);
          const cutsEquivalent = Math.ceil(remaining / 30); // Base: corte padrão R$ 30,00

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border metallic-card transition-all flex flex-col justify-between ${
                isDone
                  ? 'border-emerald-500/30 bg-emerald-950/15'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                
                {/* Header: Category & Priority & Status */}
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {item.category}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Priority Badge */}
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      item.priority === 'alta'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : item.priority === 'media'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      Prioridade {item.priority}
                    </span>

                    {/* Status Badge */}
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border border-white/10'
                    }`}>
                      {isDone && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                      {isDone ? 'Conquistado!' : 'Em Andamento'}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white font-serif mt-1">
                  {item.title}
                </h3>

                {item.notes && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.notes}
                  </p>
                )}

                {/* Numbers: Target vs Saved */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-end justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Guardado até agora:</span>
                    <span className="text-lg font-black text-emerald-400 font-serif">
                      {formatCurrency(item.savedAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Custo Estimado:</span>
                    <span className="text-base font-bold text-white font-serif">
                      {formatCurrency(item.targetCost)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Progresso da meta</span>
                    <span className="font-bold text-amber-400">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-amber-500 to-amber-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* "Barber Math" calculation: how many cuts left */}
                {!isDone && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5" />
                      Faltam <strong>{formatCurrency(remaining)}</strong>
                    </span>
                    <span className="text-[11px] opacity-90">
                      ≈ <strong>{cutsEquivalent}</strong> cortes de R$ 30
                    </span>
                  </div>
                )}

                {item.targetDate && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Previsão: {formatDateBR(item.targetDate)}</span>
                  </div>
                )}

              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                
                {!isDone ? (
                  <button
                    onClick={() => setContributeTargetGoal(item)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <PiggyBank className="w-3.5 h-3.5" />
                    <span>Guardar Dinheiro</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Item instalado no estúdio
                  </span>
                )}

                <div className="flex items-center gap-1.5">
                  {!isDone && (
                    <button
                      onClick={() => updateAcquisitionGoal(item.id, { status: 'adquirido', savedAmount: item.targetCost })}
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-emerald-400 text-xs font-medium transition-all"
                      title="Marcar como Conquistado / Comprado"
                    >
                      <Check className="w-3.5 h-3.5 inline mr-1" />
                      Comprado
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm(`Excluir a meta "${item.title}"?`)) {
                        deleteAcquisitionGoal(item.id);
                      }
                    }}
                    className="p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 text-xs transition-all"
                    title="Excluir Meta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* New Acquisition Modal */}
      <NewAcquisitionModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      {/* Contribute / Deposit Modal */}
      <ContributeModal
        isOpen={!!contributeTargetGoal}
        onClose={() => setContributeTargetGoal(null)}
        goal={contributeTargetGoal}
      />

    </div>
  );
}

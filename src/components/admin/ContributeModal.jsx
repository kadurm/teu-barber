import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { X, PiggyBank, Plus, Check } from 'lucide-react';

export default function ContributeModal({ isOpen, onClose, goal }) {
  const { contributeToAcquisition } = useApp();
  const [amount, setAmount] = useState('');
  const [deductFromCashFlow, setDeductFromCashFlow] = useState(true);

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.targetCost - goal.savedAmount);

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert("Informe um valor numérico válido maior que zero.");
      return;
    }

    contributeToAcquisition(goal.id, num, deductFromCashFlow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#14161b] border border-white/10 rounded-3xl p-6 shadow-2xl relative text-slate-100">
        
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold font-serif silver-text-gradient flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-amber-400" />
              Guardar Dinheiro / Aporte
            </h3>
            <p className="text-xs text-slate-400">
              Destine recursos do caixa para a melhoria do estúdio
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[11px] text-slate-400 block">Item Selecionado:</span>
            <h4 className="font-bold text-white text-sm">{goal.title}</h4>
            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-400">Já guardado: <strong className="text-emerald-400">{formatCurrency(goal.savedAmount)}</strong></span>
              <span className="text-slate-400">Faltam: <strong className="text-amber-400">{formatCurrency(remaining)}</strong></span>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Valor do Aporte (R$) *</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="Ex: 250.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Quick preset amount buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Sugestões:</span>
            {[50, 100, 200, 500].map(val => (
              <button
                type="button"
                key={val}
                onClick={() => setAmount(String(val))}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-semibold"
              >
                +R$ {val}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={deductFromCashFlow}
                onChange={e => setDeductFromCashFlow(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-white/20 focus:ring-0"
              />
              <span>Registrar saída automática no Fluxo de Caixa (como Reserva)</span>
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20"
            >
              Confirmar Aporte
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

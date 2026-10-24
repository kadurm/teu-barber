import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Edit2, DollarSign, Calendar, Tag, PiggyBank, Sparkles } from 'lucide-react';

export default function EditAcquisitionModal({ isOpen, onClose, goal }) {
  const { updateAcquisitionGoal } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Mobiliário');
  const [targetCost, setTargetCost] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState('alta');
  const [status, setStatus] = useState('em_economia');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setCategory(goal.category || 'Mobiliário');
      setTargetCost(goal.targetCost?.toString() || '');
      setSavedAmount(goal.savedAmount?.toString() || '0');
      setTargetDate(goal.targetDate || '');
      setPriority(goal.priority || 'alta');
      setStatus(goal.status || 'em_economia');
      setNotes(goal.notes || '');
    }
  }, [goal, isOpen]);

  if (!isOpen || !goal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cost = parseFloat(targetCost);
    const saved = parseFloat(savedAmount) || 0;

    if (isNaN(cost) || cost <= 0) {
      alert("Informe um custo estimado válido para a aquisição.");
      return;
    }
    if (!title.trim()) {
      alert("Informe o nome da melhoria ou equipamento.");
      return;
    }

    updateAcquisitionGoal(goal.id, {
      title: title.trim(),
      category,
      targetCost: cost,
      savedAmount: Math.max(0, saved),
      targetDate: targetDate || null,
      priority,
      status: saved >= cost ? 'adquirido' : status,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#14161b] border border-white/10 rounded-3xl p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-4 border-b border-white/10 sticky top-0 bg-[#14161b] z-10">
          <div>
            <h3 className="text-lg font-bold font-serif silver-text-gradient flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-amber-400" />
              Editar Meta de Aquisição
            </h3>
            <p className="text-xs text-slate-400">
              Atualize os detalhes, valores e status desta meta
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Nome do Item ou Reforma *</label>
            <input
              type="text"
              required
              placeholder="Ex: Cadeira Hidráulica Vintage Reclinável em Couro"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Custo Estimado (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="Ex: 3500.00"
                value={targetCost}
                onChange={e => setTargetCost(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Valor Guardado até Agora (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 1000.00"
                value={savedAmount}
                onChange={e => setSavedAmount(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Categoria</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Mobiliário">Mobiliário (Cadeiras, Bancadas, Sofás)</option>
                <option value="Climatização">Climatização (Ar-Condicionado, Ventilação)</option>
                <option value="Maquinário">Maquinário (Máquinas de Corte, Shavers)</option>
                <option value="Espaço & Iluminação">Espaço & Iluminação (Espelhos, Led, Decoração)</option>
                <option value="Áudio & Conforto">Áudio & Conforto (Som, Frigobar, Café)</option>
                <option value="Tecnologia">Tecnologia (Tablet, Totem, Software)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="alta">Prioridade Alta (Urgente para o espaço)</option>
                <option value="media">Prioridade Média (Importante)</option>
                <option value="baixa">Prioridade Baixa (Desejável)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Status da Meta</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="em_economia">Em Economia / Em Andamento</option>
                <option value="planejado">Planejada (Ainda não iniciada)</option>
                <option value="adquirido">Já Conquistada / Adquirida</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Previsão de Conquista</label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Observações ou Motivação</label>
            <textarea
              rows={3}
              placeholder="Ex: Marca, modelo, link de fornecedor ou por que isso vai valorizar o atendimento dos clientes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

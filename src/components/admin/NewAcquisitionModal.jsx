import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sparkles, DollarSign, Calendar, Tag } from 'lucide-react';

export default function NewAcquisitionModal({ isOpen, onClose }) {
  const { addAcquisitionGoal } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Mobiliário');
  const [targetCost, setTargetCost] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState('alta');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cost = parseFloat(targetCost);
    if (isNaN(cost) || cost <= 0) {
      alert("Informe um custo estimado válido para a aquisição.");
      return;
    }
    if (!title.trim()) {
      alert("Informe o nome da melhoria ou equipamento.");
      return;
    }

    addAcquisitionGoal({
      title: title.trim(),
      category,
      targetCost: cost,
      targetDate: targetDate || null,
      priority,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#14161b] border border-white/10 rounded-3xl p-6 shadow-2xl relative text-slate-100">
        
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold font-serif silver-text-gradient flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Nova Meta de Aquisição para o Estúdio
            </h3>
            <p className="text-xs text-slate-400">
              Planeje novos equipamentos, reformas e melhorias no Teu Barber
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
              <label className="text-slate-300 font-semibold block mb-1">Categoria</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Mobiliário">Mobiliário (Cadeiras, Bancadas, Sofás)</option>
                <option value="Climatização">Climatização (Ar-Condicionado, Ventilação)</option>
                <option value="Maquinário">Maquinário (Máquinas de Corte, Shavers)</option>
                <option value="Iluminação & Estética">Iluminação & Espelhos LED</option>
                <option value="Experiência do Cliente">Experiência (Frigobar, Café, Som)</option>
                <option value="Reforma & Pintura">Reforma & Fachada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="alta">Alta Prioridade (Urgente / Essencial)</option>
                <option value="media">Média Prioridade (Importante)</option>
                <option value="baixa">Baixa Prioridade (Desejável no futuro)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Previsão / Data Alvo</label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Detalhes e Justificativa</label>
            <textarea
              rows={3}
              placeholder="Ex: Melhora a ergonomia nas barboterapias e agrega valor visual para as fotos de cortes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-amber-400 resize-none"
            />
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
              Criar Meta de Aquisição
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

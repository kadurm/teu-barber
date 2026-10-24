import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Edit2, Scissors, DollarSign, Clock } from 'lucide-react';

export default function EditServiceModal({ isOpen, onClose, service }) {
  const { updateService } = useApp();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');
  const [category, setCategory] = useState('cabelo');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (service) {
      setName(service.name || '');
      setPrice(service.price?.toString() || '');
      setDuration(service.duration?.toString() || '30');
      setCategory(service.category || 'cabelo');
      setDescription(service.description || '');
    }
  }, [service, isOpen]);

  if (!isOpen || !service) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const p = parseFloat(price);
    const d = parseInt(duration, 10);

    if (!name.trim()) {
      alert("Informe o nome do serviço.");
      return;
    }
    if (isNaN(p) || p < 0) {
      alert("Informe um preço válido.");
      return;
    }

    updateService(service.id, {
      name: name.trim(),
      price: p,
      duration: isNaN(d) || d <= 0 ? 30 : d,
      category,
      description: description.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#14161b] border border-white/10 rounded-3xl p-6 shadow-2xl relative text-slate-100">
        
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold font-serif silver-text-gradient flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-amber-400" />
              Editar Serviço do Catálogo
            </h3>
            <p className="text-xs text-slate-400">
              Atualize nome, valores, categoria e duração do atendimento
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
            <label className="text-slate-300 font-semibold block mb-1">Nome do Serviço *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Preço (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Duração (minutos) *</label>
              <input
                type="number"
                step="5"
                min="5"
                required
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Categoria *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="cabelo">Cabelo</option>
                <option value="barba">Barba</option>
                <option value="combos">Combos</option>
                <option value="quimica">Química & Tratamentos</option>
                <option value="estetica">Estética Facial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Descrição</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descrição do procedimento ou benefícios..."
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

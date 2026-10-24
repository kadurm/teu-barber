import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, DollarSign, PlusCircle, MinusCircle } from 'lucide-react';

export default function NewTransactionModal({ isOpen, onClose }) {
  const { barbers, addFinancialRecord } = useApp();

  const [type, setType] = useState('saida'); // 'entrada' or 'saida'
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Insumos');
  const [amount, setAmount] = useState('');
  const [barberId, setBarberId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Informe um valor numérico válido maior que zero.");
      return;
    }
    if (!description.trim()) {
      alert("Informe a descrição da transação.");
      return;
    }

    const selectedBarber = barbers.find(b => b.id === barberId);

    addFinancialRecord({
      type,
      category,
      description: description.trim(),
      amount: numAmount,
      barberId: barberId || null,
      barberName: selectedBarber ? selectedBarber.name : null,
      paymentMethod,
      date
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#14161b] border border-white/10 rounded-3xl p-6 shadow-2xl relative text-slate-100">
        
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold font-serif silver-text-gradient">
              Nova Transação Financeira
            </h3>
            <p className="text-xs text-slate-400">
              Lançamento manual no fluxo de caixa do estúdio
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
          
          {/* Type Toggle: Entrada vs Saída */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">Tipo de Movimentação</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('entrada');
                  setCategory('Serviço Avulso');
                }}
                className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  type === 'entrada'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Entrada (Receita)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('saida');
                  setCategory('Insumos');
                }}
                className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  type === 'saida'
                    ? 'bg-red-500/20 text-red-300 border-red-500 shadow-lg shadow-red-500/10'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <MinusCircle className="w-4 h-4" />
                <span>Saída (Despesa)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Descrição *</label>
            <input
              type="text"
              required
              placeholder={type === 'entrada' ? 'Ex: Venda de Pomada Matte Extra Forte' : 'Ex: Compra de navalhas, gola higiênica e toalhas'}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
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
                {type === 'entrada' ? (
                  <>
                    <option value="Serviço Avulso">Serviço Avulso</option>
                    <option value="Venda Produto">Venda de Produto (Pomada/Óleo)</option>
                    <option value="Outras Receitas">Outras Receitas</option>
                  </>
                ) : (
                  <>
                    <option value="Insumos">Insumos (Lâminas, Golas, Luvas)</option>
                    <option value="Produtos Revenda">Estoque Produtos</option>
                    <option value="Custos Fixos">Aluguel / Energia / Água</option>
                    <option value="Melhoria do Espaço">Melhoria / Reforma</option>
                    <option value="Outros">Outras Despesas</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="pix">Pix</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão de Crédito/Débito</option>
                <option value="reserva">Reserva / Caixa</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {type === 'entrada' && (
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Vincular a Barbeiro (Opcional)</label>
              <select
                value={barberId}
                onChange={e => setBarberId(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">Nenhum (Receita Geral da Barbearia)</option>
                {barbers.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

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
              Registrar Transação
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

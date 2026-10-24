import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import {
  Settings,
  Scissors,
  Store,
  Users,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Edit2
} from 'lucide-react';

export default function SettingsTab() {
  const {
    shopInfo,
    setShopInfo,
    services,
    addService,
    updateService,
    deleteService,
    barbers,
    setBarbers,
    exportData,
    importData,
    resetToInitialData
  } = useApp();

  // New Service Form State
  const [isAddingService, setIsAddingService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newServiceCategory, setNewServiceCategory] = useState('cabelo');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Shop Info Form State
  const [shopName, setShopName] = useState(shopInfo.name);
  const [shopPhone, setShopPhone] = useState(shopInfo.phone);
  const [shopDisplayPhone, setShopDisplayPhone] = useState(shopInfo.displayPhone);
  const [shopAddress, setShopAddress] = useState(shopInfo.address);
  const [shopInstagram, setShopInstagram] = useState(shopInfo.instagram);
  const [shopSavedSuccess, setShopSavedSuccess] = useState(false);

  // File input ref for import
  const fileInputRef = React.useRef(null);

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    const price = parseFloat(newServicePrice);
    if (isNaN(price) || price < 0) return;

    addService({
      name: newServiceName.trim(),
      price,
      duration: parseInt(newServiceDuration) || 30,
      category: newServiceCategory,
      description: newServiceDesc.trim() || 'Serviço profissional no Teu Barber Studio.'
    });

    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDesc('');
    setIsAddingService(false);
  };

  const handleSaveShopInfo = (e) => {
    e.preventDefault();
    setShopInfo(prev => ({
      ...prev,
      name: shopName,
      phone: shopPhone.replace(/\D/g, ''),
      displayPhone: shopDisplayPhone,
      address: shopAddress,
      instagram: shopInstagram
    }));
    setShopSavedSuccess(true);
    setTimeout(() => setShopSavedSuccess(false), 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      importData(event.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="pb-2 border-b border-white/10">
        <h2 className="text-xl sm:text-2xl font-bold font-serif silver-text-gradient">
          Configurações & Catálogo do Estúdio
        </h2>
        <p className="text-xs text-slate-400">
          Gerencie catálogo de serviços, preços, informações de contato e backups do sistema
        </p>
      </div>

      {/* Part 1: Service Catalog & Pricing */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-400" />
              Catálogo de Serviços & Preços ({services.length})
            </h3>
            <p className="text-xs text-slate-400">
              Edite valores ou cadastre novos combos e tratamentos
            </p>
          </div>

          <button
            onClick={() => setIsAddingService(!isAddingService)}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingService ? 'Fechar' : 'Novo Serviço'}</span>
          </button>
        </div>

        {/* Add Service Inline Form */}
        {isAddingService && (
          <form onSubmit={handleAddService} className="p-4 rounded-xl bg-slate-900 border border-white/15 space-y-3 text-xs animate-fadeIn">
            <h4 className="font-bold text-amber-400">Cadastrar Novo Serviço</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="text-slate-300 block mb-1">Nome do Serviço</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Barboterapia Especial com Ozônio"
                  value={newServiceName}
                  onChange={e => setNewServiceName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 px-3 py-2 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="35.00"
                  value={newServicePrice}
                  onChange={e => setNewServicePrice(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 px-3 py-2 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Duração (min)</label>
                <input
                  type="number"
                  placeholder="30"
                  value={newServiceDuration}
                  onChange={e => setNewServiceDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 px-3 py-2 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Categoria</label>
                <select
                  value={newServiceCategory}
                  onChange={e => setNewServiceCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 px-3 py-2 rounded-lg text-white"
                >
                  <option value="cabelo">Cabelo</option>
                  <option value="barba">Barba</option>
                  <option value="combos">Combos</option>
                  <option value="quimica">Química & Tratamentos</option>
                  <option value="estetica">Estética</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Descrição Breve</label>
                <input
                  type="text"
                  placeholder="Descrição do serviço..."
                  value={newServiceDesc}
                  onChange={e => setNewServiceDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 px-3 py-2 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingService(false)}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold"
              >
                Salvar Serviço
              </button>
            </div>
          </form>
        )}

        {/* Services List Table */}
        <div className="rounded-xl border border-white/10 overflow-hidden bg-slate-900/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Serviço</th>
                <th className="py-2.5 px-3">Categoria</th>
                <th className="py-2.5 px-3">Duração</th>
                <th className="py-2.5 px-3 text-right">Preço</th>
                <th className="py-2.5 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {services.map(s => (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {s.name}
                  </td>
                  <td className="py-2.5 px-3 uppercase text-[10px] text-slate-400 font-mono">
                    {s.category}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {s.duration} min
                  </td>
                  <td className="py-2.5 px-3 text-right font-black font-serif text-amber-400">
                    {formatCurrency(s.price)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => {
                        const newPrice = prompt(`Novo preço para "${s.name}":`, s.price);
                        if (newPrice !== null) {
                          const num = parseFloat(newPrice);
                          if (!isNaN(num) && num >= 0) {
                            updateService(s.id, { price: num });
                          }
                        }
                      }}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-amber-400 mr-1"
                      title="Alterar Preço"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Excluir serviço "${s.name}"?`)) {
                          deleteService(s.id);
                        }
                      }}
                      className="p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400"
                      title="Excluir Serviço"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Part 2: Shop Contact & Information */}
      <form onSubmit={handleSaveShopInfo} className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" />
              Informações do Teu Barber Studio
            </h3>
            <p className="text-xs text-slate-400">
              Dados exibidos para os clientes no agendamento e nas mensagens de WhatsApp
            </p>
          </div>

          {shopSavedSuccess && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Dados atualizados!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-2">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Nome do Estabelecimento</label>
            <input
              type="text"
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">WhatsApp (Número Completo)</label>
            <input
              type="text"
              value={shopPhone}
              onChange={e => setShopPhone(e.target.value)}
              placeholder="5538991218119"
              className="w-full bg-slate-900 border border-white/15 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Telefone Formatado</label>
            <input
              type="text"
              value={shopDisplayPhone}
              onChange={e => setShopDisplayPhone(e.target.value)}
              placeholder="(38) 99121-8119"
              className="w-full bg-slate-900 border border-white/15 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Localização / Endereço</label>
            <input
              type="text"
              value={shopAddress}
              onChange={e => setShopAddress(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Instagram</label>
            <input
              type="text"
              value={shopInstagram}
              onChange={e => setShopInstagram(e.target.value)}
              placeholder="@teubarberstudio"
              className="w-full bg-slate-900 border border-white/15 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
          >
            Salvar Dados do Estúdio
          </button>
        </div>
      </form>

      {/* Part 3: Data Backup, Import & Factory Reset */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400" />
            Backup & Segurança dos Dados
          </h3>
          <p className="text-xs text-slate-400">
            Exporte ou importe seus agendamentos, clientes, fluxo de caixa e metas em formato JSON
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export Button */}
          <button
            onClick={exportData}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar Backup (JSON)</span>
          </button>

          {/* Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Restaurar / Importar Backup</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          {/* Reset Defaults Button */}
          <button
            onClick={resetToInitialData}
            className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Redefinir Padrões do Teu Barber</span>
          </button>
        </div>
      </div>

    </div>
  );
}

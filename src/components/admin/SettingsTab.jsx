import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatPhone } from '../../utils/formatters';
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
  Edit2,
  Layers,
  Filter,
  Flame,
  Cloud,
  Database
} from 'lucide-react';
import EditServiceModal from './EditServiceModal';

export default function SettingsTab({ onOpenFirebaseModal }) {
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
    resetToInitialData,
    cloudConnected
  } = useApp();

  // New Service Form State
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState('all');
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newServiceCategory, setNewServiceCategory] = useState('cabelo');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Shop Info Form State
  const [shopName, setShopName] = useState(shopInfo.name);
  const [shopPhone, setShopPhone] = useState(shopInfo.displayPhone || formatPhone(shopInfo.phone) || '(38) 99121-8119');
  const [shopAddress, setShopAddress] = useState(shopInfo.address || 'Rua dos Mangabeiras, Sagrada Família, Montes Claros - MG, CEP 39401-018');
  const [shopInstagram, setShopInstagram] = useState(shopInfo.instagram || '@teu_barber.studio');
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
    const clean = shopPhone.replace(/\D/g, '');
    let display = formatPhone(clean);
    let full = clean;
    if (clean.length === 10 || clean.length === 11) {
      full = '55' + clean;
      display = formatPhone(clean);
    } else if (clean.startsWith('55') && clean.length >= 12) {
      display = formatPhone(clean.slice(2));
    }

    setShopInfo(prev => ({
      ...prev,
      name: shopName,
      phone: full,
      displayPhone: display,
      address: shopAddress,
      instagram: shopInstagram,
      instagramUrl: `https://instagram.com/${shopInstagram.replace('@', '')}`
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

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filtrar:
          </span>
          {[
            { id: 'all', label: 'Todas as Categorias', count: services.length },
            { id: 'cabelo', label: 'Cabelo', count: services.filter(s => s.category === 'cabelo').length },
            { id: 'barba', label: 'Barba', count: services.filter(s => s.category === 'barba').length },
            { id: 'combos', label: 'Combos Econômicos', count: services.filter(s => s.category === 'combos').length },
            { id: 'quimica', label: 'Química & Tratamentos', count: services.filter(s => s.category === 'quimica').length },
            { id: 'estetica', label: 'Estética Facial', count: services.filter(s => s.category === 'estetica').length },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatalogCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCatalogCategory === cat.id
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCatalogCategory === cat.id ? 'bg-slate-950 text-amber-400' : 'bg-white/10 text-slate-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Grouped Services Tables by Category */}
        <div className="space-y-4 pt-1">
          {['cabelo', 'barba', 'combos', 'quimica', 'estetica']
            .filter(cat => selectedCatalogCategory === 'all' || selectedCatalogCategory === cat)
            .map(categoryKey => {
              const categoryServices = services.filter(s => s.category === categoryKey);
              if (categoryServices.length === 0) return null;

              const categoryLabels = {
                cabelo: { name: 'Cabelo', badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
                barba: { name: 'Barba & Modelagem', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
                combos: { name: 'Combos Econômicos', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
                quimica: { name: 'Química & Tratamentos Especiais', badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
                estetica: { name: 'Estética Facial & Cuidados', badge: 'bg-pink-500/10 text-pink-300 border-pink-500/20' },
              };

              const catInfo = categoryLabels[categoryKey] || { name: categoryKey.toUpperCase(), badge: 'bg-white/10 text-white border-white/10' };

              return (
                <div key={categoryKey} className="rounded-xl border border-white/10 overflow-hidden bg-slate-900/40">
                  <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-white">
                        {catInfo.name}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${catInfo.badge}`}>
                        {categoryServices.length} {categoryServices.length === 1 ? 'serviço' : 'serviços'}
                      </span>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead className="bg-black/20 text-slate-400 uppercase text-[10px] border-b border-white/5">
                      <tr>
                        <th className="py-2 px-3">Serviço</th>
                        <th className="py-2 px-3">Duração</th>
                        <th className="py-2 px-3 text-right">Preço</th>
                        <th className="py-2 px-3 text-center w-24">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {categoryServices.map(s => (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-white block">{s.name}</span>
                            {s.description && (
                              <span className="text-[11px] text-slate-400 block line-clamp-1 mt-0.5">
                                {s.description}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                            {s.duration} min
                          </td>
                          <td className="py-2.5 px-3 text-right font-black font-serif text-amber-400 whitespace-nowrap">
                            {formatCurrency(s.price)}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => setEditingService(s)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-amber-400 mr-1 transition-colors cursor-pointer"
                              title="Editar Serviço Completo"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Excluir serviço "${s.name}"?`)) {
                                  deleteService(s.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
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
              );
            })}
        </div>

        {/* Edit Service Modal */}
        <EditServiceModal
          isOpen={!!editingService}
          onClose={() => setEditingService(null)}
          service={editingService}
        />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2">
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
            <label className="text-slate-300 font-semibold block mb-1">WhatsApp / Telefone</label>
            <input
              type="tel"
              value={shopPhone}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, '');
                if (raw.length <= 11) {
                  setShopPhone(formatPhone(raw));
                } else {
                  setShopPhone(e.target.value);
                }
              }}
              placeholder="(38) 99121-8119"
              className="w-full bg-slate-900 border border-white/15 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
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
            <label className="text-slate-300 font-semibold block mb-1">Instagram Oficial</label>
            <input
              type="text"
              value={shopInstagram}
              onChange={e => setShopInstagram(e.target.value)}
              placeholder="@teu_barber.studio"
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

      {/* Part 3: Firebase Cloud Firestore Database */}
      <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              Banco de Dados em Nuvem (Firebase Firestore)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sincronização em tempo real dos agendamentos, clientes e catálogo entre múltiplos dispositivos via projeto Firebase &quot;TeuBarber&quot;.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              cloudConnected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${cloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {cloudConnected ? 'Conectado à Nuvem' : 'Pendente de Configuração'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onOpenFirebaseModal}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Flame className="w-4 h-4 fill-slate-950" />
            <span>{cloudConnected ? 'Gerenciar Conexão Firebase' : 'Configurar Projeto TeuBarber'}</span>
          </button>
        </div>
      </div>

      {/* Part 4: Data Backup, Import & Factory Reset */}
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

import React, { useState } from 'react';
import { 
  Flame, Check, Copy, ExternalLink, X, RefreshCw, 
  AlertCircle, ShieldCheck, HelpCircle, Code, Settings, Database, Cloud
} from 'lucide-react';
import { 
  getFirebaseConfig, 
  saveFirebaseConfig, 
  isFirebaseConfigured, 
  testFirebaseConnection, 
  saveFirestoreDoc,
  FIRESTORE_RULES_GUIDE 
} from '../../services/firebase';
import { useApp } from '../../context/AppContext';

export default function FirebaseConfigModal({ isOpen, onClose, onSaveSuccess }) {
  const { appointments, barbers, services, clients, financialRecords, shopInfo } = useApp();
  
  const currentConfig = getFirebaseConfig();
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || '');
  const [projectId, setProjectId] = useState(currentConfig.projectId || 'teubarber');
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId || '');
  const [appId, setAppId] = useState(currentConfig.appId || '');

  const [rawConfigInput, setRawConfigInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedRules, setCopiedRules] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'guide' | 'rules' | 'sync'

  if (!isOpen) return null;

  // Analisa bloco de código colado do console Firebase e preenche os campos automaticamente
  const handleParseRawConfig = (text) => {
    setRawConfigInput(text);
    if (!text.trim()) return;

    try {
      const extractField = (fieldName) => {
        const regex = new RegExp(`['"]?${fieldName}['"]?\\s*:\\s*['"]([^'"]+)['"]`, 'i');
        const match = text.match(regex);
        return match ? match[1] : '';
      };

      const extractedApiKey = extractField('apiKey');
      const extractedAuthDomain = extractField('authDomain');
      const extractedProjectId = extractField('projectId');
      const extractedStorageBucket = extractField('storageBucket');
      const extractedMessagingSenderId = extractField('messagingSenderId');
      const extractedAppId = extractField('appId');

      if (extractedApiKey) setApiKey(extractedApiKey);
      if (extractedAuthDomain) setAuthDomain(extractedAuthDomain);
      if (extractedProjectId) setProjectId(extractedProjectId);
      if (extractedStorageBucket) setStorageBucket(extractedStorageBucket);
      if (extractedMessagingSenderId) setMessagingSenderId(extractedMessagingSenderId);
      if (extractedAppId) setAppId(extractedAppId);

      if (extractedApiKey && extractedProjectId) {
        setTestResult({
          success: true,
          message: 'Credenciais identificadas com sucesso a partir do bloco colado! Clique em "Salvar & Conectar".'
        });
      }
    } catch (e) {
      console.warn('Erro ao interpretar bloco do Firebase:', e);
    }
  };

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const config = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    saveFirebaseConfig(config);
    const result = await testFirebaseConnection(config);
    setTesting(false);
    setTestResult(result);

    if (result.success) {
      if (onSaveSuccess) onSaveSuccess();
    }
  };

  const handleClearConfig = () => {
    if (window.confirm('Deseja remover as credenciais salvas do Firebase? O sistema voltará a utilizar o armazenamento local.')) {
      saveFirebaseConfig(null);
      setApiKey('');
      setAuthDomain('');
      setProjectId('');
      setStorageBucket('');
      setMessagingSenderId('');
      setAppId('');
      setRawConfigInput('');
      setTestResult(null);
    }
  };

  const handleCopyRules = () => {
    navigator.clipboard.writeText(FIRESTORE_RULES_GUIDE);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 3000);
  };

  const handleSyncInitialDataToFirebase = async () => {
    setSyncingAll(true);
    setSyncStatus('Iniciando sincronização com Firestore...');

    try {
      // 1. Barbeiros
      setSyncStatus(`Sincronizando ${barbers.length} barbeiros...`);
      for (const b of barbers) {
        await saveFirestoreDoc('barbers', b.id, b);
      }

      // 2. Serviços
      setSyncStatus(`Sincronizando ${services.length} serviços do catálogo...`);
      for (const s of services) {
        await saveFirestoreDoc('services', s.id, s);
      }

      // 3. Agendamentos
      setSyncStatus(`Sincronizando ${appointments.length} agendamentos...`);
      for (const a of appointments) {
        await saveFirestoreDoc('appointments', a.id, a);
      }

      // 4. Clientes
      setSyncStatus(`Sincronizando ${clients.length} cadastros de clientes...`);
      for (const c of clients) {
        await saveFirestoreDoc('clients', c.phone, c);
      }

      // 5. Configurações da Barbearia
      setSyncStatus('Sincronizando dados do estúdio...');
      await saveFirestoreDoc('settings', 'shopInfo', shopInfo);

      setSyncStatus('✓ Todos os dados foram gravados com sucesso no Firebase!');
      setTimeout(() => {
        setSyncingAll(false);
      }, 2500);
    } catch (err) {
      console.error('Erro na sincronização em massa:', err);
      setSyncStatus(`Erro ao sincronizar: ${err.message}`);
      setSyncingAll(false);
    }
  };

  const configured = isFirebaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#111317] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-zinc-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Flame className="w-6 h-6 fill-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Conexão com Firebase Firestore
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  configured 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {configured ? 'Nuvem Conectada' : 'Aguardando Credenciais'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Sincronização em tempo real de agendamentos reais na nuvem
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/40 px-6 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'settings', label: 'Credenciais & Conexão', icon: Settings },
            { id: 'guide', label: 'Como Pegar no Console', icon: HelpCircle },
            { id: 'rules', label: 'Regras de Segurança', icon: ShieldCheck },
            { id: 'sync', label: 'Upload de Dados', icon: Database },
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  active 
                    ? 'border-amber-400 text-amber-400 font-bold' 
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* TAB 1: SETTINGS / CREDENCIAIS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              
              {/* Quick Paste Snippet Area */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Code className="w-4 h-4" />
                  Preenchimento Automático (Cole o bloco do Firebase)
                </span>
                <p className="text-[11px] text-zinc-400">
                  Copie o bloco <code className="text-amber-300">const firebaseConfig = &#123; ... &#125;</code> do Console do Firebase e cole abaixo:
                </p>
                <textarea
                  rows={2}
                  placeholder={`Cole aqui o código do Firebase Console...\nEx: apiKey: "AIza...", projectId: "teubarber..."`}
                  value={rawConfigInput}
                  onChange={e => handleParseRawConfig(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Form with individual fields */}
              <form onSubmit={handleTestAndSave} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">API Key *</label>
                    <input
                      type="text"
                      required
                      placeholder="AIzaSy..."
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Project ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="teubarber ou teubarber-xxx"
                      value={projectId}
                      onChange={e => setProjectId(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Auth Domain</label>
                    <input
                      type="text"
                      placeholder="teubarber.firebaseapp.com"
                      value={authDomain}
                      onChange={e => setAuthDomain(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Storage Bucket</label>
                    <input
                      type="text"
                      placeholder="teubarber.firebasestorage.app"
                      value={storageBucket}
                      onChange={e => setStorageBucket(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Messaging Sender ID</label>
                    <input
                      type="text"
                      placeholder="Ex: 1234567890"
                      value={messagingSenderId}
                      onChange={e => setMessagingSenderId(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">App ID</label>
                    <input
                      type="text"
                      placeholder="1:1234567890:web:abcdef..."
                      value={appId}
                      onChange={e => setAppId(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Test Result Message */}
                {testResult && (
                  <div className={`p-3 rounded-xl border flex items-start gap-2 ${
                    testResult.success 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    {testResult.success ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                    <span>{testResult.message}</span>
                  </div>
                )}

                {/* Buttons */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleClearConfig}
                    className="px-3.5 py-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Remover Conexão
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Fechar
                    </button>

                    <button
                      type="submit"
                      disabled={testing}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4 fill-black" />}
                      <span>{testing ? 'Testando Conexão...' : 'Salvar & Conectar'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: GUIDE / PASSO A PASSO */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="space-y-3 text-zinc-300">
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-white block">Acesse o Console do Firebase</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Abra o site <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline inline-flex items-center gap-1">console.firebase.google.com <ExternalLink className="w-3 h-3" /></a> e selecione o projeto <strong>TeuBarber</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-white block">Cadastre um Aplicativo Web</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Na página inicial do projeto, clique no ícone da Web <strong>&lt;/&gt;</strong> (Adicionar app) ou vá em <strong>Configurações do Projeto (⚙️) &gt; Seus Aplicativos</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-white block">Copie as Credenciais e Cole Aqui</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Copie o bloco de código que contém <code className="text-amber-300">apiKey</code> e <code className="text-amber-300">projectId</code> e cole na caixa da aba "Credenciais & Conexão". O preenchimento é automático!
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <span className="font-bold text-white block">Crie o Banco de Dados Cloud Firestore</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      No menu lateral esquerdo do Firebase, vá em <strong>Build &gt; Firestore Database</strong> e clique em <strong>Criar Banco de Dados</strong>. Escolha a localização mais próxima (ex: <i>southamerica-east1</i>).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RULES / REGRAS DE SEGURANÇA */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm">Regras de Segurança do Cloud Firestore</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  No Console do Firebase, acesse <strong>Firestore Database &gt; Regras (Rules)</strong>, substitua o texto pelo código abaixo e clique em <strong>Publicar</strong>.
                </p>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-zinc-950 border border-white/10 font-mono text-[11px] text-amber-300 overflow-x-auto leading-relaxed">
                  {FIRESTORE_RULES_GUIDE}
                </pre>

                <button
                  type="button"
                  onClick={handleCopyRules}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                >
                  {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copiedRules ? 'Copiado!' : 'Copiar Regras'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SYNC / CARGA DE DADOS */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm">Upload Inicial de Dados para a Nuvem</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Suba todos os dados atuais de agendamentos, barbeiros da equipe, catálogo de serviços e clientes para o banco do Firebase com 1 clique.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-center">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Barbeiros</span>
                  <span className="text-white font-bold text-base">{barbers.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-center">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Serviços</span>
                  <span className="text-white font-bold text-base">{services.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-center">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Agendamentos</span>
                  <span className="text-white font-bold text-base">{appointments.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-center">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Clientes</span>
                  <span className="text-white font-bold text-base">{clients.length}</span>
                </div>
              </div>

              {syncStatus && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                  <Cloud className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{syncStatus}</span>
                </div>
              )}

              <button
                type="button"
                disabled={syncingAll || !configured}
                onClick={handleSyncInitialDataToFirebase}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {syncingAll ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                <span>{syncingAll ? 'Sincronizando com Firestore...' : 'Enviar Dados Atuais para o Firebase'}</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

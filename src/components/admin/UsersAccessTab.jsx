import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KeyRound, UserPlus, Trash2, ShieldCheck, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import {
  subscribeToCollection,
  createAdminUser,
  revokeAdminAccess,
  changeOwnPassword,
  emailToUsername
} from '../../services/firebase';

const MIN_PASSWORD = 8;

const ERRORS = {
  'auth/email-already-in-use': 'Já existe um login com esse usuário.',
  'auth/invalid-email': 'Usuário inválido. Use letras, números, ponto, hífen ou sublinhado.',
  'auth/weak-password': `Senha fraca. Use pelo menos ${MIN_PASSWORD} caracteres.`,
  'auth/operation-not-allowed': 'O provedor E-mail/senha não está ativado no Firebase Authentication.',
  'auth/invalid-credential': 'Senha atual incorreta.',
  'auth/wrong-password': 'Senha atual incorreta.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
  'auth/requires-recent-login': 'Por segurança, saia e entre novamente antes de trocar a senha.',
  'cannot-revoke-self': 'Você não pode remover o seu próprio acesso.',
  'permission-denied': 'Sem permissão. Verifique se as regras do Firestore estão publicadas.'
};

const errorMessage = (err) => {
  const code = err?.code || err?.message;
  return ERRORS[code] || 'Não foi possível concluir a operação.';
};

const inputClass = 'w-full bg-slate-900 border border-white/15 text-slate-100 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-400';
const labelClass = 'text-slate-300 font-semibold block mb-1.5 uppercase tracking-wider text-[11px]';

function Feedback({ result }) {
  if (!result) return null;
  const ok = result.type === 'ok';
  const Icon = ok ? CheckCircle2 : AlertCircle;
  return (
    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${ok ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <span>{result.text}</span>
    </div>
  );
}

export default function UsersAccessTab() {
  const { adminUser } = useApp();
  const [admins, setAdmins] = useState([]);

  // Novo usuário
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState(null);

  // Troca da própria senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [changeResult, setChangeResult] = useState(null);

  useEffect(() => {
    const unsub = subscribeToCollection('admins', (list) => {
      setAdmins((list || []).sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''))));
    });
    return () => unsub();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateResult(null);
    if (newPassword.length < MIN_PASSWORD) {
      setCreateResult({ type: 'error', text: ERRORS['auth/weak-password'] });
      return;
    }
    setCreating(true);
    try {
      await createAdminUser({ username: newUsername, password: newPassword, name: newName });
      setCreateResult({ type: 'ok', text: `Usuário "${newUsername.trim()}" criado com acesso ao painel.` });
      setNewName('');
      setNewUsername('');
      setNewPassword('');
    } catch (err) {
      setCreateResult({ type: 'error', text: errorMessage(err) });
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (admin) => {
    const label = admin.name || emailToUsername(admin.email);
    if (!window.confirm(`Remover o acesso de "${label}" ao painel?`)) return;
    try {
      await revokeAdminAccess(admin.id);
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangeResult(null);
    if (nextPassword.length < MIN_PASSWORD) {
      setChangeResult({ type: 'error', text: ERRORS['auth/weak-password'] });
      return;
    }
    if (nextPassword !== confirmPassword) {
      setChangeResult({ type: 'error', text: 'A confirmação não confere com a nova senha.' });
      return;
    }
    setChanging(true);
    try {
      await changeOwnPassword(currentPassword, nextPassword);
      setChangeResult({ type: 'ok', text: 'Senha alterada com sucesso.' });
      setCurrentPassword('');
      setNextPassword('');
      setConfirmPassword('');
    } catch (err) {
      setChangeResult({ type: 'error', text: errorMessage(err) });
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h2 className="text-xl font-bold font-serif uppercase tracking-wider silver-text-gradient">Usuários & Acesso</h2>
        <p className="text-xs text-slate-400 mt-1">
          Quem pode entrar no painel administrativo. Logado como{' '}
          <strong className="text-amber-400">{emailToUsername(adminUser?.email)}</strong>.
        </p>
      </div>

      {/* Lista de admins */}
      <section className="bg-[#14161b] border border-white/10 rounded-3xl p-5">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-amber-400" /> Usuários com acesso
        </h3>
        {admins.length === 0 ? (
          <p className="text-xs text-slate-500">Carregando...</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {admins.map(admin => {
              const isSelf = admin.id === adminUser?.uid;
              return (
                <li key={admin.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {admin.name || emailToUsername(admin.email) || 'Administrador'}
                      {isSelf && <span className="ml-2 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">você</span>}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Usuário: {admin.username || emailToUsername(admin.email) || admin.id}
                    </p>
                  </div>
                  {!isSelf && (
                    <button
                      onClick={() => handleRevoke(admin)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/10 transition-colors cursor-pointer"
                      title="Remover acesso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Novo usuário */}
        <section className="bg-[#14161b] border border-white/10 rounded-3xl p-5">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-amber-400" /> Novo usuário
          </h3>
          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className={labelClass}>Nome</label>
              <input className={inputClass} value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex.: Gustavo" />
            </div>
            <div>
              <label className={labelClass}>Usuário (login)</label>
              <input className={inputClass} required autoComplete="off" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Ex.: gustavo" />
            </div>
            <div>
              <label className={labelClass}>Senha</label>
              <div className="relative">
                <input
                  className={`${inputClass} pr-10`}
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder={`Mínimo ${MIN_PASSWORD} caracteres`}
                />
                <button type="button" onClick={() => setShowNewPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1">
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Feedback result={createResult} />
            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold uppercase tracking-wider disabled:opacity-60 disabled:cursor-wait cursor-pointer"
            >
              {creating ? 'Criando...' : 'Criar usuário'}
            </button>
          </form>
        </section>

        {/* Trocar a própria senha */}
        <section className="bg-[#14161b] border border-white/10 rounded-3xl p-5">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
            <KeyRound className="w-4 h-4 text-amber-400" /> Trocar minha senha
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className={labelClass}>Senha atual</label>
              <input className={inputClass} type="password" required autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Nova senha</label>
              <input className={inputClass} type="password" required autoComplete="new-password" value={nextPassword} onChange={e => setNextPassword(e.target.value)} placeholder={`Mínimo ${MIN_PASSWORD} caracteres`} />
            </div>
            <div>
              <label className={labelClass}>Confirmar nova senha</label>
              <input className={inputClass} type="password" required autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            <Feedback result={changeResult} />
            <button
              type="submit"
              disabled={changing}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 font-bold uppercase tracking-wider disabled:opacity-60 disabled:cursor-wait cursor-pointer"
            >
              {changing ? 'Salvando...' : 'Alterar senha'}
            </button>
          </form>
          <p className="text-[11px] text-slate-500 mt-3">
            Esqueceu a senha de alguém? Remova o acesso e crie o usuário de novo com outro login.
          </p>
        </section>
      </div>
    </div>
  );
}

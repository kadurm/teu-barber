import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, KeyRound, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { adminSignIn, isFirebaseConfigured } from '../../services/firebase';

const ERROR_MESSAGES = {
  'not-admin': 'Este usuário não tem permissão de administrador.',
  'firebase-not-configured': 'Firebase não configurado. Configure a conexão antes de entrar.',
  'auth/invalid-credential': 'Usuário ou senha incorretos.',
  'auth/wrong-password': 'Usuário ou senha incorretos.',
  'auth/user-not-found': 'Usuário ou senha incorretos.',
  'auth/missing-password': 'Digite a senha.',
  'auth/invalid-email': 'Usuário inválido.',
  'auth/user-disabled': 'Usuário desativado.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Sem conexão com a internet.'
};

export default function AdminLogin({ onBackToSite }) {
  const { shopInfo } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const configured = isFirebaseConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Sucesso: o AppContext detecta a sessão (onAuthStateChanged) e abre o painel
      await adminSignIn(username, password);
    } catch (err) {
      const code = err?.code || err?.message;
      setError(ERROR_MESSAGES[code] || 'Não foi possível entrar. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#14161b] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100">

        {/* Top Logo & Icon */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto rounded-full p-1 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-700 shadow-xl mb-3">
            <img
              src={shopInfo.logoUrl}
              alt="Logo Teu Barber"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h2 className="text-2xl font-bold font-serif silver-text-gradient uppercase tracking-wider">
            Painel Administrativo
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {shopInfo.name} • Acesso restrito aos barbeiros
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!configured ? (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            Painel temporariamente indisponível. Tente novamente em instantes.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5 uppercase tracking-wider text-[11px]">
                Usuário
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="username"
                  placeholder="Seu usuário"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); if (error) setError(''); }}
                  className="w-full bg-slate-900 border border-white/15 text-slate-100 text-sm pl-10 pr-3 py-3 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5 uppercase tracking-wider text-[11px]">
                Senha
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                  className="w-full bg-slate-900 border border-white/15 text-slate-100 text-sm pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-wait"
            >
              {loading ? 'Entrando...' : 'Acessar Painel'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <button
            onClick={onBackToSite}
            className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para o Site de Agendamentos</span>
          </button>
        </div>

      </div>
    </div>
  );
}

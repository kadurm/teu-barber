import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, ArrowLeft, ShieldCheck, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess, onBackToSite }) {
  const { shopInfo } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'TeuBarberAdmin') {
      sessionStorage.setItem('teu_barber_admin_auth', 'true');
      setError('');
      onLoginSuccess();
    } else {
      setError('Senha incorreta. Acesso restrito aos administradores do Teu Barber.');
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1.5 uppercase tracking-wider text-[11px]">
              Senha de Acesso
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="Digite a senha administrativa..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
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
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer mt-2"
          >
            Acessar Painel
          </button>
        </form>

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

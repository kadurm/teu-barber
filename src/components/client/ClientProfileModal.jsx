import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Phone,
  Calendar,
  Clock,
  Scissors,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Edit2,
  Save,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Award,
  Trash2
} from 'lucide-react';
import {
  formatCurrency,
  formatDateBR,
  formatPhone,
  generateWhatsAppLink
} from '../../utils/formatters';

export default function ClientProfileModal({ isOpen, onClose, onNewBookingClick }) {
  const {
    shopInfo,
    clients,
    currentClientPhone,
    setCurrentClientPhone,
    saveClientProfile,
    getClientByPhone,
    logoutClient,
    appointments,
    updateAppointmentStatus
  } = useApp();

  const [inputPhone, setInputPhone] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'history'
  const [searchError, setSearchError] = useState('');

  // Active client object
  const currentClient = useMemo(() => {
    if (!currentClientPhone) return null;
    return getClientByPhone(currentClientPhone);
  }, [currentClientPhone, clients, getClientByPhone]);

  // Appointments for this client (matched by clean phone)
  const clientAppointments = useMemo(() => {
    if (!currentClientPhone) return [];
    const cleanCurrent = currentClientPhone.replace(/\D/g, '');
    return appointments.filter(apt => {
      const aptPhone = (apt.clientPhone || '').replace(/\D/g, '');
      return aptPhone === cleanCurrent;
    }).sort((a, b) => {
      const dtA = `${a.date}T${a.time}`;
      const dtB = `${b.date}T${b.time}`;
      return dtB.localeCompare(dtA);
    });
  }, [appointments, currentClientPhone]);

  const upcomingAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return clientAppointments.filter(apt => {
      if (apt.status === 'cancelado' || apt.status === 'concluido') return false;
      return apt.date >= todayStr;
    });
  }, [clientAppointments]);

  const pastAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return clientAppointments.filter(apt => {
      return apt.status === 'cancelado' || apt.status === 'concluido' || apt.date < todayStr;
    });
  }, [clientAppointments]);

  if (!isOpen) return null;

  const handlePhoneLookup = (e) => {
    e.preventDefault();
    const clean = inputPhone.replace(/\D/g, '');
    if (clean.length < 10) {
      setSearchError('Por favor, informe seu WhatsApp completo com DDD (ex: 38 99121-8119).');
      return;
    }

    const found = getClientByPhone(clean);
    if (found) {
      setCurrentClientPhone(clean);
      setSearchError('');
    } else {
      // Check if there are appointments with this phone even if client record wasn't indexed
      const hasApt = appointments.find(a => (a.clientPhone || '').replace(/\D/g, '') === clean);
      if (hasApt) {
        saveClientProfile(clean, hasApt.clientName, hasApt.notes || '');
        setCurrentClientPhone(clean);
        setSearchError('');
      } else {
        setSearchError('Nenhum cadastro encontrado com este número. Faça seu primeiro agendamento para se cadastrar automaticamente!');
      }
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editedName.trim()) return;
    saveClientProfile(currentClientPhone, editedName.trim(), editedNotes);
    setIsEditingName(false);
  };

  const startEditProfile = () => {
    setEditedName(currentClient?.name || '');
    setEditedNotes(currentClient?.notes || '');
    setIsEditingName(true);
  };

  const handleCancelAppointment = (aptId) => {
    if (window.confirm('Tem certeza de que deseja cancelar este agendamento?')) {
      updateAppointmentStatus(aptId, 'cancelado');
    }
  };

  // Check if an appointment is in <= 2 hours
  const isWithin2Hours = (apt) => {
    if (apt.status !== 'confirmado' && apt.status !== 'pendente') return false;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (apt.date !== todayStr) return false;

    const [h, m] = (apt.time || '').split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return false;

    const aptDateTime = new Date();
    aptDateTime.setHours(h, m, 0, 0);

    const diffMinutes = Math.floor((aptDateTime.getTime() - now.getTime()) / (1000 * 60));
    return diffMinutes > 0 && diffMinutes <= 120;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#111317] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-zinc-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Área do Cliente & Acompanhamento
              </h3>
              <p className="text-xs text-zinc-400">
                Seus dados cadastrados, histórico e agendamentos pelo WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* IF NOT LOGGED IN / NO CLIENT FOUND */}
          {!currentClient ? (
            <div className="space-y-6 py-4 max-w-md mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                <Phone className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">Consultar Meu Cadastro</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Digite seu WhatsApp para acompanhar seus agendamentos e dados cadastrados.
                </p>
              </div>

              <form onSubmit={handlePhoneLookup} className="space-y-3 text-left">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Seu Número de WhatsApp (com DDD)
                  </label>
                  <input
                    type="tel"
                    required
                    value={inputPhone}
                    onChange={e => setInputPhone(e.target.value)}
                    placeholder="(38) 99999-9999"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                {searchError && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{searchError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Acessar Meu Cadastro
                </button>
              </form>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 text-xs text-zinc-400 text-left">
                <span className="font-bold text-white block mb-1">💡 Como funciona:</span>
                O cadastro no Teu Barber Studio é 100% automático. Assim que você conclui um agendamento pela primeira vez, seu número de WhatsApp vira sua chave exclusiva!
              </div>
            </div>
          ) : (
            /* IF LOGGED IN / CLIENT PROFILE VIEW */
            <div className="space-y-6">
              
              {/* Profile Card */}
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 relative overflow-hidden backdrop-blur-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif text-2xl font-black shrink-0">
                      {currentClient.name ? currentClient.name.charAt(0).toUpperCase() : 'C'}
                    </div>

                    <div>
                      {!isEditingName ? (
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-white">{currentClient.name}</h4>
                          <button
                            onClick={startEditProfile}
                            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors"
                            title="Editar Nome"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleSaveProfile} className="flex items-center gap-2">
                          <input
                            type="text"
                            required
                            value={editedName}
                            onChange={e => setEditedName(e.target.value)}
                            className="bg-zinc-950 border border-amber-500/50 rounded-lg px-2.5 py-1 text-sm text-white focus:outline-none"
                            placeholder="Seu nome"
                          />
                          <button
                            type="submit"
                            className="px-2.5 py-1 bg-amber-500 text-black text-xs font-bold rounded-lg hover:bg-amber-400 flex items-center gap-1 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Salvar
                          </button>
                        </form>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-zinc-400">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Phone className="w-3.5 h-3.5" />
                          {formatPhone(currentClient.phone)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-zinc-300 border border-white/5">
                          Chave do Cadastro
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={logoutClient}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Sair ou trocar de número"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Trocar WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Profile Stats / Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Atendimentos</span>
                    <span className="text-white font-bold text-sm">
                      {clientAppointments.length} agendamento(s)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Status do Perfil</span>
                    <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Ativo no Sistema
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Lembretes WhatsApp</span>
                    <span className="text-amber-400 font-bold text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      2h antes ativado
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs: Próximos vs Histórico */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('upcoming')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'upcoming'
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                          : 'text-zinc-400 hover:text-white bg-white/5'
                      }`}
                    >
                      Próximos Agendamentos ({upcomingAppointments.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'history'
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                          : 'text-zinc-400 hover:text-white bg-white/5'
                      }`}
                    >
                      Histórico Passado ({pastAppointments.length})
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      if (onNewBookingClick) onNewBookingClick();
                    }}
                    className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Novo Agendamento</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tab Content */}
                <div className="mt-4 space-y-3">
                  {activeTab === 'upcoming' && (
                    upcomingAppointments.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-white/5 text-xs text-zinc-500 space-y-3">
                        <Calendar className="w-8 h-8 mx-auto text-zinc-600" />
                        <p>Você não possui nenhum agendamento futuro marcado.</p>
                        <button
                          onClick={() => {
                            onClose();
                            if (onNewBookingClick) onNewBookingClick();
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors cursor-pointer inline-flex items-center gap-2"
                        >
                          <Scissors className="w-4 h-4" />
                          Agendar Horário Agora
                        </button>
                      </div>
                    ) : (
                      upcomingAppointments.map(apt => {
                        const in2h = isWithin2Hours(apt);
                        return (
                          <div 
                            key={apt.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              in2h 
                                ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10' 
                                : 'bg-zinc-900/60 border-white/10'
                            }`}
                          >
                            {in2h && (
                              <div className="mb-2.5 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Lembrete: Seu horário é daqui a menos de 2 horas! Lembrete do WhatsApp ativo.</span>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-white text-sm">{apt.serviceName}</h5>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                    Confirmado
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-400 mt-0.5">
                                  Profissional: <strong className="text-zinc-200">{apt.barberName}</strong> • {formatCurrency(apt.price)}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-zinc-300 mt-2 font-medium">
                                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDateBR(apt.date)}
                                  </span>
                                  <span className="flex items-center gap-1 text-white font-bold bg-white/5 px-2 py-0.5 rounded-md">
                                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    {apt.time}
                                  </span>
                                  <span className="text-zinc-500 text-[10px]">
                                    #{apt.id}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                                <a
                                  href={generateWhatsAppLink(
                                    shopInfo.phone,
                                    `Olá, Teu Barber! Tenho agendamento marcado (#${apt.id}) para ${formatDateBR(apt.date)} às ${apt.time} (${apt.serviceName}) e gostaria de tirar uma dúvida.`
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title="Falar no WhatsApp da Barbearia"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">WhatsApp</span>
                                </a>

                                <button
                                  onClick={() => handleCancelAppointment(apt.id)}
                                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-zinc-400 hover:text-red-400 text-xs font-medium transition-colors cursor-pointer"
                                  title="Cancelar este horário"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Desmarcar</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )
                  )}

                  {activeTab === 'history' && (
                    pastAppointments.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-white/5 text-xs text-zinc-500">
                        Nenhum atendimento anterior registrado neste WhatsApp.
                      </div>
                    ) : (
                      pastAppointments.map(apt => (
                        <div key={apt.id} className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-zinc-200 block">{apt.serviceName}</span>
                            <span className="text-[11px] text-zinc-500">
                              {formatDateBR(apt.date)} às {apt.time} • com {apt.barberName}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold block ${
                              apt.status === 'concluido'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : apt.status === 'cancelado'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {apt.status === 'concluido' ? 'Realizado' : apt.status === 'cancelado' ? 'Cancelado' : apt.status}
                            </span>
                            <span className="text-xs font-serif font-bold text-zinc-300 mt-0.5 block">
                              {formatCurrency(apt.price)}
                            </span>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDateBR,
  formatDateLongBR,
  formatPhone,
  generateWhatsAppLink,
  createBookingWhatsAppMessage,
  generateTimeSlots
} from '../../utils/formatters';
import {
  Scissors,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Star,
  MapPin,
  Check,
  ChevronRight,
  AlertCircle,
  CreditCard,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import MercadoPagoCheckout from './MercadoPagoCheckout';

export default function ClientBooking() {
  const { shopInfo, barbers, services, addAppointment, isSlotAvailable, updateAppointmentStatus } = useApp();

  // Current wizard step: 1: Barber, 2: Service, 3: DateTime, 4: Client Info, 5: Confirmation
  const [step, setStep] = useState(1);

  // Booking selections
  const [selectedBarberId, setSelectedBarberId] = useState('user1'); // Default to Teu
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mercadopago'); // 'mercadopago' or 'local'
  const [showMercadoPagoModal, setShowMercadoPagoModal] = useState(false);

  // Service category filter
  const [selectedCategory, setSelectedCategory] = useState('todos');

  // Confirmed booking state
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Selected Barber object
  const selectedBarber = useMemo(() => {
    return barbers.find(b => b.id === selectedBarberId) || barbers[0];
  }, [barbers, selectedBarberId]);

  // Selected Service object
  const selectedService = useMemo(() => {
    return services.find(s => s.id === selectedServiceId);
  }, [services, selectedServiceId]);

  // Filtered services
  const filteredServices = useMemo(() => {
    if (selectedCategory === 'todos') return services;
    return services.filter(s => s.category === selectedCategory);
  }, [services, selectedCategory]);

  // Next 7 days for quick selection
  const upcomingDays = useMemo(() => {
    const days = [];
    const base = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const dayNum = d.getDate();
      const monthShort = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      days.push({ iso, weekday, dayNum, monthShort, isToday: i === 0 });
    }
    return days;
  }, []);

  // Time slots generated for selected date and barber
  const timeSlots = useMemo(() => {
    const allSlots = generateTimeSlots(
      shopInfo.openTime,
      shopInfo.closeTime,
      shopInfo.slotDurationMinutes,
      shopInfo.lunchStart,
      shopInfo.lunchEnd
    );

    return allSlots.map(time => {
      const available = isSlotAvailable(selectedDate, time, selectedBarberId);
      return {
        time,
        available
      };
    });
  }, [shopInfo, selectedDate, selectedBarberId, isSlotAvailable]);

  // Phone input mask handler
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    setClientPhone(value);
  };

  // Submit appointment
  const handleConfirmBooking = (e) => {
    e.preventDefault();

    if (!clientName.trim()) {
      alert("Por favor, digite seu nome completo.");
      return;
    }
    if (clientPhone.length < 10) {
      alert("Por favor, digite um telefone/WhatsApp válido com DDD (ex: 38 99121-8119).");
      return;
    }

    const bookingPayload = {
      clientName: clientName.trim(),
      clientPhone,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      price: selectedService.price,
      duration: selectedService.duration,
      date: selectedDate,
      time: selectedTime,
      notes: notes.trim(),
      paymentMethod
    };

    const savedBooking = addAppointment(bookingPayload);
    setConfirmedBooking(savedBooking);

    if (paymentMethod === 'mercadopago') {
      setShowMercadoPagoModal(true);
    } else {
      setStep(5);
    }
  };

  // Reset booking form
  const handleNewBooking = () => {
    setSelectedServiceId('');
    setSelectedTime('');
    setClientName('');
    setClientPhone('');
    setNotes('');
    setConfirmedBooking(null);
    setShowMercadoPagoModal(false);
    setStep(1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      
      {/* Hero Banner with Emblem and Tagline */}
      <div className="text-center mb-8 sm:mb-12 relative">
        <div className="inline-block relative mb-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full p-1 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-700 shadow-2xl shadow-black">
            <img 
              src={shopInfo.logoUrl} 
              alt="Logo Teu Barber" 
              className="w-full h-full object-cover rounded-full" 
            />
          </div>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-black uppercase tracking-wider silver-text-gradient mb-2">
          Teu Barber Studio
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
          Agende seu horário de forma rápida e prática.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Rua dos Mangabeiras, Sagrada Família</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Seg a Sex: 09:00 às 20:00 • Sáb: 09:00 às 18:00</span>
          </span>
        </div>
      </div>

      {/* Progress Steps Indicator (Only when not in confirmation screen) */}
      {step < 5 && (
        <div className="mb-8">
          <div className="flex items-center justify-between relative max-w-xl mx-auto px-2">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
            
            {[
              { num: 1, label: 'Barbeiro' },
              { num: 2, label: 'Serviço' },
              { num: 3, label: 'Data & Hora' },
              { num: 4, label: 'Seus Dados' },
            ].map(s => {
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <button
                    onClick={() => {
                      if (isDone) setStep(s.num);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isActive 
                        ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20 shadow-lg shadow-amber-500/20 font-black' 
                        : isDone 
                        ? 'bg-emerald-500 text-white cursor-pointer hover:scale-105' 
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : s.num}
                  </button>
                  <span className={`text-[11px] mt-1.5 font-medium hidden sm:block ${
                    isActive ? 'text-amber-400 font-bold' : isDone ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= STEP 1: CHOOSE PROFESSIONAL ================= */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold font-serif silver-text-gradient">
              1. Escolha o Profissional
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Selecione com quem você prefere realizar seu atendimento
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
            {barbers.map(barber => {
              const isSelected = selectedBarberId === barber.id;
              return (
                <div
                  key={barber.id}
                  onClick={() => setSelectedBarberId(barber.id)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all border metallic-card metallic-card-hover ${
                    isSelected
                      ? 'border-amber-400/80 ring-2 ring-amber-400/30 bg-gradient-to-b from-slate-900 to-[#1b1e26]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={barber.avatar}
                        alt={barber.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-600 shadow-md"
                      />
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 p-1 rounded-full shadow-lg">
                          <Check className="w-3.5 h-3.5 font-bold" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                          {barber.name}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {barber.role}
                      </p>

                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {barber.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Disponível para agendamento
                    </span>
                    <span className={`font-semibold flex items-center gap-1 ${
                      isSelected ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {isSelected ? 'Selecionado' : 'Clique para escolher'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-wider"
            >
              <span>Avançar para Serviços</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: CHOOSE SERVICE ================= */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif silver-text-gradient">
                2. Selecione o Serviço
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Profissional selecionado: <strong className="text-amber-400">{selectedBarber.name}</strong>
              </p>
            </div>

            <button
              onClick={() => setStep(1)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 self-start sm:self-auto py-1 px-2 rounded-lg bg-white/5 border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Trocar Barbeiro
            </button>
          </div>

          {/* Categories Tab Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'cabelo', label: 'Cabelo' },
              { id: 'barba', label: 'Barba' },
              { id: 'combos', label: 'Combos' },
              { id: 'quimica', label: 'Química & Cores' },
              { id: 'estetica', label: 'Estética' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredServices.map(service => {
              const isSelected = selectedServiceId === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border metallic-card metallic-card-hover flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/30 bg-gradient-to-b from-slate-900 to-[#1b1e26]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base">
                            {service.name}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-amber-400 block font-serif">
                          {formatCurrency(service.price)}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {service.duration} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      {service.category.toUpperCase()}
                    </span>
                    <span className={`font-semibold text-xs flex items-center gap-1 ${
                      isSelected ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {isSelected ? '✓ Selecionado' : 'Selecionar'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            <button
              disabled={!selectedServiceId}
              onClick={() => setStep(3)}
              className={`px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all ${
                selectedServiceId
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-[1.02] cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <span>Continuar para Horários</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: CHOOSE DATE & TIME ================= */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif silver-text-gradient">
                3. Escolha a Data e o Horário
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {selectedService?.name} • com {selectedBarber.name} ({selectedService?.duration} min)
              </p>
            </div>
            <div className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-xl font-semibold self-start sm:self-auto">
              Total: {formatCurrency(selectedService?.price)}
            </div>
          </div>

          {/* Quick Date Pills (Next 7 Days) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Próximos Dias Disponíveis
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {upcomingDays.map(day => {
                const isSelected = selectedDate === day.iso;
                return (
                  <button
                    key={day.iso}
                    onClick={() => {
                      setSelectedDate(day.iso);
                      setSelectedTime(''); // Reset time selection on date change
                    }}
                    className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center transition-all border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20 scale-[1.02]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-wider">
                      {day.isToday ? 'Hoje' : day.weekday}
                    </span>
                    <span className="text-lg font-black my-0.5">
                      {day.dayNum}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {day.monthShort}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker Alternative */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs text-slate-400">Ou escolha outra data:</span>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime('');
              }}
              className="bg-slate-900 border border-white/15 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Time Slots Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Horários Livres para {formatDateBR(selectedDate)}:
              </label>
              <span className="text-[11px] text-slate-400">
                Intervalo: {shopInfo.slotDurationMinutes} minutos
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
              {timeSlots.map(slot => {
                const isSelected = selectedTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-0.5 ${
                      !slot.available
                        ? 'bg-slate-900/40 text-slate-600 border-white/5 cursor-not-allowed opacity-40 line-through'
                        : isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/20 scale-[1.03]'
                        : 'bg-white/5 border-white/10 hover:border-amber-400/50 hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    <span>{slot.time}</span>
                    <span className="text-[9px] font-normal opacity-75">
                      {slot.available ? 'Livre' : 'Ocupado'}
                    </span>
                  </button>
                );
              })}
            </div>

            {timeSlots.filter(t => t.available).length === 0 && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Nenhum horário livre nesta data para este barbeiro. Por favor selecione outro dia.
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            <button
              disabled={!selectedTime}
              onClick={() => setStep(4)}
              className={`px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all ${
                selectedTime
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-[1.02] cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <span>Confirmar Horário</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: CLIENT INFO ================= */}
      {step === 4 && (
        <form onSubmit={handleConfirmBooking} className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif silver-text-gradient">
              4. Seus Dados de Contato
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Preencha para receber a confirmação e lembrete do horário
            </p>
          </div>

          {/* Booking Summary Mini Card */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={selectedBarber.avatar}
                alt={selectedBarber.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-600"
              />
              <div>
                <h4 className="text-sm font-bold text-white">
                  {selectedService?.name}
                </h4>
                <p className="text-xs text-slate-400">
                  Com <strong>{selectedBarber.name}</strong> • {formatDateBR(selectedDate)} às <strong>{selectedTime}</strong>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Valor a pagar:</span>
              <span className="text-lg font-black text-amber-400 font-serif">
                {formatCurrency(selectedService?.price)}
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Seu Nome Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/15 text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Seu Celular / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="(38) 99999-9999"
                  value={formatPhone(clientPhone)}
                  onChange={handlePhoneChange}
                  className="w-full bg-slate-900 border border-white/15 text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Enviaremos a confirmação e lembrete direto no seu WhatsApp.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Forma de Pagamento
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mercado Pago Online */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mercadopago')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    paymentMethod === 'mercadopago'
                      ? 'bg-sky-950/40 border-sky-400 ring-2 ring-sky-400/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#009ee3] flex items-center justify-center shrink-0 shadow-md">
                    <span className="font-black text-white text-sm">mp</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Pagar Agora Online</span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-400 border border-sky-500/30 px-1.5 py-0.2 rounded font-semibold">
                        Mercado Pago
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pix Instantâneo (QR Code) ou Cartão de Crédito
                    </p>
                  </div>
                </button>

                {/* Local Payment */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('local')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    paymentMethod === 'local'
                      ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-white text-xs block">Pagar no Atendimento</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pix, Dinheiro ou Cartão direto na barbearia
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Observações ou Preferências (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Cabelo curto nas laterais, acabamento na navalha, disfarçado..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 text-slate-100 text-xs p-3 rounded-xl focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalizar Agendamento</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= STEP 5: CONFIRMATION SUCCESS ================= */}
      {step === 5 && confirmedBooking && (
        <div className="space-y-6 animate-fadeIn max-w-xl mx-auto">
          
          {/* Success Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#131d18] to-[#0c0d0f] text-center shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-xs uppercase tracking-widest font-black text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Agendamento Confirmado!
            </span>

            <h2 className="text-2xl sm:text-3xl font-black font-serif text-white mt-3 mb-1">
              Horário Marcado com Sucesso
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Obrigado, <strong className="text-white">{confirmedBooking.clientName}</strong>! Seu horário já está reservado no sistema do Teu Barber Studio.
            </p>

            {/* Receipt Summary Card */}
            <div className="my-6 p-4 rounded-2xl bg-black/40 border border-white/10 text-left space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs text-slate-400">Código da Reserva</span>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                  #{confirmedBooking.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Serviço:</span>
                  <span className="text-white font-semibold">{confirmedBooking.serviceName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Profissional:</span>
                  <span className="text-white font-semibold">{confirmedBooking.barberName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Data:</span>
                  <span className="text-white font-semibold">{formatDateBR(confirmedBooking.date)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Horário:</span>
                  <span className="text-white font-semibold text-amber-400">{confirmedBooking.time}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Valor Total:</span>
                <span className="text-lg font-black text-emerald-400 font-serif">
                  {formatCurrency(confirmedBooking.price)}
                </span>
              </div>
            </div>

            {/* WhatsApp Direct Action Button */}
            <div className="space-y-3">
              <a
                href={generateWhatsAppLink(
                  shopInfo.phone,
                  createBookingWhatsAppMessage(confirmedBooking, shopInfo)
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquare className="w-5 h-5 fill-slate-950" />
                <span>Enviar Confirmação pelo WhatsApp</span>
              </a>

              <p className="text-[11px] text-slate-400">
                Clique no botão acima para abrir a conversa no WhatsApp do Teu Barber com o comprovante pronto.
              </p>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleNewBooking}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all"
            >
              Fazer Outro Agendamento
            </button>
          </div>
        </div>
      )}

      {/* Mercado Pago Checkout Modal */}
      {showMercadoPagoModal && confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <MercadoPagoCheckout
            booking={confirmedBooking}
            shopInfo={shopInfo}
            onPaymentConfirmed={(method) => {
              updateAppointmentStatus(confirmedBooking.id, 'confirmado', method);
              setShowMercadoPagoModal(false);
              setStep(5);
            }}
            onCancel={() => {
              setShowMercadoPagoModal(false);
              setStep(5);
            }}
          />
        </div>
      )}

    </div>
  );
}

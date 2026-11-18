import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Clock, User, Phone, DollarSign, MessageSquare } from 'lucide-react';
import { generateWhatsAppLink, createClientConfirmationWhatsAppMessage } from '../../utils/formatters';
import { toLocalISODate } from '../../utils/formatters';

export default function NewAppointmentModal({ isOpen, onClose }) {
  const { barbers, services, shopInfo, addAppointment, isSlotAvailable } = useApp();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [barberId, setBarberId] = useState(barbers[0]?.id || 'user1');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [date, setDate] = useState(toLocalISODate(new Date()));
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  if (!isOpen) return null;

  // Limpa o formulário ao fechar (antes reabria com os dados do último cliente)
  const handleClose = () => {
    setClientName('');
    setClientPhone('');
    setNotes('');
    setTime('10:00');
    setDate(toLocalISODate(new Date()));
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert("Informe o nome do cliente.");
      return;
    }

    // Profissional/serviço podem ter mudado depois que o formulário abriu (dados da nuvem)
    const selectedBarber = barbers.find(b => b.id === barberId) || barbers[0];
    const selectedService = services.find(s => s.id === serviceId) || services[0];
    if (!selectedBarber || !selectedService || !date || !time) {
      alert("Preencha profissional, serviço, data e horário.");
      return;
    }

    // Avisa antes de marcar por cima de outro cliente, bloqueio, almoço ou fora do expediente
    if (!isSlotAvailable(date, time, selectedBarber.id, selectedService.duration)
      && !window.confirm(`O horário ${time} com ${selectedBarber.name} está ocupado, bloqueado ou fora do expediente. Marcar mesmo assim?`)) {
      return;
    }

    const newApt = addAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.replace(/\D/g, ''),
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      price: selectedService.price,
      duration: selectedService.duration,
      date,
      time,
      notes: notes.trim(),
      paymentMethod,
      status: 'confirmado'
    });

    if (sendWhatsApp && clientPhone.replace(/\D/g, '').length >= 10) {
      const url = generateWhatsAppLink(
        clientPhone,
        createClientConfirmationWhatsAppMessage(newApt, shopInfo)
      );
      try {
        window.open(url, '_blank');
      } catch (err) {
        console.error('Popup WhatsApp', err);
      }
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#14161b] border border-white/10 rounded-3xl p-6 shadow-2xl relative text-slate-100">
        
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold font-serif silver-text-gradient">
              Novo Agendamento Manual
            </h3>
            <p className="text-xs text-slate-400">
              Registrar cliente presencial ou recebido por telefone
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Nome do Cliente *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="Ex: Carlos Oliveira"
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">WhatsApp / Telefone</label>
              <input
                type="tel"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                placeholder="(38) 99999-9999"
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Barbeiro</label>
              <select
                value={barberId}
                onChange={e => setBarberId(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                {barbers.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Serviço</label>
              <select
                value={serviceId}
                onChange={e => setServiceId(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} - R$ {s.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Horário</label>
              <input
                type="time"
                required
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="text-slate-300 font-semibold block mb-1">Pagamento</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="pix">Pix</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Observações</label>
            <input
              type="text"
              placeholder="Ex: Primeira vez no estúdio..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Enviar confirmação no WhatsApp */}
          <div className="flex items-center gap-2 pt-1 pb-1">
            <input
              type="checkbox"
              id="sendWhatsAppConfirm"
              checked={sendWhatsApp}
              onChange={e => setSendWhatsApp(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-white/20 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="sendWhatsAppConfirm" className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer select-none">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gerar e abrir mensagem de confirmação no WhatsApp do cliente</span>
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20"
            >
              Salvar Agendamento
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

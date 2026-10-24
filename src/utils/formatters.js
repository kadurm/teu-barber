export function formatCurrency(value) {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDateBR(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export function formatDateLongBR(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString + 'T12:00:00');
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatPhone(phone) {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return phone;
}

export function cleanPhone(phone) {
  return phone ? phone.replace(/\D/g, '') : '';
}

export function generateWhatsAppLink(phone, message) {
  let clean = cleanPhone(phone);
  if (!clean.startsWith('55') && clean.length >= 10) {
    clean = '55' + clean;
  }
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function createBookingWhatsAppMessage(booking, shopInfo) {
  const address = shopInfo?.address || 'Rua dos Mangabeiras, Sagrada Família, Montes Claros - MG';
  return `💈 *NOVO AGENDAMENTO - ${shopInfo?.name?.toUpperCase() || 'TEU BARBER STUDIO'}* 💈\n\n` +
    `Olá! Realizei um agendamento pelo site e gostaria de confirmar:\n\n` +
    `👤 *Cliente:* ${booking.clientName}\n` +
    `📱 *WhatsApp:* ${formatPhone(booking.clientPhone)}\n` +
    `✂️ *Serviço:* ${booking.serviceName} (${formatCurrency(booking.price)})\n` +
    `🧔 *Profissional:* ${booking.barberName}\n` +
    `📅 *Data:* ${formatDateBR(booking.date)} (${formatDateLongBR(booking.date)})\n` +
    `⏰ *Horário:* ${booking.time}\n` +
    `🔖 *Código da Reserva:* #${booking.id}\n` +
    (booking.notes ? `📝 *Observação:* ${booking.notes}\n` : '') +
    `📍 *Local:* ${address}\n\n` +
    `_Aguardando confirmação! Teu Barber Studio._`;
}

export function createClientConfirmationWhatsAppMessage(booking, shopInfo) {
  const address = shopInfo?.address || 'Rua dos Mangabeiras, Sagrada Família, Montes Claros - MG';
  return `💈 *CONFIRMAÇÃO DE AGENDAMENTO - ${shopInfo?.name?.toUpperCase() || 'TEU BARBER STUDIO'}* 💈\n\n` +
    `Olá, *${booking.clientName}*! Seu horário foi agendado com sucesso:\n\n` +
    `✂️ *Serviço:* ${booking.serviceName} (${formatCurrency(booking.price)})\n` +
    `🧔 *Profissional:* ${booking.barberName}\n` +
    `📅 *Data:* ${formatDateBR(booking.date)} (${formatDateLongBR(booking.date)})\n` +
    `⏰ *Horário:* ${booking.time}\n` +
    `🔖 *Código do Agendamento:* #${booking.id}\n` +
    (booking.notes ? `📝 *Observação:* ${booking.notes}\n` : '') +
    `📍 *Local:* ${address}\n\n` +
    `Qualquer dúvida ou caso precise reagendar, avise por aqui. Te esperamos! 💈✂️`;
}

export function createReminderWhatsAppMessage(booking, shopInfo) {
  return `Olá, ${booking.clientName}! Passando para lembrar do seu agendamento no *${shopInfo.name}*:\n\n` +
    `✂️ *Serviço:* ${booking.serviceName}\n` +
    `🧔 *Profissional:* ${booking.barberName}\n` +
    `📅 *Data:* ${formatDateBR(booking.date)}\n` +
    `⏰ *Horário:* ${booking.time}\n\n` +
    `Te esperamos lá! Caso precise remarcar, nos avise com antecedência. 💈`;
}

export function create2HourReminderWhatsAppMessage(booking, shopInfo) {
  const address = shopInfo?.address || 'Rua dos Mangabeiras, Sagrada Família, Montes Claros - MG';
  return `💈 *LEMBRETE DE AGENDAMENTO (DAQUI A 2 HORAS) - ${shopInfo?.name?.toUpperCase() || 'TEU BARBER STUDIO'}* 💈\n\n` +
    `Olá, *${booking.clientName}*! Seu horário está se aproximando:\n\n` +
    `⏰ *Horário Marcado:* ${booking.time} (daqui a menos de 2 horas!)\n` +
    `📅 *Data:* ${formatDateBR(booking.date)} (${formatDateLongBR(booking.date)})\n` +
    `✂️ *Serviço:* ${booking.serviceName} (${formatCurrency(booking.price)})\n` +
    `🧔 *Profissional:* ${booking.barberName}\n` +
    `🔖 *Código:* #${booking.id}\n` +
    `📍 *Local:* ${address}\n\n` +
    `Já estamos nos organizando para te receber com a melhor experiência! Se tiver algum imprevisto, avise por aqui. Até breve! 💈✂️`;
}

// Generates time slots based on start/end, lunch break, and step
export function generateTimeSlots(start = "08:30", end = "19:30", stepMinutes = 30, lunchStart = "12:00", lunchEnd = "13:30") {
  const slots = [];
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const [lunchStartH, lunchStartM] = lunchStart.split(':').map(Number);
  const [lunchEndH, lunchEndM] = lunchEnd.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const lStartMinutes = lunchStartH * 60 + lunchStartM;
  const lEndMinutes = lunchEndH * 60 + lunchEndM;

  for (let mins = startMinutes; mins < endMinutes; mins += stepMinutes) {
    // Skip lunch break
    if (mins >= lStartMinutes && mins < lEndMinutes) {
      continue;
    }
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    slots.push(formatted);
  }

  return slots;
}

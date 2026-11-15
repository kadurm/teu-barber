import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  SHOP_INFO,
  BARBERS,
  SERVICES,
  INITIAL_APPOINTMENTS,
  INITIAL_FINANCIAL_RECORDS,
  INITIAL_ACQUISITIONS,
  INITIAL_BLOCKED_SLOTS,
  INITIAL_CLIENTS
} from '../data/initialData';
import { generateWhatsAppLink, create2HourReminderWhatsAppMessage } from '../utils/formatters';
import {
  isFirebaseConfigured,
  subscribeToCollection,
  saveFirestoreDoc,
  deleteFirestoreDoc,
  getFirestoreDocOnce,
  subscribeToAdminAuth,
  adminSignOut,
  splitBarberData,
  PRIVATE_BARBER_FIELDS,
  getSlotId,
  isCollectionEmptyOnServer
} from '../services/firebase';

const AppContext = createContext();

// Data local (YYYY-MM-DD) — evita o salto de dia do toISOString() após 21h no Brasil
const localDateStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// ID de agendamento não adivinhável (o cliente usa o ID para cancelar o próprio horário)
const generateAppointmentId = () => {
  const bytes = new Uint8Array(6);
  (window.crypto || window.msCrypto).getRandomValues(bytes);
  const rand = Array.from(bytes, b => b.toString(36).padStart(2, '0')).join('').slice(0, 10).toUpperCase();
  return `TB-${rand}`;
};

// Grava barbeiro separando dados públicos (/barbers) e sensíveis (/barbers_private)
const saveBarberToCloud = async (barber) => {
  const { publicData, privateData } = splitBarberData(barber);
  await saveFirestoreDoc('barbers', barber.id, publicData, { merge: false });
  if (Object.keys(privateData).length > 0) {
    await saveFirestoreDoc('barbers_private', barber.id, privateData);
  }
};

// Versão dos dados locais: ao mudar, descarta dados de demonstração salvos em navegadores antigos
// (mantém catálogo e informações da barbearia).
const LOCAL_DATA_VERSION = '2-producao';
(() => {
  try {
    if (localStorage.getItem('teu_barber_data_version') === LOCAL_DATA_VERSION) return;
    ['teu_barber_appointments', 'teu_barber_financial', 'teu_barber_acquisitions', 'teu_barber_blocked', 'teu_barber_clients', 'teu_barber_current_client']
      .forEach(k => localStorage.removeItem(k));
    Object.keys(localStorage)
      .filter(k => k.startsWith('teu_barber_client_'))
      .forEach(k => localStorage.removeItem(k));
    localStorage.setItem('teu_barber_data_version', LOCAL_DATA_VERSION);
  } catch (e) {
    console.warn('Não foi possível limpar dados locais antigos:', e);
  }
})();

export function AppProvider({ children }) {
  // Load from localStorage or defaults
  const [shopInfo, setShopInfo] = useState(() => {
    const saved = localStorage.getItem('teu_barber_shop_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const rawIg = parsed.instagram || SHOP_INFO.instagram;
        const instagram = (rawIg === '@teu_barber.oficial' || !rawIg) ? '@teu_barber.studio' : rawIg;
        const cleanIg = instagram.replace('@', '').trim();
        return {
          ...SHOP_INFO,
          ...parsed,
          logoUrl: SHOP_INFO.logoUrl,
          address: (!parsed.address || parsed.address === 'Minas Gerais (Região 38)') ? SHOP_INFO.address : parsed.address,
          instagram: instagram,
          instagramUrl: `https://instagram.com/${cleanIg}`,
          openTime: parsed.openTime || SHOP_INFO.openTime,
          closeTime: parsed.closeTime || SHOP_INFO.closeTime
        };
      } catch (e) {
        return SHOP_INFO;
      }
    }
    return SHOP_INFO;
  });

  const [barbers, setBarbers] = useState(() => {
    const saved = localStorage.getItem('teu_barber_barbers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map(b => b.id === 'user1' ? { ...b, role: 'Barbeiro & Proprietário', avatar: SHOP_INFO.logoUrl } : b);
      } catch (e) {
        return BARBERS;
      }
    }
    return BARBERS;
  });

  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('teu_barber_services');
    return saved ? JSON.parse(saved) : SERVICES;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('teu_barber_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [financialRecords, setFinancialRecords] = useState(() => {
    const saved = localStorage.getItem('teu_barber_financial');
    return saved ? JSON.parse(saved) : INITIAL_FINANCIAL_RECORDS;
  });

  const [acquisitions, setAcquisitions] = useState(() => {
    const saved = localStorage.getItem('teu_barber_acquisitions');
    return saved ? JSON.parse(saved) : INITIAL_ACQUISITIONS;
  });

  const [blockedSlots, setBlockedSlots] = useState(() => {
    const saved = localStorage.getItem('teu_barber_blocked');
    return saved ? JSON.parse(saved) : INITIAL_BLOCKED_SLOTS;
  });

  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('teu_barber_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [currentClientPhone, setCurrentClientPhone] = useState(() => {
    return localStorage.getItem('teu_barber_current_client') || '';
  });

  const [reminder2hNotification, setReminder2hNotification] = useState(null);
  const [cloudConnected, setCloudConnected] = useState(() => isFirebaseConfigured());

  // Sessão do administrador (Firebase Auth + documento em /admins/{uid})
  const [adminUser, setAdminUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => isFirebaseConfigured());
  const isAdmin = Boolean(adminUser);

  // Horários ocupados publicados na nuvem (sem dados do cliente)
  const [occupiedSlots, setOccupiedSlots] = useState([]);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setAuthLoading(false);
      return;
    }
    const unsub = subscribeToAdminAuth((user) => {
      setAdminUser(user);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const logoutAdmin = async () => {
    await adminSignOut();
    setAdminUser(null);
  };

  // Dados PÚBLICOS em tempo real (site de agendamento e painel)
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setCloudConnected(false);
      return;
    }

    setCloudConnected(true);

    const unsubSlots = subscribeToCollection('slots', (cloudSlots) => {
      setOccupiedSlots(Array.isArray(cloudSlots) ? cloudSlots : []);
    });

    const unsubBarbers = subscribeToCollection('barbers', (cloudBarbers) => {
      if (cloudBarbers && Array.isArray(cloudBarbers) && cloudBarbers.length > 0) {
        // Preserva campos privados já carregados localmente (só existem no dispositivo do admin)
        setBarbers(prev => cloudBarbers.map(cb => {
          const local = prev.find(b => b.id === cb.id) || {};
          const privateLocal = {};
          PRIVATE_BARBER_FIELDS.forEach(f => { if (local[f] !== undefined) privateLocal[f] = local[f]; });
          return { ...privateLocal, ...cb };
        }));
      }
    });

    const unsubServices = subscribeToCollection('services', (cloudServices) => {
      if (cloudServices && Array.isArray(cloudServices) && cloudServices.length > 0) {
        setServices(cloudServices);
      }
    });

    const unsubBlocked = subscribeToCollection('blocked_slots', (cloudBlocked) => {
      if (cloudBlocked && Array.isArray(cloudBlocked) && cloudBlocked.length > 0) {
        setBlockedSlots(cloudBlocked);
      }
    });

    return () => {
      unsubSlots();
      unsubBarbers();
      unsubServices();
      unsubBlocked();
    };
  }, []);

  // Dados PRIVADOS em tempo real — somente com admin autenticado
  useEffect(() => {
    if (!isFirebaseConfigured() || !isAdmin) return;

    // 1. Escuta agendamentos da nuvem
    const unsubAppointments = subscribeToCollection('appointments', (cloudAppointments) => {
      if (cloudAppointments && Array.isArray(cloudAppointments) && cloudAppointments.length > 0) {
        setAppointments(prev => {
          const map = new Map();
          prev.forEach(item => { if (item.id) map.set(item.id, item); });
          cloudAppointments.forEach(item => { if (item.id) map.set(item.id, item); });
          return Array.from(map.values()).sort((a, b) => {
            const dateA = `${a.date || ''} ${a.time || ''}`;
            const dateB = `${b.date || ''} ${b.time || ''}`;
            return dateB.localeCompare(dateA);
          });
        });
      }
    });

    // 2. Escuta clientes da nuvem
    const unsubClients = subscribeToCollection('clients', (cloudClients) => {
      if (cloudClients && Array.isArray(cloudClients) && cloudClients.length > 0) {
        setClients(prev => {
          const map = new Map();
          prev.forEach(c => { if (c.phone) map.set(c.phone, c); });
          cloudClients.forEach(c => {
            const phone = c.phone || c.id;
            if (phone) map.set(phone, { ...c, phone });
          });
          return Array.from(map.values());
        });
      }
    });

    // 3. Dados sensíveis dos barbeiros (CPF, PIX, comissão, telefone)
    const unsubBarbersPrivate = subscribeToCollection('barbers_private', (privList) => {
      if (privList && Array.isArray(privList) && privList.length > 0) {
        setBarbers(prev => prev.map(b => {
          const priv = privList.find(p => p.id === b.id);
          if (!priv) return b;
          const { id, ...privFields } = priv;
          return { ...b, ...privFields };
        }));
      }
    });

    // 4. Escuta financeiro da nuvem
    const unsubFinancial = subscribeToCollection('financial', (cloudFin) => {
      if (cloudFin && Array.isArray(cloudFin) && cloudFin.length > 0) {
        setFinancialRecords(cloudFin);
      }
    });

    return () => {
      unsubAppointments();
      unsubClients();
      unsubBarbersPrivate();
      unsubFinancial();
    };
  }, [isAdmin]);

  // Migração única: barbeiros antigos com CPF/PIX no documento público
  const barberMigrationDone = useRef(false);
  useEffect(() => {
    if (!isAdmin || barberMigrationDone.current || !isFirebaseConfigured()) return;
    barberMigrationDone.current = true;
    const unsub = subscribeToCollection('barbers', (cloudBarbers) => {
      unsub();
      (cloudBarbers || []).forEach(cb => {
        const hasPrivate = PRIVATE_BARBER_FIELDS.some(f => cb[f] !== undefined);
        if (hasPrivate) saveBarberToCloud(cb);
      });
    });

    // Primeiro acesso de um admin com a nuvem vazia: publica equipe e catálogo atuais.
    // Sem isso, o primeiro serviço/barbeiro salvo pelo painel substituiria a lista inteira no site.
    (async () => {
      if (await isCollectionEmptyOnServer('barbers') === true) {
        barbers.forEach(b => saveBarberToCloud(b));
      }
      if (await isCollectionEmptyOnServer('services') === true) {
        services.forEach(s => saveFirestoreDoc('services', s.id, s));
      }
    })();
  }, [isAdmin]);

  // Admin: libera na nuvem o horário de agendamentos cancelados (inclusive cancelados pelo cliente)
  useEffect(() => {
    if (!isAdmin || !isFirebaseConfigured()) return;
    appointments.forEach(apt => {
      if (apt.status !== 'cancelado') return;
      const slotId = getSlotId(apt.barberId, apt.date, apt.time);
      const stillBooked = appointments.some(other =>
        other.status !== 'cancelado' &&
        getSlotId(other.barberId, other.date, other.time) === slotId
      );
      if (!stillBooked && occupiedSlots.some(s => s.id === slotId)) {
        deleteFirestoreDoc('slots', slotId);
      }
    });
  }, [isAdmin, appointments, occupiedSlots]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('teu_barber_shop_info', JSON.stringify(shopInfo));
  }, [shopInfo]);

  useEffect(() => {
    localStorage.setItem('teu_barber_barbers', JSON.stringify(barbers));
  }, [barbers]);

  useEffect(() => {
    localStorage.setItem('teu_barber_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('teu_barber_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('teu_barber_financial', JSON.stringify(financialRecords));
  }, [financialRecords]);

  useEffect(() => {
    localStorage.setItem('teu_barber_acquisitions', JSON.stringify(acquisitions));
  }, [acquisitions]);

  useEffect(() => {
    localStorage.setItem('teu_barber_blocked', JSON.stringify(blockedSlots));
  }, [blockedSlots]);

  useEffect(() => {
    localStorage.setItem('teu_barber_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    if (currentClientPhone) {
      localStorage.setItem('teu_barber_current_client', currentClientPhone);
    } else {
      localStorage.removeItem('teu_barber_current_client');
    }
  }, [currentClientPhone]);

  // Client Management Functions & Phone Normalizer
  const normalizePhone = (phone) => {
    if (!phone) return '';
    let clean = phone.toString().replace(/\D/g, '');
    if (clean.startsWith('55') && clean.length >= 12) {
      clean = clean.slice(2);
    }
    return clean;
  };

  const saveClientProfile = (phone, name, notes = '') => {
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) return null;

    let updatedClient = null;
    setClients(prev => {
      const existingIdx = prev.findIndex(c => normalizePhone(c.phone) === cleanPhone);
      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        updatedClient = {
          ...existing,
          phone: cleanPhone,
          name: name.trim() || existing.name,
          notes: notes !== undefined ? notes.trim() : existing.notes,
          updatedAt: new Date().toISOString()
        };
        const next = [...prev];
        next[existingIdx] = updatedClient;
        return next;
      } else {
        updatedClient = {
          phone: cleanPhone,
          name: name.trim(),
          notes: notes ? notes.trim() : '',
          createdAt: new Date().toISOString(),
          totalBookings: 1
        };
        return [updatedClient, ...prev];
      }
    });

    try {
      localStorage.setItem(`teu_barber_client_${cleanPhone}`, JSON.stringify(updatedClient));
    } catch (e) {
      // ignore
    }

    if (isFirebaseConfigured() && updatedClient) {
      saveFirestoreDoc('clients', cleanPhone, updatedClient);
    }

    setCurrentClientPhone(cleanPhone);
    return updatedClient;
  };

  const getClientByPhone = (phone) => {
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) return null;

    // 1. Busca na lista de clientes cadastrados
    const foundInClients = clients.find(c => normalizePhone(c.phone) === cleanPhone);
    if (foundInClients) return foundInClients;

    // 2. Busca no histórico de agendamentos se já agendou alguma vez
    const foundInApts = appointments.find(apt => normalizePhone(apt.clientPhone) === cleanPhone && apt.clientName);
    if (foundInApts) {
      return {
        phone: cleanPhone,
        name: foundInApts.clientName,
        notes: foundInApts.notes || '',
        totalBookings: appointments.filter(a => normalizePhone(a.clientPhone) === cleanPhone).length || 1,
        source: 'appointments'
      };
    }

    // 3. Busca no cache local do dispositivo
    try {
      const cached = localStorage.getItem(`teu_barber_client_${cleanPhone}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // ignore
    }

    return null;
  };

  // Busca assíncrona do cadastro na nuvem (leitura por ID; o cliente nunca lista a base)
  const lookupClientByPhone = async (phone) => {
    const local = getClientByPhone(phone);
    if (local) return local;
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10 || !isFirebaseConfigured()) return null;
    const cloud = await getFirestoreDocOnce('clients', cleanPhone);
    if (!cloud) return null;
    const { id, ...data } = cloud;
    const found = { ...data, phone: cleanPhone };
    setClients(prev => prev.some(c => normalizePhone(c.phone) === cleanPhone) ? prev : [found, ...prev]);
    return found;
  };

  const logoutClient = () => {
    setCurrentClientPhone('');
    localStorage.removeItem('teu_barber_current_client');
  };

  // Motor de Lembrete no WhatsApp (2 horas antes) — roda SOMENTE no painel do admin autenticado.
  // A marcação reminder2hSent é gravada na nuvem para não repetir em outros dispositivos.
  const appointmentsRef = useRef(appointments);
  appointmentsRef.current = appointments;

  useEffect(() => {
    if (!isAdmin) return;

    const check2HourReminders = () => {
      const now = new Date();
      const todayStr = localDateStr(now);

      const due = [];
      appointmentsRef.current.forEach(apt => {
        if (apt.status !== 'confirmado' && apt.status !== 'pendente') return;
        if (apt.date !== todayStr || apt.reminder2hSent) return;

        const [h, m] = (apt.time || '').split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return;

        const aptDateTime = new Date();
        aptDateTime.setHours(h, m, 0, 0);
        const diffMinutes = Math.floor((aptDateTime.getTime() - now.getTime()) / (1000 * 60));

        if (diffMinutes > 0 && diffMinutes <= 120) {
          due.push({ apt, diffMinutes });
        }
      });

      if (due.length === 0) return;

      const sentAt = new Date().toISOString();
      const dueIds = new Set(due.map(d => d.apt.id));
      setAppointments(prev => prev.map(apt =>
        dueIds.has(apt.id) ? { ...apt, reminder2hSent: true, reminder2hSentAt: sentAt } : apt
      ));

      due.forEach(({ apt }) => {
        if (isFirebaseConfigured()) {
          saveFirestoreDoc('appointments', apt.id, { reminder2hSent: true, reminder2hSentAt: sentAt });
        }
      });

      // Notificação flutuante com botão para abrir o WhatsApp do cliente
      const last = due[due.length - 1];
      setReminder2hNotification({
        appointment: { ...last.apt, reminder2hSent: true, reminder2hSentAt: sentAt },
        diffMinutes: last.diffMinutes,
        triggeredAt: sentAt
      });

      // Disparo automático (pode ser bloqueado pelo navegador; o botão da notificação cobre o caso)
      try {
        const msg = create2HourReminderWhatsAppMessage(last.apt, shopInfo);
        window.open(generateWhatsAppLink(last.apt.clientPhone, msg), '_blank');
      } catch (err) {
        console.warn('Disparo automático bloqueado pelo navegador', err);
      }
    };

    check2HourReminders();
    const interval = setInterval(check2HourReminders, 30000);
    return () => clearInterval(interval);
  }, [shopInfo, isAdmin]);

  // Appointment Actions
  const addAppointment = (data) => {
    const id = generateAppointmentId();
    const newApt = {
      id,
      status: 'confirmado',
      paymentMethod: 'pix',
      createdAt: new Date().toISOString(),
      reminder2hSent: false,
      ...data,
    };
    setAppointments(prev => [newApt, ...prev]);

    // Grava no Firestore caso Firebase esteja conectado
    if (isFirebaseConfigured()) {
      saveFirestoreDoc('appointments', newApt.id, newApt);
      // Publica só a ocupação do horário (sem nome/telefone) para os outros clientes
      if (newApt.barberId && newApt.date && newApt.time) {
        saveFirestoreDoc('slots', getSlotId(newApt.barberId, newApt.date, newApt.time), {
          barberId: newApt.barberId,
          date: newApt.date,
          time: newApt.time,
          duration: Number(newApt.duration || shopInfo?.slotDurationMinutes || 30),
          createdAt: newApt.createdAt
        });
      }
    }

    // Salva ou atualiza automaticamente o usuário usando o número de WhatsApp como chave
    if (data.clientPhone && data.clientName) {
      saveClientProfile(data.clientPhone, data.clientName, data.notes || '');
      const clean = data.clientPhone.replace(/\D/g, '');
      setClients(prev => prev.map(c => c.phone === clean ? { ...c, totalBookings: (c.totalBookings || 0) + 1 } : c));
    }

    return newApt;
  };

  const updateAppointmentStatus = (id, newStatus, paymentMethod) => {
    const current = appointments.find(apt => apt.id === id);
    let autoFinEntry = null;

    // Concluído pela primeira vez: lança entrada automática no financeiro
    if (current && newStatus === 'concluido' && current.status !== 'concluido') {
      autoFinEntry = {
        id: `fin-auto-${Date.now()}`,
        type: 'entrada',
        category: 'Serviço',
        description: `Atendimento ${current.clientName} - ${current.serviceName}`,
        amount: Number(current.price),
        barberId: current.barberId,
        barberName: current.barberName,
        paymentMethod: paymentMethod || current.paymentMethod || 'pix',
        date: current.date || localDateStr(),
        appointmentId: current.id
      };
      setFinancialRecords(finPrev => [autoFinEntry, ...finPrev]);
    }

    setAppointments(prev => prev.map(apt => {
      if (apt.id !== id) return apt;
      const updated = { ...apt, status: newStatus };
      if (paymentMethod) updated.paymentMethod = paymentMethod;
      return updated;
    }));

    if (isFirebaseConfigured()) {
      // Cliente (não admin) só tem permissão para gravar status = 'cancelado'
      saveFirestoreDoc('appointments', id, {
        status: newStatus,
        ...(paymentMethod && isAdmin ? { paymentMethod } : {})
      });
      if (autoFinEntry && isAdmin) {
        saveFirestoreDoc('financial', autoFinEntry.id, autoFinEntry);
      }
    }
  };

  const deleteAppointment = (id) => {
    const target = appointments.find(apt => apt.id === id);
    setAppointments(prev => prev.filter(apt => apt.id !== id));
    if (isFirebaseConfigured()) {
      deleteFirestoreDoc('appointments', id);
      if (target) {
        const slotId = getSlotId(target.barberId, target.date, target.time);
        const stillBooked = appointments.some(a =>
          a.id !== id && a.status !== 'cancelado' &&
          getSlotId(a.barberId, a.date, a.time) === slotId
        );
        if (!stillBooked) deleteFirestoreDoc('slots', slotId);
      }
    }
  };

  // Financial Actions
  const addFinancialRecord = (record) => {
    const id = `fin-${Date.now()}`;
    const newRecord = {
      id,
      date: new Date().toISOString().split('T')[0],
      ...record,
      amount: Number(record.amount)
    };
    setFinancialRecords(prev => [newRecord, ...prev]);
    if (isFirebaseConfigured()) {
      saveFirestoreDoc('financial', newRecord.id, newRecord);
    }
    return newRecord;
  };

  const deleteFinancialRecord = (id) => {
    setFinancialRecords(prev => prev.filter(r => r.id !== id));
    if (isFirebaseConfigured()) {
      deleteFirestoreDoc('financial', id);
    }
  };

  // Acquisition Goals Actions
  const addAcquisitionGoal = (goal) => {
    const id = `acq-${Date.now()}`;
    const newGoal = {
      id,
      savedAmount: 0,
      status: 'em_economia',
      targetCost: Number(goal.targetCost),
      ...goal
    };
    setAcquisitions(prev => [newGoal, ...prev]);
    return newGoal;
  };

  const updateAcquisitionGoal = (id, updates) => {
    setAcquisitions(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        if (updated.savedAmount >= updated.targetCost) {
          updated.status = 'adquirido';
        }
        return updated;
      }
      return item;
    }));
  };

  const contributeToAcquisition = (goalId, amount, deductFromCashFlow = false) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setAcquisitions(prev => prev.map(item => {
      if (item.id === goalId) {
        const newSaved = item.savedAmount + numAmount;
        const newStatus = newSaved >= item.targetCost ? 'adquirido' : 'em_economia';
        return {
          ...item,
          savedAmount: newSaved,
          status: newStatus
        };
      }
      return item;
    }));

    if (deductFromCashFlow) {
      const targetGoal = acquisitions.find(g => g.id === goalId);
      addFinancialRecord({
        type: 'saida',
        category: 'Melhoria do Espaço',
        description: `Aporte Meta: ${targetGoal ? targetGoal.title : 'Melhoria'}`,
        amount: numAmount,
        paymentMethod: 'reserva'
      });
    }
  };

  const deleteAcquisitionGoal = (id) => {
    setAcquisitions(prev => prev.filter(item => item.id !== id));
  };

  // Blocked Slots Actions
  const toggleBlockedSlot = (date, time, barberId, reason = "Horário Bloqueado") => {
    setBlockedSlots(prev => {
      const exists = prev.find(b => b.date === date && b.time === time && b.barberId === barberId);
      if (exists) {
        if (isFirebaseConfigured() && exists.id) {
          deleteFirestoreDoc('blocked_slots', exists.id);
        }
        return prev.filter(b => !(b.date === date && b.time === time && b.barberId === barberId));
      } else {
        const newSlot = { date, time, barberId, reason, id: `blk-${Date.now()}` };
        if (isFirebaseConfigured()) {
          saveFirestoreDoc('blocked_slots', newSlot.id, newSlot);
        }
        return [...prev, newSlot];
      }
    });
  };

  // Service Management Actions
  const addService = (newService) => {
    const id = `srv-${Date.now()}`;
    const serviceDoc = { ...newService, id, price: Number(newService.price), duration: Number(newService.duration) };
    setServices(prev => [...prev, serviceDoc]);
    if (isFirebaseConfigured()) {
      saveFirestoreDoc('services', id, serviceDoc);
    }
  };

  const updateService = (id, updates) => {
    setServices(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates, price: Number(updates.price ?? s.price), duration: Number(updates.duration ?? s.duration) };
        if (isFirebaseConfigured()) {
          saveFirestoreDoc('services', id, updated);
        }
        return updated;
      }
      return s;
    }));
  };

  const deleteService = (id) => {
    setServices(prev => prev.filter(s => s.id !== id));
    if (isFirebaseConfigured()) {
      deleteFirestoreDoc('services', id);
    }
  };

  // Barber / Partner Management
  const addBarber = (barberData) => {
    const id = `user-${Date.now().toString().slice(-4)}`;
    const newBarber = {
      id,
      name: barberData.name.trim(),
      role: barberData.role || 'Barbeiro Profissional',
      phone: barberData.phone || '',
      document: barberData.document || '',
      pixKey: barberData.pixKey || '',
      pixKeyType: barberData.pixKeyType || 'CPF',
      commissionRate: Number(barberData.commissionRate ?? 50),
      avatar: barberData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      specialty: barberData.specialty || '',
      bio: barberData.bio || '',
      rating: '5.0',
      totalReviews: 0,
      active: true,
      admissionDate: barberData.admissionDate || new Date().toISOString().split('T')[0]
    };
    setBarbers(prev => [...prev, newBarber]);
    if (isFirebaseConfigured()) {
      saveBarberToCloud(newBarber);
    }
    return newBarber;
  };

  const updateBarber = (id, updates) => {
    setBarbers(prev => prev.map(b => {
      if (b.id === id) {
        const updated = {
          ...b,
          ...updates,
          commissionRate: updates.commissionRate !== undefined ? Number(updates.commissionRate) : b.commissionRate
        };
        if (isFirebaseConfigured()) {
          saveBarberToCloud(updated);
        }
        return updated;
      }
      return b;
    }));
  };

  const deleteBarber = (id) => {
    if (id === 'user1') {
      alert("O barbeiro proprietário não pode ser excluído.");
      return;
    }
    setBarbers(prev => prev.filter(b => b.id !== id));
    if (isFirebaseConfigured()) {
      deleteFirestoreDoc('barbers', id);
      deleteFirestoreDoc('barbers_private', id);
    }
  };

  // Helper to convert HH:MM to minutes from midnight
  const timeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Helper to get duration of an appointment in minutes
  const getAppointmentDuration = (apt) => {
    if (apt.duration && !isNaN(Number(apt.duration)) && Number(apt.duration) > 0) {
      return Number(apt.duration);
    }
    if (apt.serviceId) {
      const s = services.find(srv => srv.id === apt.serviceId);
      if (s && s.duration) return Number(s.duration);
    }
    return Number(shopInfo?.slotDurationMinutes || 30);
  };

  // Check if slot is available considering service durations and overlapping intervals
  const isSlotAvailable = (date, time, barberId, requestedDuration = null) => {
    const slotDuration = Number(shopInfo?.slotDurationMinutes || 30);
    const durationNeeded = requestedDuration ? Number(requestedDuration) : slotDuration;
    const slotStart = timeToMinutes(time);
    const slotEnd = slotStart + durationNeeded;

    // 1. Check operating hours for date
    let closeTimeStr = shopInfo?.closeTime || "20:00";
    let openTimeStr = shopInfo?.openTime || "09:00";
    if (date) {
      const [year, month, day] = date.split('-').map(Number);
      const dayOfWeek = new Date(year, month - 1, day).getDay();
      if (dayOfWeek === 6) { // Saturday
        closeTimeStr = shopInfo?.saturdayCloseTime || "18:00";
        openTimeStr = shopInfo?.saturdayOpenTime || "09:00";
      }
    }
    const closeMinutes = timeToMinutes(closeTimeStr);
    const openMinutes = timeToMinutes(openTimeStr);

    if (slotStart < openMinutes || slotEnd > closeMinutes) {
      return false;
    }

    // 2. Check lunch interval
    if (shopInfo?.lunchStart && shopInfo?.lunchEnd) {
      const lunchStartMin = timeToMinutes(shopInfo.lunchStart);
      const lunchEndMin = timeToMinutes(shopInfo.lunchEnd);
      if (lunchEndMin > lunchStartMin) {
        if (slotStart < lunchEndMin && lunchStartMin < slotEnd) {
          return false;
        }
      }
    }

    // 3. Check if slot is blocked
    const isBlocked = blockedSlots.some(b => {
      if (b.date !== date) return false;
      if (b.barberId !== barberId && b.barberId !== 'all') return false;
      const blockStart = timeToMinutes(b.time);
      const blockEnd = blockStart + slotDuration;
      return slotStart < blockEnd && blockStart < slotEnd;
    });
    if (isBlocked) return false;

    // 4. Check if overlaps with any active appointment taking its duration into account
    const hasConflict = appointments.some(apt => {
      if (apt.date !== date) return false;
      if (apt.barberId !== barberId) return false;
      if (apt.status === 'cancelado') return false;

      const aptStart = timeToMinutes(apt.time);
      const aptDuration = getAppointmentDuration(apt);
      const aptEnd = aptStart + aptDuration;

      return slotStart < aptEnd && aptStart < slotEnd;
    });
    if (hasConflict) return false;

    // 5. Horários ocupados publicados na nuvem (agendamentos feitos em outros dispositivos)
    const hasCloudConflict = occupiedSlots.some(s => {
      if (s.date !== date || s.barberId !== barberId) return false;
      const sStart = timeToMinutes(s.time);
      const sEnd = sStart + Number(s.duration || slotDuration);
      return slotStart < sEnd && sStart < slotEnd;
    });

    return !hasCloudConflict;
  };

  // Reset to initial data
  const resetToInitialData = () => {
    if (window.confirm("Deseja redefinir todos os dados para o padrão inicial do Teu Barber?")) {
      localStorage.clear();
      setShopInfo(SHOP_INFO);
      setBarbers(BARBERS);
      setServices(SERVICES);
      setAppointments(INITIAL_APPOINTMENTS);
      setFinancialRecords(INITIAL_FINANCIAL_RECORDS);
      setAcquisitions(INITIAL_ACQUISITIONS);
      setBlockedSlots(INITIAL_BLOCKED_SLOTS);
    }
  };

  // Export & Import
  const exportData = () => {
    const backup = {
      shopInfo,
      barbers,
      services,
      appointments,
      financialRecords,
      acquisitions,
      blockedSlots,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teu-barber-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.shopInfo) setShopInfo(data.shopInfo);
      if (data.barbers) setBarbers(data.barbers);
      if (data.services) setServices(data.services);
      if (data.appointments) setAppointments(data.appointments);
      if (data.financialRecords) setFinancialRecords(data.financialRecords);
      if (data.acquisitions) setAcquisitions(data.acquisitions);
      if (data.blockedSlots) setBlockedSlots(data.blockedSlots);
      alert("Backup importado com sucesso!");
    } catch (e) {
      alert("Erro ao importar arquivo: Formato JSON inválido.");
    }
  };

  return (
    <AppContext.Provider value={{
      shopInfo,
      setShopInfo,
      barbers,
      setBarbers,
      addBarber,
      updateBarber,
      deleteBarber,
      services,
      appointments,
      financialRecords,
      acquisitions,
      blockedSlots,
      clients,
      currentClientPhone,
      setCurrentClientPhone,
      saveClientProfile,
      getClientByPhone,
      logoutClient,
      reminder2hNotification,
      setReminder2hNotification,
      addAppointment,
      updateAppointmentStatus,
      deleteAppointment,
      addFinancialRecord,
      deleteFinancialRecord,
      addAcquisitionGoal,
      updateAcquisitionGoal,
      contributeToAcquisition,
      deleteAcquisitionGoal,
      toggleBlockedSlot,
      addService,
      updateService,
      deleteService,
      isSlotAvailable,
      timeToMinutes,
      getAppointmentDuration,
      resetToInitialData,
      exportData,
      importData,
      cloudConnected,
      setCloudConnected,
      lookupClientByPhone,
      adminUser,
      isAdmin,
      authLoading,
      logoutAdmin
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

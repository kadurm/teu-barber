import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SHOP_INFO,
  BARBERS,
  SERVICES,
  INITIAL_APPOINTMENTS,
  INITIAL_FINANCIAL_RECORDS,
  INITIAL_ACQUISITIONS,
  INITIAL_BLOCKED_SLOTS
} from '../data/initialData';

const AppContext = createContext();

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

  // Appointment Actions
  const addAppointment = (data) => {
    const id = `TB-${Date.now().toString().slice(-5)}`;
    const newApt = {
      id,
      status: 'confirmado',
      paymentMethod: 'pix',
      createdAt: new Date().toISOString(),
      ...data,
    };
    setAppointments(prev => [newApt, ...prev]);
    return newApt;
  };

  const updateAppointmentStatus = (id, newStatus, paymentMethod) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === id) {
        const updated = { ...apt, status: newStatus };
        if (paymentMethod) updated.paymentMethod = paymentMethod;

        // If completed and not registered in financial, automatically record entry
        if (newStatus === 'concluido' && apt.status !== 'concluido') {
          const financialEntry = {
            id: `fin-auto-${Date.now()}`,
            type: 'entrada',
            category: 'Serviço',
            description: `Atendimento ${apt.clientName} - ${apt.serviceName}`,
            amount: Number(apt.price),
            barberId: apt.barberId,
            barberName: apt.barberName,
            paymentMethod: paymentMethod || apt.paymentMethod || 'pix',
            date: apt.date || new Date().toISOString().split('T')[0],
            appointmentId: apt.id
          };
          setFinancialRecords(finPrev => [financialEntry, ...finPrev]);
        }

        return updated;
      }
      return apt;
    }));
  };

  const deleteAppointment = (id) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
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
    return newRecord;
  };

  const deleteFinancialRecord = (id) => {
    setFinancialRecords(prev => prev.filter(r => r.id !== id));
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
        return prev.filter(b => !(b.date === date && b.time === time && b.barberId === barberId));
      } else {
        return [...prev, { date, time, barberId, reason, id: `blk-${Date.now()}` }];
      }
    });
  };

  // Service Management Actions
  const addService = (newService) => {
    const id = `srv-${Date.now()}`;
    setServices(prev => [...prev, { ...newService, id, price: Number(newService.price), duration: Number(newService.duration) }]);
  };

  const updateService = (id, updates) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates, price: Number(updates.price ?? s.price), duration: Number(updates.duration ?? s.duration) } : s));
  };

  const deleteService = (id) => {
    setServices(prev => prev.filter(s => s.id !== id));
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
    return newBarber;
  };

  const updateBarber = (id, updates) => {
    setBarbers(prev => prev.map(b => b.id === id ? {
      ...b,
      ...updates,
      commissionRate: updates.commissionRate !== undefined ? Number(updates.commissionRate) : b.commissionRate
    } : b));
  };

  const deleteBarber = (id) => {
    if (id === 'user1') {
      alert("O barbeiro proprietário não pode ser excluído.");
      return;
    }
    setBarbers(prev => prev.filter(b => b.id !== id));
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

    return !hasConflict;
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
      importData
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

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
    return saved ? JSON.parse(saved) : SHOP_INFO;
  });

  const [barbers, setBarbers] = useState(() => {
    const saved = localStorage.getItem('teu_barber_barbers');
    return saved ? JSON.parse(saved) : BARBERS;
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

  // Check if slot is available
  const isSlotAvailable = (date, time, barberId) => {
    // Check if slot is blocked
    const isBlocked = blockedSlots.some(b => b.date === date && b.time === time && (b.barberId === barberId || b.barberId === 'all'));
    if (isBlocked) return false;

    // Check if already booked with active appointment
    const isBooked = appointments.some(apt => 
      apt.date === date && 
      apt.time === time && 
      apt.barberId === barberId && 
      apt.status !== 'cancelado'
    );
    return !isBooked;
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

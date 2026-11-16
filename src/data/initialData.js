import logoImg from '../assets/logo.png';

export const SHOP_INFO = {
  name: "Teu Barber Studio",
  slug: "teu-barber",
  phone: "5538991218119",
  displayPhone: "(38) 99121-8119",
  address: "Rua dos Mangabeiras, Sagrada Família, Montes Claros - MG, CEP 39401-018",
  instagram: "@teu_barber.studio",
  instagramUrl: "https://instagram.com/teu_barber.studio",
  openTime: "09:00",
  closeTime: "20:00",
  saturdayOpenTime: "09:00",
  saturdayCloseTime: "18:00",
  lunchStart: "12:00",
  lunchEnd: "13:30",
  slotDurationMinutes: 30,
  logoUrl: logoImg,
  mercadoPagoEnabled: true,
  mercadoPagoPublicKey: "",
  mercadoPagoAccessToken: ""
};

export const BARBERS = [
  {
    id: "user1",
    name: "Teu",
    role: "Barbeiro & Proprietário",
    phone: "(38) 99121-8119",
    document: "", // CPF não deve ficar no bundle público: cadastrar pelo painel (vai para /barbers_private)
    pixKey: "38991218119",
    pixKeyType: "Telefone",
    admissionDate: "2023-01-15",
    avatar: "/barbers/teu.webp",
    rating: "4.9",
    totalReviews: 248,
    specialty: "Cortes Modernos, Degradê Navalhado, Platinados & Barboterapia",
    bio: "Especialista em visagismo e cortes de alta precisão. Atendimento exclusivo focado na experiência do cliente.",
    commissionRate: 100, // Dono fica com 100% da sua produção
    active: true
  },
  {
    id: "user2",
    name: "Gustavo",
    role: "Barbeiro Profissional",
    phone: "(38) 99876-5432",
    document: "",
    pixKey: "gustavo.barber.moc@gmail.com",
    pixKeyType: "E-mail",
    admissionDate: "2024-03-01",
    avatar: "/barbers/gustavo.webp",
    rating: "4.8",
    totalReviews: 184,
    specialty: "Corte Clássico, Barba Modelada, Pigmentação & Selagem",
    bio: "Mestre nos detalhes e alinhamentos de barba e degrade. Pontualidade e precisão técnica.",
    commissionRate: 50, // 50% de comissão padrão para o parceiro
    active: true
  }
];

export const SERVICE_CATEGORIES = [
  { id: "todos", name: "Todos os Serviços" },
  { id: "cabelo", name: "Cabelo" },
  { id: "barba", name: "Barba" },
  { id: "combos", name: "Combos Econômicos" },
  { id: "quimica", name: "Química & Tratamentos" },
  { id: "estetica", name: "Estética Facial" },
];

export const SERVICES = [
  // Cabelo
  { id: "corte", name: "Corte de Cabelo", price: 30.00, duration: 35, category: "cabelo", description: "Corte personalizado com tesoura e máquina, finalização com pomada e alinhamento do pezinho." },
  { id: "pezinho", name: "Pezinho (Acabamento)", price: 10.00, duration: 15, category: "cabelo", description: "Alinhamento e contorno preciso do cabelo na navalha." },
  
  // Barba
  { id: "barba", name: "Barba Completa", price: 20.00, duration: 30, category: "barba", description: "Modelagem de barba com toalha quente, navalha e óleo pós-barba." },
  { id: "pe_barba", name: "Pé + Barba", price: 30.00, duration: 35, category: "barba", description: "Alinhamento do pezinho do cabelo com barba completa." },

  // Combos
  { id: "corte_barba", name: "Corte + Barba", price: 50.00, duration: 50, category: "combos", description: "O combo mais pedido! Corte completo + Barboterapia com toalha quente." },
  { id: "corte_sobrancelha", name: "Corte + Sobrancelha", price: 40.00, duration: 45, category: "combos", description: "Corte estilizado e alinhamento da sobrancelha na navalha." },
  { id: "corte_barba_sobrancelha", name: "Corte + Barba + Sobrancelha", price: 60.00, duration: 60, category: "combos", description: "Experiência completa de visual: cabelo, barba desenhada e sobrancelha alinhada." },
  { id: "corte_pigmentacao", name: "Corte + Pigmentação", price: 50.00, duration: 50, category: "combos", description: "Corte de cabelo com pigmentação para disfarçar falhas e realçar as linhas." },
  { id: "corte_hidratacao", name: "Corte + Hidratação", price: 50.00, duration: 50, category: "combos", description: "Corte completo com lavagem especial e máscara de hidratação profunda." },
  { id: "corte_relaxamento", name: "Corte + Relaxamento", price: 70.00, duration: 60, category: "combos", description: "Alinhamento e relaxamento dos fios com corte estilizado." },

  // Química & Tratamentos
  { id: "platinado", name: "Platinado (a partir de)", price: 100.00, duration: 90, category: "quimica", description: "Descoloração global profissional e matização para o tom branco/platinado perfeito." },
  { id: "selagem", name: "Selagem Capilar", price: 80.00, duration: 75, category: "quimica", description: "Redução de frizz, alinhamento térmico e selamento das cutículas capilares." },
  { id: "luzes", name: "Luzes / Mechas", price: 50.00, duration: 60, category: "quimica", description: "Mechas e pontos de luz iluminados para destacar o corte." },
  { id: "relaxamento", name: "Relaxamento Capilar", price: 40.00, duration: 45, category: "quimica", description: "Tratamento para soltar os cachos e amaciar a textura dos fios." },
  { id: "hidratacao", name: "Hidratação Profunda", price: 25.00, duration: 30, category: "quimica", description: "Recuperação de brilho e maciez com lavagem relaxante." },
  { id: "pigmentacao", name: "Pigmentação", price: 25.00, duration: 30, category: "quimica", description: "Pigmentação capilar ou de barba para realce de densidade e definição." },

  // Estética
  { id: "sobrancelha", name: "Sobrancelha na Navalha", price: 10.00, duration: 15, category: "estetica", description: "Design e limpeza da sobrancelha masculina mantendo o aspecto natural." },
  { id: "limpeza_pele", name: "Limpeza de Pele / Máscara Black", price: 25.00, duration: 30, category: "estetica", description: "Remoção de cravos, esfoliação facial e máscara purificante de carvão ativado." },
];

// Helper para gerar datas relativas dinâmicas para o histórico da barbearia
const getPastDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

export const INITIAL_APPOINTMENTS = [];

export const INITIAL_FINANCIAL_RECORDS = [];

export const INITIAL_ACQUISITIONS = [];

export const INITIAL_BLOCKED_SLOTS = [
  // Ex: { date: "2026-10-24", time: "12:00", barberId: "user1", reason: "Almoço" }
];

export const INITIAL_CLIENTS = [];

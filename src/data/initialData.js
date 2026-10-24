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
    document: "084.921.346-12",
    pixKey: "38991218119",
    pixKeyType: "Telefone",
    admissionDate: "2023-01-15",
    avatar: logoImg,
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
    document: "112.345.678-90",
    pixKey: "gustavo.barber.moc@gmail.com",
    pixKeyType: "E-mail",
    admissionDate: "2024-03-01",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
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

export const INITIAL_APPOINTMENTS = [
  // Hoje
  {
    id: "apt-101",
    clientName: "Lucas Mendes",
    clientPhone: "38998765432",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "corte_barba",
    serviceName: "Corte + Barba",
    price: 50.00,
    duration: 50,
    date: getPastDate(0),
    time: "09:00",
    status: "concluido",
    paymentMethod: "pix",
    notes: "Cliente frequente, gosta de degradê zero navalhado."
  },
  {
    id: "apt-102",
    clientName: "Marcos Vinicius",
    clientPhone: "38991234567",
    barberId: "user2",
    barberName: "Gustavo",
    serviceId: "corte",
    serviceName: "Corte de Cabelo",
    price: 30.00,
    duration: 35,
    date: getPastDate(0),
    time: "10:00",
    status: "concluido",
    paymentMethod: "dinheiro",
    notes: ""
  },
  {
    id: "apt-103",
    clientName: "Rodrigo Almeida",
    clientPhone: "38992348899",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "corte_barba_sobrancelha",
    serviceName: "Corte + Barba + Sobrancelha",
    price: 60.00,
    duration: 60,
    date: getPastDate(0),
    time: "14:30",
    status: "confirmado",
    paymentMethod: "pix",
    notes: "Primeira vez no estúdio"
  },
  {
    id: "apt-104",
    clientName: "Danilo Santos",
    clientPhone: "38993457788",
    barberId: "user2",
    barberName: "Gustavo",
    serviceId: "pe_barba",
    serviceName: "Pé + Barba",
    price: 30.00,
    duration: 35,
    date: getPastDate(0),
    time: "16:00",
    status: "confirmado",
    paymentMethod: "cartao",
    notes: ""
  },

  // 1 dia atrás
  {
    id: "apt-091",
    clientName: "Felipe Nogueira",
    clientPhone: "38998877665",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "corte_barba_sobrancelha",
    serviceName: "Corte + Barba + Sobrancelha",
    price: 60.00,
    duration: 60,
    date: getPastDate(1),
    time: "10:00",
    status: "concluido",
    paymentMethod: "pix"
  },
  {
    id: "apt-092",
    clientName: "Carlos Eduardo",
    clientPhone: "38997766554",
    barberId: "user2",
    barberName: "Gustavo",
    serviceId: "corte",
    serviceName: "Corte de Cabelo",
    price: 30.00,
    duration: 35,
    date: getPastDate(1),
    time: "11:30",
    status: "concluido",
    paymentMethod: "dinheiro"
  },
  {
    id: "apt-093",
    clientName: "Bruno Silveira",
    clientPhone: "38996655443",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "selagem",
    serviceName: "Selagem Capilar",
    price: 80.00,
    duration: 75,
    date: getPastDate(1),
    time: "14:00",
    status: "concluido",
    paymentMethod: "cartao"
  },
  {
    id: "apt-094",
    clientName: "Matheus Silva",
    clientPhone: "38995544332",
    barberId: "user2",
    barberName: "Gustavo",
    serviceId: "corte_barba",
    serviceName: "Corte + Barba",
    price: 50.00,
    duration: 50,
    date: getPastDate(1),
    time: "16:30",
    status: "concluido",
    paymentMethod: "pix"
  },
  {
    id: "apt-095",
    clientName: "André Luiz",
    clientPhone: "38994433221",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "corte",
    serviceName: "Corte de Cabelo",
    price: 30.00,
    duration: 35,
    date: getPastDate(1),
    time: "18:00",
    status: "concluido",
    paymentMethod: "pix"
  },

  // 2 dias atrás
  {
    id: "apt-081",
    clientName: "Samuel Costa",
    clientPhone: "38993322110",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "corte_barba",
    serviceName: "Corte + Barba",
    price: 50.00,
    duration: 50,
    date: getPastDate(2),
    time: "09:30",
    status: "concluido",
    paymentMethod: "pix"
  },
  {
    id: "apt-082",
    clientName: "Guilherme Santos",
    clientPhone: "38992211009",
    barberId: "user2",
    barberName: "Gustavo",
    serviceId: "corte",
    serviceName: "Corte de Cabelo",
    price: 30.00,
    duration: 35,
    date: getPastDate(2),
    time: "11:00",
    status: "concluido",
    paymentMethod: "dinheiro"
  },
  {
    id: "apt-083",
    clientName: "Renan Batista",
    clientPhone: "38991100998",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "corte_hidratacao",
    serviceName: "Corte + Hidratação",
    price: 50.00,
    duration: 50,
    date: getPastDate(2),
    time: "14:30",
    status: "concluido",
    paymentMethod: "cartao"
  },
  {
    id: "apt-084",
    clientName: "Igor Rocha",
    clientPhone: "38990099887",
    barberId: "user2",
    barberName: "Gustavo",
    serviceId: "pe_barba",
    serviceName: "Pé + Barba",
    price: 30.00,
    duration: 35,
    date: getPastDate(2),
    time: "16:00",
    status: "concluido",
    paymentMethod: "pix"
  },
  {
    id: "apt-085",
    clientName: "Victor Hugo",
    clientPhone: "38989988776",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "corte_sobrancelha",
    serviceName: "Corte + Sobrancelha",
    price: 40.00,
    duration: 45,
    date: getPastDate(2),
    time: "17:30",
    status: "concluido",
    paymentMethod: "pix"
  },

  // 3 dias atrás
  {
    id: "apt-071",
    clientName: "Leonardo Ribeiro",
    clientPhone: "38988877665",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "corte_barba",
    serviceName: "Corte + Barba",
    price: 50.00,
    duration: 50,
    date: getPastDate(3),
    time: "10:30",
    status: "concluido",
    paymentMethod: "pix"
  },
  {
    id: "apt-072",
    clientName: "Thiago Moreira",
    clientPhone: "38987766554",
    barberId: "user2",
    barberName: "Gustavo",
    serviceId: "corte",
    serviceName: "Corte de Cabelo",
    price: 30.00,
    duration: 35,
    date: getPastDate(3),
    time: "14:00",
    status: "concluido",
    paymentMethod: "dinheiro"
  },
  {
    id: "apt-073",
    clientName: "Daniel Souza",
    clientPhone: "38986655443",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "corte_pigmentacao",
    serviceName: "Corte + Pigmentação",
    price: 50.00,
    duration: 50,
    date: getPastDate(3),
    time: "16:00",
    status: "concluido",
    paymentMethod: "pix"
  },
  {
    id: "apt-074",
    clientName: "Lucas Vasconcelos",
    clientPhone: "38985544332",
    barberId: "user2",
    barberName: "Gustavo",
    serviceId: "barba",
    serviceName: "Barba Completa",
    price: 20.00,
    duration: 30,
    date: getPastDate(3),
    time: "17:30",
    status: "concluido",
    paymentMethod: "cartao"
  },

  // 4 dias atrás
  {
    id: "apt-061",
    clientName: "Alexandre Pires",
    clientPhone: "38984433221",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "corte",
    serviceName: "Corte de Cabelo",
    price: 30.00,
    duration: 35,
    date: getPastDate(4),
    time: "11:00",
    status: "concluido",
    paymentMethod: "pix"
  },
  {
    id: "apt-062",
    clientName: "Vinicius Prado",
    clientPhone: "38983322110",
    barberId: "user2",
    barberName: "Gustavo",
    serviceId: "corte_barba",
    serviceName: "Corte + Barba",
    price: 50.00,
    duration: 50,
    date: getPastDate(4),
    time: "15:00",
    status: "concluido",
    paymentMethod: "cartao"
  },
  {
    id: "apt-063",
    clientName: "Douglas Faria",
    clientPhone: "38982211009",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "pe_barba",
    serviceName: "Pé + Barba",
    price: 30.00,
    duration: 35,
    date: getPastDate(4),
    time: "17:00",
    status: "concluido",
    paymentMethod: "dinheiro"
  },

  // 5 dias atrás (Pico de sábado / feriado)
  {
    id: "apt-051",
    clientName: "Eduardo Henrique",
    clientPhone: "38981100998",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "platinado",
    serviceName: "Platinado (a partir de)",
    price: 100.00,
    duration: 90,
    date: getPastDate(5),
    time: "09:00",
    status: "concluido",
    paymentMethod: "pix"
  },
  {
    id: "apt-052",
    clientName: "Rafael Martins",
    clientPhone: "38980099887",
    barberId: "user2",
    barberName: "Gustavo",
    serviceId: "corte_barba_sobrancelha",
    serviceName: "Corte + Barba + Sobrancelha",
    price: 60.00,
    duration: 60,
    date: getPastDate(5),
    time: "10:30",
    status: "concluido",
    paymentMethod: "cartao"
  },
  {
    id: "apt-053",
    clientName: "Fabio Assunção",
    clientPhone: "38979988776",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "corte_barba",
    serviceName: "Corte + Barba",
    price: 50.00,
    duration: 50,
    date: getPastDate(5),
    time: "13:30",
    status: "concluido",
    paymentMethod: "pix"
  },
  {
    id: "apt-054",
    clientName: "Henrique Ramos",
    clientPhone: "38978877665",
    barberId: "user2",
    barberName: "Gustavo",
    serviceId: "corte",
    serviceName: "Corte de Cabelo",
    price: 30.00,
    duration: 35,
    date: getPastDate(5),
    time: "15:00",
    status: "concluido",
    paymentMethod: "dinheiro"
  },
  {
    id: "apt-055",
    clientName: "João Pedro",
    clientPhone: "38977766554",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "corte_relaxamento",
    serviceName: "Corte + Relaxamento",
    price: 70.00,
    duration: 60,
    date: getPastDate(5),
    time: "16:30",
    status: "concluido",
    paymentMethod: "pix"
  },
  {
    id: "apt-056",
    clientName: "Marcelo Dias",
    clientPhone: "38976655443",
    barberId: "user2",
    barberName: "Gustavo",
    serviceId: "corte_barba",
    serviceName: "Corte + Barba",
    price: 50.00,
    duration: 50,
    date: getPastDate(5),
    time: "18:00",
    status: "concluido",
    paymentMethod: "cartao"
  },

  // 6 dias atrás
  {
    id: "apt-041",
    clientName: "Otávio Toledo",
    clientPhone: "38975544332",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "corte_barba",
    serviceName: "Corte + Barba",
    price: 50.00,
    duration: 50,
    date: getPastDate(6),
    time: "11:00",
    status: "concluido",
    paymentMethod: "pix"
  },
  {
    id: "apt-042",
    clientName: "Caio Vilela",
    clientPhone: "38974433221",
    barberId: "user2",
    barberName: "Gustavo",
    serviceId: "corte",
    serviceName: "Corte de Cabelo",
    price: 30.00,
    duration: 35,
    date: getPastDate(6),
    time: "14:30",
    status: "concluido",
    paymentMethod: "dinheiro"
  },
  {
    id: "apt-043",
    clientName: "Yago Meireles",
    clientPhone: "38973322110",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "corte_sobrancelha",
    serviceName: "Corte + Sobrancelha",
    price: 40.00,
    duration: 45,
    date: getPastDate(6),
    time: "16:00",
    status: "concluido",
    paymentMethod: "pix"
  },

  // Futuro
  {
    id: "apt-105",
    clientName: "Gabriel Ferreira",
    clientPhone: "38991122334",
    barberId: "user1",
    barberName: "Teu",
    serviceId: "platinado",
    serviceName: "Platinado (a partir de)",
    price: 100.00,
    duration: 90,
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "10:30",
    status: "pendente",
    paymentMethod: "pix",
    notes: "Avaliar se cabelo aguenta descoloração"
  }
];

export const INITIAL_FINANCIAL_RECORDS = [
  // Entradas de serviços correspondentes
  {
    id: "fin-1",
    type: "entrada",
    category: "Serviço",
    description: "Atendimento Lucas Mendes - Corte + Barba",
    amount: 50.00,
    barberId: "user1",
    barberName: "Teu",
    paymentMethod: "pix",
    date: getPastDate(0)
  },
  {
    id: "fin-2",
    type: "entrada",
    category: "Serviço",
    description: "Atendimento Marcos Vinicius - Corte",
    amount: 30.00,
    barberId: "user2",
    barberName: "Gustavo",
    paymentMethod: "dinheiro",
    date: getPastDate(0)
  },
  {
    id: "fin-3",
    type: "saida",
    category: "Insumos",
    description: "Lâminas descartáveis Derby & Golas higiênicas",
    amount: 68.00,
    paymentMethod: "pix",
    date: getPastDate(0)
  },
  {
    id: "fin-4",
    type: "saida",
    category: "Produtos",
    description: "Pomadas modeladoras matte e óleo de barba para revenda",
    amount: 220.00,
    paymentMethod: "cartao",
    date: getPastDate(1)
  },
  {
    id: "fin-5",
    type: "entrada",
    category: "Venda Produto",
    description: "Pomada Matte Extra Forte",
    amount: 45.00,
    barberId: "user1",
    barberName: "Teu",
    paymentMethod: "pix",
    date: getPastDate(0)
  },
  {
    id: "fin-6",
    type: "entrada",
    category: "Serviço",
    description: "Atendimento Bruno Silveira - Selagem Capilar",
    amount: 80.00,
    barberId: "user1",
    barberName: "Teu",
    paymentMethod: "cartao",
    date: getPastDate(1)
  },
  {
    id: "fin-7",
    type: "entrada",
    category: "Serviço",
    description: "Atendimento Eduardo Henrique - Platinado",
    amount: 100.00,
    barberId: "user1",
    barberName: "Teu",
    paymentMethod: "pix",
    date: getPastDate(5)
  },
  {
    id: "fin-8",
    type: "entrada",
    category: "Serviço",
    description: "Atendimento Rafael Martins - Corte + Barba + Sobrancelha",
    amount: 60.00,
    barberId: "user2",
    barberName: "Gustavo",
    paymentMethod: "cartao",
    date: getPastDate(5)
  },
  {
    id: "fin-9",
    type: "saida",
    category: "Manutenção",
    description: "Afiação de tesouras e lâminas de corte",
    amount: 55.00,
    paymentMethod: "pix",
    date: getPastDate(3)
  }
];

export const INITIAL_ACQUISITIONS = [
  {
    id: "acq-1",
    title: "Cadeira Hidráulica Reclinável Vintage em Couro",
    category: "Mobiliário",
    targetCost: 3800.00,
    savedAmount: 2600.00,
    priority: "alta",
    status: "em_economia", // "planejado", "em_economia", "adquirido"
    targetDate: "2026-12-15",
    notes: "Modelo reclinável com cabeçote ajustável e apoio para pernas, melhora muito o conforto da barboterapia.",
    linkRef: "https://mercadolivre.com.br"
  },
  {
    id: "acq-2",
    title: "Ar-Condicionado Split Inverter 18.000 BTUs",
    category: "Climatização",
    targetCost: 3200.00,
    savedAmount: 2100.00,
    priority: "alta",
    status: "em_economia",
    targetDate: "2026-11-30",
    notes: "Climatização ideal para os dias mais quentes do Norte de MG, reduz o consumo de energia em até 60%.",
    linkRef: ""
  },
  {
    id: "acq-3",
    title: "Espelho Camarim com Iluminação Frontal LED 4000K",
    category: "Iluminação & Estética",
    targetCost: 1450.00,
    savedAmount: 1450.00,
    priority: "concluido",
    status: "adquirido",
    targetDate: "2026-10-10",
    notes: "Já instalado! Melhora a iluminação sem sombras para fotos dos cortes e vídeos para o Instagram.",
    linkRef: ""
  },
  {
    id: "acq-4",
    title: "Máquina Wahl Cordless Magic Clip Gold Edition",
    category: "Maquinário",
    targetCost: 1250.00,
    savedAmount: 700.00,
    priority: "media",
    status: "em_economia",
    targetDate: "2026-12-30",
    notes: "Motor rotativo de alta rotação, lâmina taper com dentes intercalados para degradês mais rápidos.",
    linkRef: ""
  },
  {
    id: "acq-5",
    title: "Frigobar Retrô Preto Fosco para Clientes",
    category: "Experiência do Cliente",
    targetCost: 1890.00,
    savedAmount: 500.00,
    priority: "media",
    status: "em_economia",
    targetDate: "2027-01-20",
    notes: "Disponibilizar cervejas artesanais, água gelada e refrigerantes de cortesia na espera.",
    linkRef: ""
  },
  {
    id: "acq-6",
    title: "Sofá Chesterfield 3 Lugares em Couro Ecológico",
    category: "Mobiliário",
    targetCost: 2600.00,
    savedAmount: 200.00,
    priority: "baixa",
    status: "planejado",
    targetDate: "2027-03-01",
    notes: "Substituir as cadeiras de espera atuais por um sofá clássico para valorizar o ambiente.",
    linkRef: ""
  }
];

export const INITIAL_BLOCKED_SLOTS = [
  // Ex: { date: "2026-10-24", time: "12:00", barberId: "user1", reason: "Almoço" }
];

export const INITIAL_CLIENTS = [
  {
    phone: "38988776655",
    name: "Lucas Mendonça",
    notes: "Degradê alto navalhado",
    createdAt: "2026-10-01",
    totalBookings: 3
  },
  {
    phone: "38991234567",
    name: "Marcos Vinicius",
    notes: "Cabelo social na tesoura",
    createdAt: "2026-10-05",
    totalBookings: 2
  },
  {
    phone: "38992348899",
    name: "Rodrigo Almeida",
    notes: "Primeira vez no estúdio",
    createdAt: "2026-10-12",
    totalBookings: 1
  },
  {
    phone: "38993457788",
    name: "Danilo Santos",
    notes: "Barba alinhada com toalha quente",
    createdAt: "2026-10-15",
    totalBookings: 1
  }
];

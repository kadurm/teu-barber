import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateBR } from '../../utils/formatters';
import {
  Compass,
  TrendingUp,
  Calendar,
  Search,
  MapPin,
  Clock,
  Scissors,
  Megaphone,
  Copy,
  Check,
  Lightbulb,
  Award,
  Zap,
  ChevronRight,
  Filter
} from 'lucide-react';

const MONTES_CLAROS_EVENTS = [
  {
    id: 'expomontes',
    title: 'Expomontes (Exposição Agropecuária de Montes Claros)',
    category: 'Montes Claros',
    month: 'Julho',
    period: 'Primeira quinzena de Julho (Parque João Alencar Athayde)',
    impact: 'Crítico (Pico Máximo)',
    impactColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    description: 'O maior evento do Norte de Minas Gerais. Milhares de pessoas vão aos shows de grandes artistas nacionais e camarotes.',
    barberInsight: 'Público masculino investe pesado em visagismo, combos completos (Corte + Barba + Sobrancelha), platinados e riscos na régua nas 2 semanas que antecedem e durante o evento.',
    suggestedCampaign: 'Passaporte Expomontes Teu Barber',
    promoTemplate: `Fala meu parceiro! 🚀 A Expomontes está chegando e a agenda do Teu Barber já começou a lotar para os dias de shows!\n\nGaranta seu horário na régua com antecedência e não fique na fila de última hora:\n✂️ Corte Stylist + Barboterapia completa com toalha quente\n🔥 Alinhamento na navalha & finalização premium\n\nReserve agora pelo link antes que esgote: https://kadurm.github.io/teu-barber/ 💈`
  },
  {
    id: 'aniversario_moc',
    title: 'Aniversário de Montes Claros (Feriado Municipal)',
    category: 'Montes Claros',
    month: 'Julho',
    period: '03 de Julho',
    impact: 'Alto',
    impactColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Feriado de emancipação política de Montes Claros. Marca a abertura oficial do mês de férias e das festividades de julho.',
    barberInsight: 'Excelente momento para horários estendidos nos dias 01 e 02 de julho, com alta procura para feriadão.',
    suggestedCampaign: 'Feriadão na Régua',
    promoTemplate: `Feriadão de Aniversário de Montes Claros chegando! 🏙️\n\nVai viajar ou curtir a cidade? Venha dar aquele talento no visual no Teu Barber Studio!\n\nAgende seu horário online em segundos: https://kadurm.github.io/teu-barber/`
  },
  {
    id: 'festas_agosto',
    title: 'Festas de Agosto de Montes Claros (Catopês, Marujos e Caboclinhos)',
    category: 'Montes Claros',
    month: 'Agosto',
    period: '17 a 22 de Agosto',
    impact: 'Alto',
    impactColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Maior celebração folclórica e cultural do Norte de Minas. A cidade recebe turistas, conterrâneos e famílias inteiras.',
    barberInsight: 'Movimento contínuo durante a semana inteira. Clientes procuram cortes clássicos, acabamentos impecáveis de barba e hidratação.',
    suggestedCampaign: 'Tradição & Estilo Teu Barber',
    promoTemplate: `Semana das tradicionais Festas de Agosto em Moc! 🪘✨\n\nNossa cidade respira cultura e o Teu Barber está a postos para te deixar alinhado para todos os desfiles e eventos!\n\nAgendamentos abertos: https://kadurm.github.io/teu-barber/`
  },
  {
    id: 'fenics',
    title: 'Fenics - Feira Nacional da Indústria, Comércio e Serviços',
    category: 'Montes Claros',
    month: 'Setembro',
    period: 'Meados de Setembro (Parque de Exposições de MOC)',
    impact: 'Médio-Alto',
    impactColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    description: 'Maior feira empresarial do Norte de Minas, reunindo expositores, empresários e profissionais de todo o estado.',
    barberInsight: 'Procura focada em cortes executivos clássicos, desenho de barba profissional e visagismo para networking.',
    suggestedCampaign: 'Visual Executivo Teu Barber',
    promoTemplate: `Vai participar ou expor na Fenics esta semana? 💼\n\nA sua imagem profissional abre portas! Passe no Teu Barber e garanta um visual alinhado para os dias de feira e negócios.\n\nReserve seu atendimento: https://kadurm.github.io/teu-barber/`
  },
  {
    id: 'padroeira_moc',
    title: 'Nossa Senhora da Conceição - Padroeira de Montes Claros',
    category: 'Montes Claros',
    month: 'Dezembro',
    period: '08 de Dezembro (Feriado Municipal)',
    impact: 'Alto',
    impactColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Feriado municipal que dá o pontapé inicial nas confraternizações de fim de ano em Montes Claros.',
    barberInsight: 'Início da corrida de fim de ano. Quem atende bem no dia 08 já garante a fidelização para os dias 24 e 31 de dezembro.',
    suggestedCampaign: 'Abertura da Temporada de Fim de Ano',
    promoTemplate: `Dezembro começou e as confraternizações da firma e de amigos já estão rolando! 🎄🍻\n\nNão deixe para a última hora: marque hoje seu atendimento no Teu Barber Studio!\n\nLink do app: https://kadurm.github.io/teu-barber/`
  },
  {
    id: 'carnaval',
    title: 'Carnaval & Micaretas Regionais',
    category: 'Nacional',
    month: 'Fevereiro/Março',
    period: 'Feriado de Carnaval',
    impact: 'Crítico',
    impactColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    description: 'Temporada de viagens, blocos de rua e micaretas em Minas Gerais e Bahia.',
    barberInsight: 'Aumento de 300% na procura por químicas capilares: Platinado global, Luzes / Mechas, Pigmentação e Degradê zero navalhado.',
    suggestedCampaign: 'Carnaval no Grau Teu Barber',
    promoTemplate: `Prepara o visual para a folia! 🎭⚡ Platinado perfeito, degradê na régua e barba alinhada.\n\nGaranta seu horário com antecedência antes que feche a agenda do feriado:\nhttps://kadurm.github.io/teu-barber/`
  },
  {
    id: 'dia_dos_pais',
    title: 'Dia dos Pais',
    category: 'Comercial',
    month: 'Agosto',
    period: '2º Domingo de Agosto',
    impact: 'Alto',
    impactColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Uma das datas mais sentimentais e lucrativas para barbearias no Brasil.',
    barberInsight: 'Média de 2 atendimentos simultâneos: Pai & Filho cortando juntos. Excelente para vender serviços adicionais e vale-presente.',
    suggestedCampaign: 'Combo Especial Pai & Filho',
    promoTemplate: `Neste Dia dos Pais, dê o presente que ele merece: um momento de cuidado e resenha no Teu Barber Studio! 🧔💈\n\nTraga seu pai para cortar junto com você com atendimento especial e café quentinho!\n\nAgende para os dois juntos pelo site: https://kadurm.github.io/teu-barber/`
  },
  {
    id: 'fim_de_ano',
    title: 'Natal & Réveillon (Festas de Fim de Ano)',
    category: 'Nacional',
    month: 'Dezembro',
    period: '20 a 31 de Dezembro',
    impact: 'Crítico (100% de Lotação)',
    impactColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    description: 'O período mais disputado do ano. Demanda atinge 3x a capacidade normal da barbearia.',
    barberInsight: 'Abrir horários especiais e antecipar agendamentos a partir de 20 de novembro. Sugerir pagamento antecipado online pelo Pix para evitar no-show.',
    suggestedCampaign: 'Agenda de Fim de Ano Aberta',
    promoTemplate: `🎄 Atenção clientes Teu Barber Studio! A agenda oficial de Natal e Réveillon já está aberta!\n\nComo vocês sabem, os horários de 22 a 31 de dezembro esgotam muito rápido. Garanta logo o seu dia e passe o Natal e a virada no estilo!\n\nReserve aqui: https://kadurm.github.io/teu-barber/`
  },
  {
    id: 'volta_aulas',
    title: 'Volta às Aulas (Escolas e Universidades Unimontes / Faculdades)',
    category: 'Comercial',
    month: 'Fevereiro e Agosto',
    period: 'Início de Semestres Letivos',
    impact: 'Médio-Alto',
    impactColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    description: 'Retorno de estudantes, professores e universitários às atividades.',
    barberInsight: 'Cortes juvenis, fade degradê e combos expressos com excelente giro de caixa.',
    suggestedCampaign: 'Volta às Aulas com Estilo',
    promoTemplate: `Semestre começando com a régua em dia! 📚✂️\n\nPasse no Teu Barber antes da volta às aulas e chegue com o visual renovado!\n\nAgendamento rápido: https://kadurm.github.io/teu-barber/`
  }
];

export default function IntelligenceTab() {
  const { appointments, services, financialRecords, shopInfo } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [copiedId, setCopiedId] = useState(null);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return MONTES_CLAROS_EVENTS.filter(event => {
      const matchesCategory = selectedCategory === 'Todos' || event.category === selectedCategory;
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.barberInsight.toLowerCase().includes(term) ||
        event.month.toLowerCase().includes(term) ||
        event.category.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Weekly Demand Distribution (Barbershop Intelligence)
  const weeklyDemand = useMemo(() => {
    const days = [
      { name: 'Segunda', status: 'Fechado / Folga', level: 'low', tip: 'Dia de descanso e manutenção de maquinários' },
      { name: 'Terça-Feira', status: 'Movimento Moderado (35%)', level: 'medium-low', tip: 'Ideal para lançar promoções da "Terça da Barba" e atrair clientes' },
      { name: 'Quarta-Feira', status: 'Movimento Moderado (45%)', level: 'medium-low', tip: 'Bom dia para serviços mais demorados como Platinados e Selagem' },
      { name: 'Quinta-Feira', status: 'Movimento Crescente (65%)', level: 'medium-high', tip: 'Início do esquenta do final de semana. Agenda começa a preencher' },
      { name: 'Sexta-Feira', status: 'Pico de Demanda (95%)', level: 'high', tip: 'Priorizar combos e serviços de alto ticket. Evitar atrasos' },
      { name: 'Sábado', status: 'Capacidade Máxima (100%)', level: 'high', tip: 'Dia mais rentável da semana. Incentivar agendamentos online' },
    ];
    return days;
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif silver-text-gradient flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            Inteligência de Mercado & Sazonalidade (Montes Claros - MG)
          </h2>
          <p className="text-xs text-slate-400">
            Previsão de demanda, eventos locais como a Expomontes, oportunidades sazonais e gerador de campanhas promocionais
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Montes Claros • Norte de Minas</span>
        </div>
      </div>

      {/* 3 Quick Intelligence Tips Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Zap className="w-4 h-4" />
            <h4 className="font-bold text-xs uppercase tracking-wider">Estratégia de Meio de Semana</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Terças e quartas costumam ter 40% menos fluxo do que sextas e sábados. Crie a <strong>"Quarta da Barboterapia"</strong> (R$ 5 off na barba) para nivelar seu faturamento semanal.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <Award className="w-4 h-4" />
            <h4 className="font-bold text-xs uppercase tracking-wider">Foco na Expomontes</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A <strong>Expomontes</strong> no Parque de Exposições é o período em que o homem montes-clarense mais gasta com cortes, luzes e barba. Abra a agenda 20 dias antes para garantir 100% de ocupação.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-slate-900 to-slate-900 border border-purple-500/20">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Lightbulb className="w-4 h-4" />
            <h4 className="font-bold text-xs uppercase tracking-wider">Fidelização Automática</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            O ciclo natural de corte de cabelo masculino é de <strong>20 a 25 dias</strong>. Dispare mensagens no WhatsApp lembrando os clientes desse intervalo para dobrar a recorrência anual.
          </p>
        </div>

      </div>

      {/* Part 1: Search Engine for Events & Seasonality */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
              <Calendar className="w-4 h-4 text-amber-400" />
              Motor de Busca de Eventos, Feriados & Oportunidades
            </h3>
            <p className="text-xs text-slate-400">
              Pesquise épocas do ano, eventos em Montes Claros e copie textos prontos de campanhas
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar: Expomontes, Agosto, Natal..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 pl-9 pr-3 py-2 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filtrar:
          </span>
          {['Todos', 'Montes Claros', 'Nacional', 'Comercial'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 pt-2">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* Event Badge Header */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                    {event.category} • {event.month}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${event.impactColor}`}>
                    Impacto: {event.impact}
                  </span>
                </div>

                {/* Title & Period */}
                <div>
                  <h4 className="text-base font-bold text-white font-serif">
                    {event.title}
                  </h4>
                  <p className="text-xs text-amber-400/90 font-medium mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{event.period}</span>
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {event.description}
                </p>

                {/* Barber Strategic Insight Box */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <strong className="block text-amber-400 mb-1 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Dica de Negócio para o Teu Barber:
                  </strong>
                  <span>{event.barberInsight}</span>
                </div>

              </div>

              {/* Ready Campaign Box & One-Click Copy */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <Megaphone className="w-3.5 h-3.5 text-pink-400" />
                    Campanha: {event.suggestedCampaign}
                  </span>
                  <button
                    onClick={() => handleCopy(event.id, event.promoTemplate)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Copiar texto pronto para postar ou enviar no WhatsApp"
                  >
                    {copiedId === event.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Mensagem</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400 font-mono line-clamp-2">
                  {event.promoTemplate}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Part 2: Weekly Rhythm & Flow Analysis */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Fluxo Semanal do Estúdio & Estratégia de Capacidade
          </h3>
          <p className="text-xs text-slate-400">
            Como equilibrar a demanda para maximizar o faturamento sem sobrecarregar os barbeiros
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {weeklyDemand.map(item => (
            <div
              key={item.name}
              className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{item.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.level === 'high'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : item.level === 'medium-high'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : item.level === 'medium-low'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                💡 {item.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

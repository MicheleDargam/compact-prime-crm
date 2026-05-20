"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  Users, 
  CalendarCheck, 
  Target, 
  Sparkles,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  Filter
} from "lucide-react";

// Helper to generate a smooth SVG path from data points
const generateSmoothPath = (points: number[], width: number, height: number, maxVal: number) => {
  if (points.length === 0) return "";
  const stepX = width / (points.length - 1);
  
  // Transform values to Y coordinates (padding applied later if needed)
  const coords = points.map((val, i) => ({
    x: i * stepX,
    y: height - (val / maxVal) * height
  }));

  let path = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const cx = (curr.x + next.x) / 2;
    path += ` C ${cx},${curr.y} ${cx},${next.y} ${next.x},${next.y}`;
  }
  return path;
};

// Types
type FilterType = "Todos" | "Buffet" | "Decoração" | "Fotografia";

interface DashboardMockData {
  kpis: {
    receita: string;
    receitaGrowth: string;
    leads: string;
    leadsGrowth: string;
    eventos: string;
    eventosDesc: string;
    conversao: string;
    conversaoGrowth: string;
  };
  receita: number[];
  metricas: {
    maiorMes: string;
    crescimento: string;
    ticketMedio: string;
  };
  eventos: { label: string; pct: string; width: string; color: string }[];
  insights: string[];
}

// Mock Data structure responsive to filters
const MOCK_DATA: Record<FilterType, DashboardMockData> = {
  "Todos": {
    kpis: {
      receita: "R$ 142.500",
      receitaGrowth: "+15.2% em relação a abril",
      leads: "128",
      leadsGrowth: "+8% em relação a abril",
      eventos: "24",
      eventosDesc: "4 casamentos, 12 infantis, 8 corp.",
      conversao: "18.7%",
      conversaoGrowth: "+2.1% em relação a abril",
    },
    receita: [45, 60, 55, 80, 100, 142],
    metricas: { maiorMes: "Maio", crescimento: "+215%", ticketMedio: "R$ 22.400" },
    eventos: [
      { label: "Infantil", pct: "45%", width: "45%", color: "bg-blue-400" },
      { label: "Casamento", pct: "30%", width: "30%", color: "bg-pink-400" },
      { label: "Corporativo", pct: "15%", width: "15%", color: "bg-green-400" },
      { label: "Adulto", pct: "10%", width: "10%", color: "bg-purple-400" },
    ],
    insights: [
      "<span class='font-bold text-[var(--gold-400)]'>Maio</span> foi o mês com maior volume de fechamento de <span class='font-semibold'>Casamentos</span> no 1º semestre.",
      "A IA de atendimento respondeu e qualificou <span class='font-bold text-[var(--gold-400)]'>18 leads</span> fora do horário comercial esta semana.",
      "A procura por <span class='font-semibold'>Eventos Corporativos</span> cresceu <span class='font-bold text-green-400'>22%</span> após a última campanha no LinkedIn."
    ]
  },
  "Buffet": {
    kpis: {
      receita: "R$ 110.000",
      receitaGrowth: "+12.4% em relação a abril",
      leads: "85",
      leadsGrowth: "+5% em relação a abril",
      eventos: "18",
      eventosDesc: "8 corporativos, 6 casamentos, 4 infantis",
      conversao: "21.1%",
      conversaoGrowth: "+1.5% em relação a abril",
    },
    receita: [35, 45, 40, 65, 80, 110],
    metricas: { maiorMes: "Maio", crescimento: "+214%", ticketMedio: "R$ 15.000" },
    eventos: [
      { label: "Casamento", pct: "50%", width: "50%", color: "bg-pink-400" },
      { label: "Corporativo", pct: "25%", width: "25%", color: "bg-green-400" },
      { label: "Infantil", pct: "15%", width: "15%", color: "bg-blue-400" },
      { label: "Adulto", pct: "10%", width: "10%", color: "bg-purple-400" },
    ],
    insights: [
      "O cardápio <span class='font-bold text-[var(--gold-400)]'>Premium Diamond</span> foi o mais escolhido nos casamentos recentes.",
      "Identificamos que <span class='font-bold text-[var(--gold-400)]'>85%</span> dos leads de corporativo fecham apenas o serviço de Buffet.",
      "Ticket médio do Buffet subiu <span class='font-bold text-green-400'>12%</span> desde a última atualização do menu."
    ]
  },
  "Decoração": {
    kpis: {
      receita: "R$ 25.000",
      receitaGrowth: "+22.5% em relação a abril",
      leads: "42",
      leadsGrowth: "+15% em relação a abril",
      eventos: "12",
      eventosDesc: "8 casamentos, 4 infantis",
      conversao: "28.5%",
      conversaoGrowth: "+4.2% em relação a abril",
    },
    receita: [8, 12, 10, 15, 18, 25],
    metricas: { maiorMes: "Maio", crescimento: "+212%", ticketMedio: "R$ 5.500" },
    eventos: [
      { label: "Casamento", pct: "60%", width: "60%", color: "bg-pink-400" },
      { label: "Infantil", pct: "25%", width: "25%", color: "bg-blue-400" },
      { label: "Adulto", pct: "15%", width: "15%", color: "bg-purple-400" },
      { label: "Corporativo", pct: "0%", width: "0%", color: "bg-green-400" },
    ],
    insights: [
      "Projetos de <span class='font-bold text-[var(--gold-400)]'>Cenografia Floral</span> são o principal atrativo para os leads de Casamento.",
      "Maioria dos clientes de Festa Infantil estão contratando os pacotes de Decoração com Balões.",
      "Você poderia aumentar as vendas oferecendo um <span class='font-bold text-green-400'>Combo de Decoração + Buffet</span> para os Eventos Corporativos."
    ]
  },
  "Fotografia": {
    kpis: {
      receita: "R$ 7.500",
      receitaGrowth: "+50.0% em relação a abril",
      leads: "20",
      leadsGrowth: "-5% em relação a abril",
      eventos: "5",
      eventosDesc: "4 casamentos, 1 adulto",
      conversao: "25.0%",
      conversaoGrowth: "+10.0% em relação a abril",
    },
    receita: [2, 3, 5, 0, 2, 7],
    metricas: { maiorMes: "Maio", crescimento: "+250%", ticketMedio: "R$ 3.500" },
    eventos: [
      { label: "Casamento", pct: "80%", width: "80%", color: "bg-pink-400" },
      { label: "Adulto", pct: "20%", width: "20%", color: "bg-purple-400" },
      { label: "Infantil", pct: "0%", width: "0%", color: "bg-blue-400" },
      { label: "Corporativo", pct: "0%", width: "0%", color: "bg-green-400" },
    ],
    insights: [
      "A fotografia é vendida quase exclusivamente para <span class='font-bold text-[var(--gold-400)]'>Casamentos</span> (80% das vendas).",
      "O tempo médio de fechamento reduz em <span class='font-bold text-green-400'>15%</span> ao enviar o portfólio digital na primeira mensagem.",
      "Nenhum evento infantil contratou Fotografia este mês. Avalie revisar o material de divulgação."
    ]
  }
};

const filterOptions: FilterType[] = ["Todos", "Buffet", "Decoração", "Fotografia"];
const monthsLabels = ["Dez", "Jan", "Fev", "Mar", "Abr", "Mai"];

export default function DashboardAnalytics() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("Todos");
  
  const currentData = MOCK_DATA[activeFilter];
  const maxVal = 150; // Reference max value for chart heights

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto space-y-8 animate-fade-in-up overflow-y-auto h-full">
      {/* Header */}
      <header className="pt-2 lg:pt-0">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-blue-500/10 rounded-md">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Dashboard
              </h1>
            </div>
            <p className="text-sm italic text-[var(--gold-300)]">
              Métricas e Inteligência Comercial
            </p>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Atualizado: {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </header>

      {/* Service Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-default)] shadow-card overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider shrink-0 mr-2 px-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Visão Analítica:</span>
        </div>
        <div className="flex gap-2">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`
                px-4 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer whitespace-nowrap
                ${activeFilter === filter 
                  ? 'bg-[var(--gold-500)]/15 text-[var(--gold-300)] border-[var(--gold-500)]/30 shadow-[var(--shadow-gold-glow)]' 
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--gold-500)]/20 hover:text-[var(--text-primary)]'}
              `}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Metrics Section - NOW DYNAMIC */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Receita */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex flex-col gap-2 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Receita do mês</span>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--text-primary)] transition-all">{currentData.kpis.receita}</p>
            <p className={`text-xs flex items-center gap-1 mt-1 font-medium transition-colors ${currentData.kpis.receitaGrowth.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
              <ArrowUpRight className={`w-3 h-3 ${currentData.kpis.receitaGrowth.startsWith('-') ? 'rotate-90' : ''}`} /> 
              {currentData.kpis.receitaGrowth}
            </p>
          </div>
        </div>

        {/* Card 2: Leads */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex flex-col gap-2 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Leads do mês</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--text-primary)] transition-all">{currentData.kpis.leads}</p>
            <p className={`text-xs flex items-center gap-1 mt-1 font-medium transition-colors ${currentData.kpis.leadsGrowth.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
              <ArrowUpRight className={`w-3 h-3 ${currentData.kpis.leadsGrowth.startsWith('-') ? 'rotate-90' : ''}`} /> 
              {currentData.kpis.leadsGrowth}
            </p>
          </div>
        </div>

        {/* Card 3: Eventos */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex flex-col gap-2 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Eventos Fechados</span>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--text-primary)] transition-all">{currentData.kpis.eventos}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium transition-colors">
              {currentData.kpis.eventosDesc}
            </p>
          </div>
        </div>

        {/* Card 4: Taxa de Conversão */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex flex-col gap-2 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Taxa de Conversão</span>
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--text-primary)] transition-all">{currentData.kpis.conversao}</p>
            <p className={`text-xs flex items-center gap-1 mt-1 font-medium transition-colors ${currentData.kpis.conversaoGrowth.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
              <ArrowUpRight className={`w-3 h-3 ${currentData.kpis.conversaoGrowth.startsWith('-') ? 'rotate-90' : ''}`} /> 
              {currentData.kpis.conversaoGrowth}
            </p>
          </div>
        </div>
      </section>

      {/* AI Insights Section */}
      <section className="bg-gradient-to-r from-[var(--gold-600)]/10 via-[var(--bg-card)] to-[var(--bg-card)] p-5 rounded-xl border border-[var(--gold-500)]/20 shadow-[var(--shadow-gold-glow)] transition-all">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[var(--gold-400)] animate-pulse" />
          <h2 className="text-lg font-semibold text-[var(--gold-300)]">Insights da Inteligência Artificial</h2>
          <span className="ml-2 text-[10px] uppercase font-bold text-[var(--gold-500)] border border-[var(--gold-500)]/30 px-2 py-0.5 rounded-full">
            {activeFilter}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentData.insights.map((insight, idx) => (
            <div key={idx} className="bg-[var(--bg-primary)]/60 backdrop-blur-sm p-4 rounded-lg border border-[var(--border-subtle)] transition-all hover:border-[var(--gold-500)]/30 shadow-sm">
              <p 
                className="text-sm text-[var(--text-primary)] leading-relaxed" 
                dangerouslySetInnerHTML={{ __html: insight }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mock Chart 1: Evolução de Receita Mensal */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex flex-col transition-all relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--gold-400)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Evolução de Receita Mensal <span className="text-[var(--text-muted)] font-normal text-sm">({activeFilter})</span></h3>
            </div>
            {/* Secondary metrics */}
            <div className="flex gap-4 text-xs">
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)] uppercase font-bold text-[9px] tracking-wider">Maior Mês</span>
                <span className="text-[var(--text-primary)] font-bold">{currentData.metricas.maiorMes}</span>
              </div>
              <div className="w-px h-6 bg-[var(--border-subtle)]" />
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)] uppercase font-bold text-[9px] tracking-wider">Crescimento</span>
                <span className="text-emerald-400 font-bold">{currentData.metricas.crescimento}</span>
              </div>
              <div className="w-px h-6 bg-[var(--border-subtle)]" />
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)] uppercase font-bold text-[9px] tracking-wider">Ticket Médio</span>
                <span className="text-[var(--gold-300)] font-bold">{currentData.metricas.ticketMedio}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-4 h-56 px-4 pb-2 relative mt-4">
            {/* Premium SVG Line Overlay with proper viewBox */}
            <div className="absolute inset-0 px-8 pb-7 pt-4 pointer-events-none">
              <svg viewBox="0 -10 100 120" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {/* SVG definitions for gradient */}
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--gold-600)" stopOpacity="0.5"/>
                    <stop offset="100%" stopColor="var(--gold-300)" stopOpacity="1"/>
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <path 
                  d={generateSmoothPath(currentData.receita, 100, 100, maxVal)} 
                  vectorEffect="non-scaling-stroke"
                  fill="none" 
                  stroke="url(#lineGrad)" 
                  strokeWidth="3" 
                  filter="url(#glow)"
                  className="transition-all duration-700 ease-in-out"
                />
              </svg>
            </div>

            {/* Bars */}
            {currentData.receita.map((height, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full group relative z-10">
                {/* Visual tooltip */}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 text-[11px] font-bold text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] px-2 py-1 rounded shadow-lg z-20 whitespace-nowrap">
                  R$ {height}k
                </span>
                
                {/* Bar */}
                <div 
                  className={`w-full max-w-[48px] rounded-t-md transition-all duration-700 ease-out border-t border-[var(--border-subtle)]/30
                    ${i === 5 
                      ? 'bg-gradient-to-t from-[var(--gold-600)]/20 to-[var(--gold-400)]/40 border-t-[var(--gold-400)] shadow-[0_-4px_15px_rgba(212,169,55,0.15)]' 
                      : 'bg-[var(--bg-secondary)]/50 group-hover:bg-[var(--bg-secondary)]'
                    }`} 
                  style={{ height: `${(height / maxVal) * 100}%` }}
                />
                <span className={`text-xs font-medium transition-colors ${i === 5 ? 'text-[var(--gold-300)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}`}>
                  {monthsLabels[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mock Chart 2: Tipos de eventos */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex flex-col transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[var(--text-secondary)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Volume de Vendas</h3>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center gap-6">
            {currentData.eventos.map((evento, i) => (
              <div key={i} className="group">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[var(--text-primary)] font-medium group-hover:text-[var(--gold-300)] transition-colors">{evento.label}</span>
                  <span className="text-[var(--text-secondary)] font-mono font-bold">{evento.pct}</span>
                </div>
                <div className="w-full bg-[var(--bg-primary)] rounded-full h-2.5 overflow-hidden border border-[var(--border-subtle)]/20">
                  <div 
                    className={`${evento.color} h-2.5 rounded-full transition-all duration-700 ease-out`} 
                    style={{ width: evento.width }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
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

type FilterType = "Todos" | "Buffet" | "Decoração" | "Fotografia";

interface DbData {
  receitaMes: number;
  leadsNoMes: number;
  eventosFechados: number;
  eventosTotais: number;
  eventosPorTipo: Record<string, number>;
  receitaMesAnterior: number;
  leadsMesAnterior: number;
}

function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents);
}

function growthStr(current: number, previous: number, mesAnterior: string): string {
  if (previous === 0) return current > 0 ? "Novo dado este mês" : "Sem dados ainda";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}% em relação a ${mesAnterior}`;
}

const filterOptions: FilterType[] = ["Todos", "Buffet", "Decoração", "Fotografia"];
const monthsLabels = ["Dez", "Jan", "Fev", "Mar", "Abr", "Mai"];

export default function DashboardAnalytics() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("Todos");
  const [dbData, setDbData] = useState<DbData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((json) => { if (json.ok) setDbData(json.data); })
      .catch(() => {});
  }, []);

  const now = new Date();
  const mesAnteriorLabel = now.toLocaleDateString("pt-BR", { month: "long" });

  const kpis = {
    receita: dbData ? formatBRL(dbData.receitaMes) : "—",
    receitaGrowth: dbData ? growthStr(dbData.receitaMes, dbData.receitaMesAnterior, mesAnteriorLabel) : "Carregando...",
    leads: dbData ? String(dbData.leadsNoMes) : "—",
    leadsGrowth: dbData ? growthStr(dbData.leadsNoMes, dbData.leadsMesAnterior, mesAnteriorLabel) : "Carregando...",
    eventos: dbData ? String(dbData.eventosFechados) : "—",
    eventosDesc: dbData
      ? Object.entries(dbData.eventosPorTipo).slice(0, 3).map(([t, c]) => `${c} ${t.toLowerCase()}`).join(", ") || "Sem eventos"
      : "Carregando...",
    conversao: dbData && dbData.eventosTotais > 0
      ? `${((dbData.eventosFechados / dbData.eventosTotais) * 100).toFixed(1)}%`
      : "—",
    conversaoGrowth: dbData ? `${dbData.eventosFechados} fechados de ${dbData.eventosTotais} totais` : "Carregando...",
  };

  const eventTypeColors: Record<string, string> = {
    Casamento: "bg-pink-400", Infantil: "bg-blue-400",
    Corporativo: "bg-green-400", Adulto: "bg-purple-400",
  };

  const totalEventos = dbData ? Object.values(dbData.eventosPorTipo).reduce((s, v) => s + v, 0) : 0;
  const eventosBars = dbData
    ? Object.entries(dbData.eventosPorTipo)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([label, count]) => ({
          label,
          pct: totalEventos > 0 ? `${Math.round((count / totalEventos) * 100)}%` : "0%",
          width: totalEventos > 0 ? `${Math.round((count / totalEventos) * 100)}%` : "0%",
          color: eventTypeColors[label] ?? "bg-gray-400",
        }))
    : [];

  const maxVal = 10;

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
                Painel de Análises
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
            <p className="text-3xl font-bold text-[var(--text-primary)] transition-all">{kpis.receita}</p>
            <p className={`text-xs flex items-center gap-1 mt-1 font-medium transition-colors ${kpis.receitaGrowth.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
              <ArrowUpRight className={`w-3 h-3 ${kpis.receitaGrowth.startsWith('-') ? 'rotate-90' : ''}`} />
              {kpis.receitaGrowth}
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
            <p className="text-3xl font-bold text-[var(--text-primary)] transition-all">{kpis.leads}</p>
            <p className={`text-xs flex items-center gap-1 mt-1 font-medium transition-colors ${kpis.leadsGrowth.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
              <ArrowUpRight className={`w-3 h-3 ${kpis.leadsGrowth.startsWith('-') ? 'rotate-90' : ''}`} />
              {kpis.leadsGrowth}
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
            <p className="text-3xl font-bold text-[var(--text-primary)] transition-all">{kpis.eventos}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium transition-colors">
              {kpis.eventosDesc}
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
            <p className="text-3xl font-bold text-[var(--text-primary)] transition-all">{kpis.conversao}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium transition-colors">
              {kpis.conversaoGrowth}
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
          {dbData ? (
            <>
              <div className="bg-[var(--bg-primary)]/60 backdrop-blur-sm p-4 rounded-lg border border-[var(--border-subtle)] transition-all hover:border-[var(--gold-500)]/30 shadow-sm">
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                  Total de <span className="font-bold text-[var(--gold-400)]">{dbData.eventosTotais}</span> eventos cadastrados, com <span className="font-bold text-[var(--gold-400)]">{dbData.eventosFechados}</span> fechados até o momento.
                </p>
              </div>
              <div className="bg-[var(--bg-primary)]/60 backdrop-blur-sm p-4 rounded-lg border border-[var(--border-subtle)] transition-all hover:border-[var(--gold-500)]/30 shadow-sm">
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                  <span className="font-bold text-[var(--gold-400)]">{dbData.leadsNoMes}</span> novos clientes captados este mês. Mês anterior: <span className="font-semibold">{dbData.leadsMesAnterior}</span>.
                </p>
              </div>
              <div className="bg-[var(--bg-primary)]/60 backdrop-blur-sm p-4 rounded-lg border border-[var(--border-subtle)] transition-all hover:border-[var(--gold-500)]/30 shadow-sm">
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                  Receita este mês: <span className="font-bold text-[var(--gold-400)]">{formatBRL(dbData.receitaMes)}</span>. Mês anterior: <span className="font-semibold">{formatBRL(dbData.receitaMesAnterior)}</span>.
                </p>
              </div>
            </>
          ) : (
            <div className="col-span-3 text-center py-6 text-[var(--text-muted)] text-sm">Carregando insights...</div>
          )}
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
                <span className="text-[var(--text-muted)] uppercase font-bold text-[9px] tracking-wider">Receita Mês</span>
                <span className="text-[var(--text-primary)] font-bold">{dbData ? formatBRL(dbData.receitaMes) : "—"}</span>
              </div>
              <div className="w-px h-6 bg-[var(--border-subtle)]" />
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)] uppercase font-bold text-[9px] tracking-wider">Crescimento</span>
                <span className="text-emerald-400 font-bold">
                  {dbData && dbData.receitaMesAnterior > 0
                    ? `${(((dbData.receitaMes - dbData.receitaMesAnterior) / dbData.receitaMesAnterior) * 100).toFixed(1)}%`
                    : "—"}
                </span>
              </div>
              <div className="w-px h-6 bg-[var(--border-subtle)]" />
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)] uppercase font-bold text-[9px] tracking-wider">Ticket Médio</span>
                <span className="text-[var(--gold-300)] font-bold">
                  {dbData && dbData.eventosFechados > 0
                    ? formatBRL(Math.round(dbData.receitaMes / dbData.eventosFechados))
                    : "—"}
                </span>
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
                  d={generateSmoothPath([], 100, 100, maxVal)}
                  vectorEffect="non-scaling-stroke"
                  fill="none" 
                  stroke="url(#lineGrad)" 
                  strokeWidth="3" 
                  filter="url(#glow)"
                  className="transition-all duration-700 ease-in-out"
                />
              </svg>
            </div>

            {/* Bars — histórico mensal não disponível ainda */}
            {monthsLabels.map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full group relative z-10">
                <div
                  className="w-full max-w-[48px] rounded-t-md bg-[var(--bg-secondary)]/30 border-t border-[var(--border-subtle)]/20"
                  style={{ height: "8%" }}
                />
                <span className="text-xs font-medium text-[var(--text-muted)]">{label}</span>
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
            {eventosBars.length > 0 ? eventosBars.map((evento, i) => (
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
            )) : (
              <p className="text-center text-sm text-[var(--text-muted)] py-4">Sem eventos cadastrados</p>
            )}
          </div>
        </div>

      </section>
    </div>
  );
}
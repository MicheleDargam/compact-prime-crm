"use client";

import React from "react";
import { 
  TrendingUp, 
  Users, 
  CalendarCheck, 
  Target, 
  Sparkles,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight
} from "lucide-react";

export default function DashboardAnalytics() {
  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto space-y-8 animate-fade-in-up">
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

      {/* Metrics Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Receita do mês</span>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">R$ 142.500</p>
            <p className="text-xs text-green-400 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="w-3 h-3" /> +15.2% em relação a abril
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Leads do mês</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">128</p>
            <p className="text-xs text-green-400 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="w-3 h-3" /> +8% em relação a abril
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Eventos Fechados</span>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">24</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
              4 casamentos, 12 infantis, 8 corp.
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Taxa de Conversão</span>
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">18.7%</p>
            <p className="text-xs text-green-400 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="w-3 h-3" /> +2.1% em relação a abril
            </p>
          </div>
        </div>
      </section>

      {/* AI Insights Section */}
      <section className="bg-gradient-to-r from-[var(--gold-600)]/10 via-[var(--bg-card)] to-[var(--bg-card)] p-5 rounded-xl border border-[var(--gold-500)]/20 shadow-[var(--shadow-gold-glow)]">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[var(--gold-400)] animate-pulse" />
          <h2 className="text-lg font-semibold text-[var(--gold-300)]">Insights da Inteligência Artificial</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--bg-primary)]/50 p-4 rounded-lg border border-[var(--border-subtle)]">
            <p className="text-sm text-[var(--text-primary)]">
              <span className="font-bold text-[var(--gold-400)]">Maio</span> foi o mês com maior volume de fechamento de <span className="font-semibold">Casamentos</span> no 1º semestre.
            </p>
          </div>
          <div className="bg-[var(--bg-primary)]/50 p-4 rounded-lg border border-[var(--border-subtle)]">
            <p className="text-sm text-[var(--text-primary)]">
              A IA de atendimento automático respondeu e qualificou <span className="font-bold text-[var(--gold-400)]">18 leads</span> fora do horário comercial esta semana.
            </p>
          </div>
          <div className="bg-[var(--bg-primary)]/50 p-4 rounded-lg border border-[var(--border-subtle)]">
            <p className="text-sm text-[var(--text-primary)]">
              A procura por <span className="font-semibold">Eventos Corporativos</span> cresceu <span className="font-bold text-green-400">22%</span> após a última campanha no LinkedIn.
            </p>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Mock Chart 1: Receita Mensal */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-[var(--text-secondary)]" />
            <h3 className="font-semibold text-[var(--text-primary)]">Evolução de Receita Mensal</h3>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 h-48 px-2 pb-2">
            {[45, 60, 55, 80, 100, 142].map((height, i) => {
              const months = ["Dez", "Jan", "Fev", "Mar", "Abr", "Mai"];
              return (
                <div key={i} className="flex flex-col items-center gap-2 w-full group">
                  {/* Tooltip mock */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium text-[var(--text-secondary)] bg-[var(--bg-primary)] px-2 py-1 rounded">
                    R$ {height}k
                  </span>
                  {/* Bar */}
                  <div 
                    className={`w-full max-w-[40px] rounded-t-sm transition-all duration-500 ease-out ${i === 5 ? 'bg-[var(--gold-400)] shadow-[var(--shadow-gold-glow)]' : 'bg-blue-500/40 group-hover:bg-blue-500/60'}`} 
                    style={{ height: `${(height / 150) * 100}%` }}
                  />
                  <span className="text-xs text-[var(--text-muted)]">{months[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mock Chart 2: Tipos de eventos */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-[var(--text-secondary)]" />
            <h3 className="font-semibold text-[var(--text-primary)]">Tipos de Eventos Mais Vendidos</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center gap-5">
            {/* Row 1 */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[var(--text-primary)] font-medium">Infantil</span>
                <span className="text-[var(--text-secondary)]">45%</span>
              </div>
              <div className="w-full bg-[var(--bg-primary)] rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: "45%" }}></div>
              </div>
            </div>
            
            {/* Row 2 */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[var(--text-primary)] font-medium">Casamento</span>
                <span className="text-[var(--text-secondary)]">30%</span>
              </div>
              <div className="w-full bg-[var(--bg-primary)] rounded-full h-2">
                <div className="bg-pink-400 h-2 rounded-full" style={{ width: "30%" }}></div>
              </div>
            </div>

            {/* Row 3 */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[var(--text-primary)] font-medium">Corporativo</span>
                <span className="text-[var(--text-secondary)]">15%</span>
              </div>
              <div className="w-full bg-[var(--bg-primary)] rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: "15%" }}></div>
              </div>
            </div>

            {/* Row 4 */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[var(--text-primary)] font-medium">Adulto</span>
                <span className="text-[var(--text-secondary)]">10%</span>
              </div>
              <div className="w-full bg-[var(--bg-primary)] rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: "10%" }}></div>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
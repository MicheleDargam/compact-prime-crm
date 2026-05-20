"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Coins, 
  Percent, 
  Target,
  FileText,
  UserCheck,
  ChevronRight,
  ArrowUpRight,
  PieChart,
  HelpCircle,
  Sparkles,
  Info
} from "lucide-react";

// Types
type PayoutStatus = "Pago" | "Parcial" | "Pendente";

interface PartnerPayout {
  id: string;
  name: string;
  avatar: string;
  sharePercent: number;
  expectedValue: number;
  withdrawnValue: number;
  status: PayoutStatus;
}

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  reserveValue: number;
  partners: PartnerPayout[];
  categories: { name: string; value: number; color: string }[];
  reserveGoal: { current: number; target: number; objective: string; notes: string };
}

// Mock Data for different months
const mockMonthlyData: Record<string, MonthlyData> = {
  "Maio 2026": {
    month: "Maio 2026",
    revenue: 80000,
    expenses: 42000,
    netProfit: 38000,
    reserveValue: 8000, // R$ 38.000 lucro - R$ 30.000 distribuído (10k cada) = R$ 8.000 reserva
    partners: [
      { id: "s1", name: "Clara Silva", avatar: "CS", sharePercent: 33.3, expectedValue: 10000, withdrawnValue: 10000, status: "Pago" },
      { id: "s2", name: "Beatriz Santos", avatar: "BS", sharePercent: 33.3, expectedValue: 10000, withdrawnValue: 5000, status: "Parcial" },
      { id: "s3", name: "Alice Moreira", avatar: "AM", sharePercent: 33.3, expectedValue: 10000, withdrawnValue: 0, status: "Pendente" },
    ],
    categories: [
      { name: "Fornecedores", value: 15000, color: "var(--gold-300)" },
      { name: "Funcionários", value: 12000, color: "var(--gold-400)" },
      { name: "Insumos", value: 6000, color: "var(--gold-500)" },
      { name: "Decoração", value: 4000, color: "var(--gold-600)" },
      { name: "Fotografia", value: 3000, color: "#d97706" },
      { name: "Operacional", value: 2000, color: "#b45309" },
    ],
    reserveGoal: {
      current: 34500,
      target: 50000,
      objective: "Fundo de Expansão e Capital de Giro",
      notes: "Destinado à aquisição de novos equipamentos de som e iluminação para eventos de grande porte no segundo semestre, além de manter o capital de giro operacional."
    }
  },
  "Abril 2026": {
    month: "Abril 2026",
    revenue: 90000,
    expenses: 48000,
    netProfit: 42000,
    reserveValue: 12000, // R$ 42.000 lucro - R$ 30.000 distribuído (10k cada) = R$ 12.000 reserva
    partners: [
      { id: "s1", name: "Clara Silva", avatar: "CS", sharePercent: 33.3, expectedValue: 10000, withdrawnValue: 10000, status: "Pago" },
      { id: "s2", name: "Beatriz Santos", avatar: "BS", sharePercent: 33.3, expectedValue: 10000, withdrawnValue: 10000, status: "Pago" },
      { id: "s3", name: "Alice Moreira", avatar: "AM", sharePercent: 33.3, expectedValue: 10000, withdrawnValue: 10000, status: "Pago" },
    ],
    categories: [
      { name: "Fornecedores", value: 18000, color: "var(--gold-300)" },
      { name: "Funcionários", value: 13500, color: "var(--gold-400)" },
      { name: "Insumos", value: 7000, color: "var(--gold-500)" },
      { name: "Decoração", value: 4500, color: "var(--gold-600)" },
      { name: "Fotografia", value: 3000, color: "#d97706" },
      { name: "Operacional", value: 2000, color: "#b45309" },
    ],
    reserveGoal: {
      current: 26500,
      target: 50000,
      objective: "Reserva Operacional e Contingência",
      notes: "Reserva prioritária para cobrir custos fixos da empresa durante a baixa temporada de eventos no início de inverno."
    }
  },
  "Março 2026": {
    month: "Março 2026",
    revenue: 75000,
    expenses: 39000,
    netProfit: 36000,
    reserveValue: 9000, // R$ 36.000 lucro - R$ 27.000 distribuído (9k cada) = R$ 9.000 reserva
    partners: [
      { id: "s1", name: "Clara Silva", avatar: "CS", sharePercent: 33.3, expectedValue: 9000, withdrawnValue: 9000, status: "Pago" },
      { id: "s2", name: "Beatriz Santos", avatar: "BS", sharePercent: 33.3, expectedValue: 9000, withdrawnValue: 9000, status: "Pago" },
      { id: "s3", name: "Alice Moreira", avatar: "AM", sharePercent: 33.3, expectedValue: 9000, withdrawnValue: 4500, status: "Parcial" },
    ],
    categories: [
      { name: "Fornecedores", value: 14000, color: "var(--gold-300)" },
      { name: "Funcionários", value: 12000, color: "var(--gold-400)" },
      { name: "Insumos", value: 5500, color: "var(--gold-500)" },
      { name: "Decoração", value: 3500, color: "var(--gold-600)" },
      { name: "Fotografia", value: 2500, color: "#d97706" },
      { name: "Operacional", value: 1500, color: "#b45309" },
    ],
    reserveGoal: {
      current: 17500,
      target: 50000,
      objective: "Aquisição de Mobiliário Premium",
      notes: "Poupando para compra de novas mesas espelhadas e cadeiras medalhão sob medida para casamentos."
    }
  }
};

const statusStyles: Record<PayoutStatus, { text: string; bg: string; border: string; icon: React.ReactNode }> = {
  Pago: {
    text: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
  },
  Parcial: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: <Clock className="w-3.5 h-3.5 mr-1" />
  },
  Pendente: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: <AlertCircle className="w-3.5 h-3.5 mr-1" />
  }
};

export default function SociasCaixaPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("Maio 2026");
  const [activeData, setActiveData] = useState<MonthlyData>(mockMonthlyData["Maio 2026"]);
  
  // Interactive Modal/Simulation State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerPayout | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [simulationLogs, setSimulationLogs] = useState<string[]>([
    "Painel carregado com dados do CRM Compact Prime.",
    "Lógica híbrida de fechamento operacional ativada."
  ]);

  // Handle month selection change
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setActiveData(mockMonthlyData[month]);
    setSimulationLogs(prev => [
      `Alterado visualização para o mês de ${month}.`,
      ...prev
    ]);
  };

  // Open withdrawal dialog
  const openWithdrawal = (partner: PartnerPayout) => {
    setSelectedPartner(partner);
    setWithdrawAmount((partner.expectedValue - partner.withdrawnValue).toString());
    setShowPayoutModal(true);
  };

  // Confirm mock withdrawal
  const confirmWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;

    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const newWithdrawn = selectedPartner.withdrawnValue + amountNum;
    let newStatus: PayoutStatus = "Pago";
    if (newWithdrawn < selectedPartner.expectedValue) {
      newStatus = "Parcial";
    } else if (newWithdrawn === 0) {
      newStatus = "Pendente";
    }

    // Update active state in-memory (simulated)
    const updatedPartners = activeData.partners.map(p => {
      if (p.id === selectedPartner.id) {
        return {
          ...p,
          withdrawnValue: Math.min(newWithdrawn, p.expectedValue),
          status: newStatus
        };
      }
      return p;
    });

    setActiveData({
      ...activeData,
      partners: updatedPartners
    });

    // Add log
    setSimulationLogs(prev => [
      `Simulação: Retirada de R$ ${amountNum.toLocaleString("pt-BR")} registrada para ${selectedPartner.name}. Status: ${newStatus}.`,
      ...prev
    ]);

    setShowPayoutModal(false);
    setSelectedPartner(null);
  };

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] p-4 md:p-8 animate-fade-in-up overflow-y-auto">
      {/* Header section with month selectors */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--gold-300)] tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Módulo de Distribuição</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mt-1">Sócias & Caixa</h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)] mt-0.5">Distribuição mensal e reserva da empresa</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Custom Select Box */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="appearance-none bg-[var(--bg-card)] text-sm font-medium text-[var(--text-primary)] px-4 py-2.5 pr-10 rounded-xl border border-[var(--border-default)] focus:outline-none focus:border-[var(--gold-400)] transition-all cursor-pointer shadow-card"
            >
              <option value="Maio 2026">Maio 2026</option>
              <option value="Abril 2026">Abril 2026</option>
              <option value="Março 2026">Março 2026</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[var(--text-muted)]">
              <Coins className="w-4 h-4 text-[var(--gold-300)]" />
            </div>
          </div>

          <button 
            onClick={() => setSimulationLogs(prev => ["Relatório gerado (Visual Simulado)", ...prev])}
            className="flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-medium bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] hover:border-[var(--gold-500)]/30 rounded-xl transition-all cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-card"
          >
            <Download className="w-4 h-4 text-[var(--gold-300)]" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
        </div>
      </header>

      {/* Info Warning banner indicating hybrid and secondary nature */}
      <div className="bg-gradient-to-r from-[var(--gold-500)]/5 to-[var(--gold-300)]/5 border border-[var(--gold-500)]/20 p-4 rounded-xl mb-8 flex gap-3.5 items-start">
        <Info className="w-5 h-5 text-[var(--gold-300)] shrink-0 mt-0.5" />
        <div className="text-xs md:text-sm text-[var(--text-secondary)]">
          <strong className="text-[var(--gold-300)] font-medium">Nota Financeira:</strong> Este painel atua como ferramenta auxiliar para acompanhamento da reserva em caixa e repasses mensais combinados. Os pagamentos são controlados manualmente pelas sócias e os dados aqui demonstrados são organizados e registrados de forma informativa, complementando a contabilidade oficial.
        </div>
      </div>

      {/* Summary metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1 */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--gold-300)]/20 to-[var(--gold-500)]/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-[var(--gold-500)]/10 rounded-lg text-[var(--gold-300)] group-hover:scale-105 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Receita do Mês</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{formatCurrency(activeData.revenue)}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-red-500/10 rounded-lg text-red-400 group-hover:scale-105 transition-transform">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Despesas do Mês</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{formatCurrency(activeData.expenses)}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-105 transition-transform">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Lucro Disponível</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">{formatCurrency(activeData.netProfit)}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--gold-300)] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-[var(--gold-300)]/10 rounded-lg text-[var(--gold-300)] group-hover:scale-105 transition-transform animate-pulse-gold">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Reserva em Caixa</p>
            <p className="text-2xl font-bold text-[var(--gold-300)] mt-0.5">{formatCurrency(activeData.reserveValue)}</p>
          </div>
        </div>
      </div>

      {/* Main Sections: Payout details */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Distribuição do Mês</h2>
            <span className="text-xs bg-[var(--gold-500)]/10 text-[var(--gold-300)] px-2 py-0.5 rounded-full border border-[var(--gold-500)]/20">
              Divisão Proporcional
            </span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            Total Distribuído: {formatCurrency(activeData.netProfit - activeData.reserveValue)}
          </span>
        </div>

        {/* 3 Partners Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeData.partners.map((partner) => {
            const progress = (partner.withdrawnValue / partner.expectedValue) * 100;
            const statusConfig = statusStyles[partner.status];
            
            return (
              <div 
                key={partner.id} 
                className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5 hover:border-[var(--gold-500)]/20 transition-all flex flex-col justify-between"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* Header card: Avatar + Info */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold-300)]/20 to-[var(--gold-600)]/40 flex items-center justify-center border border-[var(--gold-400)]/30 font-bold text-sm text-[var(--gold-300)]">
                        {partner.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">{partner.name}</h3>
                        <p className="text-xs text-[var(--text-muted)]">Cota de {partner.sharePercent}%</p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                      {statusConfig.icon}
                      {partner.status}
                    </span>
                  </div>

                  {/* Values details */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[var(--text-secondary)]">Valor Previsto</span>
                      <span className="font-medium text-[var(--text-primary)]">{formatCurrency(partner.expectedValue)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[var(--text-secondary)]">Valor Retirado</span>
                      <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(partner.withdrawnValue)}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="pt-2">
                      <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] mb-1">
                        <span>Progresso da retirada</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 rounded-full ${
                            partner.status === "Pago" ? "bg-emerald-500" :
                            partner.status === "Parcial" ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated action buttons */}
                <div className="flex gap-2 border-t border-[var(--border-subtle)] pt-4 mt-2">
                  <button 
                    disabled={partner.status === "Pago"}
                    onClick={() => openWithdrawal(partner)}
                    className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      partner.status === "Pago" 
                        ? "bg-transparent text-[var(--text-muted)] border border-[var(--border-subtle)] cursor-not-allowed" 
                        : "bg-[var(--gold-500)]/10 hover:bg-[var(--gold-500)]/20 text-[var(--gold-400)] border border-[var(--gold-500)]/20 hover:border-[var(--gold-400)]/40 cursor-pointer"
                    }`}
                  >
                    Registrar Retirada
                  </button>
                  <button 
                    onClick={() => setSimulationLogs(prev => [`Simulação: Recibo visual da sócia ${partner.name} visualizado.`, ...prev])}
                    className="py-2 px-2.5 rounded-lg border border-[var(--border-default)] hover:border-[var(--gold-500)]/30 bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                    title="Ver Recibo"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Grid: Company cash details + Expenses Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Company cash reserve details */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Caixa da Empresa (Reserva)</h2>
          
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 flex flex-col justify-between h-full shadow-card">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--gold-500)]/10 flex items-center justify-center text-[var(--gold-300)]">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[var(--text-primary)]">Objetivo da Reserva</h3>
                    <p className="text-xs text-[var(--gold-300)] font-medium">{activeData.reserveGoal.objective}</p>
                  </div>
                </div>
                
                {/* Meta details badge */}
                <div className="text-right">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Meta Planejada</p>
                  <p className="text-xs font-bold text-[var(--text-primary)]">{formatCurrency(activeData.reserveGoal.target)}</p>
                </div>
              </div>

              {/* Progress to target */}
              <div className="mb-6 bg-[var(--bg-primary)] border border-[var(--border-subtle)] p-4 rounded-xl">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-[var(--text-secondary)]">Progresso da Reserva</span>
                  <span className="font-bold text-[var(--gold-300)]">
                    {((activeData.reserveGoal.current / activeData.reserveGoal.target) * 100).toFixed(1)}% atingido
                  </span>
                </div>
                
                {/* Custom dual meter bar */}
                <div className="relative w-full h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  {/* Current progress */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-200)] rounded-full"
                    style={{ width: `${(activeData.reserveGoal.current / activeData.reserveGoal.target) * 100}%` }}
                  />
                  {/* Simulating this month's addition */}
                  <div 
                    className="absolute top-0 h-full bg-emerald-500/50"
                    style={{ 
                      left: `${(activeData.reserveGoal.current / activeData.reserveGoal.target) * 100}%`,
                      width: `${(activeData.reserveValue / activeData.reserveGoal.target) * 100}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] mt-2">
                  <span>Atual: {formatCurrency(activeData.reserveGoal.current)}</span>
                  <span className="text-emerald-400 font-medium">+ {formatCurrency(activeData.reserveValue)} este mês</span>
                </div>
              </div>

              {/* Remarks/Observations */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Observações</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-subtle)]">
                  "{activeData.reserveGoal.notes}"
                </p>
              </div>
            </div>

            {/* Quick Actions (Visual mock) */}
            <div className="border-t border-[var(--border-subtle)] pt-4 mt-2 flex gap-3">
              <button 
                onClick={() => setSimulationLogs(prev => ["Simulação: Histórico de investimentos da reserva visualizado.", ...prev])}
                className="flex-1 py-2 text-center text-xs font-medium border border-[var(--border-default)] hover:border-[var(--gold-500)]/30 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              >
                Histórico do Caixa
              </button>
              <button 
                onClick={() => setSimulationLogs(prev => ["Simulação: Modal de ajuste de objetivo visualizado.", ...prev])}
                className="flex-1 py-2 text-center text-xs font-medium bg-[var(--gold-500)]/10 hover:bg-[var(--gold-500)]/20 border border-[var(--gold-500)]/20 text-[var(--gold-400)] rounded-lg transition-all cursor-pointer"
              >
                Ajustar Objetivo
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Expenses breakdown */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Gastos por Categoria</h2>
          
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 shadow-card flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-[var(--text-secondary)] font-medium">Breakdown das despesas do mês selecionado</p>
                <div className="flex items-center gap-1.5 text-xs text-[var(--gold-300)] font-semibold">
                  <PieChart className="w-3.5 h-3.5" />
                  <span>Total: {formatCurrency(activeData.expenses)}</span>
                </div>
              </div>

              {/* Progress graph list of categories */}
              <div className="space-y-4">
                {activeData.categories.map((cat, idx) => {
                  const percentage = (cat.value / activeData.expenses) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </span>
                        <div className="text-right">
                          <span className="font-semibold text-[var(--text-primary)] mr-2">{formatCurrency(cat.value)}</span>
                          <span className="text-[var(--text-muted)] text-[10px]">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      {/* Bar indicator */}
                      <div className="w-full h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-700"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: cat.color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulated report log preview to look active & live */}
            <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-2 uppercase tracking-wider font-semibold">
                <span>Histórico de Simulações do Painel</span>
                <span className="text-[var(--gold-300)] animate-pulse">● online</span>
              </div>
              <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-subtle)] text-[10px] font-mono h-24 overflow-y-auto space-y-1 scrollbar-thin text-[var(--text-secondary)]">
                {simulationLogs.map((log, i) => (
                  <div key={i} className="flex gap-1.5 items-start">
                    <span className="text-[var(--gold-400)] shrink-0">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MOCKUP INTERACTIVE MODAL (REGISTER WITHDRAWAL) */}
      {showPayoutModal && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[var(--gold-300)]" />
                <h3 className="font-bold text-[var(--text-primary)]">Registrar Retirada</h3>
              </div>
              <button 
                onClick={() => setShowPayoutModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={confirmWithdrawal} className="p-6 space-y-4">
              <div className="bg-[var(--bg-primary)] p-3.5 rounded-lg border border-[var(--border-subtle)]">
                <p className="text-xs text-[var(--text-muted)]">Sócia Beneficiária</p>
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{selectedPartner.name}</p>
                <div className="grid grid-cols-2 gap-4 mt-2.5 pt-2 border-t border-[var(--border-subtle)] text-xs">
                  <div>
                    <span className="text-[var(--text-muted)]">Total Previsto:</span>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{formatCurrency(selectedPartner.expectedValue)}</p>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Já Retirado:</span>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{formatCurrency(selectedPartner.withdrawnValue)}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Valor da Retirada (R$)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs text-[var(--text-muted)] font-mono">
                    R$
                  </div>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    max={selectedPartner.expectedValue - selectedPartner.withdrawnValue}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] font-mono"
                    placeholder="0,00"
                  />
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1.5">
                  Máximo disponível para retirada: {formatCurrency(selectedPartner.expectedValue - selectedPartner.withdrawnValue)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 py-2.5 border border-[var(--border-default)] hover:border-red-500/20 hover:bg-red-500/5 text-[var(--text-secondary)] hover:text-red-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-300)] hover:from-[var(--gold-600)] hover:to-[var(--gold-400)] text-black rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Confirmar Repasse (PIX)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

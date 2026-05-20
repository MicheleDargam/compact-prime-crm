"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Coins,
  PiggyBank,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Target,
  FileText,
  PieChart,
  Sparkles,
  Info,
  X,
  FileDown,
  ShieldCheck,
  Printer,
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
  reserveGoal: { current: number; target: number; objective: string };
}

const mockMonthlyData: Record<string, MonthlyData> = {
  "Maio 2026": {
    month: "Maio 2026",
    revenue: 80000,
    expenses: 42000,
    netProfit: 38000,
    reserveValue: 8000,
    partners: [
      { id: "s1", name: "Clara Silva", avatar: "CS", sharePercent: 33.3, expectedValue: 10000, withdrawnValue: 10000, status: "Pago" },
      { id: "s2", name: "Beatriz Santos", avatar: "BS", sharePercent: 33.3, expectedValue: 10000, withdrawnValue: 5000, status: "Parcial" },
      { id: "s3", name: "Alice Moreira", avatar: "AM", sharePercent: 33.3, expectedValue: 10000, withdrawnValue: 0, status: "Pendente" },
    ],
    categories: [
      { name: "Fornecedores", value: 15000, color: "var(--gold-300)" },
      { name: "Funcionários", value: 12000, color: "var(--gold-400)" },
      { name: "Insumos", value: 7000, color: "var(--gold-500)" },
      { name: "Operacional", value: 5000, color: "#d97706" },
      { name: "Equipamentos", value: 3000, color: "#b45309" },
    ],
    reserveGoal: {
      current: 34500,
      target: 50000,
      objective: "Fundo de Expansão e Capital de Giro",
    }
  },
  "Abril 2026": {
    month: "Abril 2026",
    revenue: 90000,
    expenses: 48000,
    netProfit: 42000,
    reserveValue: 12000,
    partners: [
      { id: "s1", name: "Clara Silva", avatar: "CS", sharePercent: 33.3, expectedValue: 10000, withdrawnValue: 10000, status: "Pago" },
      { id: "s2", name: "Beatriz Santos", avatar: "BS", sharePercent: 33.3, expectedValue: 10000, withdrawnValue: 10000, status: "Pago" },
      { id: "s3", name: "Alice Moreira", avatar: "AM", sharePercent: 33.3, expectedValue: 10000, withdrawnValue: 10000, status: "Pago" },
    ],
    categories: [
      { name: "Fornecedores", value: 18000, color: "var(--gold-300)" },
      { name: "Funcionários", value: 13500, color: "var(--gold-400)" },
      { name: "Insumos", value: 8000, color: "var(--gold-500)" },
      { name: "Operacional", value: 5000, color: "#d97706" },
      { name: "Equipamentos", value: 3500, color: "#b45309" },
    ],
    reserveGoal: {
      current: 26500,
      target: 50000,
      objective: "Reserva Operacional e Contingência",
    }
  },
  "Março 2026": {
    month: "Março 2026",
    revenue: 75000,
    expenses: 39000,
    netProfit: 36000,
    reserveValue: 9000,
    partners: [
      { id: "s1", name: "Clara Silva", avatar: "CS", sharePercent: 33.3, expectedValue: 9000, withdrawnValue: 9000, status: "Pago" },
      { id: "s2", name: "Beatriz Santos", avatar: "BS", sharePercent: 33.3, expectedValue: 9000, withdrawnValue: 9000, status: "Pago" },
      { id: "s3", name: "Alice Moreira", avatar: "AM", sharePercent: 33.3, expectedValue: 9000, withdrawnValue: 4500, status: "Parcial" },
    ],
    categories: [
      { name: "Fornecedores", value: 14000, color: "var(--gold-300)" },
      { name: "Funcionários", value: 12000, color: "var(--gold-400)" },
      { name: "Insumos", value: 7000, color: "var(--gold-500)" },
      { name: "Operacional", value: 4000, color: "#d97706" },
      { name: "Equipamentos", value: 2000, color: "#b45309" },
    ],
    reserveGoal: {
      current: 17500,
      target: 50000,
      objective: "Aquisição de Mobiliário Premium",
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

export default function DistribuicaoBuffetPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("Maio 2026");
  const [activeData, setActiveData] = useState<MonthlyData>(mockMonthlyData["Maio 2026"]);

  // Withdrawal modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerPayout | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");

  // Receipt modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptPartner, setReceiptPartner] = useState<PartnerPayout | null>(null);

  // PDF modal
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const showToastFeedback = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3200);
  };

  // Movement log
  const [movementLogs, setMovementLogs] = useState<string[]>([
    "[RET] Retirada registrada — Clara Silva — R$ 10.000,00",
    "[DOC] Comprovante gerado — Beatriz Santos",
    "[CAI] Reserva atualizada — +R$ 8.000,00",
    "[REL] Relatório mensal exportado — Abril 2026",
    "[CAI] Meta da reserva definida — R$ 50.000,00",
    "[SIS] Painel carregado — Buffet Compact Prime.",
  ]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setActiveData(mockMonthlyData[month]);
    setMovementLogs(prev => [`Visualização alterada para ${month}.`, ...prev]);
  };

  const openWithdrawal = (partner: PartnerPayout) => {
    setSelectedPartner(partner);
    setWithdrawAmount((partner.expectedValue - partner.withdrawnValue).toString());
    setShowPayoutModal(true);
  };

  const openReceipt = (partner: PartnerPayout) => {
    setReceiptPartner(partner);
    setShowReceiptModal(true);
    setMovementLogs(prev => [`[DOC] Comprovante visualizado — ${partner.name}.`, ...prev]);
  };

  const handleReceiptPrint = (partner: PartnerPayout) => {
    showToastFeedback("Comprovante preparado para impressão.");
    setMovementLogs(prev => [`[IMP] Impressão solicitada — ${partner.name}.`, ...prev]);
  };

  const handleReceiptPdf = (partner: PartnerPayout) => {
    showToastFeedback("PDF do comprovante gerado visualmente.");
    setMovementLogs(prev => [`[PDF] Comprovante PDF gerado — ${partner.name} — ${formatCurrency(partner.withdrawnValue)}.`, ...prev]);
  };

  const confirmWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const newWithdrawn = Math.min(selectedPartner.withdrawnValue + amountNum, selectedPartner.expectedValue);
    const newStatus: PayoutStatus = newWithdrawn >= selectedPartner.expectedValue ? "Pago" : "Parcial";

    setActiveData(prev => ({
      ...prev,
      partners: prev.partners.map(p =>
        p.id === selectedPartner.id ? { ...p, withdrawnValue: newWithdrawn, status: newStatus } : p
      )
    }));
    setMovementLogs(prev => [
      `Retirada de ${formatCurrency(amountNum)} registrada para ${selectedPartner.name}. Status: ${newStatus}.`,
      ...prev
    ]);
    setShowPayoutModal(false);
    setSelectedPartner(null);
  };

  const handleExportPdf = () => {
    setShowPdfModal(true);
    setMovementLogs(prev => [`Relatório PDF do mês ${selectedMonth} gerado.`, ...prev]);
  };

  const handlePdfDownload = () => {
    setPdfDownloading(true);
    setTimeout(() => {
      setPdfDownloading(false);
      setShowPdfModal(false);
    }, 1500);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] p-4 md:p-8 animate-fade-in-up overflow-y-auto">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--gold-300)] tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Módulo de Distribuição — Buffet</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mt-1">Distribuição Buffet</h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)] mt-0.5">Distribuição mensal de lucro e reserva do Buffet Compact Prime</p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
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
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Coins className="w-4 h-4 text-[var(--gold-300)]" />
            </div>
          </div>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-medium bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] hover:border-[var(--gold-500)]/30 rounded-xl transition-all cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-card"
          >
            <Download className="w-4 h-4 text-[var(--gold-300)]" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
        </div>
      </header>

      {/* Info banner */}
      <div className="bg-gradient-to-r from-[var(--gold-500)]/5 to-[var(--gold-300)]/5 border border-[var(--gold-500)]/20 p-4 rounded-xl mb-8 flex gap-3.5 items-start">
        <Info className="w-5 h-5 text-[var(--gold-300)] shrink-0 mt-0.5" />
        <div className="text-xs md:text-sm text-[var(--text-secondary)]">
          <strong className="text-[var(--gold-300)] font-medium">Nota Financeira:</strong> Este painel registra exclusivamente os dados do serviço de <strong className="text-[var(--text-primary)]">Buffet</strong>. Os pagamentos são controlados manualmente pelas sócias e os valores demonstrados são organizados de forma informativa, complementando a contabilidade oficial.
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden transition-all">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--gold-300)]/20 to-[var(--gold-500)]/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-[var(--gold-500)]/10 rounded-lg text-[var(--gold-300)] group-hover:scale-105 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Receita do Mês</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{formatCurrency(activeData.revenue)}</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden transition-all">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-red-500/10 rounded-lg text-red-400 group-hover:scale-105 transition-transform">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Despesas do Mês</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{formatCurrency(activeData.expenses)}</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden transition-all">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-105 transition-transform">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Lucro Disponível</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">{formatCurrency(activeData.netProfit)}</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden transition-all">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--gold-300)] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-[var(--gold-300)]/10 rounded-lg text-[var(--gold-300)] group-hover:scale-105 transition-transform">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Reserva em Caixa</p>
            <p className="text-2xl font-bold text-[var(--gold-300)] mt-0.5">{formatCurrency(activeData.reserveValue)}</p>
          </div>
        </div>
      </div>

      {/* Partners Distribution */}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeData.partners.map((partner) => {
            const progress = partner.expectedValue > 0 ? (partner.withdrawnValue / partner.expectedValue) * 100 : 0;
            const statusConfig = statusStyles[partner.status];
            return (
              <div
                key={partner.id}
                className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5 hover:border-[var(--gold-500)]/20 transition-all flex flex-col justify-between"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
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
                      {statusConfig.icon}{partner.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[var(--text-secondary)]">Valor Previsto</span>
                      <span className="font-medium text-[var(--text-primary)]">{formatCurrency(partner.expectedValue)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[var(--text-secondary)]">Valor Retirado</span>
                      <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(partner.withdrawnValue)}</span>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] mb-1">
                        <span>Progresso da retirada</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${partner.status === "Pago" ? "bg-emerald-500" : partner.status === "Parcial" ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-[var(--border-subtle)] pt-4 mt-2">
                  <button
                    disabled={partner.status === "Pago"}
                    onClick={() => openWithdrawal(partner)}
                    className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-medium transition-all ${partner.status === "Pago" ? "bg-transparent text-[var(--text-muted)] border border-[var(--border-subtle)] cursor-not-allowed" : "bg-[var(--gold-500)]/10 hover:bg-[var(--gold-500)]/20 text-[var(--gold-400)] border border-[var(--gold-500)]/20 hover:border-[var(--gold-400)]/40 cursor-pointer"}`}
                  >
                    Registrar Retirada
                  </button>
                  <button
                    onClick={() => openReceipt(partner)}
                    className="py-2 px-2.5 rounded-lg border border-[var(--border-default)] hover:border-[var(--gold-500)]/30 bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                    title="Comprovante da retirada"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Grid: Reserve + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left: Company Reserve */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Caixa da Empresa (Reserva)</h2>

          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 shadow-card">
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
              <div className="text-right">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Meta Planejada</p>
                <p className="text-xs font-bold text-[var(--text-primary)]">{formatCurrency(activeData.reserveGoal.target)}</p>
              </div>
            </div>

            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] p-4 rounded-xl">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-[var(--text-secondary)]">Progresso da Reserva</span>
                <span className="font-bold text-[var(--gold-300)]">
                  {((activeData.reserveGoal.current / activeData.reserveGoal.target) * 100).toFixed(1)}% atingido
                </span>
              </div>
              <div className="relative w-full h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-200)] rounded-full"
                  style={{ width: `${(activeData.reserveGoal.current / activeData.reserveGoal.target) * 100}%` }}
                />
                <div
                  className="absolute top-0 h-full bg-emerald-500/50"
                  style={{
                    left: `${(activeData.reserveGoal.current / activeData.reserveGoal.target) * 100}%`,
                    width: `${(activeData.reserveValue / activeData.reserveGoal.target) * 100}%`
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] mt-2">
                <span>Valor atual: {formatCurrency(activeData.reserveGoal.current)}</span>
                <span className="text-emerald-400 font-medium">+ {formatCurrency(activeData.reserveValue)} este mês</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Expense Categories */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Gastos por Categoria — Buffet</h2>

          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 shadow-card flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-[var(--text-secondary)] font-medium">Despesas do mês selecionado</p>
                <div className="flex items-center gap-1.5 text-xs text-[var(--gold-300)] font-semibold">
                  <PieChart className="w-3.5 h-3.5" />
                  <span>Total: {formatCurrency(activeData.expenses)}</span>
                </div>
              </div>

              <div className="space-y-4">
                {activeData.categories.map((cat, idx) => {
                  const percentage = (cat.value / activeData.expenses) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </span>
                        <div className="text-right">
                          <span className="font-semibold text-[var(--text-primary)] mr-2">{formatCurrency(cat.value)}</span>
                          <span className="text-[var(--text-muted)] text-[10px]">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Movement log */}
            <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Histórico de Movimentações do Buffet</span>
                <span className="text-[var(--gold-300)] text-[10px] animate-pulse">● online</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mb-2 italic">Registro das principais movimentações internas do Buffet.</p>
              <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-subtle)] text-[10px] font-mono h-28 overflow-y-auto space-y-1.5 text-[var(--text-secondary)]">
                {movementLogs.map((log, i) => {
                  const tag = log.match(/^\[(\w+)\]/)?.[1] ?? "";
                  const tagColor: Record<string, string> = {
                    RET: "text-amber-400",
                    DOC: "text-blue-400",
                    CAI: "text-emerald-400",
                    REL: "text-violet-400",
                    IMP: "text-sky-400",
                    PDF: "text-orange-400",
                    SIS: "text-[var(--text-muted)]",
                  };
                  return (
                    <div key={i} className="flex gap-1.5 items-start">
                      <span className={`shrink-0 font-bold ${tagColor[tag] ?? "text-[var(--gold-400)]"}`}>&gt;</span>
                      <span>{log}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: REGISTRAR RETIRADA */}
      {showPayoutModal && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[var(--gold-300)]" />
                <h3 className="font-bold text-[var(--text-primary)]">Registrar Retirada</h3>
              </div>
              <button onClick={() => setShowPayoutModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

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
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs text-[var(--text-muted)] font-mono">R$</div>
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
                  Máximo disponível: {formatCurrency(selectedPartner.expectedValue - selectedPartner.withdrawnValue)}
                </p>
              </div>

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

      {/* ======================================================== */}
      {/* MODAL: COMPROVANTE DA RETIRADA */}
      {showReceiptModal && receiptPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--gold-300)]" />
                <h3 className="font-bold text-[var(--text-primary)] text-sm">Comprovante da Retirada</h3>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Paper-style receipt */}
              <div className="bg-white text-neutral-900 rounded-lg border border-neutral-200 p-5 shadow-inner" style={{ fontFamily: "sans-serif" }}>
                <div className="text-center border-b border-neutral-200 pb-3 mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Compact Prime — Buffet</p>
                  <p className="text-[9px] text-neutral-400 mt-0.5 uppercase tracking-wider">Comprovante de Retirada</p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Sócia:</span>
                    <span className="font-semibold text-neutral-800">{receiptPartner.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Valor Retirado:</span>
                    <span className="font-bold text-neutral-800 font-mono">{formatCurrency(receiptPartner.withdrawnValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Valor Total Previsto:</span>
                    <span className="font-mono text-neutral-700">{formatCurrency(receiptPartner.expectedValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Mês de Referência:</span>
                    <span className="font-semibold text-neutral-800">{selectedMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Data do Registro:</span>
                    <span className="text-neutral-700">{new Date().toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${receiptPartner.status === "Pago" ? "bg-green-100 text-green-700" : receiptPartner.status === "Parcial" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {receiptPartner.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200 text-center">
                  <p className="text-[9px] text-neutral-400 italic">Retirada registrada manualmente no CRM Compact Prime</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wide">Registro verificado</span>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 py-2 border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  onClick={() => handleReceiptPrint(receiptPartner)}
                  className="flex items-center justify-center gap-1.5 flex-1 py-2 border border-[var(--border-default)] hover:border-[var(--gold-500)]/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir
                </button>
                <button
                  onClick={() => handleReceiptPdf(receiptPartner)}
                  className="flex items-center justify-center gap-1.5 flex-1 py-2 bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-300)] hover:from-[var(--gold-600)] hover:to-[var(--gold-400)] text-black rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <FileDown className="w-3.5 h-3.5 stroke-[3]" />
                  Baixar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EXPORTAR PDF */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in-up flex flex-col my-8">

            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-[var(--gold-300)]" />
                <h3 className="font-bold text-[var(--text-primary)]">Relatório Mensal do Buffet — {selectedMonth}</h3>
              </div>
              <button onClick={() => setShowPdfModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Paper report */}
            <div className="flex-1 p-6 overflow-y-auto bg-neutral-900 border-b border-[var(--border-subtle)] max-h-[520px]">
              <div className="bg-white text-neutral-900 p-8 rounded-lg shadow-2xl border border-neutral-300" style={{ fontFamily: "'Georgia', serif" }}>

                {/* Report header */}
                <div className="border-b-2 border-amber-600 pb-4 mb-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold uppercase tracking-wider text-amber-700 font-sans" style={{ fontFamily: "sans-serif" }}>COMPACT PRIME</h2>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-sans font-semibold" style={{ fontFamily: "sans-serif" }}>Buffet — Relatório de Distribuição Mensal</p>
                  </div>
                  <div className="text-right text-xs text-neutral-500 font-sans" style={{ fontFamily: "sans-serif" }}>
                    <p>Mês: <strong>{selectedMonth}</strong></p>
                    <p className="mt-0.5">Emitido em: {new Date().toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>

                {/* Financial summary */}
                <div className="mb-6 font-sans" style={{ fontFamily: "sans-serif" }}>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-1 mb-3">Resumo Financeiro</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-neutral-50 border border-neutral-200 rounded p-3">
                      <p className="text-neutral-400 text-[10px] uppercase">Receita do Mês</p>
                      <p className="font-bold text-neutral-800 text-sm font-mono mt-0.5">{formatCurrency(activeData.revenue)}</p>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 rounded p-3">
                      <p className="text-neutral-400 text-[10px] uppercase">Despesas do Mês</p>
                      <p className="font-bold text-red-700 text-sm font-mono mt-0.5">{formatCurrency(activeData.expenses)}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
                      <p className="text-emerald-600 text-[10px] uppercase font-semibold">Lucro Disponível</p>
                      <p className="font-bold text-emerald-800 text-sm font-mono mt-0.5">{formatCurrency(activeData.netProfit)}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded p-3">
                      <p className="text-amber-600 text-[10px] uppercase font-semibold">Reserva em Caixa</p>
                      <p className="font-bold text-amber-800 text-sm font-mono mt-0.5">{formatCurrency(activeData.reserveValue)}</p>
                    </div>
                  </div>
                </div>

                {/* Partner distribution */}
                <div className="mb-6 font-sans" style={{ fontFamily: "sans-serif" }}>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-1 mb-3">Distribuição das Sócias</h4>
                  <div className="space-y-2">
                    {activeData.partners.map((p) => (
                      <div key={p.id} className="flex justify-between items-center text-xs border-b border-neutral-100 pb-2">
                        <span className="font-semibold text-neutral-800">{p.name} <span className="font-normal text-neutral-400">({p.sharePercent}%)</span></span>
                        <div className="text-right">
                          <span className="font-mono text-neutral-800">{formatCurrency(p.withdrawnValue)}</span>
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${p.status === "Pago" ? "bg-green-100 text-green-700" : p.status === "Parcial" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expense categories */}
                <div className="mb-6 font-sans" style={{ fontFamily: "sans-serif" }}>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-1 mb-3">Gastos por Categoria</h4>
                  <div className="space-y-1.5">
                    {activeData.categories.map((cat, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-neutral-700 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          {cat.name}
                        </span>
                        <span className="font-mono font-semibold text-neutral-800">{formatCurrency(cat.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-neutral-200 pt-4 text-center font-sans" style={{ fontFamily: "sans-serif" }}>
                  <p className="text-[9px] text-neutral-400 italic">Relatório visual gerado pelo CRM Compact Prime — uso informativo e gerencial.</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[var(--bg-secondary)] flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2 border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={handlePdfDownload}
                disabled={pdfDownloading}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-300)] hover:from-[var(--gold-600)] hover:to-[var(--gold-400)] text-black rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md"
              >
                {pdfDownloading ? "Aguarde..." : <><FileDown className="w-4 h-4 stroke-[3]" /> Baixar PDF</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast feedback */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-fade-in-up">
          <div className="flex items-center gap-2.5 px-5 py-3 bg-[var(--bg-card)] border border-[var(--gold-500)]/30 rounded-xl shadow-2xl text-sm text-[var(--text-primary)] font-medium whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}

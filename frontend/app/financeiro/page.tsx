"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertCircle,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Receipt,
  X,
  Download,
  FileText,
  Plus,
  ClipboardList,
  ShieldCheck,
  History,
  Upload,
  CalendarDays,
  Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type EventType = "Casamento" | "Infantil" | "Corporativo" | "Adulto";
type FinanceStatus = "Pago" | "Parcial" | "Pendente";
type ServiceTag = "Buffet" | "Decoração" | "Fotografia" | "Combo";
type InstallmentStatus = "Pago" | "Pendente" | "Parcial" | "Vencida";
type FilterType = "Todos" | "Buffet" | "Decoração" | "Fotografia" | "Combo";

interface Installment {
  number: string;
  dueDate: string;
  value: string;
  status: InstallmentStatus;
  method?: string;
  receiptGenerated: boolean;
}

interface FinanceRecord {
  id: string;
  eventoId: string;
  clienteId: string;
  client: string;
  eventType: EventType;
  services: ServiceTag[];
  totalValue: string;
  downPayment: string;
  installments: string;
  nextDueDate: string;
  status: FinanceStatus;
  hasCombo: boolean;
  comboDiscount?: string;
  installmentList: Installment[];
}

interface RecentPayment {
  id: string;
  client: string;
  method: string;
  value: string;
  date: string;
  eventType: string;
  services: ServiceTag[];
  installmentNumber: string;
  remainingBalance: string;
}

interface HistoryEntry {
  id: string;
  type: "recibo" | "cobrança" | "baixa";
  description: string;
  date: string;
  value: string;
}


// ─── Styles ───────────────────────────────────────────────────────────────────
const statusStyles: Record<FinanceStatus, string> = {
  Pago: "bg-green-500/10 text-green-400 border-green-500/20",
  Parcial: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Pendente: "bg-red-500/10 text-red-400 border-red-500/20",
};

const installmentStatusStyles: Record<InstallmentStatus, string> = {
  Pago: "bg-green-500/10 text-green-400 border-green-500/20",
  Parcial: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Pendente: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Vencida: "bg-red-500/10 text-red-400 border-red-500/20",
};

const serviceTagStyles: Record<ServiceTag, string> = {
  Buffet: "bg-[var(--gold-500)]/10 text-[var(--gold-300)] border-[var(--gold-500)]/25",
  Decoração: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  Fotografia: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  Combo: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
};

const historyTypeStyles = {
  recibo: { color: "bg-blue-500/10 text-blue-400", icon: <FileText className="w-3.5 h-3.5" />, label: "Recibo" },
  cobrança: { color: "bg-orange-500/10 text-orange-400", icon: <CreditCard className="w-3.5 h-3.5" />, label: "Cobrança" },
  baixa: { color: "bg-green-500/10 text-green-400", icon: <ArrowDownRight className="w-3.5 h-3.5" />, label: "Baixa" },
};

interface FinanceSummary { receitaMes: string; aReceber: string; parcelasPendentes: number; }

const filterOptions: FilterType[] = ["Todos", "Buffet", "Decoração", "Fotografia", "Combo"];

const comboBreakdown = [
  {
    label: "Buffet + Decoração",
    services: ["Buffet", "Decoração"] as ServiceTag[],
    desconto: "5%",
    receita: "R$ 4.500",
    receber: "R$ 600",
    contratos: 2,
  },
  {
    label: "Buffet + Fotografia",
    services: ["Buffet", "Fotografia"] as ServiceTag[],
    desconto: "5%",
    receita: "R$ 3.000",
    receber: "R$ 300",
    contratos: 1,
  },
  {
    label: "Buffet + Decoração + Fotografia",
    services: ["Buffet", "Decoração", "Fotografia"] as ServiceTag[],
    desconto: "10%",
    receita: "R$ 2.000",
    receber: "R$ 100",
    contratos: 1,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function ServiceBadges({ services }: { services: ServiceTag[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {services.map((s) => (
        <span key={s} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${serviceTagStyles[s]}`}>
          {s}
        </span>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FinanceiroPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("Todos");
  const [selectedReceipt, setSelectedReceipt] = useState<RecentPayment | null>(null);
  const [recordForPayment, setRecordForPayment] = useState<FinanceRecord | null>(null);
  const [recordForInstallments, setRecordForInstallments] = useState<FinanceRecord | null>(null);
  const [showNewCharge, setShowNewCharge] = useState(false);
  const [chargeRecord, setChargeRecord] = useState<FinanceRecord | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [chargeConfirmed, setChargeConfirmed] = useState(false);
  const [emitReceipt, setEmitReceipt] = useState(true);
  const [payValorRecebido, setPayValorRecebido] = useState("");
  const [payDataPagamento, setPayDataPagamento] = useState("");
  const [payFormaPagamento, setPayFormaPagamento] = useState("PIX");
  const [payObservacoes, setPayObservacoes] = useState("");

  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary>({ receitaMes: "—", aReceber: "—", parcelasPendentes: 0 });

  useEffect(() => {
    fetch("/api/financeiro")
      .then(r => r.json())
      .then(json => {
        if (!json.ok) return;
        setRecords(json.data.contratos as FinanceRecord[]);
        setRecentPayments(json.data.pagamentosRecentes as RecentPayment[]);
        setFinanceSummary(json.data.summary as FinanceSummary);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col bg-[var(--bg-primary)] p-4 md:p-8 animate-fade-in-up overflow-y-auto min-h-full">

      {/* ── Header ── */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Financeiro</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Controle híbrido de contratos, parcelas e cobranças</p>
      </header>

      {/* ── Filtro por Serviço ── */}
      <div className="flex items-center gap-2 mb-4 bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-default)] shadow-card overflow-x-auto no-scrollbar">
        <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider shrink-0 mr-1">Visualizar:</span>
        <div className="flex gap-2">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer whitespace-nowrap ${
                activeFilter === f
                  ? "bg-[var(--gold-500)]/15 text-[var(--gold-300)] border-[var(--gold-500)]/30 shadow-[var(--shadow-gold-glow)]"
                  : "bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--gold-500)]/20 hover:text-[var(--text-primary)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {(
          [
            { label: "Receita do mês",    value: financeSummary.receitaMes,                    Icon: TrendingUp,  color: "green"  },
            { label: "Contas a receber",  value: financeSummary.aReceber,                      Icon: DollarSign,  color: "blue"   },
            { label: "Contas a pagar",    value: "—",                                          Icon: TrendingDown, color: "red"   },
            { label: "Parcelas pendentes",value: String(financeSummary.parcelasPendentes),      Icon: AlertCircle, color: "yellow" },
          ] as const
        ).map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover">
            <div className={`p-3 bg-${color}-500/10 rounded-lg text-${color}-400`}><Icon className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{value}</p>
              {activeFilter !== "Todos" && (
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-wide font-semibold">{activeFilter}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Combo Breakdown (apenas quando filtro Combo ativo) ── */}
      {activeFilter === "Combo" && (
        <div className="mb-8 p-4 rounded-xl border border-[var(--gold-500)]/20 bg-[var(--gold-500)]/5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[var(--gold-400)]" />
            <span className="text-xs font-bold text-[var(--gold-300)] uppercase tracking-wider">Composição dos combos</span>
            <span className="text-[10px] text-[var(--text-muted)] ml-auto">Desconto aplicado por quantidade de serviços</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {comboBreakdown.map((combo) => (
              <div
                key={combo.label}
                className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] p-3 flex flex-col gap-2 hover:border-[var(--gold-500)]/25 transition-colors"
              >
                {/* Badges dos serviços */}
                <div className="flex flex-wrap gap-1">
                  {combo.services.map((s) => (
                    <span key={s} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${serviceTagStyles[s]}`}>
                      {s}
                    </span>
                  ))}
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide bg-emerald-500/10 text-emerald-300 border-emerald-500/20 ml-auto">
                    -{combo.desconto}
                  </span>
                </div>
                {/* Valores */}
                <div className="flex justify-between items-end border-t border-[var(--border-subtle)]/60 pt-2">
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Receita</p>
                    <p className="text-sm font-bold font-mono text-[var(--text-primary)]">{combo.receita}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">A receber</p>
                    <p className="text-sm font-bold font-mono text-[var(--text-secondary)]">{combo.receber}</p>
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {combo.contratos} {combo.contratos === 1 ? "contrato" : "contratos"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">

        {/* ── Left: Contratos Ativos ── */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Contratos Ativos</h2>
            <button className="text-sm text-[var(--gold-400)] hover:text-[var(--gold-300)] font-medium transition-colors">Ver todos</button>
          </div>

          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-card overflow-hidden">
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                    <th className="px-5 py-4 font-semibold">Cliente / Evento</th>
                    <th className="px-5 py-4 font-semibold">Serviços</th>
                    <th className="px-5 py-4 font-semibold">Valor Total</th>
                    <th className="px-5 py-4 font-semibold">Entrada</th>
                    <th className="px-5 py-4 font-semibold">Parcelas</th>
                    <th className="px-5 py-4 font-semibold">Vencimento</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)] text-sm">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-[var(--bg-card-hover)] transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-[var(--text-primary)]">{record.client}</span>
                          <span className="text-xs text-[var(--text-muted)]">{record.eventType}</span>
                          {record.hasCombo && (
                            <span className="text-[9px] text-emerald-400 font-bold">Combo • {record.comboDiscount} desconto</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4"><ServiceBadges services={record.services} /></td>
                      <td className="px-5 py-4 font-medium text-[var(--text-primary)]">{record.totalValue}</td>
                      <td className="px-5 py-4 text-[var(--text-secondary)]">{record.downPayment}</td>
                      <td className="px-5 py-4 text-[var(--text-secondary)]">{record.installments}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          {record.nextDueDate !== "-" && <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                          <span>{record.nextDueDate}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[record.status]}`}>
                          {record.status === "Pago" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {record.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Registrar Pagamento"
                            onClick={() => setRecordForPayment(record)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--gold-300)] hover:bg-[var(--gold-500)]/10 transition-all border border-transparent hover:border-[var(--gold-500)]/20"
                          ><DollarSign className="w-4 h-4" /></button>
                          <button
                            title="Ver Parcelas"
                            onClick={() => setRecordForInstallments(record)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-blue-300 hover:bg-blue-500/10 transition-all border border-transparent hover:border-blue-500/20"
                          ><ClipboardList className="w-4 h-4" /></button>
                          <button
                            title="Gerar Recibo"
                            onClick={() => setSelectedReceipt({ id: record.id, client: record.client, method: "PIX", value: record.totalValue, date: "Hoje", eventType: record.eventType, services: record.services, installmentNumber: record.installments, remainingBalance: "—" })}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-purple-300 hover:bg-purple-500/10 transition-all border border-transparent hover:border-purple-500/20"
                          ><FileText className="w-4 h-4" /></button>
                          <button
                            title="Nova Cobrança"
                            onClick={() => { setChargeRecord(record); setShowNewCharge(true); }}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-orange-300 hover:bg-orange-500/10 transition-all border border-transparent hover:border-orange-500/20"
                          ><Plus className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-[var(--border-default)]">
              {records.map((record) => (
                <div key={record.id} className="p-4 hover:bg-[var(--bg-card-hover)] transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)] text-base">{record.client}</h3>
                      <span className="text-xs text-[var(--text-muted)]">{record.eventType}</span>
                      {record.hasCombo && <p className="text-[9px] text-emerald-400 font-bold mt-0.5">Combo • {record.comboDiscount} desconto</p>}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusStyles[record.status]}`}>{record.status}</span>
                  </div>
                  <ServiceBadges services={record.services} />
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {[{ label: "Valor Total", val: record.totalValue }, { label: "Entrada", val: record.downPayment }, { label: "Parcelas", val: record.installments }, { label: "Vencimento", val: record.nextDueDate }].map(({ label, val }) => (
                      <div key={label}>
                        <p className="text-xs text-[var(--text-secondary)] mb-0.5">{label}</p>
                        <p className="font-medium text-[var(--text-primary)] text-sm">{val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--border-subtle)]">
                    <button onClick={() => setRecordForPayment(record)} className="flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg text-[var(--gold-400)] border border-[var(--gold-500)]/30 bg-[var(--gold-500)]/5 hover:bg-[var(--gold-500)]/10 transition-colors">
                      <DollarSign className="w-3.5 h-3.5" /> Pagamento
                    </button>
                    <button onClick={() => setRecordForInstallments(record)} className="flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg text-blue-300 border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                      <ClipboardList className="w-3.5 h-3.5" /> Parcelas
                    </button>
                    <button onClick={() => setSelectedReceipt({ id: record.id, client: record.client, method: "—", value: record.totalValue, date: "Hoje", eventType: record.eventType, services: record.services, installmentNumber: record.installments, remainingBalance: "—" })} className="flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg text-purple-300 border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors">
                      <FileText className="w-3.5 h-3.5" /> Recibo
                    </button>
                    <button onClick={() => { setChargeRecord(record); setShowNewCharge(true); }} className="flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg text-orange-300 border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Cobrança
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Últimos Pagamentos ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Últimos Pagamentos</h2>
            <button className="text-sm text-[var(--gold-400)] hover:text-[var(--gold-300)] font-medium transition-colors">Ver histórico</button>
          </div>

          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-card overflow-hidden flex flex-col divide-y divide-[var(--border-default)]">
            {recentPayments.length === 0 && (
              <p className="p-6 text-center text-sm text-[var(--text-muted)]">Nenhum pagamento registrado ainda.</p>
            )}
            {recentPayments.map((payment) => (
              <div key={payment.id} className="p-4 hover:bg-[var(--bg-card-hover)] transition-colors group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 text-green-400 rounded-lg shrink-0">
                      <ArrowDownRight className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm text-[var(--text-primary)]">{payment.client}</span>
                      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <Receipt className="w-3 h-3" /> {payment.method} • {payment.date}
                      </span>
                      <ServiceBadges services={payment.services} />
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1 shrink-0">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{payment.value}</span>
                    <button
                      onClick={() => setSelectedReceipt(payment)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] flex items-center gap-1 text-[var(--gold-400)] hover:text-[var(--gold-300)] border border-[var(--gold-500)]/30 px-2 py-0.5 rounded bg-[var(--gold-500)]/10"
                    >
                      <FileText className="w-3 h-3" /> Recibo
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setChargeRecord(null); setShowNewCharge(true); }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--gold-500)]/10 hover:bg-[var(--gold-500)]/20 text-[var(--gold-400)] border border-[var(--gold-500)]/30 rounded-xl font-medium transition-colors"
          >
            <CreditCard className="w-4 h-4" /> Emitir nova cobrança
          </button>
        </div>
      </div>

      {/* ── Financial History ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-[var(--text-muted)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Histórico Financeiro</h2>
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-card overflow-hidden">
          <div className="divide-y divide-[var(--border-default)]">
            {recentPayments.length === 0 ? (
              <div className="px-5 py-8 flex flex-col items-center justify-center gap-2 text-[var(--text-muted)]">
                <History className="w-6 h-6 opacity-40" />
                <p className="text-sm">Nenhum lançamento registrado ainda.</p>
              </div>
            ) : recentPayments.slice(0, 5).map((p) => {
              const t = historyTypeStyles["baixa"];
              return (
                <div key={p.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-[var(--bg-card-hover)] transition-colors gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${t.color}`}>{t.icon}</div>
                    <div>
                      <p className="text-sm text-[var(--text-primary)]">{p.client} — {p.method}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" /> {p.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-sm text-[var(--text-primary)]">{p.value}</span>
                    <p className="text-[9px] font-bold uppercase tracking-wide mt-0.5 text-green-400">Baixa</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Security Disclaimer ── */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] mb-2">
        <ShieldCheck className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
        <p className="text-xs text-[var(--text-muted)] italic">
          Todos os pagamentos e baixas financeiras são registrados manualmente pelas sócias. Os dados aqui exibidos refletem os lançamentos realizados no sistema.
        </p>
      </div>


      {/* ══════════════════════════════════════════════════════════
          MODALS
         ══════════════════════════════════════════════════════════ */}

      {/* ── Modal: Registrar Pagamento ── */}
      {recordForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--gold-500)]/30 rounded-2xl shadow-[var(--shadow-gold-glow)] w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--gold-400)] to-[var(--gold-600)] flex items-center justify-center text-black">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">Registrar Pagamento</h3>
                  <p className="text-xs text-[var(--text-muted)]">{recordForPayment.client} · {recordForPayment.eventType}</p>
                </div>
              </div>
              <button onClick={() => { setRecordForPayment(null); setPaymentConfirmed(false); setEmitReceipt(true); setPayValorRecebido(""); setPayDataPagamento(""); setPayFormaPagamento("PIX"); setPayObservacoes(""); }} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Body */}
            <div className="p-5 overflow-y-auto flex flex-col gap-5">
              {paymentConfirmed ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <CheckCircle2 className="w-14 h-14 text-green-400" />
                  <p className="text-lg font-bold text-[var(--text-primary)]">Pagamento registrado!</p>
                  <p className="text-sm text-[var(--text-muted)] text-center">O lançamento foi registrado com sucesso no sistema. O recibo pode ser gerado a partir do histórico.</p>
                  <button onClick={() => { setRecordForPayment(null); setPaymentConfirmed(false); setEmitReceipt(true); }} className="px-6 py-2.5 bg-[var(--gold-500)]/15 text-[var(--gold-300)] border border-[var(--gold-500)]/30 rounded-lg text-sm font-semibold hover:bg-[var(--gold-500)]/25 transition-colors">
                    Fechar
                  </button>
                </div>
              ) : (
                <>
                  <ServiceBadges services={recordForPayment.services} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Parcela</label>
                    <select className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors">
                      {recordForPayment.installmentList
                        .filter((i) => i.status !== "Pago")
                        .map((i) => (
                          <option key={i.number} value={i.number}>
                            Parcela {i.number} — {i.value} — Venc: {i.dueDate}{i.status === "Vencida" ? " ⚠ Vencida" : ""}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Valor Recebido</label>
                      <input type="text" placeholder="R$ 0,00" value={payValorRecebido} onChange={(e) => setPayValorRecebido(e.target.value)} className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Data do Pagamento</label>
                      <input type="date" value={payDataPagamento} onChange={(e) => setPayDataPagamento(e.target.value)} className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Forma de Pagamento</label>
                    <select value={payFormaPagamento} onChange={(e) => setPayFormaPagamento(e.target.value)} className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors">
                      <option>PIX</option>
                      <option>Transferência Bancária</option>
                      <option>Cartão de Crédito</option>
                      <option>Cartão de Débito</option>
                      <option>Dinheiro</option>
                      <option>Cheque</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Observações</label>
                    <textarea rows={2} placeholder="Ex: Pagamento referente à parcela 4/10..." value={payObservacoes} onChange={(e) => setPayObservacoes(e.target.value)} className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors resize-none" />
                  </div>
                  {/* Comprovante mock */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Comprovante</label>
                    <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-5 flex flex-col items-center gap-2 hover:border-[var(--gold-500)]/30 hover:bg-[var(--gold-500)]/5 transition-all cursor-pointer">
                      <Upload className="w-6 h-6 text-[var(--text-muted)]" />
                      <p className="text-xs text-[var(--text-muted)] text-center">Arraste o comprovante ou <span className="text-[var(--gold-400)]">clique para selecionar</span></p>
                      <p className="text-[10px] text-[var(--text-muted)]">PDF, PNG, JPG até 5MB</p>
                    </div>
                  </div>
                  {/* Checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setEmitReceipt((v) => !v)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${emitReceipt ? "border-[var(--gold-500)]/60 bg-[var(--gold-500)]/15" : "border-[var(--border-default)] bg-[var(--bg-input)]"}`}>
                      {emitReceipt && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--gold-400)]" />}
                    </div>
                    <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Emitir recibo automático após confirmar</span>
                  </label>
                </>
              )}
            </div>
            {!paymentConfirmed && (
              <div className="p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
                <button
                  onClick={async () => {
                    if (!recordForPayment) return;
                    const valorNum = parseFloat(payValorRecebido.replace(",", ".")) || 0;
                    try {
                      const res = await fetch("/api/financeiro/pagamentos", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          eventoId: recordForPayment.eventoId,
                          clienteId: recordForPayment.clienteId,
                          valorTotal: valorNum,
                          valorRecebido: valorNum,
                          formaPagamento: payFormaPagamento,
                          observacoes: payObservacoes || null,
                          dataPagamento: payDataPagamento || null,
                        }),
                      });
                      const json = await res.json();
                      if (!json.ok) return;
                    } catch {
                      return;
                    }
                    setPaymentConfirmed(true);
                    setPayValorRecebido(""); setPayDataPagamento(""); setPayFormaPagamento("PIX"); setPayObservacoes("");
                  }}
                  className="w-full bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] hover:from-[var(--gold-700)] hover:to-[var(--gold-500)] text-black font-bold py-3 rounded-xl text-sm transition-all shadow-md"
                >
                  Confirmar Pagamento
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Ver Parcelas ── */}
      {recordForInstallments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-xl flex flex-col overflow-hidden max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">Parcelas do Contrato</h3>
                  <p className="text-xs text-[var(--text-muted)]">{recordForInstallments.client} · Total: {recordForInstallments.totalValue}</p>
                </div>
              </div>
              <button onClick={() => setRecordForInstallments(null)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Summary pills */}
            <div className="flex gap-3 px-5 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] shrink-0 overflow-x-auto no-scrollbar">
              {[
                { label: "Pagas", val: recordForInstallments.installmentList.filter(i => i.status === "Pago").length, color: "text-green-400" },
                { label: "Pendentes", val: recordForInstallments.installmentList.filter(i => i.status === "Pendente").length, color: "text-zinc-400" },
                { label: "Vencidas", val: recordForInstallments.installmentList.filter(i => i.status === "Vencida").length, color: "text-red-400" },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex flex-col items-center px-4 py-1.5 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] shrink-0">
                  <span className={`text-lg font-bold ${color}`}>{val}</span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">{label}</span>
                </div>
              ))}
            </div>
            {/* List */}
            <div className="overflow-y-auto flex-1 divide-y divide-[var(--border-default)]">
              {recordForInstallments.installmentList.map((inst) => (
                <div key={inst.number} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[var(--bg-card-hover)] transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm text-[var(--text-primary)]">Parcela {inst.number}</span>
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Venc: {inst.dueDate}
                      {inst.method && <> · <Receipt className="w-3 h-3" /> {inst.method}</>}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-sm text-[var(--text-primary)]">{inst.value}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${installmentStatusStyles[inst.status]}`}>
                      {inst.status}
                    </span>
                    {inst.receiptGenerated ? (
                      <button
                        title="Ver Recibo"
                        onClick={() => {
                          setRecordForInstallments(null);
                          setSelectedReceipt({
                            id: recordForInstallments!.id + inst.number,
                            client: recordForInstallments!.client,
                            method: inst.method ?? "—",
                            value: inst.value,
                            date: inst.dueDate,
                            eventType: recordForInstallments!.eventType,
                            services: recordForInstallments!.services,
                            installmentNumber: inst.number,
                            remainingBalance: "—",
                          });
                        }}
                        className="p-1 rounded hover:bg-[var(--gold-500)]/10 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-[var(--gold-400)] hover:text-[var(--gold-300)]" />
                      </button>
                    ) : (
                      <span title="Recibo pendente"><FileText className="w-4 h-4 text-[var(--text-muted)] opacity-40" /></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Nova Cobrança ── */}
      {showNewCharge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">Emitir Nova Cobrança</h3>
                  <p className="text-xs text-[var(--text-muted)]">Cobranças extras, renegociações e complementos</p>
                </div>
              </div>
              <button onClick={() => { setShowNewCharge(false); setChargeRecord(null); setChargeConfirmed(false); }} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex flex-col gap-4">
              {chargeConfirmed ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <Sparkles className="w-14 h-14 text-[var(--gold-400)]" />
                  <p className="text-lg font-bold text-[var(--text-primary)]">Cobrança emitida!</p>
                  <p className="text-sm text-[var(--text-muted)] text-center">A cobrança foi lançada no histórico financeiro. O cliente poderá ser notificado manualmente.</p>
                  <button onClick={() => { setShowNewCharge(false); setChargeRecord(null); setChargeConfirmed(false); }} className="px-6 py-2.5 bg-[var(--gold-500)]/15 text-[var(--gold-300)] border border-[var(--gold-500)]/30 rounded-lg text-sm font-semibold hover:bg-[var(--gold-500)]/25 transition-colors">
                    Fechar
                  </button>
                </div>
              ) : (
                <>
                  {/* Contexto de cliente */}
                  {chargeRecord ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/5 border border-orange-500/15">
                      <span className="text-xs text-[var(--text-muted)]">Cliente:</span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{chargeRecord.client}</span>
                      <span className="text-xs text-[var(--text-muted)]">·</span>
                      <span className="text-xs text-[var(--text-muted)]">{chargeRecord.eventType}</span>
                      <ServiceBadges services={chargeRecord.services} />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Cliente</label>
                      <select className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors">
                        {records.map((r) => (
                          <option key={r.id} value={r.id}>{r.client} — {r.eventType}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Valor</label>
                      <input type="text" placeholder="R$ 0,00" className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Vencimento</label>
                      <input type="date" className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Descrição</label>
                    <input type="text" placeholder="Ex: Hora extra equipe de garçons, nova decoração..." className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Serviço Relacionado</label>
                    <select className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors">
                      <option>Buffet</option>
                      <option>Decoração</option>
                      <option>Fotografia</option>
                      <option>Combo</option>
                      <option>Geral / Não vinculado</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Observações Internas</label>
                    <textarea rows={3} placeholder="Notas internas para as sócias..." className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors resize-none" />
                  </div>
                  <button
                    onClick={() => setChargeConfirmed(true)}
                    className="w-full bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] hover:from-[var(--gold-700)] hover:to-[var(--gold-500)] text-black font-bold py-3 rounded-xl text-sm transition-all shadow-md"
                  >
                    Emitir Cobrança
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Recibo ── */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--gold-500)]/30 rounded-2xl shadow-[var(--shadow-gold-glow)] w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-[var(--gold-300)] to-[var(--gold-600)] flex items-center justify-center text-black font-bold text-xs">CP</div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">Recibo de Pagamento</h3>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Compact Prime CRM</p>
                </div>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-md hover:bg-[var(--bg-card-hover)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5 overflow-y-auto">
              <div className="text-center mb-2">
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Valor Recebido</p>
                <h2 className="text-3xl font-mono font-bold text-[var(--gold-300)]">{selectedReceipt.value}</h2>
                <div className="mt-2 flex justify-center"><ServiceBadges services={selectedReceipt.services} /></div>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col gap-3">
                {[
                  { label: "Cliente", val: selectedReceipt.client, bold: true },
                  { label: "Evento", val: selectedReceipt.eventType, bold: false },
                  { label: "Serviços", val: selectedReceipt.services.join(", "), bold: false },
                  { label: "Parcela referente", val: selectedReceipt.installmentNumber, bold: false },
                  { label: "Forma de Pagamento", val: selectedReceipt.method, bold: false },
                  { label: "Data do Pagamento", val: selectedReceipt.date, bold: false },
                  { label: "Saldo Restante", val: selectedReceipt.remainingBalance, bold: true },
                ].map(({ label, val, bold }, i, arr) => (
                  <div key={label} className={`flex justify-between items-center ${i < arr.length - 1 ? "border-b border-[var(--border-subtle)]/50 pb-2" : ""}`}>
                    <span className="text-xs text-[var(--text-muted)]">{label}</span>
                    <span className={`text-sm ${bold ? "font-bold text-[var(--text-primary)]" : "font-medium text-[var(--text-secondary)]"}`}>{val}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] text-center italic leading-relaxed">
                Recebemos de {selectedReceipt.client} a importância supra, referente à prestação de serviços para evento do tipo {selectedReceipt.eventType}.
              </p>
            </div>
            <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
              <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider text-center sm:text-left">
                Recibo gerado eletronicamente pelo<br />CRM Compact Prime.
              </p>
              <button className="flex items-center gap-2 bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] hover:from-[var(--gold-700)] hover:to-[var(--gold-500)] text-black px-4 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-md w-full sm:w-auto justify-center">
                <Download className="w-4 h-4" /> Exportar PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

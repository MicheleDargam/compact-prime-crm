"use client";

import React from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  AlertCircle,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Receipt
} from "lucide-react";

// Types
type EventType = "Casamento" | "Infantil" | "Corporativo" | "Adulto";
type FinanceStatus = "Pago" | "Parcial" | "Pendente";

interface FinanceRecord {
  id: string;
  client: string;
  eventType: EventType;
  totalValue: string;
  downPayment: string;
  installments: string;
  nextDueDate: string;
  status: FinanceStatus;
}

interface RecentPayment {
  id: string;
  client: string;
  method: string;
  value: string;
  date: string;
}

// Mock Data
const mockRecords: FinanceRecord[] = [
  {
    id: "1",
    client: "Ana & João",
    eventType: "Casamento",
    totalValue: "R$ 45.000",
    downPayment: "R$ 15.000",
    installments: "3/10",
    nextDueDate: "10/06/2026",
    status: "Pago",
  },
  {
    id: "2",
    client: "Infantil Miguel",
    eventType: "Infantil",
    totalValue: "R$ 18.000",
    downPayment: "R$ 5.000",
    installments: "1/5",
    nextDueDate: "15/05/2026",
    status: "Pendente",
  },
  {
    id: "3",
    client: "PrimeTech",
    eventType: "Corporativo",
    totalValue: "R$ 35.000",
    downPayment: "R$ 10.000",
    installments: "2/4",
    nextDueDate: "20/05/2026",
    status: "Parcial",
  },
  {
    id: "4",
    client: "Juliana Costa",
    eventType: "Adulto",
    totalValue: "R$ 22.000",
    downPayment: "R$ 22.000",
    installments: "1/1",
    nextDueDate: "-",
    status: "Pago",
  },
];

const recentPayments: RecentPayment[] = [
  { id: "1", client: "Juliana Costa", method: "PIX", value: "R$ 22.000", date: "Hoje, 14:30" },
  { id: "2", client: "PrimeTech", method: "Transferência", value: "R$ 5.000", date: "Ontem, 16:45" },
  { id: "3", client: "Ana & João", method: "Cartão de Crédito", value: "R$ 5.000", date: "15/05/2026" },
  { id: "4", client: "Infantil Miguel", method: "PIX", value: "R$ 5.000", date: "12/05/2026" },
];

// Helper styles
const eventTypeStyles: Record<EventType, string> = {
  "Casamento": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Infantil": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Corporativo": "bg-green-500/10 text-green-400 border-green-500/20",
  "Adulto": "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const statusStyles: Record<FinanceStatus, string> = {
  "Pago": "bg-green-500/10 text-green-400 border-green-500/20",
  "Parcial": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Pendente": "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function FinanceiroPage() {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] p-4 md:p-8 animate-fade-in-up overflow-y-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Financeiro</h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)] mt-1">Controle financeiro da operação</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover">
          <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Receita do mês</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">R$ 120.000</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Contas a receber</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">R$ 45.000</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover">
          <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Contas a pagar</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">R$ 18.500</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover">
          <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Parcelas pendentes</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">8</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Table + Sidebar) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column - Financial Table */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Contratos Ativos</h2>
            <button className="text-sm text-[var(--gold-400)] hover:text-[var(--gold-300)] font-medium transition-colors">
              Ver todos
            </button>
          </div>
          
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-card overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                    <th className="px-5 py-4 font-semibold">Cliente / Evento</th>
                    <th className="px-5 py-4 font-semibold">Valor Total</th>
                    <th className="px-5 py-4 font-semibold">Entrada</th>
                    <th className="px-5 py-4 font-semibold">Parcelas</th>
                    <th className="px-5 py-4 font-semibold">Vencimento</th>
                    <th className="px-5 py-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)] text-sm">
                  {mockRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-[var(--bg-card-hover)] transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[var(--text-primary)]">{record.client}</span>
                          <span className="text-xs text-[var(--text-muted)] mt-0.5">{record.eventType}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-medium text-[var(--text-primary)]">{record.totalValue}</span>
                      </td>
                      <td className="px-5 py-4 text-[var(--text-secondary)]">
                        {record.downPayment}
                      </td>
                      <td className="px-5 py-4 text-[var(--text-secondary)]">
                        {record.installments}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          {record.nextDueDate !== "-" && <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                          <span>{record.nextDueDate}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[record.status]}`}>
                          {record.status === "Pago" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet View */}
            <div className="lg:hidden divide-y divide-[var(--border-default)]">
              {mockRecords.map((record) => (
                <div key={record.id} className="p-4 hover:bg-[var(--bg-card-hover)] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)] text-base">{record.client}</h3>
                      <span className="text-xs text-[var(--text-muted)]">{record.eventType}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusStyles[record.status]}`}>
                      {record.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-0.5">Valor Total</p>
                      <p className="font-medium text-[var(--text-primary)] text-sm">{record.totalValue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-0.5">Entrada</p>
                      <p className="font-medium text-[var(--text-primary)] text-sm">{record.downPayment}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-0.5">Parcelas</p>
                      <p className="text-sm text-[var(--text-primary)]">{record.installments}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-0.5">Vencimento</p>
                      <p className="text-sm text-[var(--text-primary)]">{record.nextDueDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Recent Payments */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Últimos Pagamentos</h2>
            <button className="text-sm text-[var(--gold-400)] hover:text-[var(--gold-300)] font-medium transition-colors">
              Ver histórico
            </button>
          </div>
          
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-card overflow-hidden flex flex-col divide-y divide-[var(--border-default)]">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-card-hover)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 text-green-400 rounded-lg">
                    <ArrowDownRight className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-[var(--text-primary)]">{payment.client}</span>
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                      <Receipt className="w-3 h-3" /> {payment.method} • {payment.date}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-[var(--text-primary)]">{payment.value}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Action Button - Exemplo */}
          <button className="mt-2 w-full flex items-center justify-center gap-2 py-3 bg-[var(--gold-500)]/10 hover:bg-[var(--gold-500)]/20 text-[var(--gold-400)] border border-[var(--gold-500)]/30 rounded-xl font-medium transition-colors">
            <CreditCard className="w-4 h-4" />
            Emitir nova cobrança
          </button>
        </div>

      </div>
    </div>
  );
}

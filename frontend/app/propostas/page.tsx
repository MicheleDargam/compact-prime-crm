"use client";

import React from "react";
import { 
  FileText, 
  Edit, 
  Send, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  MoreHorizontal,
  FileDown
} from "lucide-react";

// Types
type EventType = "Casamento" | "Infantil" | "Corporativo" | "Adulto";
type ProposalStatus = "Enviada" | "Em negociação" | "Aprovada" | "Vencida";

interface Proposal {
  id: string;
  client: string;
  eventType: EventType;
  value: string;
  sendDate: string;
  validity: string;
  status: ProposalStatus;
}

// Mock Data
const mockProposals: Proposal[] = [
  {
    id: "1",
    client: "Ana & João",
    eventType: "Casamento",
    value: "R$ 45.000",
    sendDate: "10/05/2026",
    validity: "15 dias",
    status: "Aprovada",
  },
  {
    id: "2",
    client: "Infantil Miguel",
    eventType: "Infantil",
    value: "R$ 18.000",
    sendDate: "15/05/2026",
    validity: "15 dias",
    status: "Enviada",
  },
  {
    id: "3",
    client: "PrimeTech",
    eventType: "Corporativo",
    value: "R$ 35.000",
    sendDate: "12/05/2026",
    validity: "15 dias",
    status: "Em negociação",
  },
  {
    id: "4",
    client: "Juliana Costa",
    eventType: "Adulto",
    value: "R$ 22.000",
    sendDate: "01/05/2026",
    validity: "15 dias",
    status: "Vencida",
  },
];

// Helper styles
const eventTypeStyles: Record<EventType, string> = {
  "Casamento": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Infantil": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Corporativo": "bg-green-500/10 text-green-400 border-green-500/20",
  "Adulto": "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const statusStyles: Record<ProposalStatus, string> = {
  "Enviada": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Em negociação": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Aprovada": "bg-green-500/10 text-green-400 border-green-500/20",
  "Vencida": "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function PropostasPage() {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] p-4 md:p-8 animate-fade-in-up overflow-y-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Propostas</h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)] mt-1">Gestão de propostas comerciais</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Propostas enviadas</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">12</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover">
          <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Aguardando resposta</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">5</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover">
          <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Propostas vencendo</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">2</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover">
          <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Propostas fechadas</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">24</p>
          </div>
        </div>
      </div>

      {/* Proposals List/Table Container */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-card overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Tipo</th>
                <th className="px-6 py-4 font-semibold">Valor</th>
                <th className="px-6 py-4 font-semibold">Envio / Validade</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {mockProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-[var(--bg-card-hover)] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[var(--text-primary)]">{proposal.client}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${eventTypeStyles[proposal.eventType]}`}>
                      {proposal.eventType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-[var(--text-primary)]">{proposal.value}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-[var(--text-primary)]">{proposal.sendDate}</span>
                      <span className="text-xs text-[var(--text-muted)]">Validade: {proposal.validity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[proposal.status]}`}>
                      {proposal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--gold-400)] bg-[var(--gold-400)]/10 hover:bg-[var(--gold-400)]/20 border border-[var(--gold-400)]/20 rounded-md transition-colors"
                        title="Ver PDF"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        PDF
                      </button>
                      <button 
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden divide-y divide-[var(--border-default)]">
          {mockProposals.map((proposal) => (
            <div key={proposal.id} className="p-4 hover:bg-[var(--bg-card-hover)] transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-base">{proposal.client}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${eventTypeStyles[proposal.eventType]}`}>
                      {proposal.eventType}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusStyles[proposal.status]}`}>
                      {proposal.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[var(--text-primary)]">{proposal.value}</span>
                </div>
              </div>

              <div className="flex justify-between items-end mt-4">
                <div className="flex flex-col">
                  <span className="text-xs text-[var(--text-secondary)]">Enviado: {proposal.sendDate}</span>
                  <span className="text-xs text-[var(--text-muted)]">Validade: {proposal.validity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--gold-400)] bg-[var(--gold-400)]/10 hover:bg-[var(--gold-400)]/20 border border-[var(--gold-400)]/20 rounded-md transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    PDF
                  </button>
                  <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--border-default)] rounded-md transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

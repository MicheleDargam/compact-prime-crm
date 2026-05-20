"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Edit, 
  Send, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  MoreHorizontal,
  FileDown,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  Printer,
  ShieldCheck,
  CalendarDays,
  Info
} from "lucide-react";
import {
  type ServiceType,
  SERVICES,
  isCombo
} from "@/app/data/services";
import { ServiceBadgeGroup } from "@/app/components/ServiceBadge";

// Types
type EventType = "Casamento" | "Infantil" | "Corporativo" | "Adulto";
type ProposalStatus = "Enviada" | "Em negociação" | "Aprovada" | "Vencida";

interface Proposal {
  id: string;
  client: string;
  eventType: EventType;
  sendDate: string;
  validity: string;
  status: ProposalStatus;
  servicosContratados: ServiceType[];
  valoresPorServico: {
    buffet?: number;
    decoracao?: number;
    fotografia?: number;
  };
  descontoCombo: number;
  subtotalCents: number;
  totalCents: number;
}

// Mock Data adapted to multi-services
const initialProposals: Proposal[] = [
  {
    id: "1",
    client: "Ana & João",
    eventType: "Casamento",
    sendDate: "10/05/2026",
    validity: "15 dias",
    status: "Aprovada",
    servicosContratados: ["buffet", "decoracao", "fotografia"],
    valoresPorServico: { buffet: 3500000, decoracao: 1000000, fotografia: 500000 },
    descontoCombo: 0.10,
    subtotalCents: 5000000,
    totalCents: 4500000, // R$ 45.000 (Combo)
  },
  {
    id: "2",
    client: "Infantil Miguel",
    eventType: "Infantil",
    sendDate: "15/05/2026",
    validity: "15 dias",
    status: "Enviada",
    servicosContratados: ["buffet"],
    valoresPorServico: { buffet: 1800000 },
    descontoCombo: 0,
    subtotalCents: 1800000,
    totalCents: 1800000, // R$ 18.000 (Apenas Buffet)
  },
  {
    id: "3",
    client: "PrimeTech",
    eventType: "Corporativo",
    sendDate: "12/05/2026",
    validity: "15 dias",
    status: "Em negociação",
    servicosContratados: ["buffet", "decoracao"],
    valoresPorServico: { buffet: 3000000, decoracao: 684210 },
    descontoCombo: 0.05,
    subtotalCents: 3684210,
    totalCents: 3500000, // R$ 35.000 (Combo Buffet + Decoração)
  },
  {
    id: "4",
    client: "Juliana Costa",
    eventType: "Adulto",
    sendDate: "01/05/2026",
    validity: "15 dias",
    status: "Vencida",
    servicosContratados: ["decoracao", "fotografia"],
    valoresPorServico: { decoracao: 1500000, fotografia: 815789 },
    descontoCombo: 0.05,
    subtotalCents: 2315789,
    totalCents: 2200000, // R$ 22.000 (Combo Decoração + Fotografia)
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

const statusFilterOptions = ["Todos", "Enviada", "Em negociação", "Aprovada", "Vencida"];
const serviceFilterOptions = ["Todos", "Buffet", "Decoração", "Fotografia", "Combo"];

export default function PropostasPage() {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("Todos");
  const [activeServiceFilter, setActiveServiceFilter] = useState("Todos");

  // PDF Preview Modal State
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  // Re-active filtering logic
  const filteredProposals = proposals.filter((p) => {
    const matchesStatus = activeStatusFilter === "Todos" || p.status === activeStatusFilter;
    
    let matchesService = true;
    if (activeServiceFilter !== "Todos") {
      if (activeServiceFilter === "Combo") {
        matchesService = isCombo(p.servicosContratados);
      } else {
        const serviceMap: Record<string, string> = {
          "Buffet": "buffet",
          "Decoração": "decoracao",
          "Fotografia": "fotografia",
        };
        const searchId = serviceMap[activeServiceFilter];
        matchesService = p.servicosContratados.includes(searchId as any);
      }
    }

    const matchesSearch = 
      p.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.eventType.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesService && matchesSearch;
  });

  const handleOpenPdf = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowPdfModal(true);
  };

  const handleMockDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`PDF da proposta de ${selectedProposal?.client} baixado com sucesso!`);
      setShowPdfModal(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] p-4 md:p-8 animate-fade-in-up overflow-y-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--gold-300)] tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gestão Comercial de Eventos Premium</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mt-1">Propostas</h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)] mt-0.5 font-sans">Gestão de propostas comerciais e orçamentos multi-serviços</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Propostas enviadas</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">12</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-yellow-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Em negociação</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">5</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-orange-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Propostas vencendo</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">2</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-green-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Propostas fechadas</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">24</p>
          </div>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="flex flex-col gap-4 mb-6 bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[var(--text-muted)]" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors"
            placeholder="Buscar proposta por cliente ou tipo de evento..."
          />
        </div>

        {/* Double row of filter buttons */}
        <div className="flex flex-col gap-3.5 pt-1">
          {/* Status filter */}
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider w-24 shrink-0">Filtrar Status:</span>
            <div className="flex flex-wrap gap-2">
              {statusFilterOptions.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveStatusFilter(filter)}
                  className={`
                    px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer
                    ${activeStatusFilter === filter 
                      ? 'bg-[var(--gold-500)]/15 text-[var(--gold-300)] border-[var(--gold-500)]/30 shadow-[var(--shadow-gold-glow)]' 
                      : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--gold-500)]/20 hover:text-[var(--text-primary)]'}
                  `}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Service filter */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 border-t border-[var(--border-subtle)] pt-3.5 mt-1">
            <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider w-24 shrink-0">Por Serviço:</span>
            <div className="flex flex-wrap gap-2">
              {serviceFilterOptions.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveServiceFilter(filter)}
                  className={`
                    px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer
                    ${activeServiceFilter === filter 
                      ? 'bg-[var(--gold-500)]/15 text-[var(--gold-300)] border-[var(--gold-500)]/30 shadow-[var(--shadow-gold-glow)]' 
                      : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--gold-500)]/20 hover:text-[var(--text-primary)]'}
                  `}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Proposals List/Table Container */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-card overflow-hidden">
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Tipo Evento</th>
                <th className="px-6 py-4 font-semibold">Serviços Contratados</th>
                <th className="px-6 py-4 font-semibold">Resumo Orçamentário</th>
                <th className="px-6 py-4 font-semibold">Envio / Validade</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {filteredProposals.map((proposal) => {
                const combo = isCombo(proposal.servicosContratados);
                const discountAmount = proposal.subtotalCents - proposal.totalCents;

                // Highlight style for combo proposal lines
                const rowBorderHighlight = combo
                  ? "border-l-2 border-l-[var(--gold-400)]/60 bg-[var(--gold-500)]/[0.01]"
                  : "";

                return (
                  <tr key={proposal.id} className={`hover:bg-[var(--bg-card-hover)] transition-colors group ${rowBorderHighlight}`}>
                    {/* Client name */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[var(--text-primary)] text-sm">{proposal.client}</span>
                    </td>

                    {/* Event Type */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${eventTypeStyles[proposal.eventType]}`}>
                        {proposal.eventType}
                      </span>
                    </td>

                    {/* Services badge */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <ServiceBadgeGroup evento={proposal} />
                      </div>
                    </td>

                    {/* Budget Summary (Includes subtotal, discount, final total) */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-bold text-[var(--text-primary)] font-mono">{formatCurrency(proposal.totalCents / 100)}</span>
                        
                        {combo && (
                          <div className="text-[10px] text-[var(--text-secondary)] font-mono">
                            <span className="text-emerald-400">Combo desc {proposal.descontoCombo * 100}% (-{formatCurrency(discountAmount / 100)})</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs">
                        <span className="text-[var(--text-primary)]">{proposal.sendDate}</span>
                        <span className="text-xs text-[var(--text-muted)] mt-0.5">Validade: {proposal.validity}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyles[proposal.status]}`}>
                        {proposal.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-85 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenPdf(proposal)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--gold-400)] bg-[var(--gold-500)]/5 hover:bg-[var(--gold-500)]/15 border border-[var(--gold-500)]/20 rounded-lg transition-all cursor-pointer"
                          title="Visualizar PDF timbrado do orçamento"
                        >
                          <FileDown className="w-3.5 h-3.5 stroke-[2.5]" />
                          PDF
                        </button>
                        <button 
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors cursor-pointer"
                          title="Editar proposta"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden divide-y divide-[var(--border-default)]">
          {filteredProposals.map((proposal) => {
            const combo = isCombo(proposal.servicosContratados);
            const discountAmount = proposal.subtotalCents - proposal.totalCents;

            return (
              <div 
                key={proposal.id} 
                className={`p-4 hover:bg-[var(--bg-card-hover)] transition-colors relative overflow-hidden ${combo ? "border-l-2 border-l-[var(--gold-400)]" : ""}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] text-sm">{proposal.client}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${eventTypeStyles[proposal.eventType]}`}>
                        {proposal.eventType}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyles[proposal.status]}`}>
                        {proposal.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[var(--text-primary)] font-mono text-sm">{formatCurrency(proposal.totalCents / 100)}</span>
                  </div>
                </div>

                {/* Services summary in mobile card */}
                <div className="mb-4 pt-3 border-t border-[var(--border-subtle)]/50">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 font-bold">Serviços da Proposta</p>
                  <ServiceBadgeGroup evento={proposal} size="sm" />
                  
                  {combo && (
                    <div className="bg-[var(--gold-500)]/5 border border-[var(--gold-500)]/10 rounded-lg p-2.5 mt-2.5 text-[10px] text-[var(--text-secondary)] font-mono">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(proposal.subtotalCents / 100)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 mt-0.5">
                        <span>Desconto {proposal.descontoCombo * 100}%:</span>
                        <span>-{formatCurrency(discountAmount / 100)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end mt-4 pt-3 border-t border-[var(--border-subtle)]/40">
                  <div className="flex flex-col text-xs">
                    <span className="text-[var(--text-secondary)]">Enviado: {proposal.sendDate}</span>
                    <span className="text-[var(--text-muted)] text-[11px] mt-0.5">Validade: {proposal.validity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenPdf(proposal)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--gold-400)] bg-[var(--gold-500)]/5 hover:bg-[var(--gold-500)]/15 border border-[var(--gold-500)]/20 rounded-lg transition-all cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      PDF
                    </button>
                    <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--border-default)] rounded-md transition-colors cursor-pointer">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProposals.length === 0 && (
          <div className="bg-[var(--bg-card)] border-t border-[var(--border-default)] p-12 text-center">
            <FileText className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)] font-medium">Nenhuma proposta corresponde aos filtros e buscas selecionados.</p>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: VISUALIZADOR DE PDF TIMBRADO (MOCKUP INTERATIVO) */}
      {showPdfModal && selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up flex flex-col my-8">
            
            {/* Header of Modal */}
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--gold-300)]" />
                <h3 className="font-bold text-[var(--text-primary)]">Visualizar Proposta Comercial (PDF)</h3>
              </div>
              <button 
                onClick={() => setShowPdfModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timbered Proposal Body (Paper style sheet inside a dark shell) */}
            <div className="flex-1 p-6 overflow-y-auto bg-neutral-900 border-b border-[var(--border-subtle)] max-h-[500px]">
              <div 
                className="bg-white text-neutral-900 p-8 md:p-10 rounded-lg shadow-2xl relative overflow-hidden font-serif border border-neutral-300 min-h-[600px] flex flex-col justify-between"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {/* Visual Header Grid with Gold Lines */}
                <div>
                  <div className="flex justify-between items-start border-b-2 border-amber-600 pb-5 mb-8">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-wider text-amber-700 font-sans" style={{ fontFamily: "sans-serif" }}>COMPACT PRIME</h2>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-sans font-semibold mt-0.5" style={{ fontFamily: "sans-serif" }}>Buffet & Eventos Premium</p>
                    </div>
                    <div className="text-right text-xs text-neutral-500 font-sans" style={{ fontFamily: "sans-serif" }}>
                      <p>Data: {selectedProposal.sendDate}</p>
                      <p className="mt-0.5">Validade: {selectedProposal.validity}</p>
                      <p className="font-mono mt-0.5 text-[10px] font-bold">ORC-{selectedProposal.id}2026</p>
                    </div>
                  </div>

                  {/* Intro Text */}
                  <div className="mb-6 font-sans text-xs text-neutral-600" style={{ fontFamily: "sans-serif" }}>
                    <p className="font-semibold text-neutral-800 text-sm">Prezado(a) {selectedProposal.client},</p>
                    <p className="mt-2.5 leading-relaxed">
                      Agradecemos a oportunidade de apresentar nosso orçamento personalizado para o seu evento. Abaixo detalhamos os serviços integrados e os respectivos valores operacionais conforme as premissas acordadas.
                    </p>
                  </div>

                  {/* Event Details Box */}
                  <div className="bg-neutral-50 border border-neutral-200 rounded p-4 mb-6 font-sans text-xs text-neutral-700" style={{ fontFamily: "sans-serif" }}>
                    <h4 className="font-bold text-neutral-800 border-b border-neutral-200 pb-1.5 mb-2 uppercase text-[10px] tracking-wide">Premissas do Evento</h4>
                    <div className="grid grid-cols-2 gap-y-2">
                      <div><span className="text-neutral-400">Cliente:</span> <strong className="text-neutral-800 font-medium">{selectedProposal.client}</strong></div>
                      <div><span className="text-neutral-400">Tipo de Evento:</span> <strong className="text-neutral-800 font-medium">{selectedProposal.eventType}</strong></div>
                    </div>
                  </div>

                  {/* Services Breakdown (NEW PDF Section) */}
                  <div className="mb-6 font-sans text-xs text-neutral-700" style={{ fontFamily: "sans-serif" }}>
                    <h4 className="font-bold text-neutral-800 border-b-2 border-neutral-200 pb-2 mb-3 uppercase text-[10px] tracking-wide">Serviços Contratados no PDF</h4>
                    
                    <div className="space-y-3.5">
                      {selectedProposal.servicosContratados.map((srv) => {
                        const label = SERVICES[srv]?.label || srv;
                        const valueText = selectedProposal.valoresPorServico[srv] 
                          ? formatCurrency(selectedProposal.valoresPorServico[srv]! / 100) 
                          : "R$ 0,00";

                        const descriptionMap: Record<string, string> = {
                          buffet: "Gastronomia fina com menu completo, coquetel de boas-vindas, prato principal, sobremesas, louças premium e serviço profissional de copeiras e garçons.",
                          decoracao: "Ambiente floral com design exclusivo, lounges premium, passadeira, cortinários em voil e iluminação cênica harmoniosa.",
                          fotografia: "Cobertura fotográfica completa do evento com equipe dedicada, ensaio pré-wedding e galeria digital com tratamento de imagem em alta definição."
                        };

                        return (
                          <div key={srv} className="flex justify-between items-start gap-4 border-b border-neutral-100 pb-3">
                            <div className="max-w-md">
                              <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                {label}
                              </span>
                              <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">{descriptionMap[srv]}</p>
                            </div>
                            <span className="font-bold text-neutral-800 font-mono text-right shrink-0">{valueText}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Financial calculations */}
                  <div className="flex justify-end font-sans text-xs text-neutral-700" style={{ fontFamily: "sans-serif" }}>
                    <div className="w-72 space-y-1.5 pt-2 border-t border-neutral-200">
                      
                      <div className="flex justify-between text-neutral-500">
                        <span>Subtotal do Pacote:</span>
                        <span className="font-mono">{formatCurrency(selectedProposal.subtotalCents / 100)}</span>
                      </div>

                      {isCombo(selectedProposal.servicosContratados) && (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>Desconto Combo ({selectedProposal.descontoCombo * 100}%):</span>
                          <span className="font-mono">-{formatCurrency((selectedProposal.subtotalCents - selectedProposal.totalCents) / 100)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-neutral-900 font-bold border-t border-neutral-300 pt-2 text-sm">
                        <span>Valor Final Líquido:</span>
                        <span className="text-amber-800 font-mono">{formatCurrency(selectedProposal.totalCents / 100)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Digital Stamp Sign footer */}
                <div className="mt-12 flex justify-between items-end border-t border-neutral-100 pt-5 font-sans" style={{ fontFamily: "sans-serif" }}>
                  <div className="text-[9px] text-neutral-400">
                    <p>Compact Prime CRM — Documento Comercial Informativo.</p>
                    <p className="mt-0.5">Assinado digitalmente por Compact Prime Ltda.</p>
                  </div>
                  
                  {/* Approval seal icon */}
                  <div className="flex items-center gap-1.5 border-2 border-emerald-600/35 px-3 py-1.5 rounded bg-emerald-500/5 text-emerald-600 uppercase text-[9px] font-bold tracking-wider font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    <span>Orçamento Aprovado</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-[var(--bg-secondary)] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[var(--gold-300)]" />
                Dica: O PDF inclui o detalhamento dos impostos e condições de parcelamento.
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="px-4 py-2 border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  onClick={handleMockDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-300)] hover:from-[var(--gold-600)] hover:to-[var(--gold-400)] text-black rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {downloading ? (
                    <>Aguarde...</>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 text-black stroke-[3]" />
                      Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

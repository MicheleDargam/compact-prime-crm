"use client";

import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  Users,
  Phone,
  CalendarDays,
  Plus,
  Sparkles,
  X,
  CheckCircle2,
  Check,
} from "lucide-react";
import {
  type ServiceType,
  SERVICES,
  COMBO_DISCOUNTS,
  isCombo,
} from "@/app/data/services";
import { ServiceBadgeGroup } from "@/app/components/ServiceBadge";

// Types
type EventType = "Casamento" | "Infantil" | "Corporativo" | "Adulto";
type LeadStatus = "Novo Lead" | "Proposta Enviada" | "Negociação" | "Fechado";

interface Lead {
  id: string;
  name: string;
  document: string;
  phone: string;
  eventType: EventType;
  eventDate: string;
  status: LeadStatus;
  lastContact: string;
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
const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Ana & João",
    document: "123.456.789-00",
    phone: "(11) 98765-4321",
    eventType: "Casamento",
    eventDate: "12/10/2026",
    status: "Fechado",
    lastContact: "Hoje, 10:30",
    servicosContratados: ["buffet", "decoracao", "fotografia"],
    valoresPorServico: { buffet: 3500000, decoracao: 1000000, fotografia: 500000 },
    descontoCombo: 0.10,
    subtotalCents: 5000000,
    totalCents: 4500000, // R$ 45.000 (Combo)
  },
  {
    id: "2",
    name: "Infantil Miguel",
    document: "098.765.432-11",
    phone: "(11) 91234-5678",
    eventType: "Infantil",
    eventDate: "15/08/2026",
    status: "Proposta Enviada",
    lastContact: "Ontem, 16:45",
    servicosContratados: ["buffet"],
    valoresPorServico: { buffet: 1800000 },
    descontoCombo: 0,
    subtotalCents: 1800000,
    totalCents: 1800000, // R$ 18.000 (Apenas Buffet)
  },
  {
    id: "3",
    name: "PrimeTech",
    document: "12.345.678/0001-99",
    phone: "(11) 3000-4000",
    eventType: "Corporativo",
    eventDate: "20/11/2026",
    status: "Negociação",
    lastContact: "12/05/2026",
    servicosContratados: ["buffet", "decoracao"],
    valoresPorServico: { buffet: 3000000, decoracao: 684210 },
    descontoCombo: 0.05,
    subtotalCents: 3684210,
    totalCents: 3500000, // R$ 35.000 (Combo Buffet + Decoração)
  },
  {
    id: "4",
    name: "Juliana Costa",
    document: "456.789.123-44",
    phone: "(11) 97777-8888",
    eventType: "Adulto",
    eventDate: "05/09/2026",
    status: "Novo Lead",
    lastContact: "10/05/2026",
    servicosContratados: ["buffet", "fotografia"],
    valoresPorServico: { buffet: 1815789, fotografia: 500000 },
    descontoCombo: 0.05,
    subtotalCents: 2315789,
    totalCents: 2200000, // R$ 22.000 (Combo Buffet + Fotografia)
  },
  {
    id: "5",
    name: "Lucas Oliveira",
    document: "789.123.456-55",
    phone: "(11) 95555-6666",
    eventType: "Casamento",
    eventDate: "18/12/2026",
    status: "Novo Lead",
    lastContact: "15/05/2026",
    servicosContratados: ["fotografia"],
    valoresPorServico: { fotografia: 600000 },
    descontoCombo: 0,
    subtotalCents: 600000,
    totalCents: 600000, // R$ 6.000 (Apenas Fotografia)
  },
  {
    id: "6",
    name: "Cláudia Santos",
    document: "321.654.987-88",
    phone: "(11) 94444-5555",
    eventType: "Corporativo",
    eventDate: "05/07/2026",
    status: "Proposta Enviada",
    lastContact: "18/05/2026",
    servicosContratados: ["decoracao"],
    valoresPorServico: { decoracao: 1200000 },
    descontoCombo: 0,
    subtotalCents: 1200000,
    totalCents: 1200000, // R$ 12.000 (Apenas Decoração)
  }
];

// Helper styles
const eventTypeStyles: Record<EventType, string> = {
  "Casamento": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Infantil": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Corporativo": "bg-green-500/10 text-green-400 border-green-500/20",
  "Adulto": "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const statusStyles: Record<LeadStatus, string> = {
  "Novo Lead": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Proposta Enviada": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Negociação": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Fechado": "bg-green-500/10 text-green-400 border-green-500/20",
};

const filterOptions = ["Todos", "Novo Lead", "Proposta Enviada", "Negociação", "Fechado"];
const serviceFilterOptions = ["Todos", "Buffet", "Decoração", "Fotografia", "Combo"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [activeServiceFilter, setActiveServiceFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [showNewLead, setShowNewLead] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formNome, setFormNome] = useState("");
  const [formCpf, setFormCpf] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formEventType, setFormEventType] = useState<EventType>("Casamento");
  const [formEventDate, setFormEventDate] = useState("");
  const [formServicos, setFormServicos] = useState<ServiceType[]>([]);
  const [formObservacoes, setFormObservacoes] = useState("");

  const toggleServico = (s: ServiceType) => {
    setFormServicos((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const resetForm = () => {
    setFormNome(""); setFormCpf(""); setFormTelefone("");
    setFormEventType("Casamento"); setFormEventDate("");
    setFormServicos([]); setFormObservacoes("");
  };

  const handleSaveLead = () => {
    const servicos: ServiceType[] = formServicos.length > 0 ? formServicos : ["buffet"];
    const descontoCombo = COMBO_DISCOUNTS[servicos.length] ?? 0;
    const novoLead: Lead = {
      id: Date.now().toString(),
      name: formNome.trim() || "Sem nome",
      document: formCpf.trim() || "—",
      phone: formTelefone.trim() || "—",
      eventType: formEventType,
      eventDate: formEventDate
        ? new Date(formEventDate + "T12:00:00").toLocaleDateString("pt-BR")
        : "—",
      status: "Novo Lead",
      lastContact: "Agora",
      servicosContratados: servicos,
      valoresPorServico: {},
      descontoCombo,
      subtotalCents: 0,
      totalCents: 0,
    };
    setLeads((prev) => [novoLead, ...prev]);
    setShowNewLead(false);
    resetForm();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  // Filtering logic
  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = activeFilter === "Todos" || lead.status === activeFilter;
    
    let matchesService = true;
    if (activeServiceFilter !== "Todos") {
      if (activeServiceFilter === "Combo") {
        matchesService = isCombo(lead.servicosContratados);
      } else {
        const serviceIdMap: Record<string, string> = {
          "Buffet": "buffet",
          "Decoração": "decoracao",
          "Fotografia": "fotografia",
        };
        const searchId = serviceIdMap[activeServiceFilter];
        matchesService = lead.servicosContratados.includes(searchId as any);
      }
    }

    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.document.includes(searchTerm) ||
      lead.phone.includes(searchTerm);

    return matchesStatus && matchesService && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] p-4 md:p-8 animate-fade-in-up overflow-y-auto">

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[var(--bg-card)] border border-emerald-500/40 rounded-xl shadow-lg text-xs font-semibold text-emerald-400 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4" />
          Lead criado com sucesso e adicionado ao Pipeline Comercial!
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] shadow-card">
              <Users className="w-6 h-6 text-[var(--gold-400)]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Leads</h1>
          </div>
          <p className="text-sm md:text-base text-[var(--text-secondary)] mt-1">Base de clientes e oportunidades multi-serviços</p>
        </div>
        
        <button
          onClick={() => setShowNewLead(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-tr from-[var(--gold-600)] to-[var(--gold-400)] text-[var(--bg-primary)] font-semibold rounded-lg shadow-[var(--shadow-gold-glow)] hover:scale-105 transition-transform duration-200 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Novo Lead
        </button>
      </header>

      {/* Search and Filters */}
      <div className="flex flex-col gap-5 mb-6 bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[var(--text-muted)]" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors"
            placeholder="Buscar lead por nome, CPF/CNPJ ou telefone..."
          />
        </div>

        {/* Double Row of Filters */}
        <div className="flex flex-col gap-3.5 pt-1">
          {/* Status Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider w-24 shrink-0">Filtrar Status:</span>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`
                    px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer
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

          {/* Service Filters */}
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

      {/* Leads List/Table Container */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-card overflow-hidden">
        
        {/* Desktop Table View */}
        <div className="hidden xl:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Nome / Documento</th>
                <th className="px-6 py-4 font-semibold">Contato</th>
                <th className="px-6 py-4 font-semibold">Serviços Contratados</th>
                <th className="px-6 py-4 font-semibold">Evento / Data</th>
                <th className="px-6 py-4 font-semibold">Status / Valor Final</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {filteredLeads.map((lead) => {
                const combo = isCombo(lead.servicosContratados);
                const discountAmount = lead.subtotalCents - lead.totalCents;
                return (
                  <tr key={lead.id} className="hover:bg-[var(--bg-card-hover)] transition-colors group">
                    {/* Name / CPF */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[var(--text-primary)] text-sm">{lead.name}</span>
                        <span className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{lead.document}</span>
                      </div>
                    </td>
                    
                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-[var(--text-primary)] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          {lead.phone}
                        </span>
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          Último contato: {lead.lastContact}
                        </span>
                      </div>
                    </td>

                    {/* Services (NEW Column) */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {/* Service Badges */}
                        <ServiceBadgeGroup evento={lead} />
                        
                        {/* Combo discount indicator */}
                        {combo && (
                          <div className="text-[10px] text-[var(--text-secondary)] leading-tight bg-[var(--gold-500)]/5 border border-[var(--gold-500)]/10 px-2 py-1 rounded-md mt-1">
                            <div className="flex items-center gap-1 text-[8px] font-bold text-[var(--gold-300)] uppercase tracking-wider mb-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Resumo do Combo</span>
                            </div>
                            <div className="flex flex-col gap-0.5 font-mono text-[9px]">
                              <span>Subtotal: {formatCurrency(lead.subtotalCents / 100)}</span>
                              <span className="text-emerald-400">Desconto: {lead.descontoCombo * 100}% (-{formatCurrency(discountAmount / 100)})</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Event Type / Date */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1.5 text-xs">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${eventTypeStyles[lead.eventType]}`}>
                          {lead.eventType}
                        </span>
                        <span className="text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
                          <CalendarDays className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          {lead.eventDate}
                        </span>
                      </div>
                    </td>

                    {/* Status / Value */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyles[lead.status]}`}>
                          {lead.status}
                        </span>
                        <span className="text-xs font-bold text-[var(--text-primary)] font-mono mt-0.5">
                          {formatCurrency(lead.totalCents / 100)}
                        </span>
                      </div>
                    </td>

                    {/* Action button */}
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-[var(--text-muted)] hover:text-[var(--gold-400)] hover:bg-[var(--gold-400)]/10 rounded-lg transition-colors cursor-pointer">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="xl:hidden divide-y divide-[var(--border-default)]">
          {filteredLeads.map((lead) => {
            const combo = isCombo(lead.servicosContratados);
            const discountAmount = lead.subtotalCents - lead.totalCents;
            return (
              <div key={lead.id} className="p-4 hover:bg-[var(--bg-card-hover)] transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] text-base">{lead.name}</h3>
                    <span className="text-xs text-[var(--text-muted)] font-mono mt-0.5 block">{lead.document}</span>
                  </div>
                  <button className="p-1 text-[var(--text-muted)] hover:text-[var(--gold-400)] cursor-pointer">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-4 text-xs">
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Contato</p>
                    <p className="font-medium text-[var(--text-primary)]">{lead.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Último contato</p>
                    <p className="font-medium text-[var(--text-primary)]">{lead.lastContact}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Data Evento</p>
                    <p className="font-medium text-[var(--text-primary)]">{lead.eventDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Valor Estimado</p>
                    <p className="font-bold text-[var(--text-primary)] font-mono">{formatCurrency(lead.totalCents / 100)}</p>
                  </div>
                </div>

                {/* Services Section in Mobile Card */}
                <div className="mb-4 pt-3 border-t border-[var(--border-subtle)]">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5 font-bold">Serviços Interessados</p>
                  <ServiceBadgeGroup evento={lead} />
                  
                  {combo && (
                    <div className="bg-[var(--gold-500)]/5 border border-[var(--gold-500)]/10 rounded-lg p-2.5 mt-2.5 text-[11px] text-[var(--text-secondary)]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[var(--gold-300)] uppercase text-[8px] tracking-wider flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Detalhes do Combo
                        </span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wide">
                          Combo Ativo
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-0.5 gap-x-2 font-mono text-[10px]">
                        <div>Subtotal:</div>
                        <div className="text-right">{formatCurrency(lead.subtotalCents / 100)}</div>
                        <div>Desconto {lead.descontoCombo * 100}%:</div>
                        <div className="text-right text-emerald-400">-{formatCurrency(discountAmount / 100)}</div>
                        <div className="col-span-2 border-t border-[var(--border-subtle)] pt-1 mt-1 flex justify-between font-sans text-xs">
                          <span className="font-semibold">Valor Final:</span>
                          <span className="font-bold text-[var(--text-primary)]">{formatCurrency(lead.totalCents / 100)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${eventTypeStyles[lead.eventType]}`}>
                    {lead.eventType}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyles[lead.status]}`}>
                    {lead.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLeads.length === 0 && (
          <div className="bg-[var(--bg-card)] border-t border-[var(--border-default)] p-12 text-center">
            <Users className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)] font-medium">Nenhum lead corresponde aos filtros e buscas selecionados.</p>
          </div>
        )}
      </div>

      {/* ── Modal: Novo Lead ── */}
      {showNewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--gold-500)]/30 rounded-2xl shadow-[var(--shadow-gold-glow)] w-full max-w-lg flex flex-col overflow-hidden max-h-[92vh]">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--gold-400)] to-[var(--gold-600)] flex items-center justify-center text-black">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">Novo Lead</h3>
                  <p className="text-xs text-[var(--text-muted)]">Captura de oportunidade comercial</p>
                </div>
              </div>
              <button
                onClick={() => { setShowNewLead(false); resetForm(); }}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex flex-col gap-4">

              {/* Nome + CPF */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Nome do cliente</label>
                  <input
                    type="text"
                    placeholder="Ex: Ana & João Silva"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">CPF / CNPJ</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={formCpf}
                    onChange={(e) => setFormCpf(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors"
                  />
                </div>
              </div>

              {/* Telefone + Tipo Evento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Telefone</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-0000"
                    value={formTelefone}
                    onChange={(e) => setFormTelefone(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Tipo de Evento</label>
                  <select
                    value={formEventType}
                    onChange={(e) => setFormEventType(e.target.value as EventType)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors"
                  >
                    <option>Casamento</option>
                    <option>Infantil</option>
                    <option>Corporativo</option>
                    <option>Adulto</option>
                  </select>
                </div>
              </div>

              {/* Data do Evento */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Data do Evento</label>
                <input
                  type="date"
                  value={formEventDate}
                  onChange={(e) => setFormEventDate(e.target.value)}
                  className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors"
                />
              </div>

              {/* Serviços desejados */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Serviços Desejados</label>
                <div className="flex gap-2 flex-wrap">
                  {(["buffet", "decoracao", "fotografia"] as ServiceType[]).map((s) => {
                    const cfg = SERVICES[s];
                    const selected = formServicos.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleServico(s)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                          selected
                            ? `${cfg.color} ${cfg.textColor} ${cfg.borderColor} shadow-sm`
                            : "bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-subtle)]"
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 stroke-[3]" />}
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>

                {/* Combo badge */}
                {formServicos.length > 1 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--gold-500)]/8 border border-[var(--gold-500)]/25">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--gold-400)] shrink-0" />
                    <span className="text-xs font-bold text-[var(--gold-300)]">
                      Combo detectado automaticamente
                    </span>
                    <span className="ml-auto text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      -{(COMBO_DISCOUNTS[formServicos.length] ?? 0) * 100}% desconto
                    </span>
                  </div>
                )}
              </div>

              {/* Observações */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Observações</label>
                <textarea
                  rows={3}
                  placeholder="Informações adicionais sobre o lead, restrições, preferências..."
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
              <button
                onClick={() => { setShowNewLead(false); resetForm(); }}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-default)] text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveLead}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] hover:from-[var(--gold-700)] hover:to-[var(--gold-500)] text-black font-bold text-sm transition-all shadow-md"
              >
                Salvar Lead
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

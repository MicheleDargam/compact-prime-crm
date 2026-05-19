"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Users, 
  Phone, 
  CalendarDays,
  Plus
} from "lucide-react";

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
  estimatedValue: string;
}

// Mock Data
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
    estimatedValue: "R$ 45.000",
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
    estimatedValue: "R$ 18.000",
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
    estimatedValue: "R$ 35.000",
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
    estimatedValue: "R$ 22.000",
  },
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

export default function LeadsPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] p-4 md:p-8 animate-fade-in-up overflow-y-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] shadow-card">
              <Users className="w-6 h-6 text-[var(--gold-400)]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Leads</h1>
          </div>
          <p className="text-sm md:text-base text-[var(--text-secondary)] mt-1">Base de clientes e oportunidades</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-tr from-[var(--gold-600)] to-[var(--gold-400)] text-[var(--bg-primary)] font-semibold rounded-lg shadow-[var(--shadow-gold-glow)] hover:scale-105 transition-transform duration-200">
          <Plus className="w-5 h-5" />
          Novo Lead
        </button>
      </header>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--gold-400)] focus:border-[var(--gold-400)] transition-colors"
              placeholder="Buscar por nome, CPF ou celular..."
            />
          </div>
          
          {/* Mobile Filter Button (Visible only on small screens) */}
          <button className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl">
            <Filter className="w-5 h-5" />
            Filtros
          </button>
        </div>

        {/* Filter Pills (Scrollable on mobile) */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 gap-2 no-scrollbar">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`
                whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border
                ${activeFilter === filter 
                  ? 'bg-[var(--gold-500)]/20 text-[var(--gold-300)] border-[var(--gold-500)]/30' 
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'}
              `}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List/Table Container */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-card overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden xl:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Nome / Documento</th>
                <th className="px-6 py-4 font-semibold">Contato</th>
                <th className="px-6 py-4 font-semibold">Evento / Data</th>
                <th className="px-6 py-4 font-semibold">Status / Valor</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {mockLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[var(--bg-card-hover)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[var(--text-primary)] text-base">{lead.name}</span>
                      <span className="text-xs text-[var(--text-muted)]">{lead.document}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        {lead.phone}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        Último contato: {lead.lastContact}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${eventTypeStyles[lead.eventType]}`}>
                        {lead.eventType}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {lead.eventDate}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[lead.status]}`}>
                        {lead.status}
                      </span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {lead.estimatedValue}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-[var(--text-muted)] hover:text-[var(--gold-400)] hover:bg-[var(--gold-400)]/10 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="xl:hidden divide-y divide-[var(--border-default)]">
          {mockLeads.map((lead) => (
            <div key={lead.id} className="p-4 hover:bg-[var(--bg-card-hover)] transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-lg">{lead.name}</h3>
                  <span className="text-xs text-[var(--text-muted)]">{lead.document}</span>
                </div>
                <button className="p-1 text-[var(--text-muted)] hover:text-[var(--gold-400)]">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-4">
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Contato</p>
                  <p className="text-sm text-[var(--text-primary)]">{lead.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Último contato</p>
                  <p className="text-sm text-[var(--text-primary)]">{lead.lastContact}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Data Evento</p>
                  <p className="text-sm text-[var(--text-primary)]">{lead.eventDate}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Valor Estimado</p>
                  <p className="font-semibold text-sm text-[var(--text-primary)]">{lead.estimatedValue}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${eventTypeStyles[lead.eventType]}`}>
                  {lead.eventType}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusStyles[lead.status]}`}>
                  {lead.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

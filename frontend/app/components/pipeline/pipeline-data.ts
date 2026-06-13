import { ServiceType } from "@/app/data/services";

// ===== Types =====

export type LeadId = string;
export type ColumnId = string;

export type EventType = "Casamento" | "Infantil" | "Adulto" | "Corporativo";
export type ClientCategory = "Cliente Novo" | "Cliente Prime" | "Cliente VIP";

export interface Lead {
  id: LeadId;
  cliente_id?: string;
  name: string;
  email?: string | null;
  phone: string;
  cpf: string;
  eventType: EventType;
  data_evento?: string | null;
  buffetTime: string;
  value: string;
  /** Raw numeric value in cents for sorting/totals */
  valueCents: number;
  validity: string;
  notes?: string;
  // NEW multi-service fields
  servicosContratados: ServiceType[];
  valoresPorServico: {
    buffet?: number;
    decoracao?: number;
    fotografia?: number;
  };
  observacoesPorServico?: Record<string, string | null>;
  descontoCombo: number;
  subtotalCents: number;
  totalCents: number;
  clientCategory?: ClientCategory;
}

export interface Column {
  id: ColumnId;
  title: string;
  color: string;
  leadIds: LeadId[];
}

export interface KanbanState {
  leads: Record<LeadId, Lead>;
  columns: Column[];
}


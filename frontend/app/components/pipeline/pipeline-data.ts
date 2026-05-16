// ===== Types =====

export type LeadId = string;
export type ColumnId = string;

export interface Lead {
  id: LeadId;
  name: string;
  event: string;
  value: string;
  /** Raw numeric value in cents for sorting/totals */
  valueCents: number;
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

// ===== Mock Data =====

export const INITIAL_DATA: KanbanState = {
  leads: {
    "lead-1": { id: "lead-1", name: "Maria Silva", event: "Casamento · 150 pax", value: "R$ 22.500", valueCents: 2250000 },
    "lead-2": { id: "lead-2", name: "João Souza", event: "Corporativo · 80 pax", value: "R$ 12.000", valueCents: 1200000 },
    "lead-3": { id: "lead-3", name: "Ana Lima", event: "Aniversário · 60 pax", value: "R$ 8.500", valueCents: 850000 },
    "lead-4": { id: "lead-4", name: "Carlos Mendes", event: "Casamento · 200 pax", value: "R$ 35.000", valueCents: 3500000 },
    "lead-5": { id: "lead-5", name: "Fernanda Costa", event: "Debutante · 120 pax", value: "R$ 18.000", valueCents: 1800000 },
    "lead-6": { id: "lead-6", name: "Ricardo Alves", event: "Corporativo · 300 pax", value: "R$ 45.000", valueCents: 4500000 },
    "lead-7": { id: "lead-7", name: "Beatriz Ramos", event: "Casamento · 180 pax", value: "R$ 28.000", valueCents: 2800000 },
    "lead-8": { id: "lead-8", name: "Lucas Ferreira", event: "Formatura · 250 pax", value: "R$ 38.000", valueCents: 3800000 },
    "lead-9": { id: "lead-9", name: "Patrícia Nunes", event: "Casamento · 170 pax", value: "R$ 26.500", valueCents: 2650000 },
    "lead-10": { id: "lead-10", name: "Diego Rocha", event: "Corporativo · 100 pax", value: "R$ 15.000", valueCents: 1500000 },
  },
  columns: [
    { id: "col-novo", title: "Novo Lead", color: "var(--gold-400)", leadIds: ["lead-1", "lead-2", "lead-3"] },
    { id: "col-qualificacao", title: "Qualificação", color: "var(--info)", leadIds: ["lead-4", "lead-5"] },
    { id: "col-proposta", title: "Proposta Enviada", color: "var(--warning)", leadIds: ["lead-6", "lead-7"] },
    { id: "col-negociacao", title: "Negociação", color: "#a78bfa", leadIds: ["lead-8"] },
    { id: "col-fechado", title: "Fechado", color: "var(--success)", leadIds: ["lead-9", "lead-10"] },
  ],
};

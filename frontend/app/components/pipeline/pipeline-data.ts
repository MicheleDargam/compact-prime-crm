// ===== Types =====

export type LeadId = string;
export type ColumnId = string;

export type EventType = "Casamento" | "Infantil" | "Adulto" | "Corporativo";

export interface Lead {
  id: LeadId;
  name: string;
  phone: string;
  cpf: string;
  eventType: EventType;
  buffetTime: string;
  value: string;
  /** Raw numeric value in cents for sorting/totals */
  valueCents: number;
  validity: string;
  notes?: string;
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
    "lead-1": { id: "lead-1", name: "Maria Silva", phone: "(11) 98765-4321", cpf: "123.456.789-00", eventType: "Casamento", buffetTime: "5 horas", value: "R$ 22.500", valueCents: 2250000, validity: "15 dias" },
    "lead-2": { id: "lead-2", name: "João Souza", phone: "(11) 99876-5432", cpf: "987.654.321-11", eventType: "Corporativo", buffetTime: "5 horas", value: "R$ 12.000", valueCents: 1200000, validity: "15 dias", notes: "Atenção: Endereço em comunidade. Cancelar/recusar (Regra: Compact Prime não atende)." },
    "lead-3": { id: "lead-3", name: "Ana Lima", phone: "(11) 91234-5678", cpf: "456.789.123-22", eventType: "Infantil", buffetTime: "5 horas", value: "R$ 8.500", valueCents: 850000, validity: "15 dias" },
    "lead-4": { id: "lead-4", name: "Carlos Mendes", phone: "(11) 97777-8888", cpf: "321.654.987-33", eventType: "Casamento", buffetTime: "5 horas", value: "R$ 35.000", valueCents: 3500000, validity: "15 dias" },
    "lead-5": { id: "lead-5", name: "Fernanda Costa", phone: "(11) 96666-5555", cpf: "159.753.852-44", eventType: "Adulto", buffetTime: "5 horas", value: "R$ 18.000", valueCents: 1800000, validity: "15 dias", notes: "Cliente solicitou degustação VIP." },
    "lead-6": { id: "lead-6", name: "Ricardo Alves", phone: "(11) 95555-4444", cpf: "753.951.456-55", eventType: "Corporativo", buffetTime: "5 horas", value: "R$ 45.000", valueCents: 4500000, validity: "15 dias" },
    "lead-7": { id: "lead-7", name: "Beatriz Ramos", phone: "(11) 94444-3333", cpf: "852.741.963-66", eventType: "Casamento", buffetTime: "5 horas", value: "R$ 28.000", valueCents: 2800000, validity: "15 dias", notes: "Falta aprovação final do decorador." },
    "lead-8": { id: "lead-8", name: "Lucas Ferreira", phone: "(11) 93333-2222", cpf: "963.852.741-77", eventType: "Adulto", buffetTime: "5 horas", value: "R$ 38.000", valueCents: 3800000, validity: "15 dias" },
    "lead-9": { id: "lead-9", name: "Patrícia Nunes", phone: "(11) 92222-1111", cpf: "147.258.369-88", eventType: "Casamento", buffetTime: "5 horas", value: "R$ 26.500", valueCents: 2650000, validity: "15 dias" },
    "lead-10": { id: "lead-10", name: "Diego Rocha", phone: "(11) 91111-0000", cpf: "258.369.147-99", eventType: "Corporativo", buffetTime: "5 horas", value: "R$ 15.000", valueCents: 1500000, validity: "15 dias" },
  },
  columns: [
    { id: "col-novo", title: "Novo Lead", color: "var(--gold-400)", leadIds: ["lead-1", "lead-2", "lead-3", "lead-4", "lead-5"] },
    { id: "col-proposta", title: "Proposta Enviada", color: "var(--warning)", leadIds: ["lead-6", "lead-7"] },
    { id: "col-negociacao", title: "Negociação", color: "#a78bfa", leadIds: ["lead-8"] },
    { id: "col-fechado", title: "Fechado", color: "var(--success)", leadIds: ["lead-9", "lead-10"] },
  ],
};

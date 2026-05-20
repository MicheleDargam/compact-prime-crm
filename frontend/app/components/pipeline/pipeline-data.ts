import { ServiceType } from "@/app/data/services";

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
  // NEW multi-service fields
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
    "lead-1": { 
      id: "lead-1", 
      name: "Maria Silva", 
      phone: "(11) 98765-4321", 
      cpf: "123.456.789-00", 
      eventType: "Casamento", 
      buffetTime: "5 horas", 
      value: "R$ 32.850", 
      valueCents: 3285000, 
      validity: "15 dias",
      servicosContratados: ["buffet", "decoracao", "fotografia"],
      valoresPorServico: { buffet: 2250000, decoracao: 800000, fotografia: 600000 },
      descontoCombo: 0.10,
      subtotalCents: 3650000,
      totalCents: 3285000
    },
    "lead-2": { 
      id: "lead-2", 
      name: "João Souza", 
      phone: "(11) 99876-5432", 
      cpf: "987.654.321-11", 
      eventType: "Corporativo", 
      buffetTime: "5 horas", 
      value: "R$ 15.200", 
      valueCents: 1520000, 
      validity: "15 dias", 
      notes: "Atenção: Endereço em comunidade. Cancelar/recusar (Regra: Compact Prime não atende).",
      servicosContratados: ["buffet", "decoracao"],
      valoresPorServico: { buffet: 1200000, decoracao: 400000 },
      descontoCombo: 0.05,
      subtotalCents: 1600000,
      totalCents: 1520000
    },
    "lead-3": { 
      id: "lead-3", 
      name: "Ana Lima", 
      phone: "(11) 91234-5678", 
      cpf: "456.789.123-22", 
      eventType: "Infantil", 
      buffetTime: "5 horas", 
      value: "R$ 8.500", 
      valueCents: 850000, 
      validity: "15 dias",
      servicosContratados: ["buffet"],
      valoresPorServico: { buffet: 850000 },
      descontoCombo: 0,
      subtotalCents: 850000,
      totalCents: 850000
    },
    "lead-4": { 
      id: "lead-4", 
      name: "Carlos Mendes", 
      phone: "(11) 97777-8888", 
      cpf: "321.654.987-33", 
      eventType: "Casamento", 
      buffetTime: "5 horas", 
      value: "R$ 33.250", 
      valueCents: 3325000, 
      validity: "15 dias",
      servicosContratados: ["buffet", "decoracao"],
      valoresPorServico: { buffet: 3000000, decoracao: 500000 },
      descontoCombo: 0.05,
      subtotalCents: 3500000,
      totalCents: 3325000
    },
    "lead-5": { 
      id: "lead-5", 
      name: "Fernanda Costa", 
      phone: "(11) 96666-5555", 
      cpf: "159.753.852-44", 
      eventType: "Adulto", 
      buffetTime: "5 horas", 
      value: "R$ 26.550", 
      valueCents: 2655000, 
      validity: "15 dias", 
      notes: "Cliente solicitou degustação VIP.",
      servicosContratados: ["buffet", "decoracao", "fotografia"],
      valoresPorServico: { buffet: 1800000, decoracao: 650000, fotografia: 500000 },
      descontoCombo: 0.10,
      subtotalCents: 2950000,
      totalCents: 2655000
    },
    "lead-6": { 
      id: "lead-6", 
      name: "Ricardo Alves", 
      phone: "(11) 95555-4444", 
      cpf: "753.951.456-55", 
      eventType: "Corporativo", 
      buffetTime: "5 horas", 
      value: "R$ 52.250", 
      valueCents: 5225000, 
      validity: "15 dias",
      servicosContratados: ["buffet", "fotografia"],
      valoresPorServico: { buffet: 4500000, fotografia: 1000000 },
      descontoCombo: 0.05,
      subtotalCents: 5500000,
      totalCents: 5225000
    },
    "lead-7": { 
      id: "lead-7", 
      name: "Beatriz Ramos", 
      phone: "(11) 94444-3333", 
      cpf: "852.741.963-66", 
      eventType: "Casamento", 
      buffetTime: "5 horas", 
      value: "R$ 26.600", 
      valueCents: 2660000, 
      validity: "15 dias", 
      notes: "Falta aprovação final do decorador.",
      servicosContratados: ["buffet", "decoracao"],
      valoresPorServico: { buffet: 2500000, decoracao: 300000 },
      descontoCombo: 0.05,
      subtotalCents: 2800000,
      totalCents: 2660000
    },
    "lead-8": { 
      id: "lead-8", 
      name: "Lucas Ferreira", 
      phone: "(11) 93333-2222", 
      cpf: "963.852.741-77", 
      eventType: "Adulto", 
      buffetTime: "5 horas", 
      value: "R$ 34.200", 
      valueCents: 3420000, 
      validity: "15 dias",
      servicosContratados: ["buffet", "decoracao", "fotografia"],
      valoresPorServico: { buffet: 2800000, decoracao: 600000, fotografia: 400000 },
      descontoCombo: 0.10,
      subtotalCents: 3800000,
      totalCents: 3420000
    },
    "lead-9": { 
      id: "lead-9", 
      name: "Patrícia Nunes", 
      phone: "(11) 92222-1111", 
      cpf: "147.258.369-88", 
      eventType: "Casamento", 
      buffetTime: "5 horas", 
      value: "R$ 25.175", 
      valueCents: 2517500, 
      validity: "15 dias",
      servicosContratados: ["buffet", "decoracao"],
      valoresPorServico: { buffet: 2350000, decoracao: 300000 },
      descontoCombo: 0.05,
      subtotalCents: 2650000,
      totalCents: 2517500
    },
    "lead-10": { 
      id: "lead-10", 
      name: "Diego Rocha", 
      phone: "(11) 91111-0000", 
      cpf: "258.369.147-99", 
      eventType: "Corporativo", 
      buffetTime: "5 horas", 
      value: "R$ 15.000", 
      valueCents: 1500000, 
      validity: "15 dias",
      servicosContratados: ["buffet"],
      valoresPorServico: { buffet: 1500000 },
      descontoCombo: 0,
      subtotalCents: 1500000,
      totalCents: 1500000
    },
  },
  columns: [
    { id: "col-novo", title: "Novo Lead", color: "var(--gold-400)", leadIds: ["lead-1", "lead-2", "lead-3", "lead-4", "lead-5"] },
    { id: "col-proposta", title: "Proposta Enviada", color: "var(--warning)", leadIds: ["lead-6", "lead-7"] },
    { id: "col-negociacao", title: "Negociação", color: "#a78bfa", leadIds: ["lead-8"] },
    { id: "col-fechado", title: "Fechado", color: "var(--success)", leadIds: ["lead-9", "lead-10"] },
  ],
};

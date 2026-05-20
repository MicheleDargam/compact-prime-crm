// ===== Service Types =====

export type ServiceType = "buffet" | "decoracao" | "fotografia";
export type ServiceRole = "principal" | "adicional";
export type EventoStatus = "Lead" | "Proposta Enviada" | "Negociação" | "Fechado" | "Cancelado";
export type EventType = "Casamento" | "Infantil" | "Adulto" | "Corporativo";

// ===== Service Config =====

export interface ServiceConfig {
  id: ServiceType;
  label: string;
  role: ServiceRole;
  color: string;       // Tailwind bg class
  textColor: string;   // Tailwind text class
  borderColor: string; // Tailwind border class
}

export const SERVICES: Record<ServiceType, ServiceConfig> = {
  buffet: {
    id: "buffet",
    label: "Buffet",
    role: "principal",
    color: "bg-amber-500/20",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/40",
  },
  decoracao: {
    id: "decoracao",
    label: "Decoração",
    role: "adicional",
    color: "bg-purple-500/20",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/40",
  },
  fotografia: {
    id: "fotografia",
    label: "Fotografia",
    role: "adicional",
    color: "bg-sky-500/20",
    textColor: "text-sky-400",
    borderColor: "border-sky-500/40",
  },
};

// ===== Combo Config =====

export interface ComboConfig {
  label: string;
  color: string;
  textColor: string;
  borderColor: string;
}

export const COMBO_CONFIG: ComboConfig = {
  label: "Combo",
  color: "bg-gradient-to-r from-amber-500/20 to-purple-500/20",
  textColor: "text-amber-300",
  borderColor: "border-amber-400/40",
};

/** Desconto aplicado por quantidade de serviços adicionais no combo */
export const COMBO_DISCOUNTS: Record<number, number> = {
  1: 0,     // só buffet — sem desconto
  2: 0.05,  // buffet + 1 adicional — 5% de desconto
  3: 0.10,  // buffet + 2 adicionais — 10% de desconto
};

// ===== Event/Lead Types =====

export interface ValoresPorServico {
  buffet?: number;       // em centavos
  decoracao?: number;
  fotografia?: number;
}

export interface EventoMultiServico {
  id: string;
  cliente: string;
  phone: string;
  eventType: EventType;
  dataEvento: string;
  servicosContratados: ServiceType[];
  valoresPorServico: ValoresPorServico;
  /** Percentual de desconto combo (0–1). Ex: 0.05 = 5% */
  descontoCombo: number;
  /** Soma dos serviços antes do desconto, em centavos */
  subtotalCents: number;
  /** Total final após desconto, em centavos */
  totalCents: number;
  status: EventoStatus;
  notes?: string;
}

// ===== Helpers =====

export function calcularTotalEvento(
  valores: ValoresPorServico,
  servicos: ServiceType[]
): { subtotalCents: number; descontoCombo: number; totalCents: number } {
  const subtotalCents =
    (valores.buffet ?? 0) +
    (valores.decoracao ?? 0) +
    (valores.fotografia ?? 0);

  const descontoCombo = COMBO_DISCOUNTS[servicos.length] ?? 0;
  const totalCents = Math.round(subtotalCents * (1 - descontoCombo));

  return { subtotalCents, descontoCombo, totalCents };
}

export function isCombo(servicos: ServiceType[]): boolean {
  return servicos.length > 1;
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

// ===== Mock Data =====

export const mockEventos: EventoMultiServico[] = [
  {
    id: "evt-001",
    cliente: "Maria Silva",
    phone: "(11) 98765-4321",
    eventType: "Casamento",
    dataEvento: "2026-07-12",
    servicosContratados: ["buffet", "decoracao", "fotografia"],
    valoresPorServico: { buffet: 2250000, decoracao: 800000, fotografia: 600000 },
    descontoCombo: 0.10,
    subtotalCents: 3650000,
    totalCents: 3285000,
    status: "Fechado",
  },
  {
    id: "evt-002",
    cliente: "Carlos Mendes",
    phone: "(11) 97777-8888",
    eventType: "Casamento",
    dataEvento: "2026-08-03",
    servicosContratados: ["buffet", "decoracao"],
    valoresPorServico: { buffet: 3500000, decoracao: 1200000 },
    descontoCombo: 0.05,
    subtotalCents: 4700000,
    totalCents: 4465000,
    status: "Negociação",
  },
  {
    id: "evt-003",
    cliente: "Ana Lima",
    phone: "(11) 91234-5678",
    eventType: "Infantil",
    dataEvento: "2026-06-21",
    servicosContratados: ["buffet"],
    valoresPorServico: { buffet: 850000 },
    descontoCombo: 0,
    subtotalCents: 850000,
    totalCents: 850000,
    status: "Proposta Enviada",
  },
  {
    id: "evt-004",
    cliente: "Ricardo Alves",
    phone: "(11) 95555-4444",
    eventType: "Corporativo",
    dataEvento: "2026-09-15",
    servicosContratados: ["buffet", "fotografia"],
    valoresPorServico: { buffet: 4500000, fotografia: 1000000 },
    descontoCombo: 0.05,
    subtotalCents: 5500000,
    totalCents: 5225000,
    status: "Lead",
  },
  {
    id: "evt-005",
    cliente: "Fernanda Costa",
    phone: "(11) 96666-5555",
    eventType: "Adulto",
    dataEvento: "2026-07-30",
    servicosContratados: ["buffet", "decoracao", "fotografia"],
    valoresPorServico: { buffet: 1800000, decoracao: 650000, fotografia: 500000 },
    descontoCombo: 0.10,
    subtotalCents: 2950000,
    totalCents: 2655000,
    status: "Proposta Enviada",
    notes: "Cliente solicitou degustação VIP.",
  },
  {
    id: "evt-006",
    cliente: "Diego Rocha",
    phone: "(11) 91111-0000",
    eventType: "Corporativo",
    dataEvento: "2026-10-05",
    servicosContratados: ["buffet"],
    valoresPorServico: { buffet: 1500000 },
    descontoCombo: 0,
    subtotalCents: 1500000,
    totalCents: 1500000,
    status: "Fechado",
  },
];

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


"use client";

import {
  type ServiceType,
  type EventoMultiServico,
  SERVICES,
  COMBO_CONFIG,
  isCombo,
} from "@/app/data/services";

// ===== Single Badge =====

interface ServiceBadgeProps {
  service: ServiceType | "combo";
  size?: "sm" | "md";
}

export function ServiceBadge({ service, size = "md" }: ServiceBadgeProps) {
  const padding = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";

  if (service === "combo") {
    return (
      <span
        className={`inline-flex items-center rounded-full border font-semibold tracking-wide ${padding} ${COMBO_CONFIG.color} ${COMBO_CONFIG.textColor} ${COMBO_CONFIG.borderColor}`}
      >
        {COMBO_CONFIG.label}
      </span>
    );
  }

  const config = SERVICES[service];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium tracking-wide ${padding} ${config.color} ${config.textColor} ${config.borderColor}`}
    >
      {config.label}
    </span>
  );
}

// ===== Badge Group (exibe todos os serviços de um evento) =====

interface ServiceBadgeGroupProps {
  evento: Pick<EventoMultiServico, "servicosContratados">;
  size?: "sm" | "md";
  showCombo?: boolean;
}

export function ServiceBadgeGroup({
  evento,
  size = "md",
  showCombo = true,
}: ServiceBadgeGroupProps) {
  const { servicosContratados } = evento;
  const combo = isCombo(servicosContratados);

  return (
    <div className="flex flex-wrap gap-1">
      {servicosContratados.map((service) => (
        <ServiceBadge key={service} service={service} size={size} />
      ))}
      {combo && showCombo && <ServiceBadge service="combo" size={size} />}
    </div>
  );
}

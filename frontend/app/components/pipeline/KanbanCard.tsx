import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Lead, ClientCategory } from "./pipeline-data";
import { CSSProperties } from "react";
import { isCombo } from "@/app/data/services";
import { ServiceBadgeGroup } from "@/app/components/ServiceBadge";
import { Sparkles, Crown, Star, Gem } from "lucide-react";

const categoryConfig: Record<ClientCategory, { label: string; icon: React.ReactNode; classes: string }> = {
  "Cliente VIP": {
    label: "VIP",
    icon: <Crown className="w-2.5 h-2.5" />,
    classes: "text-[var(--gold-300)] border-[var(--gold-500)]/40 bg-[var(--gold-500)]/10",
  },
  "Cliente Prime": {
    label: "PRIME",
    icon: <Gem className="w-2.5 h-2.5" />,
    classes: "text-blue-300 border-blue-500/40 bg-blue-500/10",
  },
  "Cliente Novo": {
    label: "NOVO",
    icon: <Star className="w-2.5 h-2.5" />,
    classes: "text-neutral-400 border-neutral-600/50 bg-neutral-800/50",
  },
};

interface KanbanCardProps {
  lead: Lead;
  columnColor: string;
}

interface CardContentProps extends KanbanCardProps {
  innerRef?: (node: HTMLElement | null) => void;
  style?: CSSProperties;
  attributes?: any;
  listeners?: any;
  isDragging?: boolean;
}

// Visual presentational component to ensure safe rendering in both Context and Overlay
export function CardContent({ lead, columnColor, innerRef, style, attributes, listeners, isDragging }: CardContentProps) {
  const combo = isCombo(lead.servicosContratados);
  const discountAmount = lead.subtotalCents - lead.totalCents;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  if (isDragging) {
    return (
      <div
        ref={innerRef}
        style={{ ...style, borderColor: columnColor, backgroundColor: "var(--bg-secondary)" }}
        className="rounded-lg p-3 border-2 border-dashed opacity-30 h-[120px]"
      />
    );
  }

  // Visual Highlight style for Combo events
  const borderStyle = combo
    ? { border: "1px solid rgba(212, 169, 55, 0.3)", boxShadow: "0 0 10px rgba(212, 169, 55, 0.04)" }
    : { borderColor: "var(--border-subtle)" };

  return (
    <div
      ref={innerRef}
      style={{
        ...style,
        background: "var(--bg-secondary)",
        ...borderStyle,
      }}
      {...attributes}
      {...listeners}
      className="rounded-lg p-3 border transition-all duration-200 cursor-grab hover:scale-[1.01] hover:shadow-card-hover active:cursor-grabbing group touch-none relative overflow-hidden"
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = columnColor; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = combo ? "rgba(212, 169, 55, 0.3)" : "var(--border-subtle)"; }}
    >
      {/* Visual Indicator Top Line for Combos */}
      {combo && (
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--gold-500)]/40 to-transparent" />
      )}

      {/* Card Header (Name, Value) */}
      <div className="flex justify-between items-start mb-2.5">
        <div>
          <p className="text-sm font-bold truncate max-w-[130px]" style={{ color: "var(--text-primary)" }}>{lead.name}</p>
          {lead.clientCategory && (() => {
            const cfg = categoryConfig[lead.clientCategory];
            return (
              <span className={`inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold border ${cfg.classes}`}>
                {cfg.icon}
                {cfg.label}
              </span>
            );
          })()}
          <p className="text-[10px] uppercase font-bold mt-0.5 tracking-wider" style={{ color: columnColor }}>{lead.eventType}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-bold font-mono" style={{ color: combo ? "var(--gold-300)" : "var(--text-primary)" }}>
            {formatCurrency(lead.totalCents / 100)}
          </p>
          <p className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>Válido: {lead.validity}</p>
        </div>
      </div>

      {/* Services Badge Row */}
      <div className="mb-2.5 pt-2 border-t border-[var(--border-subtle)]/50">
        <ServiceBadgeGroup evento={lead} size="sm" />
      </div>

      {/* Combo Details Summary */}
      {combo && (
        <div className="mb-2.5 p-2 bg-[var(--gold-500)]/5 border border-[var(--gold-500)]/10 rounded text-[9px] text-[var(--text-secondary)] font-mono leading-tight flex flex-col gap-0.5">
          <div className="flex justify-between text-[8px] font-bold text-[var(--gold-300)] uppercase tracking-wide mb-0.5 font-sans items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Resumo Combo ({lead.descontoCombo * 100}% desc)</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(lead.subtotalCents / 100)}</span>
          </div>
          <div className="flex justify-between text-emerald-400">
            <span>Desconto:</span>
            <span>-{formatCurrency(discountAmount / 100)}</span>
          </div>
        </div>
      )}
      
      {/* Contact Details */}
      <div className="space-y-1 mt-1 border-t border-[var(--border-subtle)]/40 pt-2.5">
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
          <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="font-mono text-[10px]">{lead.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
          <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
          <span className="font-mono text-[10px]">{lead.cpf}</span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
          <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px]">Buffet: {lead.buffetTime}</span>
        </div>
      </div>

      {lead.notes && (
        <div className="mt-2.5 p-2 rounded flex items-start gap-1.5" style={{ background: "rgba(234, 179, 8, 0.08)", border: "1px solid rgba(234, 179, 8, 0.15)" }}>
          <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--warning)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[9px] leading-tight text-[var(--warning)]">
            {lead.notes}
          </p>
        </div>
      )}
    </div>
  );
}

// Sortable wrapper for the columns
export function KanbanCard({ lead, columnColor }: KanbanCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: {
      type: "Lead",
      lead,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <CardContent 
      lead={lead} 
      columnColor={columnColor} 
      innerRef={setNodeRef} 
      style={style} 
      attributes={attributes} 
      listeners={listeners}
      isDragging={isDragging} 
    />
  );
}

// Helper wrapper for the Drag Overlay
export function KanbanCardOverlay({ lead, columnColor }: KanbanCardProps) {
  return (
    <CardContent lead={lead} columnColor={columnColor} />
  );
}

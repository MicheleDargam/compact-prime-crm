import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Lead } from "./pipeline-data";
import { CSSProperties } from "react";

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
  if (isDragging) {
    return (
      <div
        ref={innerRef}
        style={{ ...style, borderColor: columnColor, backgroundColor: "var(--bg-secondary)" }}
        className="rounded-lg p-3 border-2 border-dashed opacity-30 h-[86px]"
      />
    );
  }

  return (
    <div
      ref={innerRef}
      style={{
        ...style,
        background: "var(--bg-secondary)",
        borderColor: "var(--border-subtle)",
      }}
      {...attributes}
      {...listeners}
      className="rounded-lg p-3 border transition-all duration-200 cursor-grab hover:scale-[1.01] hover:shadow-card-hover active:cursor-grabbing group touch-none"
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = columnColor; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm font-bold truncate max-w-[140px]" style={{ color: "var(--text-primary)" }}>{lead.name}</p>
          <p className="text-[10px] uppercase font-bold mt-1 tracking-wider" style={{ color: columnColor }}>{lead.eventType}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{lead.value}</p>
          <p className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>Válido: {lead.validity}</p>
        </div>
      </div>
      
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
          <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="font-mono text-[11px]">{lead.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
          <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
          <span className="font-mono text-[11px]">{lead.cpf}</span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
          <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[11px]">Buffet: {lead.buffetTime}</span>
        </div>
      </div>

      {lead.notes && (
        <div className="mt-1 p-2 rounded flex items-start gap-1.5" style={{ background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.2)" }}>
          <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--warning)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[10px] leading-tight" style={{ color: "var(--warning)" }}>
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
    transform: CSS.Transform.toString(transform),
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

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
      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{lead.name}</p>
      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{lead.event}</p>
      <p className="text-xs font-semibold mt-1.5" style={{ color: columnColor }}>{lead.value}</p>
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

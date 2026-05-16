import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Column, Lead } from "./pipeline-data";
import { KanbanCard } from "./KanbanCard";
import { useMemo } from "react";

interface KanbanColumnProps {
  column: Column;
  leads: Lead[];
}

export function KanbanColumn({ column, leads }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const leadIds = useMemo(() => leads.map((l) => l.id), [leads]);

  return (
    <div
      className="min-w-[280px] flex-1 rounded-xl border flex flex-col max-h-[800px]"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 p-3 pb-2 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: column.color, boxShadow: `0 0 8px ${column.color}40` }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
          {column.title}
        </span>
        <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--bg-input)", color: "var(--text-muted)" }}>
          {leads.length}
        </span>
      </div>

      {/* Droppable Area */}
      <div 
        ref={setNodeRef} 
        className="flex-1 p-3 overflow-y-auto space-y-3"
        style={{ scrollbarWidth: "thin" }}
      >
        <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} columnColor={column.color} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

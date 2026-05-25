"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { KanbanState, Lead } from "./pipeline-data";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCardOverlay } from "./KanbanCard";
import { isCombo } from "@/app/data/services";

const EMPTY_STATE: KanbanState = {
  leads: {},
  columns: [
    { id: "col-novo", title: "Novo Cliente", color: "var(--gold-400)", leadIds: [] },
    { id: "col-proposta", title: "Proposta Enviada", color: "var(--warning)", leadIds: [] },
    { id: "col-negociacao", title: "Negociação", color: "#a78bfa", leadIds: [] },
    { id: "col-fechado", title: "Fechado", color: "var(--success)", leadIds: [] },
  ],
};

const COLUMN_TO_STATUS: Record<string, string> = {
  "col-novo": "lead",
  "col-proposta": "proposta",
  "col-negociacao": "negociacao",
  "col-fechado": "fechado",
};

const serviceFilterOptions = ["Todos", "Buffet", "Decoração", "Fotografia", "Combo"];

export default function PipelineKanban() {
  const [data, setData] = useState<KanbanState>(EMPTY_STATE);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [activeColumnColor, setActiveColumnColor] = useState<string>("");
  const [activeServiceFilter, setActiveServiceFilter] = useState<string>("Todos");
  // After the entrance animation ends, remove the class so transform:translateY(0)
  // is cleared. Without this, the retained transform creates a containing block
  // that breaks position:fixed on DragOverlay, causing the card to appear below the cursor.
  const [entranceAnimated, setEntranceAnimated] = useState(false);

  useEffect(() => {
    fetch("/api/painel-clientes")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setData(json.data);
      })
      .catch(() => {});
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires moving 5px before drag starts. Essential for mobile scrolling and clicking.
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const totalLeads = Object.keys(data.leads).length;

  // Filter count logic
  const filteredTotalCount = Object.values(data.leads).filter((lead) => {
    if (activeServiceFilter === "Todos") return true;
    if (activeServiceFilter === "Combo") return isCombo(lead.servicosContratados);
    
    const serviceMap: Record<string, string> = {
      "Buffet": "buffet",
      "Decoração": "decoracao",
      "Fotografia": "fotografia",
    };
    return lead.servicosContratados.includes(serviceMap[activeServiceFilter] as any);
  }).length;

  const findColumnByLeadId = (id: string) => {
    return data.columns.find((col) => col.leadIds.includes(id));
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id } = active;
    const activeData = active.data.current;

    if (activeData?.type === "Lead") {
      setActiveLead(activeData.lead);
      const col = findColumnByLeadId(id as string);
      if (col) setActiveColumnColor(col.color);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    setActiveColumnColor("");

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const isOverLead = over.data.current?.type === "Lead";
    const isOverColumn = over.data.current?.type === "Column";

    let movedToColumnId: string | null = null;

    setData((prev) => {
      const activeColumn = prev.columns.find((col) => col.leadIds.includes(activeId));
      if (!activeColumn) return prev;

      if (isOverLead) {
        const overColumn = prev.columns.find((col) => col.leadIds.includes(overId));
        if (!overColumn) return prev;

        if (activeColumn.id === overColumn.id) {
          const activeIndex = activeColumn.leadIds.indexOf(activeId);
          const overIndex = activeColumn.leadIds.indexOf(overId);
          if (activeIndex === overIndex) return prev;
          return {
            ...prev,
            columns: prev.columns.map((col) =>
              col.id === activeColumn.id
                ? { ...col, leadIds: arrayMove(col.leadIds, activeIndex, overIndex) }
                : col
            ),
          };
        }

        movedToColumnId = overColumn.id;
        const activeItems = activeColumn.leadIds.filter((id) => id !== activeId);
        const overItems = overColumn.leadIds;
        const overIndex = overItems.indexOf(overId);
        return {
          ...prev,
          columns: prev.columns.map((col) => {
            if (col.id === activeColumn.id) return { ...col, leadIds: activeItems };
            if (col.id === overColumn.id) return { ...col, leadIds: [...overItems.slice(0, overIndex), activeId, ...overItems.slice(overIndex)] };
            return col;
          }),
        };
      }

      if (isOverColumn) {
        if (activeColumn.id === overId) return prev;
        movedToColumnId = overId;
        const activeItems = activeColumn.leadIds.filter((id) => id !== activeId);
        return {
          ...prev,
          columns: prev.columns.map((col) => {
            if (col.id === activeColumn.id) return { ...col, leadIds: activeItems };
            if (col.id === overId) return { ...col, leadIds: [...col.leadIds, activeId] };
            return col;
          }),
        };
      }

      return prev;
    });

    if (movedToColumnId) {
      const newStatus = COLUMN_TO_STATUS[movedToColumnId];
      if (newStatus) {
        fetch(`/api/painel-clientes/${activeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }).catch(() => {});
      }
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }),
  };

  return (
    <div
      className={entranceAnimated ? undefined : "animate-fade-in-up stagger-5"}
      style={entranceAnimated ? undefined : { opacity: 0 }}
      onAnimationEnd={entranceAnimated ? undefined : (e) => {
        if (e.target === e.currentTarget) setEntranceAnimated(true);
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Pipeline Comercial
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Arraste os cards para avançar os clientes de etapa
          </p>
        </div>
        <span className="text-xs font-semibold px-4 py-2 rounded-full self-start md:self-auto" style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
          {activeServiceFilter === "Todos"
            ? `${totalLeads} clientes ativos`
            : `${filteredTotalCount} de ${totalLeads} clientes (${activeServiceFilter})`}
        </span>
      </div>

      {/* Service Filters Pills Row */}
      <div className="flex items-center gap-2 mb-6 bg-[var(--bg-card)] p-3.5 rounded-xl border border-[var(--border-default)] shadow-card overflow-x-auto no-scrollbar">
        <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider shrink-0 mr-2">Filtrar Serviço:</span>
        <div className="flex gap-2">
          {serviceFilterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveServiceFilter(filter)}
              className={`
                px-4 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer whitespace-nowrap
                ${activeServiceFilter === filter 
                  ? 'bg-[var(--gold-500)]/15 text-[var(--gold-300)] border-[var(--gold-500)]/30 shadow-[var(--shadow-gold-glow)]' 
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--gold-500)]/20 hover:text-[var(--text-primary)]'}
              `}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2" style={{ scrollbarWidth: "thin" }}>
          {data.columns.map((col) => {
            const columnLeads = col.leadIds
              .map((id) => data.leads[id])
              .filter((lead) => {
                if (activeServiceFilter === "Todos") return true;
                if (activeServiceFilter === "Combo") return isCombo(lead.servicosContratados);
                
                const serviceMap: Record<string, string> = {
                  "Buffet": "buffet",
                  "Decoração": "decoracao",
                  "Fotografia": "fotografia",
                };
                return lead.servicosContratados.includes(serviceMap[activeServiceFilter] as any);
              });
            return <KanbanColumn key={col.id} column={col} leads={columnLeads} />;
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={dropAnimation}>
          {activeLead ? (
            <div style={{ transform: "rotate(4deg)", opacity: 0.9, boxShadow: "var(--shadow-gold-glow)" }}>
              <KanbanCardOverlay lead={activeLead} columnColor={activeColumnColor} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

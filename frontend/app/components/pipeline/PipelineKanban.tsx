"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { INITIAL_DATA, KanbanState, Lead } from "./pipeline-data";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCardOverlay } from "./KanbanCard";

export default function PipelineKanban() {
  const [data, setData] = useState<KanbanState>(INITIAL_DATA);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [activeColumnColor, setActiveColumnColor] = useState<string>("");

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

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveLead = active.data.current?.type === "Lead";
    const isOverLead = over.data.current?.type === "Lead";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveLead) return;

    // Moving lead over another lead (in another column)
    if (isActiveLead && isOverLead) {
      const activeColumn = findColumnByLeadId(activeId as string);
      const overColumn = findColumnByLeadId(overId as string);

      if (!activeColumn || !overColumn) return;

      if (activeColumn.id !== overColumn.id) {
        setData((prev) => {
          const activeItems = [...activeColumn.leadIds];
          const overItems = [...overColumn.leadIds];
          const activeIndex = activeItems.indexOf(activeId as string);
          const overIndex = overItems.indexOf(overId as string);

          activeItems.splice(activeIndex, 1);
          
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top > over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;
          const newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
          
          overItems.splice(newIndex, 0, activeId as string);

          return {
            ...prev,
            columns: prev.columns.map((col) => {
              if (col.id === activeColumn.id) return { ...col, leadIds: activeItems };
              if (col.id === overColumn.id) return { ...col, leadIds: overItems };
              return col;
            }),
          };
        });
      }
    }

    // Moving lead over an empty column
    if (isActiveLead && isOverColumn) {
      const activeColumn = findColumnByLeadId(activeId as string);
      if (!activeColumn) return;

      if (activeColumn.id !== overId) {
        setData((prev) => {
          const activeItems = [...activeColumn.leadIds];
          const activeIndex = activeItems.indexOf(activeId as string);
          activeItems.splice(activeIndex, 1);

          return {
            ...prev,
            columns: prev.columns.map((col) => {
              if (col.id === activeColumn.id) return { ...col, leadIds: activeItems };
              if (col.id === overId) return { ...col, leadIds: [...col.leadIds, activeId as string] };
              return col;
            }),
          };
        });
      }
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    setActiveColumnColor("");

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeColumn = findColumnByLeadId(activeId as string);
    const overColumn = findColumnByLeadId(overId as string);

    if (!activeColumn || !overColumn) return;

    // Sorting within the same column
    if (activeColumn.id === overColumn.id) {
      const activeIndex = activeColumn.leadIds.indexOf(activeId as string);
      const overIndex = overColumn.leadIds.indexOf(overId as string);

      if (activeIndex !== overIndex) {
        setData((prev) => {
          const newItems = arrayMove(activeColumn.leadIds, activeIndex, overIndex);
          return {
            ...prev,
            columns: prev.columns.map((col) =>
              col.id === activeColumn.id ? { ...col, leadIds: newItems } : col
            ),
          };
        });
      }
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }),
  };

  return (
    <div className="animate-fade-in-up stagger-5" style={{ opacity: 0, animationFillMode: "forwards" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Pipeline Comercial
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Arraste os cards para avançar os leads de etapa
          </p>
        </div>
        <span className="text-xs font-semibold px-4 py-2 rounded-full" style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
          {totalLeads} leads ativos
        </span>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2" style={{ scrollbarWidth: "thin" }}>
          {data.columns.map((col) => {
            const columnLeads = col.leadIds.map((id) => data.leads[id]);
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

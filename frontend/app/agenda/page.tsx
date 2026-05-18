"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar } from "lucide-react";

// Definição dos tipos de eventos para tipagem forte
type EventType = "casamento" | "infantil" | "corporativo" | "adulto" | "reuniao" | "visita";

interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  time: string;
}

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  events: CalendarEvent[];
}

// Configuração de cores por tipo de evento
const eventStyleMap: Record<EventType, string> = {
  casamento: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  infantil: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  corporativo: "bg-green-500/10 text-green-400 border-green-500/20",
  adulto: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  reuniao: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  visita: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

// Geração dos dias do mês de Maio de 2026 (Exemplo visual)
// O mês começa na sexta-feira. 
const generateMockDays = (): CalendarDay[] => {
  const days: CalendarDay[] = [];
  
  // Dias do mês anterior (Abril) - Domingo a Quinta
  const prevMonthDays = [26, 27, 28, 29, 30];
  prevMonthDays.forEach(date => {
    days.push({ date, isCurrentMonth: false, events: [] });
  });

  // Dias do mês atual (Maio)
  for (let i = 1; i <= 31; i++) {
    const events: CalendarEvent[] = [];
    
    // Inserindo os eventos mockados nos dias específicos
    if (i === 2) {
      events.push({ id: "1", title: "Ana & João", type: "casamento", time: "19:00" });
    }
    if (i === 5) {
      events.push({ id: "2", title: "Visita técnica", type: "visita", time: "10:00" });
      events.push({ id: "3", title: "Reunião de proposta", type: "reuniao", time: "14:00" });
    }
    if (i === 9) {
      events.push({ id: "4", title: "Infantil Miguel", type: "infantil", time: "14:00" });
      events.push({ id: "5", title: "Adulto Juliana", type: "adulto", time: "20:00" });
    }
    if (i === 14) {
      events.push({ id: "6", title: "Corp. PrimeTech", type: "corporativo", time: "09:00" });
    }
    if (i === 23) {
      events.push({ id: "7", title: "Reunião com DJ", type: "reuniao", time: "16:00" });
    }

    days.push({ 
      date: i, 
      isCurrentMonth: true, 
      isToday: i === 18, // Simulando que o dia "hoje" é 18
      events 
    });
  }

  // Preenchendo o final do grid para fechar 5 ou 6 semanas (total 42 células)
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({ date: i, isCurrentMonth: false, events: [] });
  }

  return days;
};

export default function AgendaPage() {
  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const calendarDays = generateMockDays();

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] p-4 md:p-8 animate-fade-in-up">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-card">
            <Calendar className="w-6 h-6 text-[var(--gold-400)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Agenda</h1>
            <p className="text-sm text-[var(--text-secondary)]">Visão geral dos eventos de Maio</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[var(--bg-card)] p-1.5 rounded-lg border border-[var(--border-default)] shadow-card">
          <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-md transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-[var(--text-primary)] min-w-[120px] text-center">
            Maio 2026
          </span>
          <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-md transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Calendar Grid Container */}
      <div className="flex-1 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] shadow-card overflow-hidden flex flex-col">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-[var(--border-default)] bg-[var(--bg-secondary)]">
          {daysOfWeek.map((day, index) => (
            <div 
              key={index} 
              className="py-3 px-2 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6">
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`
                min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2 border-r border-b border-[var(--border-default)]
                flex flex-col gap-1 sm:gap-1.5 transition-colors
                ${!day.isCurrentMonth ? 'bg-[var(--bg-secondary)]/30 opacity-60' : 'hover:bg-[var(--bg-card-hover)]/50'}
                ${index % 7 === 6 ? 'border-r-0' : ''} /* Remove a borda direita da última coluna */
              `}
            >
              {/* Day Header */}
              <div className="flex justify-end">
                <span 
                  className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium
                    ${day.isToday 
                      ? 'bg-[var(--gold-500)] text-white shadow-[var(--shadow-gold-glow)]' 
                      : day.isCurrentMonth ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                    }
                  `}
                >
                  {day.date}
                </span>
              </div>

              {/* Events list */}
              <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar">
                {day.events.map((event) => (
                  <div 
                    key={event.id}
                    className={`
                      text-[10px] sm:text-xs px-1.5 py-1 rounded border truncate flex flex-col sm:flex-row sm:items-center sm:gap-1.5
                      ${eventStyleMap[event.type]}
                    `}
                    title={`${event.time} - ${event.title}`}
                  >
                    <span className="font-semibold opacity-80 shrink-0">{event.time}</span>
                    <span className="truncate hidden sm:inline">{event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        className="
          fixed bottom-6 right-6 sm:bottom-8 sm:right-8 
          w-14 h-14 bg-gradient-to-tr from-[var(--gold-600)] to-[var(--gold-400)]
          rounded-full flex items-center justify-center text-[var(--bg-primary)]
          shadow-[var(--shadow-gold-glow)] hover:scale-105 hover:shadow-lg transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-[var(--gold-300)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]
          z-50
        "
        title="Adicionar Novo Evento"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}

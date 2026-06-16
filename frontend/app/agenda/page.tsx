"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Sparkles,
  Users,
  Clock,
  ClipboardList,
  Info,
  Download,
  Trash2
} from "lucide-react";
import { 
  type ServiceType, 
  isCombo,
  SERVICES 
} from "@/app/data/services";
import { ServiceBadgeGroup } from "@/app/components/ServiceBadge";

// Types
type EventType = "casamento" | "infantil" | "corporativo" | "adulto" | "reuniao" | "visita";
export type StatusOperacional = "Confirmado" | "Montagem" | "Em andamento" | "Finalizado";

interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  time: string;
  servicosContratados: ServiceType[];
  statusOperacional: StatusOperacional;
  colaboradoresCount: number;
}

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  events: CalendarEvent[];
}

// Event Type Styles
const eventStyleMap: Record<EventType, string> = {
  casamento: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  infantil: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  corporativo: "bg-green-500/10 text-green-400 border-green-500/20",
  adulto: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  reuniao: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  visita: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

// Event Type Translation Label
const eventTypeLabels: Record<EventType, string> = {
  casamento: "Casamento",
  infantil: "Infantil",
  corporativo: "Corporativo",
  adulto: "Adulto",
  reuniao: "Reunião Comercial",
  visita: "Visita Técnica",
};

// Status Operacional Styles
const statusStyleMap: Record<StatusOperacional, string> = {
  "Confirmado": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Montagem": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Em andamento": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Finalizado": "bg-green-500/10 text-green-400 border-green-500/20",
};

const serviceFilterOptions = ["Todos", "Buffet", "Decoração", "Fotografia", "Combo"];

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function buildCalendarDays(year: number, month: number, apiEvents: Record<number, CalendarEvent[]>): CalendarDay[] {
  const days: CalendarDay[] = [];
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const startDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const isCurrMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({ date: prevMonthDays - i, isCurrentMonth: false, events: [] });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: d, isCurrentMonth: true, isToday: isCurrMonth && d === today.getDate(), events: apiEvents[d] ?? [] });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: i, isCurrentMonth: false, events: [] });
  }
  return days;
}

export default function AgendaPage() {
  const now = new Date();
  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [activeServiceFilter, setActiveServiceFilter] = useState("Todos");
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Novo Agendamento
  const [showNewModal, setShowNewModal] = useState(false);
  const [newNome, setNewNome] = useState("");
  const [newTipo, setNewTipo] = useState("Casamento");
  const [newData, setNewData] = useState("");
  const [newHorario, setNewHorario] = useState("");
  const [newObs, setNewObs] = useState("");
  const [newSaving, setNewSaving] = useState(false);
  const [newError, setNewError] = useState("");
  const [conflictWarning, setConflictWarning] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteEvent = async (eventoId: string, nomeCliente: string) => {
    if (!confirm(`Arquivar o evento de "${nomeCliente}"? Ele sairá da agenda mas pode ser visto em arquivados.`)) return;
    setDeletingId(eventoId);
    try {
      const res = await fetch(`/api/painel-clientes/${eventoId}?action=arquivar`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        const r = await fetch(`/api/agenda?year=${currentYear}&month=${currentMonth}`);
        const j = await r.json();
        if (j.ok) {
          const built = buildCalendarDays(j.data.year, j.data.month, j.data.events);
          setCalendarDays(built);
          const updated = built.find(d => d.date === selectedDay?.date && d.isCurrentMonth) ?? null;
          setSelectedDay(updated);
        }
      }
    } catch { /* silencioso */ }
    finally { setDeletingId(null); }
  };

  const handleImport = async () => {
    if (!confirm("Importar eventos do Google Agenda para o CRM? Eventos já importados serão ignorados.")) return;
    setImporting(true);
    setImportMsg(null);
    let totalImportados = 0;
    try {
      let temMais = true;
      while (temMais) {
        const res = await fetch("/api/agenda/importar-gcal", { method: "POST" });
        const json = await res.json();
        if (!json.ok) {
          setImportMsg({ ok: false, text: json.error ?? "Erro ao importar." });
          return;
        }
        totalImportados += json.importados ?? 0;
        temMais = json.temMais ?? false;
        setImportMsg({ ok: true, text: `Importando... ${totalImportados} evento(s) até agora.` });
      }
      setImportMsg({ ok: true, text: `${totalImportados} evento(s) importado(s) com sucesso. Tudo importado!` });
      const r = await fetch(`/api/agenda?year=${currentYear}&month=${currentMonth}`);
      const j = await r.json();
      if (j.ok) setCalendarDays(buildCalendarDays(j.data.year, j.data.month, j.data.events));
    } catch {
      setImportMsg({ ok: false, text: "Erro de conexão. Clique novamente para continuar de onde parou." });
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    if (!newData) { setConflictWarning(""); return; }
    const [y, m, d] = newData.split("-").map(Number);
    fetch(`/api/agenda?year=${y}&month=${m}`)
      .then(r => r.json())
      .then(json => {
        if (!json.ok) return;
        const events: CalendarEvent[] = json.data.events[d] ?? [];
        if (events.length > 0) {
          const nomes = events.map((e: CalendarEvent) => e.title).join(", ");
          setConflictWarning(`Já existe${events.length > 1 ? "m" : ""} ${events.length} evento(s) nessa data: ${nomes}`);
        } else {
          setConflictWarning("");
        }
      })
      .catch(() => setConflictWarning(""));
  }, [newData]);

  const monthLabel = `${MONTH_NAMES[currentMonth - 1]} ${currentYear}`;

  useEffect(() => {
    fetch(`/api/agenda?year=${currentYear}&month=${currentMonth}`)
      .then(r => r.json())
      .then(json => {
        if (!json.ok) return;
        const { year, month, events } = json.data as { year: number; month: number; events: Record<number, CalendarEvent[]> };
        const built = buildCalendarDays(year, month, events);
        setCalendarDays(built);
        const todayD = year === now.getFullYear() && month === now.getMonth() + 1 ? now.getDate() : 1;
        setSelectedDay(built.find(d => d.date === todayD && d.isCurrentMonth) ?? built.find(d => d.isCurrentMonth) ?? null);
      })
      .catch(() => {});
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) { setCurrentYear(y => y - 1); setCurrentMonth(12); }
    else setCurrentMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) { setCurrentYear(y => y + 1); setCurrentMonth(1); }
    else setCurrentMonth(m => m + 1);
  };

  const handleSaveAgendamento = async () => {
    setNewError("");
    if (!newNome.trim() || !newData) { setNewError("Nome e data são obrigatórios."); return; }
    setNewSaving(true);
    try {
      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeCliente: newNome, tipoEvento: newTipo, dataEvento: newData, horario: newHorario || undefined, observacoes: newObs || undefined }),
      });
      const json = await res.json();
      if (!json.ok) { setNewError(json.error ?? "Erro ao salvar."); return; }
      setShowNewModal(false);
      setNewNome(""); setNewTipo("Casamento"); setNewData(""); setNewHorario(""); setNewObs(""); setNewError(""); setConflictWarning("");
      // Refresh calendar
      const r = await fetch(`/api/agenda?year=${currentYear}&month=${currentMonth}`);
      const j = await r.json();
      if (j.ok) {
        const built = buildCalendarDays(j.data.year, j.data.month, j.data.events);
        setCalendarDays(built);
      }
    } catch { setNewError("Erro de conexão."); }
    finally { setNewSaving(false); }
  };

  const handleSelectDay = (day: CalendarDay) => {
    if (day.isCurrentMonth) {
      const actualDay = calendarDays.find(d => d.date === day.date && d.isCurrentMonth);
      if (actualDay) setSelectedDay(actualDay);
    }
  };

  const getFilteredEvents = (events: CalendarEvent[]) => {
    return events.filter(e => {
      if (activeServiceFilter === "Todos") return true;
      if (activeServiceFilter === "Combo") return isCombo(e.servicosContratados);
      const serviceMap: Record<string, string> = { "Buffet": "buffet", "Decoração": "decoracao", "Fotografia": "fotografia" };
      return e.servicosContratados.includes(serviceMap[activeServiceFilter] as any);
    });
  };

  const selectedDayFilteredEvents = selectedDay ? getFilteredEvents(selectedDay.events) : [];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] p-4 md:p-8 animate-fade-in-up overflow-y-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-card">
            <Calendar className="w-6 h-6 text-[var(--gold-400)]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--gold-300)] tracking-widest uppercase">
              <Sparkles className="w-3 h-3" />
              <span>Cronograma de Operações</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">Agenda</h1>
            <p className="text-sm text-[var(--text-secondary)]">Visão geral dos eventos e logística</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleImport}
            disabled={importing}
            title="Importar eventos do Google Agenda"
            className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--gold-500)]/30 transition-all disabled:opacity-60 cursor-pointer shadow-card"
          >
            <Download className="w-4 h-4 text-[var(--gold-400)]" />
            {importing ? "Importando..." : "Importar do Google"}
          </button>

          <div className="flex items-center gap-4 bg-[var(--bg-card)] p-1.5 rounded-lg border border-[var(--border-default)] shadow-card">
            <button onClick={handlePrevMonth} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-md transition-colors cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-[var(--text-primary)] min-w-[120px] text-center font-sans">
              {monthLabel}
            </span>
            <button onClick={handleNextMonth} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-md transition-colors cursor-pointer">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {importMsg && (
        <div className={`mb-4 px-4 py-3 rounded-xl border text-xs font-semibold flex items-center gap-2 shrink-0 ${importMsg.ok ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          <span>{importMsg.ok ? "✓" : "✕"}</span>
          <span>{importMsg.text}</span>
          <button onClick={() => setImportMsg(null)} className="ml-auto text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">×</button>
        </div>
      )}

      {/* Service Legenda / Filtros Horizontais */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-6 bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-default)] shadow-card overflow-x-auto no-scrollbar shrink-0">
        <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider w-32 shrink-0">Filtrar Agenda:</span>
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

      {/* Híbrido Layout: Calendar Grid + Selected Day details panel */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[500px]">
        {/* Calendar Grid Container (Left) */}
        <div className="flex-1 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] shadow-card flex flex-col overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-[var(--border-default)] bg-[var(--bg-secondary)] shrink-0">
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
            {calendarDays.map((day, index) => {
              const isSelected = selectedDay && day.isCurrentMonth && selectedDay.date === day.date;
              const filteredEvents = getFilteredEvents(day.events);

              return (
                <div 
                  key={index}
                  onClick={() => handleSelectDay(day)}
                  className={`
                    min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 border-r border-b border-[var(--border-default)]
                    flex flex-col gap-1 sm:gap-1.5 transition-colors cursor-pointer select-none
                    ${!day.isCurrentMonth ? 'bg-[var(--bg-secondary)]/30 opacity-60 pointer-events-none' : 'hover:bg-[var(--bg-card-hover)]/30'}
                    ${isSelected ? 'bg-[var(--gold-500)]/[0.04] border-l-2 border-l-[var(--gold-500)]' : ''}
                    ${index % 7 === 6 ? 'border-r-0' : ''}
                  `}
                >
                  {/* Day Header */}
                  <div className="flex justify-between items-center">
                    {/* Small Dot indicator for events total */}
                    {day.isCurrentMonth && day.events.length > 0 && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                    )}
                    <span 
                      className={`
                        w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold font-mono
                        ${day.isToday 
                          ? 'bg-[var(--gold-500)] text-black shadow-[var(--shadow-gold-glow)] font-bold' 
                          : isSelected
                            ? 'bg-[var(--bg-input)] text-[var(--gold-300)] border border-[var(--gold-500)]/30'
                            : day.isCurrentMonth ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                        }
                      `}
                    >
                      {day.date}
                    </span>
                  </div>

                  {/* Events list in Calendar cell */}
                  <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar max-h-[70px]">
                    {filteredEvents.map((event) => {
                      const isEventCombo = isCombo(event.servicosContratados);
                      
                      return (
                        <div 
                          key={event.id}
                          className={`
                            text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border truncate flex items-center justify-between gap-1
                            ${eventStyleMap[event.type]}
                            ${isEventCombo ? 'border-[var(--gold-400)]/30 shadow-[0_0_6px_rgba(212,169,55,0.08)]' : ''}
                          `}
                          title={`${event.time} - ${event.title} (${event.type})`}
                        >
                          <span className="truncate">{event.title}</span>
                          {isEventCombo && <span className="w-1 h-1 rounded-full bg-[var(--gold-400)] shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel (Right on Desktop, Below on Mobile) */}
        <div className="w-full lg:w-[360px] shrink-0 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] shadow-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-default)]">
            <div>
              <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-[var(--gold-400)]" />
                Eventos do Dia
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Visão logística da data selecionada</p>
            </div>
            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-[var(--bg-input)] text-[var(--gold-300)] border border-[var(--border-default)]">
              {selectedDay ? `${selectedDay.date} de ${MONTH_NAMES[currentMonth - 1]}, ${currentYear}` : "—"}
            </span>
          </div>

          {/* List of Detailed Events */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[420px] pr-1" style={{ scrollbarWidth: "thin" }}>
            {selectedDayFilteredEvents.length > 0 ? (
              selectedDayFilteredEvents.map((event) => {
                const eventCombo = isCombo(event.servicosContratados);

                return (
                  <div 
                    key={event.id}
                    className={`
                      p-3.5 rounded-xl border flex flex-col gap-3 relative overflow-hidden transition-all bg-[var(--bg-secondary)]
                      ${eventCombo ? 'border-[var(--gold-500)]/30 shadow-[var(--shadow-gold-glow)]' : 'border-[var(--border-default)]'}
                    `}
                  >
                    {/* Top Golden accent top bar for Combos */}
                    {eventCombo && (
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--gold-500)]/40 to-transparent" />
                    )}

                    {/* Event name & Time */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1.5">
                          {event.title}
                          {eventCombo && (
                            <span className="text-[8px] bg-[var(--gold-500)]/15 text-[var(--gold-300)] border border-[var(--gold-500)]/30 rounded px-1.5 py-0.2 uppercase font-bold tracking-wider font-sans shrink-0">
                              Combo
                            </span>
                          )}
                        </h4>
                        <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${eventStyleMap[event.type]}`}>
                          {eventTypeLabels[event.type]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 text-[var(--text-primary)] font-mono text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          <span>{event.time}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          disabled={deletingId === event.id}
                          title="Arquivar evento"
                          className="p-1 rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Service Badges */}
                    {event.servicosContratados.length > 0 && (
                      <div className="pt-2 border-t border-[var(--border-subtle)]/40">
                        <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-bold mb-1.5">Serviços Contratados:</p>
                        <ServiceBadgeGroup evento={event} size="sm" />
                      </div>
                    )}

                    {/* Operational parameters (Status, Collaborators size) */}
                    <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-[var(--border-subtle)]/40 text-[11px]">
                      <div>
                        <span className="text-[var(--text-muted)] block text-[9px] uppercase tracking-wider font-bold mb-0.5">Status Operação:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyleMap[event.statusOperacional]}`}>
                          {event.statusOperacional}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)] block text-[9px] uppercase tracking-wider font-bold mb-0.5">Equipe Logística:</span>
                        <div className="flex items-center gap-1 text-[var(--text-secondary)] font-medium font-sans">
                          <Users className="w-3.5 h-3.5 text-[var(--gold-400)] shrink-0" />
                          <span>{event.colaboradoresCount} colaboradores</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-[var(--text-muted)] flex-1">
                <Calendar className="w-8 h-8 opacity-40 mb-2" />
                <p className="text-xs font-semibold">Sem compromissos operacionais para esta data.</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-[var(--bg-input)] rounded-lg border border-[var(--border-default)] text-[10px] text-[var(--text-secondary)] font-sans leading-relaxed flex gap-2">
            <Info className="w-4 h-4 text-[var(--gold-300)] shrink-0 mt-0.5" />
            <p>Clique em qualquer dia do calendário para ver o detalhamento completo dos serviços contratados e logística de equipe.</p>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => { setNewData(`${currentYear}-${String(currentMonth).padStart(2,"0")}-${String(selectedDay?.date ?? now.getDate()).padStart(2,"0")}`); setShowNewModal(true); }}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 bg-gradient-to-tr from-[var(--gold-600)] to-[var(--gold-400)] rounded-full flex items-center justify-center text-[var(--bg-primary)] shadow-[var(--shadow-gold-glow)] hover:scale-105 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--gold-300)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] z-50 cursor-pointer"
        title="Adicionar Novo Agendamento"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Modal Novo Agendamento */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--gold-300)]" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Novo Agendamento</h3>
              </div>
              <button onClick={() => setShowNewModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <ClipboardList className="w-4 h-4 hidden" />
                <span className="text-lg leading-none">×</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Nome do Cliente *</label>
                <input type="text" placeholder="Ex: Maria Oliveira" value={newNome} onChange={e => setNewNome(e.target.value)} className="w-full px-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-400)]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Tipo *</label>
                  <select value={newTipo} onChange={e => setNewTipo(e.target.value)} className="w-full px-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-400)] cursor-pointer">
                    {["Casamento","Infantil","Adulto","Corporativo","Visita Técnica","Reunião Comercial"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Horário</label>
                  <input type="time" value={newHorario} onChange={e => setNewHorario(e.target.value)} className="w-full px-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-400)]" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Data *</label>
                <input type="date" value={newData} onChange={e => setNewData(e.target.value)} className="w-full px-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-400)]" />
                {conflictWarning && (
                  <p className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 flex items-start gap-1.5">
                    <span className="shrink-0">⚠</span>
                    <span>{conflictWarning}. Você ainda pode salvar se os serviços forem diferentes.</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Observações</label>
                <textarea rows={2} placeholder="Detalhes do agendamento..." value={newObs} onChange={e => setNewObs(e.target.value)} className="w-full px-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-400)] resize-none" />
              </div>

              {newError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{newError}</p>}

              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowNewModal(false)} className="flex-1 py-2.5 border border-[var(--border-default)] text-[var(--text-secondary)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer">Cancelar</button>
                <button onClick={handleSaveAgendamento} disabled={newSaving} className="flex-1 py-2.5 bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] text-black rounded-lg text-xs font-bold transition-all disabled:opacity-60 cursor-pointer">
                  {newSaving ? "Salvando..." : "Salvar Agendamento"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

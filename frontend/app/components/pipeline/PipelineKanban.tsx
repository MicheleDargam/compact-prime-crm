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
import { isCombo, SERVICES } from "@/app/data/services";
import {
  Eye, Pencil, RefreshCw, FileText, MessageCircle,
  Calendar, Archive, Trash2, X, CheckCircle2, AlertTriangle, Loader2,
} from "lucide-react";

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

const COLUMN_STATUS_STYLES: Record<string, string> = {
  "col-novo": "text-[var(--gold-300)] bg-[var(--gold-500)]/10 border-[var(--gold-500)]/20",
  "col-proposta": "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
  "col-negociacao": "text-violet-300 bg-violet-500/10 border-violet-500/20",
  "col-fechado": "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
};

const EVENT_TYPES = ["Casamento", "Infantil", "Adulto", "Corporativo"] as const;
const CATEGORIAS = ["Cliente Novo", "Cliente Prime", "Cliente VIP"] as const;
const SERVICE_OPTS = [
  { key: "buffet", label: "Buffet" },
  { key: "decoracao", label: "Decoração" },
  { key: "fotografia", label: "Fotografia" },
] as const;
const serviceFilterOptions = ["Todos", "Buffet", "Decoração", "Fotografia", "Combo"];

type MenuClickPos = { x: number; y: number };

interface ActiveMenu {
  leadId: string;
  x: number;
  y: number;
}

interface ServicoDetail {
  valor: string;
  observacoes: string;
}

interface EditForm {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  tipoEvento: string;
  dataEvento: string;
  servicos: string[];
  servicoDetails: Record<string, ServicoDetail>;
  observacoes: string;
  categoria: string;
}

interface MeetingForm {
  titulo: string;
  data: string;
  horario: string;
  observacoes: string;
}

interface ConfirmModal {
  type: "arquivar" | "excluir";
  lead: Lead;
  deleteText: string;
}

interface PipelineKanbanProps {
  searchTerm?: string;
  refreshTrigger?: number;
}

function DropdownItem({
  icon, label, onClick, danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
      }`}
    >
      <span className="w-4 h-4 shrink-0 flex items-center">{icon}</span>
      {label}
    </button>
  );
}

const EDIT_FORM_DEFAULT: EditForm = {
  nome: "", email: "", cpf: "", telefone: "", tipoEvento: "Casamento",
  dataEvento: "", servicos: [], servicoDetails: {}, observacoes: "", categoria: "Cliente Novo",
};

function parseCurrency(val: string): number {
  if (!val.trim()) return 0;
  const clean = val.replace(/[R$\s]/g, "");
  if (clean.includes(",")) return parseFloat(clean.replace(/\./g, "").replace(",", ".")) || 0;
  return parseFloat(clean) || 0;
}

function formatForInput(cents: number): string {
  if (!cents || cents === 0) return "";
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}

interface EmpresaConfigK {
  nome_fantasia: string;
  slogan: string;
  responsavel_legal: string;
  cargo_responsavel: string;
  assinatura_texto: string;
}

export default function PipelineKanban({ searchTerm = "", refreshTrigger = 0 }: PipelineKanbanProps) {
  const [data, setData] = useState<KanbanState>(EMPTY_STATE);
  const [empresa, setEmpresa] = useState<EmpresaConfigK>({
    nome_fantasia: "COMPACT PRIME",
    slogan: "Buffet & Eventos Premium",
    responsavel_legal: "",
    cargo_responsavel: "",
    assinatura_texto: "",
  });
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [activeColumnColor, setActiveColumnColor] = useState<string>("");
  const [entranceAnimated, setEntranceAnimated] = useState(false);
  const [activeServiceFilter, setActiveServiceFilter] = useState<string>("Todos");
  const [refreshKey, setRefreshKey] = useState(0);

  const [activeMenu, setActiveMenu] = useState<ActiveMenu | null>(null);
  const [showViewModal, setShowViewModal] = useState<Lead | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<Lead | null>(null);
  const [showProposalModal, setShowProposalModal] = useState<Lead | null>(null);

  const [showEditModal, setShowEditModal] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EDIT_FORM_DEFAULT);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const [showMeetingModal, setShowMeetingModal] = useState<Lead | null>(null);
  const [meetingForm, setMeetingForm] = useState<MeetingForm>({ titulo: "", data: "", horario: "", observacoes: "" });
  const [meetingLoading, setMeetingLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState<ConfirmModal | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToastMsg = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  useEffect(() => {
    fetch("/api/painel-clientes")
      .then((r) => r.json())
      .then((json) => { if (json.ok) setData(json.data); })
      .catch(() => {});
    fetch("/api/configuracoes/empresa")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok && json.data) {
          setEmpresa((prev) => ({ ...prev, ...json.data }));
        }
      })
      .catch(() => {});
  }, [refreshTrigger, refreshKey]);

  const leadMatchesSearch = (lead: Lead): boolean => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.cpf.toLowerCase().includes(q) ||
      lead.phone.toLowerCase().includes(q)
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const totalLeads = Object.keys(data.leads).length;

  const filteredTotalCount = Object.values(data.leads).filter((lead) => {
    if (!leadMatchesSearch(lead)) return false;
    if (activeServiceFilter === "Todos") return true;
    if (activeServiceFilter === "Combo") return isCombo(lead.servicosContratados);
    const serviceMap: Record<string, string> = { Buffet: "buffet", Decoração: "decoracao", Fotografia: "fotografia" };
    return lead.servicosContratados.includes(serviceMap[activeServiceFilter] as never);
  }).length;

  const findColumnByLeadId = (id: string) => data.columns.find((col) => col.leadIds.includes(id));

  const handleMenuClick = (pos: MenuClickPos, leadId: string) => {
    const x = Math.max(4, Math.min(pos.x - 208, (typeof window !== "undefined" ? window.innerWidth : 800) - 212));
    setActiveMenu({ leadId, x, y: pos.y });
  };

  const handleStatusChange = (leadId: string, newColumnId: string) => {
    const newStatus = COLUMN_TO_STATUS[newColumnId];
    if (!newStatus) return;

    setData((prev) => {
      const activeColumn = prev.columns.find((col) => col.leadIds.includes(leadId));
      if (!activeColumn || activeColumn.id === newColumnId) return prev;
      return {
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.id === activeColumn.id) return { ...col, leadIds: col.leadIds.filter((id) => id !== leadId) };
          if (col.id === newColumnId) return { ...col, leadIds: [...col.leadIds, leadId] };
          return col;
        }),
      };
    });

    fetch(`/api/painel-clientes/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => {});

    const colTitle = data.columns.find((c) => c.id === newColumnId)?.title ?? newColumnId;
    setShowStatusModal(null);
    showToastMsg(`Status atualizado para "${colTitle}".`);
  };

  const handleOpenEdit = (lead: Lead) => {
    const servicoDetails: Record<string, ServicoDetail> = {};
    for (const tipo of lead.servicosContratados) {
      const valueCents = lead.valoresPorServico[tipo as keyof typeof lead.valoresPorServico] ?? 0;
      const obs = lead.observacoesPorServico?.[tipo] ?? "";
      servicoDetails[tipo] = { valor: formatForInput(valueCents), observacoes: obs ?? "" };
    }
    setEditForm({
      nome: lead.name,
      email: lead.email ?? "",
      cpf: lead.cpf === "—" ? "" : lead.cpf,
      telefone: lead.phone === "—" ? "" : lead.phone,
      tipoEvento: lead.eventType,
      dataEvento: lead.data_evento ?? "",
      servicos: [...lead.servicosContratados],
      servicoDetails,
      observacoes: lead.notes ?? "",
      categoria: lead.clientCategory ?? "Cliente Novo",
    });
    setEditError("");
    setShowEditModal(lead);
  };

  const handleSaveEdit = async () => {
    if (!showEditModal) return;
    setEditLoading(true);
    setEditError("");
    try {
      const servicoDetailsForApi = Object.fromEntries(
        Object.entries(editForm.servicoDetails).map(([tipo, d]) => [
          tipo,
          { valorEstimado: parseCurrency(d.valor), observacoes: d.observacoes.trim() || null },
        ])
      );
      const res = await fetch(`/api/painel-clientes/${showEditModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, servicoDetails: servicoDetailsForApi }),
      });
      const json = await res.json();
      if (json.ok) {
        setShowEditModal(null);
        setRefreshKey((k) => k + 1);
        showToastMsg("Cadastro atualizado com sucesso.");
      } else {
        setEditError(json.error ?? "Erro ao salvar.");
      }
    } catch {
      setEditError("Erro de conexão. Tente novamente.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenMeeting = (lead: Lead) => {
    setMeetingForm({ titulo: "", data: "", horario: "", observacoes: "" });
    setShowMeetingModal(lead);
  };

  const handleSaveMeeting = async () => {
    if (!showMeetingModal) return;
    setMeetingLoading(true);
    try {
      const res = await fetch(`/api/painel-clientes/${showMeetingModal.id}/reuniao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meetingForm),
      });
      const json = await res.json();
      if (json.ok) {
        setShowMeetingModal(null);
        showToastMsg("Reunião agendada com sucesso.");
      } else {
        showToastMsg(json.error ?? "Erro ao agendar reunião.");
      }
    } catch {
      showToastMsg("Erro de conexão. Tente novamente.");
    } finally {
      setMeetingLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    if (confirmModal.type === "excluir" && confirmModal.deleteText !== "EXCLUIR") return;
    setActionLoading(true);
    const { lead, type } = confirmModal;
    try {
      const res = await fetch(`/api/painel-clientes/${lead.id}?action=${type}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.ok) {
        setData((prev) => {
          const newLeads = { ...prev.leads };
          delete newLeads[lead.id];
          return {
            ...prev,
            leads: newLeads,
            columns: prev.columns.map((col) => ({
              ...col,
              leadIds: col.leadIds.filter((id) => id !== lead.id),
            })),
          };
        });
        setConfirmModal(null);
        showToastMsg(type === "arquivar" ? "Evento arquivado com sucesso." : "Cliente excluído com sucesso.");
      } else {
        showToastMsg(json.error ?? "Erro ao processar.");
      }
    } catch {
      showToastMsg("Erro de conexão. Tente novamente.");
    } finally {
      setActionLoading(false);
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;
    if (activeData?.type === "Lead") {
      setActiveLead(activeData.lead);
      const col = findColumnByLeadId(active.id as string);
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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const activeMenuLead = activeMenu ? data.leads[activeMenu.leadId] : null;

  const inputCls = "w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-500)]/60 transition-colors";
  const labelCls = "block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider";
  const btnPrimaryCls = "flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--gold-500)] text-black hover:bg-[var(--gold-400)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  const btnSecondaryCls = "px-5 py-2.5 rounded-xl border border-[var(--border-default)] text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer";

  return (
    <div
      className={entranceAnimated ? undefined : "animate-fade-in-up stagger-5"}
      style={entranceAnimated ? undefined : { opacity: 0 }}
      onAnimationEnd={
        entranceAnimated ? undefined : (e) => { if (e.target === e.currentTarget) setEntranceAnimated(true); }
      }
    >
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 bg-[var(--bg-card)] border border-emerald-500/40 rounded-xl shadow-lg text-xs font-semibold text-emerald-400 animate-fade-in-up max-w-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Click-outside overlay for action menu */}
      {activeMenu && <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />}

      {/* Action dropdown (fixed position) */}
      {activeMenu && activeMenuLead && (
        <div
          className="fixed z-50 w-52 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-2xl overflow-hidden animate-fade-in-up"
          style={{ top: activeMenu.y, left: activeMenu.x }}
        >
          <div className="py-1">
            <DropdownItem icon={<Eye className="w-4 h-4" />} label="Ver cliente" onClick={() => { setShowViewModal(activeMenuLead); setActiveMenu(null); }} />
            <DropdownItem icon={<Pencil className="w-4 h-4" />} label="Editar cadastro" onClick={() => { handleOpenEdit(activeMenuLead); setActiveMenu(null); }} />
            <DropdownItem icon={<RefreshCw className="w-4 h-4" />} label="Alterar status" onClick={() => { setShowStatusModal(activeMenuLead); setActiveMenu(null); }} />
            <div className="h-px mx-3 my-1 bg-[var(--border-subtle)]" />
            <DropdownItem icon={<FileText className="w-4 h-4" />} label="Visualizar proposta" onClick={() => { setShowProposalModal(activeMenuLead); setActiveMenu(null); }} />
            <div className="h-px mx-3 my-1 bg-[var(--border-subtle)]" />
            <DropdownItem
              icon={<MessageCircle className="w-4 h-4" />}
              label="Abrir WhatsApp"
              onClick={() => {
                const num = activeMenuLead.phone.replace(/\D/g, "");
                if (num) window.open(`https://wa.me/55${num}`, "_blank");
                else showToastMsg("Nenhum telefone cadastrado para este cliente.");
                setActiveMenu(null);
              }}
            />
            <DropdownItem icon={<Calendar className="w-4 h-4" />} label="Agendar reunião" onClick={() => { handleOpenMeeting(activeMenuLead); setActiveMenu(null); }} />
            <div className="h-px mx-3 my-1 bg-[var(--border-subtle)]" />
            <DropdownItem icon={<Archive className="w-4 h-4" />} label="Arquivar" onClick={() => { setConfirmModal({ type: "arquivar", lead: activeMenuLead, deleteText: "" }); setActiveMenu(null); }} />
            <DropdownItem icon={<Trash2 className="w-4 h-4" />} label="Excluir" onClick={() => { setConfirmModal({ type: "excluir", lead: activeMenuLead, deleteText: "" }); setActiveMenu(null); }} danger />
          </div>
        </div>
      )}

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
        <span
          className="text-xs font-semibold px-4 py-2 rounded-full self-start md:self-auto"
          style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
        >
          {activeServiceFilter === "Todos"
            ? `${totalLeads} clientes ativos`
            : `${filteredTotalCount} de ${totalLeads} clientes (${activeServiceFilter})`}
        </span>
      </div>

      {/* Service Filters */}
      <div className="flex items-center gap-2 mb-6 bg-[var(--bg-card)] p-3.5 rounded-xl border border-[var(--border-default)] shadow-card overflow-x-auto no-scrollbar">
        <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider shrink-0 mr-2">Filtrar Serviço:</span>
        <div className="flex gap-2">
          {serviceFilterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveServiceFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer whitespace-nowrap ${
                activeServiceFilter === filter
                  ? "bg-[var(--gold-500)]/15 text-[var(--gold-300)] border-[var(--gold-500)]/30 shadow-[var(--shadow-gold-glow)]"
                  : "bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--gold-500)]/20 hover:text-[var(--text-primary)]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2" style={{ scrollbarWidth: "thin" }}>
          {data.columns.map((col) => {
            const columnLeads = col.leadIds
              .map((id) => data.leads[id])
              .filter((lead) => {
                if (!lead) return false;
                if (!leadMatchesSearch(lead)) return false;
                if (activeServiceFilter === "Todos") return true;
                if (activeServiceFilter === "Combo") return isCombo(lead.servicosContratados);
                const serviceMap: Record<string, string> = { Buffet: "buffet", Decoração: "decoracao", Fotografia: "fotografia" };
                return lead.servicosContratados.includes(serviceMap[activeServiceFilter] as never);
              });
            return <KanbanColumn key={col.id} column={col} leads={columnLeads} onMenuClick={handleMenuClick} />;
          })}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeLead ? (
            <div style={{ transform: "rotate(4deg)", opacity: 0.9, boxShadow: "var(--shadow-gold-glow)" }}>
              <KanbanCardOverlay lead={activeLead} columnColor={activeColumnColor} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* ──────────────── MODAL: Ver Cliente ──────────────── */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-md flex flex-col overflow-hidden max-h-[90vh] shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--gold-500)]/10 flex items-center justify-center text-[var(--gold-400)]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{showViewModal.name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">Ficha do cliente</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(null)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex flex-col gap-4">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col gap-3">
                {[
                  { label: "Nome", val: showViewModal.name },
                  { label: "CPF / CNPJ", val: showViewModal.cpf },
                  { label: "Telefone", val: showViewModal.phone },
                  { label: "E-mail", val: showViewModal.email ?? "—" },
                  { label: "Tipo de Evento", val: showViewModal.eventType },
                  { label: "Data do Evento", val: showViewModal.data_evento ? new Date(showViewModal.data_evento + "T12:00:00").toLocaleDateString("pt-BR") : "—" },
                  { label: "Categoria", val: showViewModal.clientCategory ?? "—" },
                ].map(({ label, val }, i, arr) => (
                  <div key={label} className={`flex justify-between items-center text-sm ${i < arr.length - 1 ? "border-b border-[var(--border-subtle)]/50 pb-2" : ""}`}>
                    <span className="text-xs text-[var(--text-muted)]">{label}</span>
                    <span className="font-medium text-[var(--text-primary)]">{val}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2">Serviços</p>
                <div className="flex flex-wrap gap-2">
                  {showViewModal.servicosContratados.length === 0 ? (
                    <span className="text-xs text-[var(--text-muted)]">Nenhum serviço selecionado</span>
                  ) : (
                    showViewModal.servicosContratados.map((s) => (
                      <span key={s} className="text-xs px-2 py-1 rounded-lg bg-[var(--bg-input)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                        {SERVICES[s]?.label ?? s}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-[var(--gold-500)]/5 border border-[var(--gold-500)]/15">
                <span className="text-xs text-[var(--text-secondary)]">Valor estimado</span>
                <span className="font-mono font-bold text-[var(--gold-300)] text-lg">{formatCurrency(showViewModal.totalCents / 100)}</span>
              </div>

              {showViewModal.notes && (
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
                  <p className="font-semibold mb-1 uppercase tracking-wider text-[9px] text-amber-400">Observações</p>
                  {showViewModal.notes}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
              <button onClick={() => setShowViewModal(null)} className={btnSecondaryCls + " w-full"}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: Alterar Status ──────────────── */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-muted)]">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">Alterar Status</h3>
                  <p className="text-xs text-[var(--text-muted)] truncate max-w-[180px]">{showStatusModal.name}</p>
                </div>
              </div>
              <button onClick={() => setShowStatusModal(null)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">Selecione o novo status</p>
              {data.columns.map((col) => {
                const isCurrent = col.leadIds.includes(showStatusModal.id);
                return (
                  <button
                    key={col.id}
                    onClick={() => handleStatusChange(showStatusModal.id, col.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                      isCurrent
                        ? `${COLUMN_STATUS_STYLES[col.id]} shadow-sm`
                        : "bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--gold-500)]/20 hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col.color }} />
                    {col.title}
                    {isCurrent && <span className="ml-auto text-[9px] font-bold uppercase tracking-wider opacity-70">atual</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: Editar Cadastro ──────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[92vh] shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--gold-500)]/10 flex items-center justify-center text-[var(--gold-400)]">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">Editar Cadastro</h3>
                  <p className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">{showEditModal.name}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(null)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Nome completo *</label>
                  <input className={inputCls} value={editForm.nome} onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome do cliente" />
                </div>
                <div>
                  <label className={labelCls}>CPF / CNPJ</label>
                  <input className={inputCls} value={editForm.cpf} onChange={(e) => setEditForm((f) => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className={labelCls}>Telefone</label>
                  <input className={inputCls} value={editForm.telefone} onChange={(e) => setEditForm((f) => ({ ...f, telefone: e.target.value }))} placeholder="(11) 9 0000-0000" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>E-mail</label>
                  <input type="email" className={inputCls} value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" />
                </div>
                <div>
                  <label className={labelCls}>Tipo de evento</label>
                  <select className={inputCls} value={editForm.tipoEvento} onChange={(e) => setEditForm((f) => ({ ...f, tipoEvento: e.target.value }))}>
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Data do evento</label>
                  <input type="date" className={inputCls} value={editForm.dataEvento} onChange={(e) => setEditForm((f) => ({ ...f, dataEvento: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Categoria</label>
                  <select className={inputCls} value={editForm.categoria} onChange={(e) => setEditForm((f) => ({ ...f, categoria: e.target.value }))}>
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelCls}>Serviços</label>
                <div className="flex gap-3">
                  {SERVICE_OPTS.map(({ key, label }) => {
                    const checked = editForm.servicos.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setEditForm((f) => ({
                          ...f,
                          servicos: checked ? f.servicos.filter((s) => s !== key) : [...f.servicos, key],
                        }))}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          checked
                            ? "bg-[var(--gold-500)]/15 text-[var(--gold-300)] border-[var(--gold-500)]/30"
                            : "bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--gold-500)]/20"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {editForm.servicos.map((svc) => {
                  const svcLabel = SERVICE_OPTS.find((o) => o.key === svc)?.label ?? svc;
                  const detail = editForm.servicoDetails[svc] ?? { valor: "", observacoes: "" };
                  return (
                    <div key={svc} className="flex flex-col gap-2 p-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)]">
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{svcLabel}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-[var(--text-muted)]">Valor estimado (R$)</span>
                          <input
                            type="text"
                            placeholder="Ex: 2.500,00"
                            value={detail.valor}
                            onChange={(e) => setEditForm((f) => ({
                              ...f,
                              servicoDetails: { ...f.servicoDetails, [svc]: { ...(f.servicoDetails[svc] ?? { valor: "", observacoes: "" }), valor: e.target.value } },
                            }))}
                            className={inputCls + " font-mono"}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-[var(--text-muted)]">Observação</span>
                          <input
                            type="text"
                            placeholder="Ex: 5 horas, inclui bolo"
                            value={detail.observacoes}
                            onChange={(e) => setEditForm((f) => ({
                              ...f,
                              servicoDetails: { ...f.servicoDetails, [svc]: { ...(f.servicoDetails[svc] ?? { valor: "", observacoes: "" }), observacoes: e.target.value } },
                            }))}
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className={labelCls}>Observações</label>
                <textarea
                  className={inputCls + " resize-none h-20"}
                  value={editForm.observacoes}
                  onChange={(e) => setEditForm((f) => ({ ...f, observacoes: e.target.value }))}
                  placeholder="Informações adicionais..."
                />
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {editError}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0 flex gap-3">
              <button onClick={() => setShowEditModal(null)} className={btnSecondaryCls}>Cancelar</button>
              <button onClick={handleSaveEdit} disabled={editLoading || !editForm.nome.trim()} className={btnPrimaryCls + " flex-1"}>
                {editLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: Agendar Reunião ──────────────── */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-md flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-muted)]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">Agendar Reunião</h3>
                  <p className="text-xs text-[var(--text-muted)] truncate max-w-[180px]">{showMeetingModal.name}</p>
                </div>
              </div>
              <button onClick={() => setShowMeetingModal(null)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className={labelCls}>Título *</label>
                <input className={inputCls} value={meetingForm.titulo} onChange={(e) => setMeetingForm((f) => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Reunião de apresentação" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Data *</label>
                  <input type="date" className={inputCls} value={meetingForm.data} onChange={(e) => setMeetingForm((f) => ({ ...f, data: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Horário</label>
                  <input type="time" className={inputCls} value={meetingForm.horario} onChange={(e) => setMeetingForm((f) => ({ ...f, horario: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Observações</label>
                <textarea className={inputCls + " resize-none h-20"} value={meetingForm.observacoes} onChange={(e) => setMeetingForm((f) => ({ ...f, observacoes: e.target.value }))} placeholder="Pauta, local, link..." />
              </div>
            </div>

            <div className="p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0 flex gap-3">
              <button onClick={() => setShowMeetingModal(null)} className={btnSecondaryCls}>Cancelar</button>
              <button
                onClick={handleSaveMeeting}
                disabled={meetingLoading || !meetingForm.titulo.trim() || !meetingForm.data.trim()}
                className={btnPrimaryCls + " flex-1"}
              >
                {meetingLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Agendando...</> : "Agendar reunião"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: Confirmar Arquivar / Excluir ──────────────── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${confirmModal.type === "excluir" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>
                  {confirmModal.type === "excluir" ? <Trash2 className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">
                    {confirmModal.type === "excluir" ? "Excluir cliente" : "Arquivar evento"}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] truncate max-w-[180px]">{confirmModal.lead.name}</p>
                </div>
              </div>
              <button onClick={() => setConfirmModal(null)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {confirmModal.type === "excluir" ? (
                <>
                  <div className="flex gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300 leading-relaxed">
                      Esta ação irá remover o cliente e todos os seus eventos do painel. Para desfazer será necessário contato com o suporte.
                    </p>
                  </div>
                  <div>
                    <label className={labelCls}>
                      Digite <span className="text-red-400 font-bold">EXCLUIR</span> para confirmar
                    </label>
                    <input
                      className={inputCls}
                      value={confirmModal.deleteText}
                      onChange={(e) => setConfirmModal((m) => m ? { ...m, deleteText: e.target.value } : m)}
                      placeholder="EXCLUIR"
                      autoComplete="off"
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  O evento de <span className="font-semibold text-[var(--text-primary)]">{confirmModal.lead.name}</span> será arquivado e não aparecerá mais no painel.
                </p>
              )}
            </div>

            <div className="p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0 flex gap-3">
              <button onClick={() => setConfirmModal(null)} className={btnSecondaryCls}>Cancelar</button>
              <button
                onClick={handleConfirmAction}
                disabled={
                  actionLoading ||
                  (confirmModal.type === "excluir" && confirmModal.deleteText !== "EXCLUIR")
                }
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold flex-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  confirmModal.type === "excluir"
                    ? "bg-red-500 text-white hover:bg-red-400"
                    : "bg-amber-500 text-black hover:bg-amber-400"
                }`}
              >
                {actionLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
                ) : confirmModal.type === "excluir" ? (
                  "Excluir cliente"
                ) : (
                  "Arquivar evento"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: Visualizar Proposta ──────────────── */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--gold-500)]/30 rounded-2xl shadow-[var(--shadow-gold-glow)] w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--gold-400)] to-[var(--gold-600)] flex items-center justify-center text-black">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">Proposta Comercial</h3>
                  <p className="text-xs text-[var(--text-muted)]">{showProposalModal.name} · Visualização</p>
                </div>
              </div>
              <button onClick={() => setShowProposalModal(null)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-neutral-900">
              {showProposalModal.servicosContratados.length === 0 && showProposalModal.totalCents === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <FileText className="w-10 h-10 text-neutral-600" />
                  <p className="text-neutral-400 text-sm font-medium">Nenhuma proposta gerada ainda</p>
                  <p className="text-neutral-600 text-xs text-center max-w-xs">
                    Adicione serviços ao evento para gerar uma proposta comercial.
                  </p>
                </div>
              ) : (
                <div className="bg-white text-neutral-900 p-7 rounded-lg shadow-2xl border border-neutral-200" style={{ fontFamily: "Georgia, serif" }}>
                  <div className="border-b-2 border-amber-600 pb-4 mb-6 flex justify-between items-start">
                    <div>
                      <h2 className="text-base font-bold uppercase tracking-wider text-amber-700" style={{ fontFamily: "sans-serif" }}>{empresa.nome_fantasia}</h2>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold" style={{ fontFamily: "sans-serif" }}>Proposta Comercial — {empresa.slogan}</p>
                    </div>
                    <div className="text-right text-xs text-neutral-500" style={{ fontFamily: "sans-serif" }}>
                      <p>Ref.: CP-{showProposalModal.id.slice(-4).padStart(4, "0")}</p>
                      <p className="mt-0.5">Emitida em: {new Date().toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>

                  <div className="mb-5" style={{ fontFamily: "sans-serif" }}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-200 pb-1 mb-3">Dados do Cliente</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                      {[
                        { label: "Nome / Razão Social", val: showProposalModal.name },
                        { label: "CPF / CNPJ", val: showProposalModal.cpf },
                        { label: "Telefone", val: showProposalModal.phone },
                        { label: "Tipo de Evento", val: showProposalModal.eventType },
                      ].map(({ label, val }) => (
                        <div key={label}>
                          <p className="text-neutral-400 text-[9px] uppercase tracking-wider">{label}</p>
                          <p className="font-semibold text-neutral-800 mt-0.5">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-5" style={{ fontFamily: "sans-serif" }}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-200 pb-1 mb-3">Serviços Incluídos</h4>
                    <div className="space-y-1.5">
                      {showProposalModal.servicosContratados.map((s) => {
                        const svc = SERVICES[s];
                        const val = showProposalModal.valoresPorServico[s as keyof typeof showProposalModal.valoresPorServico];
                        return (
                          <div key={s} className="flex justify-between items-center text-xs border-b border-neutral-100 pb-1.5">
                            <span className="text-neutral-800 font-medium">{svc?.label ?? s}</span>
                            <span className="font-mono font-semibold text-neutral-700">
                              {val ? formatCurrency(val / 100) : "A definir"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mb-5" style={{ fontFamily: "sans-serif" }}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-200 pb-1 mb-3">Resumo Financeiro</h4>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Subtotal</span>
                        <span className="font-mono text-neutral-700">{formatCurrency(showProposalModal.subtotalCents / 100)}</span>
                      </div>
                      {showProposalModal.descontoCombo > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Desconto Combo ({showProposalModal.descontoCombo * 100}%)</span>
                          <span className="font-mono">-{formatCurrency((showProposalModal.subtotalCents - showProposalModal.totalCents) / 100)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-sm border-t border-neutral-200 pt-2 mt-1">
                        <span className="text-neutral-800">Total da Proposta</span>
                        <span className="font-mono text-amber-700">{formatCurrency(showProposalModal.totalCents / 100)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200 pt-4 text-center" style={{ fontFamily: "sans-serif" }}>
                    <p className="text-[9px] text-neutral-400 italic">Proposta gerada pelo CRM Compact Prime — uso informativo e gerencial.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
              <button onClick={() => setShowProposalModal(null)} className={btnSecondaryCls + " w-full"}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

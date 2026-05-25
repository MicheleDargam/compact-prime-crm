"use client";

import { useState } from "react";
import {
  Plus, Search, Users, CheckCircle2, Check, X, Sparkles, Star, Gem, Crown,
} from "lucide-react";
import DashboardCards from "../components/DashboardCards";
import PipelineKanbanClient from "../components/pipeline/PipelineKanbanClient";
import { type ServiceType, SERVICES, COMBO_DISCOUNTS } from "@/app/data/services";

type EventType = "Casamento" | "Infantil" | "Corporativo" | "Adulto";
type ClientCategory = "Cliente Novo" | "Cliente Prime" | "Cliente VIP";

const CATEGORY_ACTIVE_CLASSES: Record<ClientCategory, string> = {
  "Cliente Novo": "text-neutral-300 bg-neutral-800/70 border-neutral-600/60",
  "Cliente Prime": "text-blue-300 bg-blue-500/15 border-blue-500/40",
  "Cliente VIP": "text-[var(--gold-300)] bg-[var(--gold-500)]/10 border-[var(--gold-500)]/40",
};

export default function KanbanPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Novo Cliente modal
  const [showNewLead, setShowNewLead] = useState(false);
  const [formNome, setFormNome] = useState("");
  const [formCpf, setFormCpf] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formEventType, setFormEventType] = useState<EventType>("Casamento");
  const [formEventDate, setFormEventDate] = useState("");
  const [formServicos, setFormServicos] = useState<ServiceType[]>([]);
  const [formObservacoes, setFormObservacoes] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCategory, setFormCategory] = useState<ClientCategory>("Cliente Novo");
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const showToastMsg = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const toggleServico = (s: ServiceType) =>
    setFormServicos((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const resetForm = () => {
    setFormNome(""); setFormCpf(""); setFormTelefone(""); setFormEmail("");
    setFormEventType("Casamento"); setFormEventDate("");
    setFormServicos([]); setFormObservacoes("");
    setFormCategory("Cliente Novo"); setFormError("");
  };

  const handleSaveLead = async () => {
    setFormSaving(true);
    setFormError("");
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formNome.trim() || "Sem nome",
          cpf: formCpf.trim() || null,
          email: formEmail.trim() || null,
          telefone: formTelefone.trim() || null,
          categoria: formCategory,
          observacoes: formObservacoes.trim() || null,
          tipoEvento: formEventType,
          dataEvento: formEventDate || null,
          servicos: formServicos,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        const msg = data.error || "Erro ao criar cliente.";
        const detail = data.details ? ` (${data.details})` : "";
        setFormError(msg + detail);
        return;
      }
      setShowNewLead(false);
      resetForm();
      setRefreshTrigger((t) => t + 1);
      showToastMsg("Cliente criado e adicionado ao Painel!");
    } catch {
      setFormError("Erro de conexão. Tente novamente.");
    } finally {
      setFormSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8">

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 bg-[var(--bg-card)] border border-emerald-500/40 rounded-xl shadow-lg text-xs font-semibold text-emerald-400 animate-fade-in-up max-w-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="pt-2 lg:pt-0">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Painel de Clientes
            </h1>
            <p className="text-sm mt-1 italic" style={{ color: "var(--gold-300)" }}>
              Pipeline comercial de clientes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs hidden sm:block" style={{ color: "var(--text-muted)" }}>
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
            <button
              onClick={() => setShowNewLead(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-tr from-[var(--gold-600)] to-[var(--gold-400)] text-[var(--bg-primary)] font-semibold rounded-lg shadow-[var(--shadow-gold-glow)] hover:scale-105 transition-transform duration-200 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Novo Cliente
            </button>
          </div>
        </div>

        {/* Gold separator */}
        <div
          className="mt-4 h-px w-full"
          style={{ background: "linear-gradient(to right, var(--gold-500), var(--gold-500)/20, transparent)" }}
        />

        {/* Search bar */}
        <div className="mt-4 relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[var(--text-muted)]" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, CPF ou telefone..."
            className="block w-full pl-10 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors"
          />
        </div>
      </header>

      {/* Summary cards */}
      <section id="dashboard-cards" aria-label="Resumo">
        <DashboardCards />
      </section>

      {/* Pipeline kanban */}
      <section id="pipeline-preview" aria-label="Pipeline comercial">
        <PipelineKanbanClient searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
      </section>

      {/* ══════════════════════════════════════════════════════════
          MODAL: NOVO CLIENTE
         ══════════════════════════════════════════════════════════ */}
      {showNewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--gold-500)]/30 rounded-2xl shadow-[var(--shadow-gold-glow)] w-full max-w-lg flex flex-col overflow-hidden max-h-[92vh]">

            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--gold-400)] to-[var(--gold-600)] flex items-center justify-center text-black">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">Novo Cliente</h3>
                  <p className="text-xs text-[var(--text-muted)]">Captura de oportunidade comercial</p>
                </div>
              </div>
              <button
                onClick={() => { setShowNewLead(false); resetForm(); }}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 overflow-y-auto flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Nome do cliente</label>
                  <input
                    type="text"
                    placeholder="Ex: Ana & João Silva"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">CPF / CNPJ</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={formCpf}
                    onChange={(e) => setFormCpf(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Telefone</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-0000"
                    value={formTelefone}
                    onChange={(e) => setFormTelefone(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">E-mail</label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Tipo de Evento</label>
                  <select
                    value={formEventType}
                    onChange={(e) => setFormEventType(e.target.value as EventType)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors"
                  >
                    <option>Casamento</option>
                    <option>Infantil</option>
                    <option>Corporativo</option>
                    <option>Adulto</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Data do Evento</label>
                  <input
                    type="date"
                    value={formEventDate}
                    onChange={(e) => setFormEventDate(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors"
                  />
                </div>
              </div>

              {/* Categoria */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Categoria do Cliente</label>
                <div className="flex gap-2">
                  {(["Cliente Novo", "Cliente Prime", "Cliente VIP"] as ClientCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormCategory(cat)}
                      className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-semibold transition-all flex-1 cursor-pointer ${
                        formCategory === cat
                          ? CATEGORY_ACTIVE_CLASSES[cat]
                          : "bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border-default)] hover:border-[var(--border-subtle)]"
                      }`}
                    >
                      {cat === "Cliente Novo" && <Star className="w-3 h-3 shrink-0" />}
                      {cat === "Cliente Prime" && <Gem className="w-3 h-3 shrink-0" />}
                      {cat === "Cliente VIP" && <Crown className="w-3 h-3 shrink-0" />}
                      <span className="truncate">{cat}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-[var(--text-muted)] leading-relaxed">
                  <span className="font-semibold text-neutral-400">Novo:</span> primeiro contato ·{" "}
                  <span className="font-semibold text-blue-400">Prime:</span> cliente recorrente ·{" "}
                  <span className="font-semibold text-[var(--gold-400)]">VIP:</span> estratégico ou premium
                </p>
              </div>

              {/* Serviços */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Serviços Desejados</label>
                <div className="flex gap-2 flex-wrap">
                  {(["buffet", "decoracao", "fotografia"] as ServiceType[]).map((s) => {
                    const cfg = SERVICES[s];
                    const selected = formServicos.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleServico(s)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          selected
                            ? `${cfg.color} ${cfg.textColor} ${cfg.borderColor} shadow-sm`
                            : "bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-subtle)]"
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 stroke-[3]" />}
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
                {formServicos.length > 1 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--gold-500)]/8 border border-[var(--gold-500)]/25">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--gold-400)] shrink-0" />
                    <span className="text-xs font-bold text-[var(--gold-300)]">Combo detectado automaticamente</span>
                    <span className="ml-auto text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      -{(COMBO_DISCOUNTS[formServicos.length] ?? 0) * 100}% desconto
                    </span>
                  </div>
                )}
              </div>

              {/* Observações */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Observações</label>
                <textarea
                  rows={3}
                  placeholder="Informações adicionais sobre o cliente..."
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-500)]/50 transition-colors resize-none"
                />
              </div>

              {formError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
              <button
                onClick={() => { setShowNewLead(false); resetForm(); }}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-default)] text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveLead}
                disabled={formSaving}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] hover:from-[var(--gold-700)] hover:to-[var(--gold-500)] text-black font-bold text-sm transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {formSaving ? "Salvando..." : "Salvar Cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

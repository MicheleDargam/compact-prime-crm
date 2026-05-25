"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Plus, 
  Search, 
  Sparkles, 
  Phone, 
  UserPlus, 
  Check, 
  X, 
  ChevronRight,
  Info,
  SlidersHorizontal
} from "lucide-react";

// Types
type StatusColaborador = "Ativo" | "Folga" | "Ocupado";
type DispColaborador = "Disponível" | "Evento agendado" | "Indisponível";
type StatusPagamento = "Pago" | "Pendente" | "Parcial";

interface Colaborador {
  id: string;
  nome: string;
  funcao: string;
  telefone: string;
  status: StatusColaborador;
  disponibilidade: DispColaborador;
}

interface Evento {
  id: string;
  nome: string;
  data: string;
  colaboradores: { nome: string; funcao: string }[];
}

interface RegistroHora {
  id: string;
  funcionario: string;
  evento: string;
  horas: number;
  valor: number;
  status: StatusPagamento;
}

interface ToastMessage {
  id: number;
  type: "success" | "info" | "warning";
  title: string;
  message: string;
}


export default function FuncionariosPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [registros, setRegistros] = useState<RegistroHora[]>([]);

  useEffect(() => { loadData(); }, []);
  
  // UI State: Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFuncao, setSelectedFuncao] = useState("Todas");

  // UI State: Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEscalaModal, setShowEscalaModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  // UI State: Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Form State: Add Employee
  const [newEmpNome, setNewEmpNome] = useState("");
  const [newEmpFuncao, setNewEmpFuncao] = useState("Garçom");
  const [newEmpTelefone, setNewEmpTelefone] = useState("");
  const [newEmpStatus, setNewEmpStatus] = useState<StatusColaborador>("Ativo");
  const [newEmpDisp, setNewEmpDisp] = useState<DispColaborador>("Disponível");

  // Form State: Scale Event
  const [scaleEventId, setScaleEventId] = useState("");
  const [scaleEmpId, setScaleEmpId] = useState("");

  // Form State: Register Payment
  const [payRegistroId, setPayRegistroId] = useState("");
  const [payStatus, setPayStatus] = useState<StatusPagamento>("Pago");
  const [payValor, setPayValor] = useState("");

  const addToast = (title: string, message: string, type: "success" | "info" | "warning" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const loadData = () => {
    fetch("/api/funcionarios").then(r => r.json()).then(json => { if (json.ok) setColaboradores(json.data as Colaborador[]); }).catch(() => {});
    fetch("/api/funcionarios/eventos").then(r => r.json()).then(json => { if (json.ok) setEventos(json.data as Evento[]); }).catch(() => {});
    fetch("/api/funcionarios/registros").then(r => r.json()).then(json => { if (json.ok) setRegistros(json.data as RegistroHora[]); }).catch(() => {});
  };

  // Handlers
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpNome.trim() || !newEmpTelefone.trim()) {
      addToast("Erro no preenchimento", "Por favor, preencha todos os campos do formulário.", "warning");
      return;
    }
    try {
      const res = await fetch("/api/funcionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: newEmpNome, funcao: newEmpFuncao, telefone: newEmpTelefone }),
      });
      const json = await res.json();
      if (!json.ok) {
        addToast("Erro", json.error ?? "Erro ao adicionar funcionário.", "warning");
        return;
      }
      setColaboradores(prev => [...prev, { id: json.data.id, nome: newEmpNome, funcao: newEmpFuncao, telefone: newEmpTelefone, status: "Ativo", disponibilidade: "Disponível" }]);
      addToast("Funcionário Adicionado", `${newEmpNome} foi adicionado(a) como ${newEmpFuncao} com sucesso!`, "success");
      setNewEmpNome("");
      setNewEmpTelefone("");
      setNewEmpStatus("Ativo");
      setNewEmpDisp("Disponível");
      setShowAddModal(false);
    } catch {
      addToast("Erro", "Falha na conexão ao salvar funcionário.", "warning");
    }
  };

  const handleScaleEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventObj = eventos.find(ev => ev.id === scaleEventId);
    const empObj = colaboradores.find(c => c.id === scaleEmpId);

    if (!eventObj || !empObj) {
      addToast("Erro", "Selecione um evento e um colaborador.", "warning");
      return;
    }

    try {
      const res = await fetch("/api/funcionarios/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventoId: scaleEventId, funcionarioId: scaleEmpId }),
      });
      const json = await res.json();
      if (!json.ok) {
        addToast("Aviso", json.error ?? "Erro ao escalar colaborador.", "warning");
        return;
      }
      addToast("Colaborador Escalado", `${empObj.nome} foi escalado(a) para ${eventObj.nome}.`, "success");
      setShowEscalaModal(false);
      fetch("/api/funcionarios/eventos").then(r => r.json()).then(j => { if (j.ok) setEventos(j.data as Evento[]); }).catch(() => {});
      fetch("/api/funcionarios/registros").then(r => r.json()).then(j => { if (j.ok) setRegistros(j.data as RegistroHora[]); }).catch(() => {});
    } catch {
      addToast("Erro", "Falha na conexão ao escalar colaborador.", "warning");
    }
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const regObj = registros.find(r => r.id === payRegistroId);
    if (!regObj) return;

    try {
      const res = await fetch("/api/funcionarios/registros", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: payRegistroId, status: payStatus, valor: payValor ? parseFloat(payValor) : undefined }),
      });
      const json = await res.json();
      if (!json.ok) {
        addToast("Erro", json.error ?? "Erro ao registrar pagamento.", "warning");
        return;
      }
      setRegistros(prev => prev.map(r =>
        r.id === payRegistroId
          ? { ...r, status: payStatus, valor: payValor ? parseFloat(payValor) : r.valor }
          : r
      ));
      addToast("Pagamento Registrado", `Pagamento de ${regObj.funcionario} no evento ${regObj.evento} marcado como ${payStatus}.`, "success");
      setPayValor("");
      setShowPayModal(false);
    } catch {
      addToast("Erro", "Falha na conexão ao registrar pagamento.", "warning");
    }
  };

  // Calculated Metrics
  const activeColabCount = colaboradores.filter(c => c.status === "Ativo").length;
  const eventsThisWeekCount = eventos.length;
  const totalHours = registros.reduce((sum, r) => sum + r.horas, 0);
  const pendingPaymentsTotal = registros
    .filter(r => r.status !== "Pago")
    .reduce((sum, r) => sum + (r.status === "Parcial" ? r.valor / 2 : r.valor), 0);

  // Filters
  const filteredColaboradores = colaboradores.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.telefone.includes(searchTerm);
    const matchesFuncao = selectedFuncao === "Todas" || c.funcao === selectedFuncao;
    return matchesSearch && matchesFuncao;
  });

  const funcoesList = ["Garçom", "Cozinha", "Recepção", "Decoração", "Fotografia", "Limpeza", "Montagem"];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] p-4 md:p-8 animate-fade-in-up overflow-y-auto">
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className="bg-[var(--bg-card)] border border-[var(--gold-400)]/30 text-[var(--text-primary)] rounded-xl p-4 shadow-2xl flex items-start gap-3 animate-fade-in-up relative overflow-hidden"
            style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 10px rgba(212,169,55,0.05)" }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-[var(--gold-300)] to-[var(--gold-600)]" />
            <div className="p-1.5 bg-[var(--gold-500)]/10 rounded-lg text-[var(--gold-300)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[var(--gold-300)] uppercase tracking-wider">{t.title}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{t.message}</p>
            </div>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Header section with page title & visual quick actions */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--gold-300)] tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Gestão Operacional de Equipe</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mt-1">Equipe</h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)] mt-0.5">Gestão operacional da equipe de eventos</p>
        </div>

        {/* Buttons / Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-300)] hover:from-[var(--gold-600)] hover:to-[var(--gold-400)] text-black rounded-xl shadow-md shadow-gold-500/10 hover:shadow-gold-500/20 transition-all duration-300 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            Adicionar Funcionário
          </button>

          <button 
            onClick={() => setShowEscalaModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-medium bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] hover:border-[var(--gold-500)]/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-all duration-200 cursor-pointer shadow-card"
          >
            <UserPlus className="w-4 h-4 text-[var(--gold-300)]" />
            Escalar Equipe
          </button>

          <button 
            onClick={() => setShowPayModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-medium bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] hover:border-[var(--gold-500)]/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-all duration-200 cursor-pointer shadow-card"
          >
            <DollarSign className="w-4 h-4 text-[var(--gold-300)]" />
            Registrar Pagamento
          </button>
        </div>
      </header>

      {/* Info warning indicator indicating operational/mock nature */}
      <div className="bg-gradient-to-r from-[var(--gold-500)]/5 to-[var(--gold-300)]/5 border border-[var(--gold-500)]/15 p-4 rounded-xl mb-8 flex gap-3.5 items-start">
        <Info className="w-5 h-5 text-[var(--gold-300)] shrink-0 mt-0.5" />
        <div className="text-xs md:text-sm text-[var(--text-secondary)]">
          <strong className="text-[var(--gold-300)] font-medium">Nota Operacional:</strong> Este módulo destina-se à coordenação logística da equipe durante os eventos (escalas, contatos rápidos e controle informal de diárias). A folha salarial e o controle fiscal/trabalhista permanecem sendo geridos manualmente através de processos híbridos fora do sistema.
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Card 1: Equipe Ativa */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--gold-300)]/20 to-[var(--gold-500)]/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-[var(--gold-500)]/10 rounded-lg text-[var(--gold-300)] group-hover:scale-105 transition-transform duration-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Equipe Ativa</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{activeColabCount} Colaboradores</p>
          </div>
        </div>

        {/* Card 2: Eventos da Semana */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--gold-300)]/20 to-[var(--gold-500)]/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-[var(--gold-500)]/10 rounded-lg text-[var(--gold-300)] group-hover:scale-105 transition-transform duration-300">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Eventos da Semana</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{eventsThisWeekCount} Eventos</p>
          </div>
        </div>

        {/* Card 3: Horas Trabalhadas */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--gold-300)]/20 to-[var(--gold-500)]/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-[var(--gold-500)]/10 rounded-lg text-[var(--gold-300)] group-hover:scale-105 transition-transform duration-300">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Horas Trabalhadas</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{totalHours} Horas</p>
          </div>
        </div>

        {/* Card 4: Pagamentos Pendentes */}
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden animate-pulse-gold">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--gold-300)] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-[var(--gold-500)]/15 rounded-lg text-[var(--gold-300)] group-hover:scale-105 transition-transform duration-300">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Pagamentos Pendentes</p>
            <p className="text-2xl font-bold text-[var(--gold-300)] mt-0.5">{formatCurrency(pendingPaymentsTotal)}</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Equipe Atual (Esquerda) + Eventos da Semana (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Column: Equipe Atual (2 cols span on large screens) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Header filter row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--gold-300)]" />
              Equipe Atual
              <span className="text-xs font-normal text-[var(--text-secondary)]">({filteredColaboradores.length} listados)</span>
            </h2>

            {/* Filters panel */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-44 pl-9 pr-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg text-xs text-[var(--text-primary)]"
                />
              </div>

              <div className="relative">
                <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                <select
                  value={selectedFuncao}
                  onChange={(e) => setSelectedFuncao(e.target.value)}
                  className="appearance-none pl-8 pr-6 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg text-xs text-[var(--text-primary)] cursor-pointer"
                >
                  <option value="Todas">Todas Funções</option>
                  {funcoesList.map(fn => <option key={fn} value={fn}>{fn}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Cards list of Employees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredColaboradores.map((colab) => {
              
              // Status Styling
              const statusStyles = {
                Ativo: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                Folga: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                Ocupado: "text-amber-400 bg-amber-500/10 border-amber-500/20"
              };

              // Availability Styling
              const dispStyles = {
                "Disponível": "text-emerald-400 bg-emerald-500/5 border-emerald-500/10",
                "Evento agendado": "text-amber-400 bg-amber-500/5 border-amber-500/10",
                "Indisponível": "text-red-400 bg-red-500/5 border-red-500/10"
              };

              // Short Initial
              const initialLetters = colab.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

              return (
                <div 
                  key={colab.id}
                  className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5 hover:border-[var(--gold-500)]/20 transition-all flex flex-col justify-between shadow-card"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold-300)]/10 to-[var(--gold-600)]/30 flex items-center justify-center border border-[var(--gold-400)]/25 font-bold text-sm text-[var(--gold-300)]">
                        {initialLetters}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-[var(--text-primary)] line-clamp-1">{colab.nome}</h3>
                        <p className="text-xs text-[var(--gold-300)] font-medium mt-0.5">{colab.funcao}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide border rounded-full ${statusStyles[colab.status]}`}>
                      {colab.status}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3.5 mt-1 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        Contato:
                      </span>
                      <span className="font-medium text-[var(--text-secondary)]">{colab.telefone}</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        Disponibilidade:
                      </span>
                      <span className={`inline-flex px-2 py-0.5 border rounded text-[10px] font-medium ${dispStyles[colab.disponibilidade]}`}>
                        {colab.disponibilidade}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredColaboradores.length === 0 && (
              <div className="col-span-2 bg-[var(--bg-card)] border border-[var(--border-default)] p-8 rounded-xl text-center">
                <Users className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2.5" />
                <p className="text-sm text-[var(--text-secondary)]">Nenhum colaborador encontrado com os filtros selecionados.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Eventos da Semana (1 col span) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--gold-300)]" />
            Eventos da Semana
          </h2>

          <div className="flex flex-col gap-4">
            {eventos.map((ev) => (
              <div 
                key={ev.id}
                className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5 shadow-card hover:border-[var(--gold-500)]/20 transition-all relative overflow-hidden"
              >
                {/* Accent top gold line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--gold-500)]/40 to-[var(--gold-300)]/20" />

                <div className="flex justify-between items-start mb-3.5">
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">{ev.nome}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{ev.data}</p>
                  </div>
                  <span className="bg-[var(--gold-500)]/10 text-[var(--gold-300)] text-[10px] font-bold border border-[var(--gold-500)]/20 px-2 py-0.5 rounded-full shrink-0">
                    {ev.colaboradores.length} Escala{ev.colaboradores.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Team Scaled List */}
                <div className="bg-[var(--bg-primary)] rounded-lg p-3 border border-[var(--border-subtle)] space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Equipe Escalada</p>
                  
                  {ev.colaboradores.map((team, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs border-b border-[var(--border-subtle)] last:border-b-0 pb-1.5 last:pb-0">
                      <span className="font-medium text-[var(--text-primary)]">{team.nome}</span>
                      <span className="text-[10px] text-[var(--gold-300)] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-400)] shrink-0" />
                        {team.funcao}
                      </span>
                    </div>
                  ))}

                  {ev.colaboradores.length === 0 && (
                    <p className="text-xs text-[var(--text-muted)] italic">Nenhum profissional escalado ainda.</p>
                  )}
                </div>

                {/* Micro Action link */}
                <div className="flex justify-end mt-3">
                  <button 
                    onClick={() => {
                      setScaleEventId(ev.id);
                      setShowEscalaModal(true);
                    }}
                    className="text-[11px] font-medium text-[var(--gold-300)] hover:text-[var(--gold-100)] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Escalar profissional
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Horas e Pagamentos Section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--gold-300)]" />
          Horas e Pagamentos
        </h2>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="p-4">Funcionário</th>
                  <th className="p-4">Evento</th>
                  <th className="p-4 text-center">Horas Trabalhadas</th>
                  <th className="p-4 text-right">Valor Combinado</th>
                  <th className="p-4 text-center">Status Pagamento</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-secondary)]">
                {registros.map((reg) => {
                  
                  // Status Config
                  const statusConfig = {
                    Pago: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                    Pendente: "text-red-400 bg-red-500/10 border-red-500/20",
                    Parcial: "text-amber-400 bg-amber-500/10 border-amber-500/20"
                  };

                  return (
                    <tr key={reg.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                      <td className="p-4 font-medium text-[var(--text-primary)]">{reg.funcionario}</td>
                      <td className="p-4">{reg.evento}</td>
                      <td className="p-4 text-center font-mono">{reg.horas}h</td>
                      <td className="p-4 text-right font-mono font-medium text-[var(--text-primary)]">{formatCurrency(reg.valor)}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold border rounded-full ${statusConfig[reg.status]}`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setPayRegistroId(reg.id);
                            setPayValor(reg.valor.toString());
                            setPayStatus(reg.status === "Pago" ? "Pago" : "Pago");
                            setShowPayModal(true);
                          }}
                          className="px-2.5 py-1 text-[10px] font-semibold bg-[var(--gold-500)]/10 hover:bg-[var(--gold-500)]/20 text-[var(--gold-400)] border border-[var(--gold-500)]/25 rounded transition-all cursor-pointer"
                        >
                          Quitar/Ajustar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* MODAL 1: ADICIONAR FUNCIONÁRIO (MOCK) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--gold-300)]" />
                <h3 className="font-bold text-[var(--text-primary)]">Adicionar Funcionário</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={newEmpNome}
                  onChange={(e) => setNewEmpNome(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                  placeholder="Ex: Carlos Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Função
                  </label>
                  <select
                    value={newEmpFuncao}
                    onChange={(e) => setNewEmpFuncao(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] cursor-pointer"
                  >
                    {funcoesList.map(fn => <option key={fn} value={fn}>{fn}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Telefone
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmpTelefone}
                    onChange={(e) => setNewEmpTelefone(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                    placeholder="Ex: (11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Status
                  </label>
                  <select
                    value={newEmpStatus}
                    onChange={(e) => setNewEmpStatus(e.target.value as StatusColaborador)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] cursor-pointer"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Folga">Folga</option>
                    <option value="Ocupado">Ocupado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Disponibilidade
                  </label>
                  <select
                    value={newEmpDisp}
                    onChange={(e) => setNewEmpDisp(e.target.value as DispColaborador)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] cursor-pointer"
                  >
                    <option value="Disponível">Disponível</option>
                    <option value="Evento agendado">Evento agendado</option>
                    <option value="Indisponível">Indisponível</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-[var(--border-default)] hover:border-red-500/20 hover:bg-red-500/5 text-[var(--text-secondary)] hover:text-red-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-300)] hover:from-[var(--gold-600)] hover:to-[var(--gold-400)] text-black rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ESCALAR EQUIPE (MOCK) */}
      {showEscalaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[var(--gold-300)]" />
                <h3 className="font-bold text-[var(--text-primary)]">Escalar Equipe</h3>
              </div>
              <button 
                onClick={() => setShowEscalaModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScaleEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  1. Selecione o Evento
                </label>
                <select
                  value={scaleEventId}
                  onChange={(e) => setScaleEventId(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg px-3 py-2.5 text-xs text-[var(--text-primary)] cursor-pointer"
                >
                  {eventos.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.nome} ({ev.data.split(" ")[0]})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  2. Selecione o Colaborador
                </label>
                <select
                  value={scaleEmpId}
                  onChange={(e) => setScaleEmpId(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg px-3 py-2.5 text-xs text-[var(--text-primary)] cursor-pointer"
                >
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} — {c.funcao} ({c.disponibilidade})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[var(--text-muted)] mt-1.5">
                  Dica: Profissionais com status "Disponível" são ideais para escalação imediata.
                </p>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowEscalaModal(false)}
                  className="flex-1 py-2.5 border border-[var(--border-default)] hover:border-red-500/20 hover:bg-red-500/5 text-[var(--text-secondary)] hover:text-red-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-300)] hover:from-[var(--gold-600)] hover:to-[var(--gold-400)] text-black rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Confirmar Escala
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: REGISTRAR PAGAMENTO (MOCK) */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[var(--gold-300)]" />
                <h3 className="font-bold text-[var(--text-primary)]">Registrar Pagamento</h3>
              </div>
              <button 
                onClick={() => setShowPayModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Selecione o Repasse Operacional
                </label>
                <select
                  value={payRegistroId}
                  onChange={(e) => {
                    setPayRegistroId(e.target.value);
                    const selected = registros.find(r => r.id === e.target.value);
                    if (selected) setPayValor(selected.valor.toString());
                  }}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg px-3 py-2.5 text-xs text-[var(--text-primary)] cursor-pointer"
                >
                  {registros.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.funcionario} — {r.evento} ({formatCurrency(r.valor)} - {r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Alterar Status
                  </label>
                  <select
                    value={payStatus}
                    onChange={(e) => setPayStatus(e.target.value as StatusPagamento)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] cursor-pointer"
                  >
                    <option value="Pago">Pago</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Parcial">Parcial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Valor da Diária (R$)
                  </label>
                  <input
                    type="number"
                    value={payValor}
                    onChange={(e) => setPayValor(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-2.5 border border-[var(--border-default)] hover:border-red-500/20 hover:bg-red-500/5 text-[var(--text-secondary)] hover:text-red-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-300)] hover:from-[var(--gold-600)] hover:to-[var(--gold-400)] text-black rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Salvar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

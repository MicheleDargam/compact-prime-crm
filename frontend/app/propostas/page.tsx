"use client";

import { useState } from "react";
import {
  FileText,
  Edit,
  Send,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileDown,
  Search,
  Sparkles,
  X,
  ShieldCheck,
  Info,
  ScrollText,
  Save,
  Building2,
  User,
} from "lucide-react";
import {
  type ServiceType,
  SERVICES,
  COMBO_DISCOUNTS,
  isCombo
} from "@/app/data/services";
import { ServiceBadgeGroup } from "@/app/components/ServiceBadge";

// Types
type EventType = "Casamento" | "Infantil" | "Corporativo" | "Adulto";
type ProposalStatus = "Enviada" | "Em negociação" | "Aprovada" | "Vencida";

interface Proposal {
  id: string;
  client: string;
  eventType: EventType;
  sendDate: string;
  validity: string;
  status: ProposalStatus;
  servicosContratados: ServiceType[];
  valoresPorServico: {
    buffet?: number;
    decoracao?: number;
    fotografia?: number;
  };
  descontoCombo: number;
  subtotalCents: number;
  totalCents: number;
}

// Mock Data
const initialProposals: Proposal[] = [
  {
    id: "1",
    client: "Ana & João",
    eventType: "Casamento",
    sendDate: "10/05/2026",
    validity: "15 dias",
    status: "Aprovada",
    servicosContratados: ["buffet", "decoracao", "fotografia"],
    valoresPorServico: { buffet: 3500000, decoracao: 1000000, fotografia: 500000 },
    descontoCombo: 0.10,
    subtotalCents: 5000000,
    totalCents: 4500000,
  },
  {
    id: "2",
    client: "Infantil Miguel",
    eventType: "Infantil",
    sendDate: "15/05/2026",
    validity: "15 dias",
    status: "Enviada",
    servicosContratados: ["buffet"],
    valoresPorServico: { buffet: 1800000 },
    descontoCombo: 0,
    subtotalCents: 1800000,
    totalCents: 1800000,
  },
  {
    id: "3",
    client: "PrimeTech",
    eventType: "Corporativo",
    sendDate: "12/05/2026",
    validity: "15 dias",
    status: "Em negociação",
    servicosContratados: ["buffet", "decoracao"],
    valoresPorServico: { buffet: 3000000, decoracao: 684210 },
    descontoCombo: 0.05,
    subtotalCents: 3684210,
    totalCents: 3500000,
  },
  {
    id: "4",
    client: "Juliana Costa",
    eventType: "Adulto",
    sendDate: "01/05/2026",
    validity: "15 dias",
    status: "Vencida",
    servicosContratados: ["decoracao", "fotografia"],
    valoresPorServico: { decoracao: 1500000, fotografia: 815789 },
    descontoCombo: 0.05,
    subtotalCents: 2315789,
    totalCents: 2200000,
  },
];

const eventTypeStyles: Record<EventType, string> = {
  "Casamento": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Infantil": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Corporativo": "bg-green-500/10 text-green-400 border-green-500/20",
  "Adulto": "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const statusStyles: Record<ProposalStatus, string> = {
  "Enviada": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Em negociação": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Aprovada": "bg-green-500/10 text-green-400 border-green-500/20",
  "Vencida": "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusFilterOptions = ["Todos", "Enviada", "Em negociação", "Aprovada", "Vencida"];
const serviceFilterOptions = ["Todos", "Buffet", "Decoração", "Fotografia", "Combo"];
const allServiceTypes: ServiceType[] = ["buffet", "decoracao", "fotografia"];
const eventTypes: EventType[] = ["Casamento", "Infantil", "Corporativo", "Adulto"];

const srvDescriptionMap: Record<string, string> = {
  buffet: "Gastronomia fina com menu completo, coquetel de boas-vindas, prato principal, sobremesas, louças premium e serviço profissional de copeiras e garçons.",
  decoracao: "Ambiente floral com design exclusivo, lounges premium, passadeira, cortinários em voil e iluminação cênica harmoniosa.",
  fotografia: "Cobertura fotográfica completa do evento com equipe dedicada, ensaio pré-wedding e galeria digital com tratamento de imagem em alta definição.",
};

const clausulas = [
  {
    num: "1",
    titulo: "DO OBJETO",
    texto: "O presente instrumento tem por objeto a prestação dos serviços descritos na Seção 4 deste contrato, a serem realizados pela CONTRATADA conforme as especificações técnicas e premissas acordadas.",
  },
  {
    num: "2",
    titulo: "DA RESCISÃO",
    texto: "A rescisão do contrato por parte do CONTRATANTE com menos de 30 dias de antecedência implicará multa de 30% sobre o valor total contratado. Cancelamentos com mais de 30 dias terão restituição integral dos valores pagos.",
  },
  {
    num: "3",
    titulo: "DAS RESPONSABILIDADES",
    texto: "A CONTRATADA responsabiliza-se pela execução dos serviços com qualidade conforme especificado, e o CONTRATANTE responsabiliza-se pelo pagamento nas datas acordadas e pela veracidade das informações fornecidas.",
  },
  {
    num: "4",
    titulo: "DO FORO",
    texto: "As partes elegem o Foro da Comarca de São Paulo/SP para dirimir quaisquer dúvidas oriundas do presente contrato, renunciando expressamente a qualquer outro.",
  },
];

export default function PropostasPage() {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("Todos");
  const [activeServiceFilter, setActiveServiceFilter] = useState("Todos");

  // PDF Modal
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProposal, setEditProposal] = useState<Proposal | null>(null);
  const [editEventType, setEditEventType] = useState<EventType>("Casamento");
  const [editServicos, setEditServicos] = useState<ServiceType[]>([]);
  const [editValidade, setEditValidade] = useState("15 dias");
  const [editParcelas, setEditParcelas] = useState(3);
  const [editObservacoes, setEditObservacoes] = useState("");

  // Contract Modal
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractProposal, setContractProposal] = useState<Proposal | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const filteredProposals = proposals.filter((p) => {
    const matchesStatus = activeStatusFilter === "Todos" || p.status === activeStatusFilter;
    let matchesService = true;
    if (activeServiceFilter !== "Todos") {
      if (activeServiceFilter === "Combo") {
        matchesService = isCombo(p.servicosContratados);
      } else {
        const serviceMap: Record<string, string> = {
          "Buffet": "buffet",
          "Decoração": "decoracao",
          "Fotografia": "fotografia",
        };
        matchesService = p.servicosContratados.includes(serviceMap[activeServiceFilter] as ServiceType);
      }
    }
    const matchesSearch =
      p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesService && matchesSearch;
  });

  const handleOpenPdf = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowPdfModal(true);
  };

  const handleMockDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setShowPdfModal(false);
    }, 1500);
  };

  const handleOpenEdit = (proposal: Proposal) => {
    setEditProposal(proposal);
    setEditEventType(proposal.eventType);
    setEditServicos([...proposal.servicosContratados]);
    setEditValidade(proposal.validity);
    setEditParcelas(3);
    setEditObservacoes("");
    setShowEditModal(true);
  };

  const toggleEditServico = (srv: ServiceType) => {
    setEditServicos((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const handleSaveEdit = () => {
    if (!editProposal) return;
    const newServicos = editServicos.length > 0 ? editServicos : editProposal.servicosContratados;
    const discount = COMBO_DISCOUNTS[newServicos.length as keyof typeof COMBO_DISCOUNTS] ?? 0;
    setProposals((prev) =>
      prev.map((p) =>
        p.id === editProposal.id
          ? {
              ...p,
              eventType: editEventType,
              servicosContratados: newServicos,
              validity: editValidade,
              descontoCombo: discount,
              totalCents: Math.round(p.subtotalCents * (1 - discount)),
            }
          : p
      )
    );
    setShowEditModal(false);
    setEditProposal(null);
  };

  const handleOpenContract = (proposal: Proposal) => {
    setContractProposal(proposal);
    setShowContractModal(true);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] p-4 md:p-8 animate-fade-in-up overflow-y-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--gold-300)] tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gestão Comercial de Eventos Premium</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mt-1">Propostas</h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)] mt-0.5 font-sans">Gestão de propostas comerciais e orçamentos multi-serviços</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Send className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Propostas enviadas</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">12</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-yellow-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-400"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Em negociação</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">5</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-orange-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400"><AlertCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Propostas vencendo</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">2</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card flex items-center gap-4 transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-green-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-green-500/10 rounded-lg text-green-400"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Propostas fechadas</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">24</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 mb-6 bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] shadow-card">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[var(--text-muted)]" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors"
            placeholder="Buscar proposta por cliente ou tipo de evento..."
          />
        </div>

        <div className="flex flex-col gap-3.5 pt-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider w-24 shrink-0">Filtrar Status:</span>
            <div className="flex flex-wrap gap-2">
              {statusFilterOptions.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveStatusFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${activeStatusFilter === filter ? 'bg-[var(--gold-500)]/15 text-[var(--gold-300)] border-[var(--gold-500)]/30 shadow-[var(--shadow-gold-glow)]' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--gold-500)]/20 hover:text-[var(--text-primary)]'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2 border-t border-[var(--border-subtle)] pt-3.5 mt-1">
            <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider w-24 shrink-0">Por Serviço:</span>
            <div className="flex flex-wrap gap-2">
              {serviceFilterOptions.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveServiceFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${activeServiceFilter === filter ? 'bg-[var(--gold-500)]/15 text-[var(--gold-300)] border-[var(--gold-500)]/30 shadow-[var(--shadow-gold-glow)]' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--gold-500)]/20 hover:text-[var(--text-primary)]'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-card overflow-hidden">

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Tipo Evento</th>
                <th className="px-6 py-4 font-semibold">Serviços</th>
                <th className="px-6 py-4 font-semibold">Orçamento</th>
                <th className="px-6 py-4 font-semibold">Envio / Validade</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {filteredProposals.map((proposal) => {
                const combo = isCombo(proposal.servicosContratados);
                const discountAmount = proposal.subtotalCents - proposal.totalCents;
                const rowHighlight = combo ? "border-l-2 border-l-[var(--gold-400)]/60 bg-[var(--gold-500)]/[0.01]" : "";

                return (
                  <tr key={proposal.id} className={`hover:bg-[var(--bg-card-hover)] transition-colors group ${rowHighlight}`}>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[var(--text-primary)] text-sm">{proposal.client}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${eventTypeStyles[proposal.eventType]}`}>
                        {proposal.eventType}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <ServiceBadgeGroup evento={proposal} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-bold text-[var(--text-primary)] font-mono">{formatCurrency(proposal.totalCents / 100)}</span>
                        {combo && (
                          <span className="text-[10px] text-emerald-400 font-mono">
                            Combo {proposal.descontoCombo * 100}% (-{formatCurrency(discountAmount / 100)})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs">
                        <span className="text-[var(--text-primary)]">{proposal.sendDate}</span>
                        <span className="text-[var(--text-muted)] mt-0.5">Validade: {proposal.validity}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyles[proposal.status]}`}>
                        {proposal.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-85 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenPdf(proposal)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--gold-400)] bg-[var(--gold-500)]/5 hover:bg-[var(--gold-500)]/15 border border-[var(--gold-500)]/20 rounded-lg transition-all cursor-pointer"
                          title="Visualizar proposta comercial em PDF"
                        >
                          <FileDown className="w-3.5 h-3.5 stroke-[2.5]" />
                          PDF
                        </button>
                        <button
                          onClick={() => handleOpenEdit(proposal)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors cursor-pointer"
                          title="Editar proposta"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenContract(proposal)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-400 bg-violet-500/5 hover:bg-violet-500/15 border border-violet-500/20 rounded-lg transition-all cursor-pointer"
                          title="Converter em contrato"
                        >
                          <ScrollText className="w-3.5 h-3.5 stroke-[2.5]" />
                          Contrato
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-[var(--border-default)]">
          {filteredProposals.map((proposal) => {
            const combo = isCombo(proposal.servicosContratados);
            const discountAmount = proposal.subtotalCents - proposal.totalCents;

            return (
              <div
                key={proposal.id}
                className={`p-4 hover:bg-[var(--bg-card-hover)] transition-colors relative overflow-hidden ${combo ? "border-l-2 border-l-[var(--gold-400)]" : ""}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] text-sm">{proposal.client}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${eventTypeStyles[proposal.eventType]}`}>
                        {proposal.eventType}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyles[proposal.status]}`}>
                        {proposal.status}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-[var(--text-primary)] font-mono text-sm">{formatCurrency(proposal.totalCents / 100)}</span>
                </div>

                <div className="mb-4 pt-3 border-t border-[var(--border-subtle)]/50">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 font-bold">Serviços da Proposta</p>
                  <ServiceBadgeGroup evento={proposal} size="sm" />

                  {combo && (
                    <div className="bg-[var(--gold-500)]/5 border border-[var(--gold-500)]/10 rounded-lg p-2.5 mt-2.5 text-[10px] text-[var(--text-secondary)] font-mono">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(proposal.subtotalCents / 100)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 mt-0.5">
                        <span>Desconto {proposal.descontoCombo * 100}%:</span>
                        <span>-{formatCurrency(discountAmount / 100)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end mt-4 pt-3 border-t border-[var(--border-subtle)]/40">
                  <div className="flex flex-col text-xs">
                    <span className="text-[var(--text-secondary)]">Enviado: {proposal.sendDate}</span>
                    <span className="text-[var(--text-muted)] text-[11px] mt-0.5">Validade: {proposal.validity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenPdf(proposal)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[var(--gold-400)] bg-[var(--gold-500)]/5 hover:bg-[var(--gold-500)]/15 border border-[var(--gold-500)]/20 rounded-lg transition-all cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      PDF
                    </button>
                    <button
                      onClick={() => handleOpenEdit(proposal)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--border-default)] rounded-md transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenContract(proposal)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-violet-400 bg-violet-500/5 hover:bg-violet-500/15 border border-violet-500/20 rounded-lg transition-all cursor-pointer"
                    >
                      <ScrollText className="w-3.5 h-3.5" />
                      Contrato
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProposals.length === 0 && (
          <div className="p-12 text-center border-t border-[var(--border-default)]">
            <FileText className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)] font-medium">Nenhuma proposta corresponde aos filtros selecionados.</p>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: PDF */}
      {showPdfModal && selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up flex flex-col my-8">

            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--gold-300)]" />
                <h3 className="font-bold text-[var(--text-primary)]">Visualizar Proposta Comercial</h3>
              </div>
              <button onClick={() => setShowPdfModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-neutral-900 border-b border-[var(--border-subtle)] max-h-[500px]">
              <div className="bg-white text-neutral-900 p-8 md:p-10 rounded-lg shadow-2xl relative overflow-hidden border border-neutral-300 min-h-[600px] flex flex-col justify-between" style={{ fontFamily: "'Georgia', serif" }}>
                <div>
                  <div className="flex justify-between items-start border-b-2 border-amber-600 pb-5 mb-8">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-wider text-amber-700 font-sans" style={{ fontFamily: "sans-serif" }}>COMPACT PRIME</h2>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-sans font-semibold mt-0.5" style={{ fontFamily: "sans-serif" }}>Buffet & Eventos Premium</p>
                    </div>
                    <div className="text-right text-xs text-neutral-500 font-sans" style={{ fontFamily: "sans-serif" }}>
                      <p>Data: {selectedProposal.sendDate}</p>
                      <p className="mt-0.5">Validade: {selectedProposal.validity}</p>
                      <p className="font-mono mt-0.5 text-[10px] font-bold">ORC-{selectedProposal.id}2026</p>
                    </div>
                  </div>

                  <div className="mb-6 font-sans text-xs text-neutral-600" style={{ fontFamily: "sans-serif" }}>
                    <p className="font-semibold text-neutral-800 text-sm">Prezado(a) {selectedProposal.client},</p>
                    <p className="mt-2.5 leading-relaxed">Agradecemos a oportunidade de apresentar nosso orçamento personalizado para o seu evento. Abaixo detalhamos os serviços integrados e os respectivos valores operacionais conforme as premissas acordadas.</p>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 rounded p-4 mb-6 font-sans text-xs text-neutral-700" style={{ fontFamily: "sans-serif" }}>
                    <h4 className="font-bold text-neutral-800 border-b border-neutral-200 pb-1.5 mb-2 uppercase text-[10px] tracking-wide">Premissas do Evento</h4>
                    <div className="grid grid-cols-2 gap-y-2">
                      <div><span className="text-neutral-400">Cliente:</span> <strong className="text-neutral-800 font-medium">{selectedProposal.client}</strong></div>
                      <div><span className="text-neutral-400">Tipo de Evento:</span> <strong className="text-neutral-800 font-medium">{selectedProposal.eventType}</strong></div>
                    </div>
                  </div>

                  <div className="mb-6 font-sans text-xs text-neutral-700" style={{ fontFamily: "sans-serif" }}>
                    <h4 className="font-bold text-neutral-800 border-b-2 border-neutral-200 pb-2 mb-3 uppercase text-[10px] tracking-wide">Serviços Contratados</h4>
                    <div className="space-y-3.5">
                      {selectedProposal.servicosContratados.map((srv) => (
                        <div key={srv} className="flex justify-between items-start gap-4 border-b border-neutral-100 pb-3">
                          <div className="max-w-md">
                            <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                              {SERVICES[srv]?.label || srv}
                            </span>
                            <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">{srvDescriptionMap[srv]}</p>
                          </div>
                          <span className="font-bold text-neutral-800 font-mono text-right shrink-0">
                            {selectedProposal.valoresPorServico[srv] ? formatCurrency(selectedProposal.valoresPorServico[srv]! / 100) : "R$ 0,00"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end font-sans text-xs text-neutral-700" style={{ fontFamily: "sans-serif" }}>
                    <div className="w-72 space-y-1.5 pt-2 border-t border-neutral-200">
                      <div className="flex justify-between text-neutral-500">
                        <span>Subtotal do Pacote:</span>
                        <span className="font-mono">{formatCurrency(selectedProposal.subtotalCents / 100)}</span>
                      </div>
                      {isCombo(selectedProposal.servicosContratados) && (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>Desconto Combo ({selectedProposal.descontoCombo * 100}%):</span>
                          <span className="font-mono">-{formatCurrency((selectedProposal.subtotalCents - selectedProposal.totalCents) / 100)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-neutral-900 font-bold border-t border-neutral-300 pt-2 text-sm">
                        <span>Valor Final Líquido:</span>
                        <span className="text-amber-800 font-mono">{formatCurrency(selectedProposal.totalCents / 100)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-between items-end border-t border-neutral-100 pt-5 font-sans" style={{ fontFamily: "sans-serif" }}>
                  <div className="text-[9px] text-neutral-400">
                    <p>Compact Prime CRM — Documento Comercial Informativo.</p>
                    <p className="mt-0.5">Assinado digitalmente por Compact Prime Ltda.</p>
                  </div>
                  <div className="flex items-center gap-1.5 border-2 border-emerald-600/35 px-3 py-1.5 rounded bg-emerald-500/5 text-emerald-600 uppercase text-[9px] font-bold tracking-wider font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    <span>Orçamento Aprovado</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[var(--bg-secondary)] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[var(--gold-300)]" />
                O PDF inclui o detalhamento dos impostos e condições de parcelamento.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="px-4 py-2 border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  onClick={handleMockDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-300)] hover:from-[var(--gold-600)] hover:to-[var(--gold-400)] text-black rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {downloading ? "Aguarde..." : <><FileDown className="w-4 h-4 text-black stroke-[3]" /> Download PDF</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDITAR PROPOSTA */}
      {showEditModal && editProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up my-8">

            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-[var(--gold-300)]" />
                <h3 className="font-bold text-[var(--text-primary)] text-sm">Editar Proposta — {editProposal.client}</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">

              {/* Tipo de Evento */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">Tipo de Evento</label>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map((et) => (
                    <button
                      key={et}
                      onClick={() => setEditEventType(et)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${editEventType === et ? 'bg-[var(--gold-500)]/15 text-[var(--gold-300)] border-[var(--gold-500)]/40' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--gold-500)]/20'}`}
                    >
                      {et}
                    </button>
                  ))}
                </div>
              </div>

              {/* Serviços */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">Serviços Contratados</label>
                <div className="flex gap-2">
                  {allServiceTypes.map((srv) => {
                    const active = editServicos.includes(srv);
                    const color = SERVICES[srv]?.color || "#888";
                    return (
                      <button
                        key={srv}
                        onClick={() => toggleEditServico(srv)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
                        style={{
                          background: active ? `${color}22` : "var(--bg-input)",
                          color: active ? color : "var(--text-secondary)",
                          borderColor: active ? `${color}55` : "var(--border-default)",
                        }}
                      >
                        {SERVICES[srv]?.label || srv}
                      </button>
                    );
                  })}
                </div>
                {editServicos.length > 1 && (
                  <p className="text-[11px] text-emerald-400 mt-2 font-semibold">
                    Combo detectado — desconto de {(COMBO_DISCOUNTS[editServicos.length as keyof typeof COMBO_DISCOUNTS] ?? 0) * 100}% aplicado
                  </p>
                )}
              </div>

              {/* Validade */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">Validade da Proposta</label>
                <input
                  type="text"
                  value={editValidade}
                  onChange={(e) => setEditValidade(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg text-sm text-[var(--text-primary)] transition-colors"
                  placeholder="Ex: 15 dias"
                />
              </div>

              {/* Número de parcelas */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">Número de Parcelas</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 6, 10, 12].map((n) => (
                    <button
                      key={n}
                      onClick={() => setEditParcelas(n)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all cursor-pointer ${editParcelas === n ? 'bg-[var(--gold-500)]/15 text-[var(--gold-300)] border-[var(--gold-500)]/40' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--gold-500)]/20'}`}
                    >
                      {n}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">Observações</label>
                <textarea
                  value={editObservacoes}
                  onChange={(e) => setEditObservacoes(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors resize-none"
                  placeholder="Condições especiais, ajustes solicitados pelo cliente..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-300)] hover:from-[var(--gold-600)] hover:to-[var(--gold-400)] text-black rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Save className="w-3.5 h-3.5 stroke-[3]" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONTRATO */}
      {showContractModal && contractProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up flex flex-col my-8">

            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-violet-400" />
                <h3 className="font-bold text-[var(--text-primary)]">Contrato de Prestação de Serviços</h3>
              </div>
              <button onClick={() => setShowContractModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Paper document */}
            <div className="flex-1 p-6 overflow-y-auto bg-neutral-900 border-b border-[var(--border-subtle)] max-h-[580px]">
              <div className="bg-white text-neutral-900 p-8 md:p-10 rounded-lg shadow-2xl border border-neutral-300 min-h-[700px] flex flex-col gap-6" style={{ fontFamily: "'Georgia', serif" }}>

                {/* Contract Header */}
                <div className="text-center border-b-2 border-neutral-800 pb-6">
                  <h2 className="text-base font-bold uppercase tracking-[0.15em] text-neutral-800 font-sans" style={{ fontFamily: "sans-serif" }}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1 font-sans" style={{ fontFamily: "sans-serif" }}>Nº CONT-{contractProposal.id}2026 · Data de Emissão: {new Date().toLocaleDateString("pt-BR")}</p>
                </div>

                {/* Seção 1 — Dados da Empresa */}
                <div className="font-sans text-xs" style={{ fontFamily: "sans-serif" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <h4 className="font-bold text-neutral-800 uppercase text-[10px] tracking-wider">1. Dados do Contratado (Empresa)</h4>
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200 rounded p-3.5 grid grid-cols-2 gap-y-2 text-neutral-700">
                    <div><span className="text-neutral-400">Razão Social:</span> <strong className="font-semibold">Compact Prime Buffet & Eventos Ltda</strong></div>
                    <div><span className="text-neutral-400">CNPJ:</span> <strong className="font-semibold">00.000.000/0001-00</strong></div>
                    <div><span className="text-neutral-400">Endereço:</span> <strong className="font-semibold">Rua dos Eventos, 1500 – São Paulo/SP</strong></div>
                    <div><span className="text-neutral-400">Responsável:</span> <strong className="font-semibold">Diretor Comercial</strong></div>
                  </div>
                </div>

                {/* Seção 2 — Dados do Cliente */}
                <div className="font-sans text-xs" style={{ fontFamily: "sans-serif" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <h4 className="font-bold text-neutral-800 uppercase text-[10px] tracking-wider">2. Dados do Contratante (Cliente)</h4>
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200 rounded p-3.5 grid grid-cols-2 gap-y-2 text-neutral-700">
                    <div><span className="text-neutral-400">Nome / Razão Social:</span> <strong className="font-semibold">{contractProposal.client}</strong></div>
                    <div><span className="text-neutral-400">Tipo de Evento:</span> <strong className="font-semibold">{contractProposal.eventType}</strong></div>
                    <div><span className="text-neutral-400">CPF / CNPJ:</span> <strong className="font-semibold text-neutral-400 italic">A preencher</strong></div>
                    <div><span className="text-neutral-400">Contato:</span> <strong className="font-semibold text-neutral-400 italic">A preencher</strong></div>
                  </div>
                </div>

                {/* Seção 3 — Dados do Evento */}
                <div className="font-sans text-xs" style={{ fontFamily: "sans-serif" }}>
                  <h4 className="font-bold text-neutral-800 uppercase text-[10px] tracking-wider border-b border-neutral-200 pb-1.5 mb-2">3. Dados do Evento</h4>
                  <div className="grid grid-cols-3 gap-3 text-neutral-700">
                    <div className="bg-neutral-50 border border-neutral-200 rounded p-3">
                      <p className="text-[9px] text-neutral-400 uppercase font-semibold mb-1">Tipo</p>
                      <p className="font-semibold text-neutral-800">{contractProposal.eventType}</p>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 rounded p-3">
                      <p className="text-[9px] text-neutral-400 uppercase font-semibold mb-1">Data do Evento</p>
                      <p className="font-semibold text-neutral-400 italic">A preencher</p>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 rounded p-3">
                      <p className="text-[9px] text-neutral-400 uppercase font-semibold mb-1">Local</p>
                      <p className="font-semibold text-neutral-400 italic">A preencher</p>
                    </div>
                  </div>
                </div>

                {/* Seção 4 — Serviços Contratados */}
                <div className="font-sans text-xs" style={{ fontFamily: "sans-serif" }}>
                  <h4 className="font-bold text-neutral-800 uppercase text-[10px] tracking-wider border-b border-neutral-200 pb-1.5 mb-2">4. Serviços Contratados</h4>
                  <div className="space-y-2.5">
                    {contractProposal.servicosContratados.map((srv) => (
                      <div key={srv} className="flex justify-between items-center bg-neutral-50 border border-neutral-200 rounded p-3">
                        <div>
                          <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0" />
                            {SERVICES[srv]?.label || srv}
                          </span>
                          <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed max-w-xs">{srvDescriptionMap[srv]}</p>
                        </div>
                        <span className="font-bold text-neutral-800 font-mono shrink-0 ml-4">
                          {contractProposal.valoresPorServico[srv] ? formatCurrency(contractProposal.valoresPorServico[srv]! / 100) : "R$ 0,00"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seção 5 — Condições Financeiras */}
                <div className="font-sans text-xs" style={{ fontFamily: "sans-serif" }}>
                  <h4 className="font-bold text-neutral-800 uppercase text-[10px] tracking-wider border-b border-neutral-200 pb-1.5 mb-2">5. Condições Financeiras</h4>
                  <div className="flex justify-end">
                    <div className="w-72 space-y-1.5">
                      <div className="flex justify-between text-neutral-500">
                        <span>Subtotal:</span>
                        <span className="font-mono">{formatCurrency(contractProposal.subtotalCents / 100)}</span>
                      </div>
                      {isCombo(contractProposal.servicosContratados) && (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>Desconto Combo ({contractProposal.descontoCombo * 100}%):</span>
                          <span className="font-mono">-{formatCurrency((contractProposal.subtotalCents - contractProposal.totalCents) / 100)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-neutral-900 font-bold border-t border-neutral-300 pt-2 text-sm">
                        <span>Valor Total Líquido:</span>
                        <span className="text-amber-800 font-mono">{formatCurrency(contractProposal.totalCents / 100)}</span>
                      </div>
                      <div className="flex justify-between text-neutral-500 pt-1">
                        <span>Forma de pagamento:</span>
                        <span className="italic">A definir em aditivo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção 6 — Cláusulas */}
                <div className="font-sans text-xs" style={{ fontFamily: "sans-serif" }}>
                  <h4 className="font-bold text-neutral-800 uppercase text-[10px] tracking-wider border-b border-neutral-200 pb-1.5 mb-3">6. Cláusulas e Condições Gerais</h4>
                  <div className="space-y-3 text-neutral-700">
                    {clausulas.map((c) => (
                      <div key={c.num}>
                        <p className="font-bold text-neutral-800 text-[11px]">Cláusula {c.num} — {c.titulo}</p>
                        <p className="mt-0.5 leading-relaxed text-neutral-600">{c.texto}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assinaturas */}
                <div className="font-sans text-xs mt-4 pt-4 border-t-2 border-neutral-200" style={{ fontFamily: "sans-serif" }}>
                  <h4 className="font-bold text-neutral-800 uppercase text-[10px] tracking-wider mb-6 text-center">Assinaturas</h4>
                  <div className="grid grid-cols-2 gap-12">
                    <div className="text-center">
                      <div className="border-t border-neutral-400 pt-2">
                        <p className="font-semibold text-neutral-800">{contractProposal.client}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Contratante</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="border-t border-neutral-400 pt-2">
                        <p className="font-semibold text-neutral-800">Compact Prime Ltda</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Contratada</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-[9px] text-neutral-400 mt-6">São Paulo, {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>

              </div>
            </div>

            {/* Integration notice + actions */}
            <div className="px-6 pt-4 pb-2 bg-violet-500/5 border-t border-violet-500/15 shrink-0">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-violet-300/80 leading-relaxed">
                  <span className="font-bold text-violet-300">Integração automática:</span> contratos convertidos alimentam automaticamente Agenda, Financeiro e Operação. A sincronização ocorrerá ao confirmar a assinatura.
                </p>
              </div>
            </div>

            <div className="px-6 py-3 bg-[var(--bg-secondary)] flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setShowContractModal(false)}
                className="px-4 py-2 border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
              >
                Fechar
              </button>
              <button
                className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <ScrollText className="w-3.5 h-3.5 stroke-[2.5]" />
                Confirmar Contrato
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

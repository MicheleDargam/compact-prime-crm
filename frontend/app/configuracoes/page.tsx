"use client";

import { useState, useEffect, useRef } from "react";
import {
  Building2,
  Briefcase,
  Sparkles,
  Users,
  DollarSign,
  Layers,
  Eye,
  Lock,
  Check,
  HelpCircle,
  Smartphone,
  Calendar,
  Cpu,
  Bot,
  Link2,
  Save,
  CheckCircle,
  FileCheck,
  Moon,
  Sun,
  Tag,
  Crown,
  Gem,
  Star,
  ArrowUpRight,
  Plus,
  Pencil,
  X,
} from "lucide-react";
import { ServiceBadge } from "@/app/components/ServiceBadge";

type TabId = "empresa" | "servicos" | "socias" | "financeiro" | "integracoes" | "visual" | "clientes";

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

type ClientCategoryOption = "Cliente Novo" | "Cliente Prime" | "Cliente VIP";
type ServiceOption = "Buffet" | "Decoração" | "Fotografia";

interface PromotionRule {
  id: string;
  name: string;
  clientCategory: ClientCategoryOption;
  services: ServiceOption[];
  discount: number;
  active: boolean;
  observations: string;
}


const CATEGORY_BADGE_STYLE: Record<ClientCategoryOption, string> = {
  "Cliente Novo": "text-neutral-400 border-neutral-600/50 bg-neutral-800/50",
  "Cliente Prime": "text-blue-300 border-blue-500/40 bg-blue-500/10",
  "Cliente VIP": "text-[var(--gold-300)] border-[var(--gold-500)]/40 bg-[var(--gold-500)]/10",
};

const SERVICE_BADGE_STYLE: Record<ServiceOption, string> = {
  "Buffet": "text-[var(--gold-300)] bg-[var(--gold-500)]/10 border-[var(--gold-500)]/20",
  "Decoração": "text-pink-300 bg-pink-500/10 border-pink-500/20",
  "Fotografia": "text-blue-300 bg-blue-500/10 border-blue-500/20",
};

export default function ConfiguacoesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("empresa");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Empresa Form States
  const [nomeFantasia, setNomeFantasia] = useState("Compact Prime Buffet & Eventos Premium");
  const [slogan, setSlogan] = useState("Gastronomia refinada e cenografia exclusiva para casamentos e eventos de alto padrão.");
  const [telefone, setTelefone] = useState("(11) 98765-4321");
  const [email, setEmail] = useState("diretoria@compactprime.com.br");
  const [endereco, setEndereco] = useState("Av. Europa, 1500 - Jardins, São Paulo - SP");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [responsavelLegal, setResponsavelLegal] = useState("");
  const [cargoResponsavel, setCargoResponsavel] = useState("");
  const [assinaturaTexto, setAssinaturaTexto] = useState("");
  const [empresaLoading, setEmpresaLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Service Actives States (Toggles)
  const [buffetAtivo, setBuffetAtivo] = useState(true);
  const [decoracaoAtiva, setDecoracaoAtiva] = useState(true);
  const [fotografiaAtiva, setFotografiaAtiva] = useState(true);

  // Financial Standard States
  const [validadeProposta, setValidadeProposta] = useState("15 dias");
  const [parcelamentoPadrao, setParcelamentoPadrao] = useState("Sinal + Parcelas iguais mensais até 10 dias antes do evento");
  const [sinalMinimo, setSinalMinimo] = useState("30% de sinal para reserva");
  const [observacoesFinanceiras, setObservacoesFinanceiras] = useState("Valores sujeitos a alteração em caso de aumento expressivo de insumos.");

  // Client Categories States
  const [criterioNovo, setCriterioNovo] = useState("Primeiro contato ou primeira contratação com a Compact Prime.");

  const [prioridadeNovo, setPrioridadeNovo] = useState<"Normal" | "Alta" | "Máxima">("Normal");

  const [criterioPrime, setCriterioPrime] = useState("Cliente que já contratou mais de uma vez com a Compact Prime.");

  const [prioridadePrime, setPrioridadePrime] = useState<"Normal" | "Alta" | "Máxima">("Alta");

  const [criterioVip, setCriterioVip] = useState("Cliente estratégico, alto ticket ou indicação importante de parceiro.");

  const [prioridadeVip, setPrioridadeVip] = useState<"Normal" | "Alta" | "Máxima">("Máxima");

  // Preferences Toggles
  const [temaEscuro, setTemaEscuro] = useState(true);
  const [identidadeDourada, setIdentidadeDourada] = useState(true);
  const [layoutPremium, setLayoutPremium] = useState(true);

  const tabs: TabItem[] = [
    { id: "empresa", label: "Empresa", icon: <Building2 className="w-4 h-4" /> },
    { id: "servicos", label: "Serviços & Combo", icon: <Briefcase className="w-4 h-4" /> },
    { id: "socias", label: "Sócias & Societário", icon: <Users className="w-4 h-4" /> },
    { id: "financeiro", label: "Financeiro Padrão", icon: <DollarSign className="w-4 h-4" /> },
    { id: "integracoes", label: "Integrações Futuras", icon: <Link2 className="w-4 h-4" /> },
    { id: "visual", label: "Visual & Temas", icon: <Eye className="w-4 h-4" /> },
    { id: "clientes", label: "Clientes & Categorias", icon: <Tag className="w-4 h-4" /> },
  ];

  useEffect(() => {
    fetch("/api/configuracoes/empresa")
      .then((r) => r.json())
      .then((json) => {
        if (!json.ok || !json.data) return;
        const d = json.data;
        if (d.nome_fantasia) setNomeFantasia(d.nome_fantasia);
        if (d.slogan) setSlogan(d.slogan);
        if (d.telefone) setTelefone(d.telefone);
        if (d.email) setEmail(d.email);
        if (d.endereco) setEndereco(d.endereco);
        if (d.razao_social) setRazaoSocial(d.razao_social);
        if (d.cnpj) setCnpj(d.cnpj);
        if (d.responsavel_legal) setResponsavelLegal(d.responsavel_legal);
        if (d.cargo_responsavel) setCargoResponsavel(d.cargo_responsavel);
        if (d.assinatura_texto) setAssinaturaTexto(d.assinatura_texto);
        if (d.logo_url) setLogoUrl(d.logo_url);
      })
      .catch(() => {});
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const form = new FormData();
      form.append("logo", file);
      const res = await fetch("/api/configuracoes/empresa/logo", { method: "POST", body: form });
      const json = await res.json();
      if (json.ok) {
        setLogoUrl(json.url + "?t=" + Date.now());
        handleSave("Logo");
      } else {
        alert(json.error ?? "Erro ao enviar logo.");
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleSaveEmpresa = async () => {
    setEmpresaLoading(true);
    try {
      const res = await fetch("/api/configuracoes/empresa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_fantasia: nomeFantasia,
          slogan,
          telefone,
          email,
          endereco,
          razao_social: razaoSocial,
          cnpj,
          responsavel_legal: responsavelLegal,
          cargo_responsavel: cargoResponsavel,
          assinatura_texto: assinaturaTexto,
        }),
      });
      const json = await res.json();
      if (json.ok) handleSave("Empresa");
    } catch {
      // silent
    } finally {
      setEmpresaLoading(false);
    }
  };

  const handleSave = (sectionName: string) => {
    setToastMessage(`Configurações de ${sectionName} salvas com sucesso!`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Promotion Rules
  const [promotionRules, setPromotionRules] = useState<PromotionRule[]>([]);

  useEffect(() => {
    fetch("/api/configuracoes/regras")
      .then(r => r.json())
      .then(json => {
        if (!json.ok) return;
        setPromotionRules((json.data as Array<{ id: string; name: string; clientCategory: string; discount: number; active: boolean; observations: string }>).map(r => ({
          id: r.id,
          name: r.name,
          clientCategory: r.clientCategory as ClientCategoryOption,
          services: [] as ServiceOption[],
          discount: r.discount,
          active: r.active,
          observations: r.observations,
        })));
      })
      .catch(() => {});
  }, []);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleFormName, setRuleFormName] = useState("");
  const [ruleFormCategory, setRuleFormCategory] = useState<ClientCategoryOption>("Cliente Novo");
  const [ruleFormServices, setRuleFormServices] = useState<ServiceOption[]>([]);
  const [ruleFormDiscount, setRuleFormDiscount] = useState(10);
  const [ruleFormActive, setRuleFormActive] = useState(true);
  const [ruleFormObservations, setRuleFormObservations] = useState("");

  const cancelRuleForm = () => {
    setShowRuleForm(false);
    setEditingRuleId(null);
    setRuleFormName("");
    setRuleFormCategory("Cliente Novo");
    setRuleFormServices([]);
    setRuleFormDiscount(10);
    setRuleFormActive(true);
    setRuleFormObservations("");
  };

  const openNewRuleForm = () => { cancelRuleForm(); setShowRuleForm(true); };

  const openEditRuleForm = (rule: PromotionRule) => {
    setRuleFormName(rule.name);
    setRuleFormCategory(rule.clientCategory);
    setRuleFormServices([...rule.services]);
    setRuleFormDiscount(rule.discount);
    setRuleFormActive(rule.active);
    setRuleFormObservations(rule.observations);
    setEditingRuleId(rule.id);
    setShowRuleForm(true);
  };

  const handleSaveRule = () => {
    if (!ruleFormName.trim() || ruleFormServices.length === 0) return;
    if (editingRuleId) {
      setPromotionRules(prev => prev.map(r =>
        r.id === editingRuleId
          ? { ...r, name: ruleFormName, clientCategory: ruleFormCategory, services: ruleFormServices, discount: ruleFormDiscount, active: ruleFormActive, observations: ruleFormObservations }
          : r
      ));
    } else {
      setPromotionRules(prev => [...prev, { id: `rule-${Date.now()}`, name: ruleFormName, clientCategory: ruleFormCategory, services: ruleFormServices, discount: ruleFormDiscount, active: ruleFormActive, observations: ruleFormObservations }]);
    }
    cancelRuleForm();
    handleSave("Regras Comerciais");
  };

  const toggleRuleActive = (id: string) => setPromotionRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const deleteRule = (id: string) => setPromotionRules(prev => prev.filter(r => r.id !== id));
  const toggleRuleService = (svc: ServiceOption) => setRuleFormServices(prev => prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc]);
  const getActiveRulesForCategory = (cat: ClientCategoryOption) => promotionRules.filter(r => r.clientCategory === cat && r.active);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] p-4 md:p-8 animate-fade-in-up overflow-y-auto relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[var(--bg-card)] border border-[var(--gold-400)]/40 rounded-xl shadow-[var(--shadow-gold-glow)] text-xs font-semibold text-[var(--gold-300)] animate-fade-in-up">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="mb-8 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--gold-300)] tracking-widest uppercase">
          <Sparkles className="w-3 h-3" />
          <span>Configurações Gerais</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mt-0.5">Configurações</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Gerenciamento geral da operação e identidade do CRM</p>
      </header>

      {/* Settings Grid Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-[500px]">
        {/* Left Side Tab Menu */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-default)] shadow-card max-h-none md:max-h-[340px] no-scrollbar">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap
                  ${active 
                    ? "bg-[var(--gold-500)]/15 text-[var(--gold-300)] border-l-2 border-l-[var(--gold-400)] shadow-[0_0_8px_rgba(212,169,55,0.05)]" 
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.02]"}
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side Settings Panel */}
        <div className="flex-1 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] shadow-card p-6 md:p-8 flex flex-col min-h-[400px]">
          
          {/* TAB 1: EMPRESA */}
          {activeTab === "empresa" && (
            <div className="flex flex-col gap-6 flex-1">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Informações da Empresa</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Dados institucionais expostos em orçamentos, PDFs e propostas.</p>
              </div>

              {/* Logo Upload */}
              <div className="flex items-center gap-5 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--gold-300)] to-[var(--gold-600)] shadow-md border border-[var(--gold-500)]/30 overflow-hidden shrink-0">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="Logomarca" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-black font-extrabold text-lg">CP</span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Logomarca Oficial</h4>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">PNG transparente, máx. 2 MB, 512×512 px ideal.</p>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    className="mt-2 text-[10px] font-bold text-[var(--gold-300)] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {logoUploading ? "Enviando..." : logoUrl ? "Alterar Logomarca" : "Enviar Logomarca"}
                  </button>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Nome Fantasia</label>
                  <input 
                    type="text" 
                    value={nomeFantasia}
                    onChange={(e) => setNomeFantasia(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Telefone Comercial</label>
                  <input 
                    type="text" 
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Slogan da Marca</label>
                  <input 
                    type="text" 
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">E-mail para Contato</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Endereço Comercial</label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Razão Social</label>
                  <input
                    type="text"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    placeholder="Ex: Compact Prime Buffet & Eventos Ltda"
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">CNPJ</label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Responsável Legal</label>
                  <input
                    type="text"
                    value={responsavelLegal}
                    onChange={(e) => setResponsavelLegal(e.target.value)}
                    placeholder="Nome completo da responsável"
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Cargo da Responsável</label>
                  <input
                    type="text"
                    value={cargoResponsavel}
                    onChange={(e) => setCargoResponsavel(e.target.value)}
                    placeholder="Ex: Sócia-Diretora"
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors"
                  />
                </div>
              </div>

              {/* Assinatura */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Assinatura nos Documentos</h4>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Nome que aparece na linha de assinatura de contratos e propostas. Se vazio, usa o Responsável Legal.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Nome na Assinatura</label>
                  <input
                    type="text"
                    value={assinaturaTexto}
                    onChange={(e) => setAssinaturaTexto(e.target.value)}
                    placeholder={responsavelLegal || "Ex: Michele Dargam"}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors"
                  />
                </div>
                <div className="pt-2 border-t border-[var(--border-subtle)]">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2 font-bold">Pré-visualização</p>
                  <div className="flex justify-center">
                    <div className="border-t-2 border-neutral-500 pt-2 text-center min-w-[180px]">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{assinaturaTexto || responsavelLegal || "Nome do Responsável"}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{cargoResponsavel || "Cargo"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="mt-auto pt-6 border-t border-[var(--border-subtle)] flex justify-end">
                <button
                  onClick={handleSaveEmpresa}
                  disabled={empresaLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] hover:from-[var(--gold-700)] hover:to-[var(--gold-500)] text-black rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-black stroke-[3]" />
                  {empresaLoading ? "Salvando..." : "Salvar Configurações"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SERVIÇOS E COMBOS */}
          {activeTab === "servicos" && (
            <div className="flex flex-col gap-6 flex-1">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Serviços Ativos & Regras de Combo</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Determine os serviços ofertados na plataforma comercial e o regramento de descontos de pacotes.</p>
              </div>

              {/* Serviços Ativos Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[var(--gold-300)] uppercase tracking-wider">Status dos Serviços na Plataforma</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Buffet Card */}
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 rounded-xl flex flex-col justify-between min-h-[140px]">
                    <div className="flex justify-between items-start">
                      <ServiceBadge service="buffet" size="md" />
                      
                      {/* Premium Toggle */}
                      <button 
                        onClick={() => setBuffetAtivo(!buffetAtivo)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${buffetAtivo ? 'bg-emerald-500' : 'bg-neutral-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full transition-transform ${buffetAtivo ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-bold font-sans uppercase">
                        <span className="w-2 h-2 rounded-full bg-[var(--gold-400)]" />
                        <span>Cor: Dourado (Buffet)</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                        Serviço principal de gastronomia premium.
                      </p>
                    </div>
                  </div>

                  {/* Decoração Card */}
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 rounded-xl flex flex-col justify-between min-h-[140px]">
                    <div className="flex justify-between items-start">
                      <ServiceBadge service="decoracao" size="md" />
                      
                      {/* Premium Toggle */}
                      <button 
                        onClick={() => setDecoracaoAtiva(!decoracaoAtiva)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${decoracaoAtiva ? 'bg-emerald-500' : 'bg-neutral-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full transition-transform ${decoracaoAtiva ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-bold font-sans uppercase">
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                        <span>Cor: Rosa (Decoracão)</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                        Design floral e cenografia personalizada.
                      </p>
                    </div>
                  </div>

                  {/* Fotografia Card */}
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 rounded-xl flex flex-col justify-between min-h-[140px]">
                    <div className="flex justify-between items-start">
                      <ServiceBadge service="fotografia" size="md" />
                      
                      {/* Premium Toggle */}
                      <button 
                        onClick={() => setFotografiaAtiva(!fotografiaAtiva)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${fotografiaAtiva ? 'bg-emerald-500' : 'bg-neutral-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full transition-transform ${fotografiaAtiva ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-bold font-sans uppercase">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Cor: Azul (Fotografia)</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                        Fotografia de alta definição e álbuns premium.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo das Promoções Ativas */}
              {(() => {
                const activeRules = promotionRules.filter(r => r.active);
                const categoryTopStrip: Record<ClientCategoryOption, string> = {
                  "Cliente Novo": "from-neutral-500/60",
                  "Cliente Prime": "from-blue-500/60",
                  "Cliente VIP": "from-[var(--gold-500)]/80",
                };
                return (
                  <div className="p-5 rounded-xl bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[var(--gold-400)]" />
                        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Resumo das Promoções Ativas</h4>
                      </div>
                      <span className={`text-[10px] border rounded-full px-3 py-1 uppercase font-bold tracking-wider font-sans shrink-0 ${activeRules.length > 0 ? "bg-[var(--gold-500)]/15 text-[var(--gold-300)] border-[var(--gold-500)]/30" : "bg-neutral-800/50 text-neutral-500 border-neutral-700/50"}`}>
                        {activeRules.length} {activeRules.length === 1 ? "promoção ativa" : "promoções ativas"}
                      </span>
                    </div>

                    {/* Campaign Cards */}
                    {activeRules.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activeRules.map(rule => (
                          <div key={rule.id} className="relative rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden hover:border-[var(--gold-500)]/20 transition-all group">
                            <div className={`h-[2px] w-full bg-gradient-to-r ${categoryTopStrip[rule.clientCategory]} to-transparent`} />
                            <div className="p-3.5 flex flex-col gap-2.5">
                              {/* Category badge */}
                              <span className={`inline-flex items-center w-fit px-1.5 py-0.5 rounded text-[9px] font-bold border ${CATEGORY_BADGE_STYLE[rule.clientCategory]}`}>
                                {rule.clientCategory}
                              </span>

                              {/* Services */}
                              <div className="flex flex-wrap gap-1">
                                {rule.services.map((svc, i) => (
                                  <span key={svc} className="inline-flex items-center gap-1">
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${SERVICE_BADGE_STYLE[svc]}`}>{svc}</span>
                                    {i < rule.services.length - 1 && <span className="text-[var(--text-muted)] text-[9px] self-center">+</span>}
                                  </span>
                                ))}
                              </div>

                              {/* Discount — big number */}
                              <div className="flex items-end justify-between mt-1">
                                <div>
                                  <span className="text-2xl font-bold font-mono text-emerald-400 leading-none">{rule.discount}</span>
                                  <span className="text-sm font-bold text-emerald-400/70 ml-0.5">%</span>
                                  <p className="text-[9px] text-emerald-600/70 font-semibold mt-0.5">desconto</p>
                                </div>
                                <Sparkles className="w-4 h-4 text-[var(--gold-500)]/30 group-hover:text-[var(--gold-400)]/50 transition-colors mb-1" />
                              </div>

                              {/* Campaign name */}
                              <p className="text-[9px] text-[var(--text-muted)] truncate border-t border-[var(--border-subtle)]/40 pt-2">{rule.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 border border-dashed border-[var(--border-subtle)] rounded-xl flex flex-col items-center gap-2">
                        <Sparkles className="w-6 h-6 text-[var(--text-muted)]/40" />
                        <p className="text-xs text-[var(--text-muted)]">Nenhuma promoção ativa no momento.</p>
                        <p className="text-[10px] text-[var(--text-muted)]/60">Crie regras na seção "Regras Comerciais de Promoção" abaixo.</p>
                      </div>
                    )}

                    {/* Footer stats */}
                    {activeRules.length > 0 && (
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]/50">
                        <p className="text-[9px] text-[var(--text-muted)] truncate">
                          Categorias: <span className="text-[var(--text-secondary)] font-semibold">{[...new Set(activeRules.map(r => r.clientCategory))].join(", ")}</span>
                        </p>
                        <span className="text-[9px] font-bold font-mono text-emerald-400 shrink-0">
                          até {Math.max(...activeRules.map(r => r.discount))}% desc
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Regras Comerciais de Promoção */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[var(--gold-400)]" />
                      Regras Comerciais de Promoção
                    </h4>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Descontos automáticos por categoria de cliente e combinação de serviços.</p>
                  </div>
                  <button
                    onClick={openNewRuleForm}
                    className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-[var(--gold-300)] border border-[var(--gold-500)]/30 bg-[var(--gold-500)]/10 hover:bg-[var(--gold-500)]/20 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nova Regra
                  </button>
                </div>

                {/* Inline Form */}
                {showRuleForm && (
                  <div className="p-5 rounded-xl bg-[var(--bg-input)] border border-[var(--gold-500)]/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[var(--text-primary)]">{editingRuleId ? "Editar Regra Comercial" : "Nova Regra Comercial"}</p>
                      <button onClick={cancelRuleForm} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"><X className="w-4 h-4" /></button>
                    </div>

                    {/* Nome */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Nome da Campanha *</label>
                      <input
                        type="text"
                        value={ruleFormName}
                        onChange={e => setRuleFormName(e.target.value)}
                        placeholder="Ex: Especial Verão – Novos Clientes"
                        className="bg-[var(--bg-card)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-muted)]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Categoria */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Categoria do Cliente *</label>
                        <div className="flex flex-col gap-1.5">
                          {(["Cliente Novo", "Cliente Prime", "Cliente VIP"] as ClientCategoryOption[]).map(cat => (
                            <button
                              key={cat}
                              onClick={() => setRuleFormCategory(cat)}
                              className={`text-left px-3 py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${ruleFormCategory === cat ? CATEGORY_BADGE_STYLE[cat] : "text-[var(--text-muted)] border-[var(--border-default)] bg-[var(--bg-card)] hover:border-[var(--border-default)]"}`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Serviços */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Serviços do Combo *</label>
                        <div className="flex flex-col gap-1.5">
                          {(["Buffet", "Decoração", "Fotografia"] as ServiceOption[]).map(svc => (
                            <button
                              key={svc}
                              onClick={() => toggleRuleService(svc)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${ruleFormServices.includes(svc) ? SERVICE_BADGE_STYLE[svc] : "text-[var(--text-muted)] border-[var(--border-default)] bg-[var(--bg-card)]"}`}
                            >
                              <span className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 ${ruleFormServices.includes(svc) ? "border-current bg-current/20" : "border-[var(--border-default)]"}`}>
                                {ruleFormServices.includes(svc) && <Check className="w-2 h-2" />}
                              </span>
                              {svc}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Desconto */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Percentual de Desconto *</label>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={ruleFormDiscount}
                              onChange={e => setRuleFormDiscount(Math.max(1, Math.min(100, Number(e.target.value))))}
                              className="w-16 bg-[var(--bg-card)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2 text-xs text-[var(--text-primary)] font-mono text-center transition-colors"
                            />
                            <span className="text-sm font-bold text-[var(--text-secondary)]">%</span>
                          </div>
                          <div className="flex gap-1">
                            {[5, 10, 15, 20].map(v => (
                              <button key={v} onClick={() => setRuleFormDiscount(v)} className={`px-2 py-1 rounded text-[9px] font-bold border transition-all cursor-pointer ${ruleFormDiscount === v ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "text-[var(--text-muted)] border-[var(--border-default)] bg-[var(--bg-card)] hover:border-emerald-500/20"}`}>{v}%</button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Status da Regra</label>
                        <div className="flex items-center gap-3 mt-1.5">
                          <button
                            onClick={() => setRuleFormActive(!ruleFormActive)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${ruleFormActive ? "bg-emerald-500" : "bg-neutral-700"}`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full transition-transform ${ruleFormActive ? "translate-x-4" : "translate-x-0"}`} />
                          </button>
                          <span className={`text-xs font-bold ${ruleFormActive ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>{ruleFormActive ? "Ativa" : "Inativa"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Observações */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Observações</label>
                      <input
                        type="text"
                        value={ruleFormObservations}
                        onChange={e => setRuleFormObservations(e.target.value)}
                        placeholder="Informações adicionais sobre esta regra..."
                        className="bg-[var(--bg-card)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-muted)]"
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                      <button onClick={cancelRuleForm} className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] rounded-lg transition-all cursor-pointer">Cancelar</button>
                      <button
                        onClick={handleSaveRule}
                        disabled={!ruleFormName.trim() || ruleFormServices.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] hover:from-[var(--gold-700)] hover:to-[var(--gold-500)] text-black rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Save className="w-3.5 h-3.5 stroke-[3]" />
                        {editingRuleId ? "Salvar Alterações" : "Criar Regra"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Rules List */}
                {promotionRules.length > 0 ? (
                  <div className="space-y-2">
                    {promotionRules.map(rule => (
                      <div
                        key={rule.id}
                        className={`p-3.5 rounded-xl border transition-all ${rule.active ? "bg-[var(--bg-secondary)] border-[var(--border-subtle)]" : "bg-[var(--bg-secondary)]/50 border-[var(--border-subtle)]/40 opacity-55"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[var(--text-primary)]">{rule.name}</span>
                              {!rule.active && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-neutral-600/50 text-neutral-500 bg-neutral-800/50 uppercase tracking-wide">inativa</span>}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${CATEGORY_BADGE_STYLE[rule.clientCategory]}`}>{rule.clientCategory}</span>
                              <span className="text-[var(--text-muted)] text-[9px] font-bold">+</span>
                              {rule.services.map(svc => (
                                <span key={svc} className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${SERVICE_BADGE_STYLE[svc]}`}>{svc}</span>
                              ))}
                              <span className="text-[var(--text-muted)] text-[9px] font-bold">=</span>
                              <span className="text-xs font-bold font-mono text-emerald-400">{rule.discount}% desc</span>
                            </div>
                            {rule.observations && <p className="text-[9px] text-[var(--text-muted)] mt-1 leading-relaxed">{rule.observations}</p>}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                            <button onClick={() => openEditRuleForm(rule)} className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer" title="Editar">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => toggleRuleActive(rule.id)} className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${rule.active ? "bg-emerald-500" : "bg-neutral-700"}`} title={rule.active ? "Desativar" : "Ativar"}>
                              <div className={`bg-white w-4 h-4 rounded-full transition-transform ${rule.active ? "translate-x-4" : "translate-x-0"}`} />
                            </button>
                            <button onClick={() => deleteRule(rule.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-400 transition-all cursor-pointer" title="Excluir">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--text-muted)] text-xs border border-dashed border-[var(--border-subtle)] rounded-xl">
                    Nenhuma regra criada. Clique em "Nova Regra" para começar.
                  </div>
                )}
              </div>

              {/* Save button */}
              <div className="mt-auto pt-6 border-t border-[var(--border-subtle)] flex justify-end">
                <button
                  onClick={() => handleSave("Serviços & Combos")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] hover:from-[var(--gold-700)] hover:to-[var(--gold-500)] text-black rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-black stroke-[3]" />
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SÓCIAS */}
          {activeTab === "socias" && (
            <div className="flex flex-col gap-6 flex-1">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Sócias & Corpo Societário</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Gerenciamento de acesso e participações societárias das sócias proprietárias.</p>
              </div>

              {/* Partners Cards list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Michele Card */}
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--gold-500)] to-transparent" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Michele Dargam</h4>
                      <p className="text-[10px] text-[var(--gold-300)] uppercase font-bold tracking-wider mt-0.5">Diretora Comercial & Eventos</p>
                    </div>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[var(--bg-input)] border border-[var(--border-default)] text-[var(--text-primary)]">
                      50%
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-[var(--text-secondary)] font-mono">
                    <p className="flex items-center gap-2">
                      <span className="text-neutral-500 w-12 text-[10px] font-sans uppercase font-bold tracking-wider">E-mail:</span>
                      <span>michele@compactprime.com.br</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-neutral-500 w-12 text-[10px] font-sans uppercase font-bold tracking-wider">Telefone:</span>
                      <span>(11) 99999-1111</span>
                    </p>
                  </div>
                </div>

                {/* Fernanda Card */}
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--gold-500)] to-transparent" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Fernanda Prime</h4>
                      <p className="text-[10px] text-[var(--gold-300)] uppercase font-bold tracking-wider mt-0.5">Diretora Operacional & Gastronomia</p>
                    </div>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[var(--bg-input)] border border-[var(--border-default)] text-[var(--text-primary)]">
                      50%
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-[var(--text-secondary)] font-mono">
                    <p className="flex items-center gap-2">
                      <span className="text-neutral-500 w-12 text-[10px] font-sans uppercase font-bold tracking-wider">E-mail:</span>
                      <span>fernanda@compactprime.com.br</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-neutral-500 w-12 text-[10px] font-sans uppercase font-bold tracking-wider">Telefone:</span>
                      <span>(11) 99999-2222</span>
                    </p>
                  </div>
                </div>

              </div>

              {/* Additional security tip box */}
              <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-secondary)] flex items-start gap-2">
                <Lock className="w-4 h-4 text-[var(--gold-400)] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Acesso Administrativo Restrito</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
                    Apenas as sócias detentoras de chaves de segurança têm permissão para alterar os percentuais societários e as configurações financeiras do caixa corporativo.
                  </p>
                </div>
              </div>

              {/* Save button */}
              <div className="mt-auto pt-6 border-t border-[var(--border-subtle)] flex justify-end">
                <button 
                  onClick={() => handleSave("Sócias")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] hover:from-[var(--gold-700)] hover:to-[var(--gold-500)] text-black rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-black stroke-[3]" />
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCEIRO PADRÃO */}
          {activeTab === "financeiro" && (
            <div className="flex flex-col gap-6 flex-1">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Parâmetros Financeiros Padrão</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Configure as regras e textos inseridos automaticamente em novos orçamentos e propostas comerciais.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Validade Padrão da Proposta</label>
                  <input 
                    type="text" 
                    value={validadeProposta}
                    onChange={(e) => setValidadeProposta(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Sinal Mínimo de Entrada</label>
                  <input 
                    type="text" 
                    value={sinalMinimo}
                    onChange={(e) => setSinalMinimo(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Regra de Parcelamento Padrão</label>
                  <input 
                    type="text" 
                    value={parcelamentoPadrao}
                    onChange={(e) => setParcelamentoPadrao(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Observações / Termos Jurídicos Financeiros</label>
                  <textarea 
                    rows={3}
                    value={observacoesFinanceiras}
                    onChange={(e) => setObservacoesFinanceiras(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-400)] focus:outline-none rounded-lg p-2.5 text-xs text-[var(--text-primary)] transition-colors resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Informative alert */}
              <div className="p-4 bg-[var(--gold-500)]/5 border border-[var(--gold-500)]/15 rounded-xl text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
                <FileCheck className="w-4 h-4 text-[var(--gold-400)] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Esses dados alimentam diretamente os relatórios de simulação do **PDF Oficial** acessíveis pela listagem da página de **Propostas**.
                </p>
              </div>

              {/* Save button */}
              <div className="mt-auto pt-6 border-t border-[var(--border-subtle)] flex justify-end">
                <button 
                  onClick={() => handleSave("Financeiro Padrão")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] hover:from-[var(--gold-700)] hover:to-[var(--gold-500)] text-black rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-black stroke-[3]" />
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: INTEGRAÇÕES */}
          {activeTab === "integracoes" && (
            <div className="flex flex-col gap-6 flex-1">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Integrações de Tecnologia</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Gerenciamento de conexões externas com APIs de WhatsApp, agendas e Inteligência Artificial.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* WhatsApp */}
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between min-h-[140px] group hover:border-[var(--gold-500)]/20 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">WhatsApp Link</h4>
                        <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Disparo manual de propostas</p>
                      </div>
                    </div>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded px-2 py-0.5 uppercase font-bold font-mono">
                      Conectado
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-4 leading-relaxed">
                    Disparo de link direto para o chat do cliente via aplicativo web ou desktop.
                  </p>
                </div>

                {/* Google Agenda */}
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between min-h-[140px] group hover:border-[var(--gold-500)]/20 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Google Agenda</h4>
                        <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Sincronização bidirecional</p>
                      </div>
                    </div>
                    <span className="text-[8px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/25 rounded px-2 py-0.5 uppercase font-bold font-mono">
                      Em breve
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-4 leading-relaxed">
                    Sincronização em tempo real das visitas técnicas e casamentos no calendário.
                  </p>
                </div>

                {/* Evolution API */}
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between min-h-[140px] group hover:border-[var(--gold-500)]/20 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Evolution API</h4>
                        <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Gatilhos automáticos WhatsApp</p>
                      </div>
                    </div>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded px-2 py-0.5 uppercase font-bold font-mono">
                      Conectado
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-4 leading-relaxed">
                    API comercial ativa para recepção de webhooks de novos leads e propostas de orçamento.
                  </p>
                </div>

                {/* IA Comercial */}
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between min-h-[140px] group hover:border-[var(--gold-500)]/20 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-neutral-500/10 rounded-lg text-neutral-400">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">IA Comercial</h4>
                        <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Triagem automática de Leads</p>
                      </div>
                    </div>
                    <span className="text-[8px] bg-neutral-800 text-neutral-400 border border-neutral-700 rounded px-2 py-0.5 uppercase font-bold font-mono">
                      Planejado
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-4 leading-relaxed">
                    Qualificação inteligente com robôs de conversa para WhatsApp para captação automática.
                  </p>
                </div>

                {/* IA Operacional */}
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between min-h-[140px] md:col-span-2 group hover:border-[var(--gold-500)]/20 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-neutral-500/10 rounded-lg text-neutral-400">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">IA Operacional de Escala</h4>
                        <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Dimensionamento automático de colaboradores</p>
                      </div>
                    </div>
                    <span className="text-[8px] bg-neutral-800 text-neutral-400 border border-neutral-700 rounded px-2 py-0.5 uppercase font-bold font-mono">
                      Planejado
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-4 leading-relaxed">
                    Algoritmo inteligente para cruzamento de disponibilidade de equipes operacionais e tamanho do buffet contratado na semana.
                  </p>
                </div>

              </div>

              {/* Save button */}
              <div className="mt-auto pt-6 border-t border-[var(--border-subtle)] flex justify-end">
                <button 
                  onClick={() => handleSave("Integrações")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] hover:from-[var(--gold-700)] hover:to-[var(--gold-500)] text-black rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-black stroke-[3]" />
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: PREFERÊNCIAS VISUAIS */}
          {activeTab === "visual" && (
            <div className="flex flex-col gap-6 flex-1">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Preferências Visuais</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Controle a identidade visual premium e o comportamento gráfico do CRM.</p>
              </div>

              {/* ── Seleção de Tema ── */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[var(--gold-300)] uppercase tracking-wider">Seleção de Tema</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Card: Tema Escuro Premium */}
                  <div className="relative rounded-xl border-2 border-[var(--gold-500)]/50 bg-[var(--bg-secondary)] overflow-hidden shadow-[0_0_16px_rgba(212,169,55,0.08)]">
                    {/* Selected indicator */}
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center z-10">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>

                    {/* Preview área: mini mock escuro */}
                    <div className="h-28 flex overflow-hidden" style={{ background: "#0d0d0d" }}>
                      {/* mini sidebar */}
                      <div className="w-8 h-full flex flex-col gap-1 p-1.5" style={{ background: "#111111", borderRight: "1px solid #1e1e1e" }}>
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="w-full rounded" style={{ height: "6px", background: i === 1 ? "#c9a227" : "#1e1e1e" }} />
                        ))}
                      </div>
                      {/* mini content */}
                      <div className="flex-1 p-2 flex flex-col gap-1.5">
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex-1 rounded" style={{ height: "22px", background: "#1a1a1a", border: "1px solid #1e1e1e" }} />
                          ))}
                        </div>
                        <div className="rounded" style={{ height: "36px", background: "#1a1a1a", border: "1px solid #1e1e1e" }} />
                        <div className="flex gap-1">
                          <div className="rounded" style={{ height: "12px", width: "40%", background: "#c9a227", opacity: 0.6 }} />
                          <div className="rounded" style={{ height: "12px", flex: 1, background: "#1e1e1e" }} />
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-[var(--gold-400)]" />
                        <span className="text-sm font-bold text-[var(--text-primary)]">Tema Escuro Premium</span>
                        <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 uppercase tracking-wide">Ativo</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                        Identidade principal do CRM Compact Prime
                      </p>
                    </div>
                  </div>

                  {/* Card: Tema Claro Corporativo */}
                  <div className="relative rounded-xl border-2 border-[var(--border-default)] bg-[var(--bg-secondary)] overflow-hidden opacity-80">
                    {/* Lock indicator */}
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--bg-input)] border border-[var(--border-default)] flex items-center justify-center z-10">
                      <Lock className="w-2.5 h-2.5 text-[var(--text-muted)]" />
                    </div>

                    {/* Preview área: mini mock claro */}
                    <div className="h-28 flex overflow-hidden" style={{ background: "#f2f2f0" }}>
                      {/* mini sidebar */}
                      <div className="w-8 h-full flex flex-col gap-1 p-1.5" style={{ background: "#ffffff", borderRight: "1px solid #e8e8e8" }}>
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="w-full rounded" style={{ height: "6px", background: i === 1 ? "#c9a227" : "#e8e8e8" }} />
                        ))}
                      </div>
                      {/* mini content */}
                      <div className="flex-1 p-2 flex flex-col gap-1.5">
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex-1 rounded" style={{ height: "22px", background: "#ffffff", border: "1px solid #e5e5e5" }} />
                          ))}
                        </div>
                        <div className="rounded" style={{ height: "36px", background: "#ffffff", border: "1px solid #e5e5e5" }} />
                        <div className="flex gap-1">
                          <div className="rounded" style={{ height: "12px", width: "40%", background: "#c9a227", opacity: 0.5 }} />
                          <div className="rounded" style={{ height: "12px", flex: 1, background: "#e8e8e8" }} />
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-bold text-[var(--text-primary)]">Tema Claro Corporativo</span>
                        <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 uppercase tracking-wide">Em breve</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                        Versão clara para ambientes iluminados e uso prolongado
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* ── Aparência ── */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[var(--gold-300)] uppercase tracking-wider">Aparência do CRM</h4>

                <div className="space-y-3.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 rounded-xl">
                  
                  {/* Tema Escuro Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">Tema Escuro Ativo</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Paleta focada em tons pretos e cinza grafite para redução de fadiga visual.</p>
                    </div>
                    <button 
                      onClick={() => setTemaEscuro(!temaEscuro)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${temaEscuro ? 'bg-emerald-500' : 'bg-neutral-700'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full transition-transform ${temaEscuro ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Identidade Dourada Toggle */}
                  <div className="flex items-center justify-between border-t border-[var(--border-subtle)]/40 pt-3.5">
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">Identidade Dourada Ativa</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Destaques e links marcados em ouro premium da marca Compact Prime.</p>
                    </div>
                    <button 
                      onClick={() => setIdentidadeDourada(!identidadeDourada)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${identidadeDourada ? 'bg-emerald-500' : 'bg-neutral-700'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full transition-transform ${identidadeDourada ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Layout Premium Toggle */}
                  <div className="flex items-center justify-between border-t border-[var(--border-subtle)]/40 pt-3.5">
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">Layout Premium Habilitado</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Sombras aveludadas, gradientes lineares suaves e micro-animações ativas.</p>
                    </div>
                    <button 
                      onClick={() => setLayoutPremium(!layoutPremium)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${layoutPremium ? 'bg-emerald-500' : 'bg-neutral-700'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full transition-transform ${layoutPremium ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                </div>
              </div>

              {/* Informative tips */}
              <div className="p-4 bg-[var(--gold-500)]/5 border border-[var(--gold-500)]/15 rounded-xl text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-[var(--gold-400)] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  As configurações visuais do CRM são aplicadas globalmente para todos os usuários com papel societário administrativo e de suporte comercial.
                </p>
              </div>

              {/* Save button */}
              <div className="mt-auto pt-6 border-t border-[var(--border-subtle)] flex justify-end">
                <button 
                  onClick={() => handleSave("Visual & Temas")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] hover:from-[var(--gold-700)] hover:to-[var(--gold-500)] text-black rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-black stroke-[3]" />
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: CLIENTES & CATEGORIAS */}
          {activeTab === "clientes" && (
            <div className="flex flex-col gap-6 flex-1">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Categorias de Clientes</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Configure os critérios, benefícios e prioridades de cada perfil de cliente no CRM.</p>
              </div>

              {/* Future integration banner */}
              <div className="p-3.5 rounded-xl flex items-start gap-3 border border-dashed border-[var(--gold-500)]/25 bg-[var(--gold-500)]/5">
                <Sparkles className="w-4 h-4 text-[var(--gold-400)] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[var(--gold-300)]">Preparado para integração futura</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                    Essas categorias serão aplicadas automaticamente em: <span className="text-[var(--text-secondary)] font-semibold">Clientes</span>, <span className="text-[var(--text-secondary)] font-semibold">Painel de Clientes</span>, <span className="text-[var(--text-secondary)] font-semibold">Propostas</span> e <span className="text-[var(--text-secondary)] font-semibold">IA Comercial</span>.
                  </p>
                </div>
                <span className="shrink-0 text-[8px] font-bold px-2 py-0.5 rounded-full border border-[var(--gold-500)]/30 text-[var(--gold-300)] bg-[var(--gold-500)]/10 uppercase tracking-wide font-mono whitespace-nowrap">
                  Mock Visual
                </span>
              </div>

              {/* Category Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* ── Cliente Novo ── */}
                <div className="flex flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
                  {/* Card header strip */}
                  <div className="h-1 w-full bg-gradient-to-r from-neutral-500/60 to-transparent" />
                  <div className="p-4 flex flex-col gap-4 flex-1">
                    {/* Badge preview */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-neutral-800/60 border border-neutral-700/40">
                          <Star className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">Cliente Novo</p>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border text-neutral-400 border-neutral-600/50 bg-neutral-800/50">
                            <Star className="w-2.5 h-2.5" />
                            NOVO
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-neutral-500 font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-neutral-500" />
                        Cinza
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Critério de Classificação</label>
                        <textarea
                          rows={2}
                          value={criterioNovo}
                          onChange={(e) => setCriterioNovo(e.target.value)}
                          className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-neutral-500 focus:outline-none rounded-lg p-2 text-[10px] text-[var(--text-primary)] transition-colors resize-none leading-relaxed"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Prioridade Comercial</label>
                        <div className="flex gap-1">
                          {(["Normal", "Alta", "Máxima"] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() => setPrioridadeNovo(p)}
                              className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer border ${
                                prioridadeNovo === p
                                  ? "bg-neutral-700 text-neutral-200 border-neutral-500"
                                  : "bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border-default)] hover:border-neutral-600"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Cliente Prime ── */}
                <div className="flex flex-col rounded-xl border border-blue-500/20 bg-[var(--bg-secondary)] overflow-hidden shadow-[0_0_12px_rgba(59,130,246,0.04)]">
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500/60 to-transparent" />
                  <div className="p-4 flex flex-col gap-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <Gem className="w-4 h-4 text-blue-300" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">Cliente Prime</p>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border text-blue-300 border-blue-500/40 bg-blue-500/10">
                            <Gem className="w-2.5 h-2.5" />
                            PRIME
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-blue-400 font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Azul
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Critério de Classificação</label>
                        <textarea
                          rows={2}
                          value={criterioPrime}
                          onChange={(e) => setCriterioPrime(e.target.value)}
                          className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-blue-500/50 focus:outline-none rounded-lg p-2 text-[10px] text-[var(--text-primary)] transition-colors resize-none leading-relaxed"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Prioridade Comercial</label>
                        <div className="flex gap-1">
                          {(["Normal", "Alta", "Máxima"] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() => setPrioridadePrime(p)}
                              className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer border ${
                                prioridadePrime === p
                                  ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                  : "bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border-default)] hover:border-blue-500/30"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Cliente VIP ── */}
                <div className="flex flex-col rounded-xl border border-[var(--gold-500)]/30 bg-[var(--bg-secondary)] overflow-hidden shadow-[0_0_16px_rgba(212,169,55,0.06)]">
                  <div className="h-1 w-full bg-gradient-to-r from-[var(--gold-500)]/80 to-transparent" />
                  <div className="p-4 flex flex-col gap-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[var(--gold-500)]/10 border border-[var(--gold-500)]/25">
                          <Crown className="w-4 h-4 text-[var(--gold-300)]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">Cliente VIP</p>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border text-[var(--gold-300)] border-[var(--gold-500)]/40 bg-[var(--gold-500)]/10">
                            <Crown className="w-2.5 h-2.5" />
                            VIP
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-[var(--gold-400)] font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-[var(--gold-400)]" />
                        Dourado
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Critério de Classificação</label>
                        <textarea
                          rows={2}
                          value={criterioVip}
                          onChange={(e) => setCriterioVip(e.target.value)}
                          className="bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--gold-500)]/40 focus:outline-none rounded-lg p-2 text-[10px] text-[var(--text-primary)] transition-colors resize-none leading-relaxed"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Prioridade Comercial</label>
                        <div className="flex gap-1">
                          {(["Normal", "Alta", "Máxima"] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() => setPrioridadeVip(p)}
                              className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer border ${
                                prioridadeVip === p
                                  ? "bg-[var(--gold-500)]/15 text-[var(--gold-300)] border-[var(--gold-500)]/35"
                                  : "bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border-default)] hover:border-[var(--gold-500)]/20"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Promoções Aplicadas por Categoria */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-[var(--gold-300)] uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" />
                    Promoções Ativas por Categoria
                  </h4>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Reflexo das regras ativas configuradas em <span className="text-[var(--text-secondary)] font-semibold">Serviços & Combo</span>.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(["Cliente Novo", "Cliente Prime", "Cliente VIP"] as ClientCategoryOption[]).map(cat => {
                    const activeRules = getActiveRulesForCategory(cat);
                    const headerColors: Record<ClientCategoryOption, string> = {
                      "Cliente Novo": "from-neutral-500/40",
                      "Cliente Prime": "from-blue-500/40",
                      "Cliente VIP": "from-[var(--gold-500)]/60",
                    };
                    return (
                      <div key={cat} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
                        <div className={`h-0.5 w-full bg-gradient-to-r ${headerColors[cat]} to-transparent`} />
                        <div className="p-3">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border mb-2 ${CATEGORY_BADGE_STYLE[cat]}`}>{cat}</span>
                          {activeRules.length === 0 ? (
                            <p className="text-[9px] text-[var(--text-muted)] italic">Nenhuma promoção ativa.</p>
                          ) : (
                            <ul className="space-y-1">
                              {activeRules.map(r => (
                                <li key={r.id} className="flex items-center gap-1.5 text-[9px]">
                                  <span className="text-emerald-400 font-bold font-mono shrink-0">{r.discount}%</span>
                                  <span className="text-[var(--text-secondary)]">{r.services.join(" + ")}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Integration roadmap note */}
              <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl flex items-start gap-2.5">
                <ArrowUpRight className="w-4 h-4 text-[var(--gold-400)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Evolução futura das categorias</p>
                  <ul className="mt-1.5 space-y-1 text-[10px] text-[var(--text-muted)] leading-relaxed">
                    <li><span className="text-neutral-400 font-semibold">Cliente Novo →</span> classificado automaticamente ao cadastrar um cliente pela primeira vez.</li>
                    <li><span className="text-blue-400 font-semibold">Cliente Prime →</span> promovido automaticamente após a 2ª contratação confirmada.</li>
                    <li><span className="text-[var(--gold-400)] font-semibold">Cliente VIP →</span> definido manualmente ou por IA com base em ticket, frequência e indicações.</li>
                  </ul>
                </div>
              </div>

              {/* Save button */}
              <div className="mt-auto pt-6 border-t border-[var(--border-subtle)] flex justify-end">
                <button
                  onClick={() => handleSave("Clientes & Categorias")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] hover:from-[var(--gold-700)] hover:to-[var(--gold-500)] text-black rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-black stroke-[3]" />
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

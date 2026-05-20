"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { ServiceBadge } from "@/app/components/ServiceBadge";

type TabId = "empresa" | "servicos" | "socias" | "financeiro" | "integracoes" | "visual";

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

export default function ConfiguacoesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("empresa");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Mock Form States
  const [nomeFantasia, setNomeFantasia] = useState("Compact Prime Buffet & Eventos Premium");
  const [slogan, setSlogan] = useState("Gastronomia refinada e cenografia exclusiva para casamentos e eventos de alto padrão.");
  const [telefone, setTelefone] = useState("(11) 98765-4321");
  const [email, setEmail] = useState("diretoria@compactprime.com.br");
  const [endereco, setEndereco] = useState("Av. Europa, 1500 - Jardins, São Paulo - SP");

  // Service Actives States (Toggles)
  const [buffetAtivo, setBuffetAtivo] = useState(true);
  const [decoracaoAtiva, setDecoracaoAtiva] = useState(true);
  const [fotografiaAtiva, setFotografiaAtiva] = useState(true);

  // Financial Standard States
  const [validadeProposta, setValidadeProposta] = useState("15 dias");
  const [parcelamentoPadrao, setParcelamentoPadrao] = useState("Sinal + Parcelas iguais mensais até 10 dias antes do evento");
  const [sinalMinimo, setSinalMinimo] = useState("30% de sinal para reserva");
  const [observacoesFinanceiras, setObservacoesFinanceiras] = useState("Valores sujeitos a alteração em caso de aumento expressivo de insumos.");

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
  ];

  const handleSave = (sectionName: string) => {
    setToastMessage(`Configurações de ${sectionName} salvas com sucesso!`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

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

              {/* Logo Mock */}
              <div className="flex items-center gap-5 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--gold-300)] to-[var(--gold-600)] shadow-md border border-[var(--gold-500)]/30">
                  <span className="text-black font-extrabold text-lg">CP</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Logomarca Oficial</h4>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">Formato ideal: PNG transparente, 512x512px.</p>
                  <button className="mt-2 text-[10px] font-bold text-[var(--gold-300)] hover:underline cursor-pointer">Alterar Logomarca</button>
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
              </div>

              {/* Save button */}
              <div className="mt-auto pt-6 border-t border-[var(--border-subtle)] flex justify-end">
                <button 
                  onClick={() => handleSave("Empresa")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] hover:from-[var(--gold-700)] hover:to-[var(--gold-500)] text-black rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-black stroke-[3]" />
                  Salvar Configurações
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

              {/* Combo Rules Section */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[var(--gold-400)]" />
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Regras de Combo Multi-Serviços</h4>
                  </div>
                  <span className="text-[10px] bg-[var(--gold-500)]/15 text-[var(--gold-300)] border border-[var(--gold-500)]/30 rounded-full px-3 py-1 uppercase font-bold tracking-wider font-sans">
                    Combo Ativado
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">2 Serviços Selecionados</span>
                    <span className="text-xs font-bold font-mono text-emerald-400">5% Desconto</span>
                  </div>

                  <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">3 Serviços Selecionados</span>
                    <span className="text-xs font-bold font-mono text-emerald-400">10% Desconto</span>
                  </div>
                </div>

                {/* Pacote Premium Visual Preview Box */}
                <div className="p-4 bg-[var(--gold-500)]/5 border border-dashed border-[var(--gold-500)]/20 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div>
                    <h5 className="font-bold text-[var(--gold-300)] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Visualização do Pacote Premium (Combo)
                    </h5>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1 max-w-md">
                      Quando o lead contrata Buffet + Decoração + Fotografia simultaneamente, o CRM calcula e expõe visualmente a economia total no resumo orçamentário.
                    </p>
                  </div>
                  <span className="text-[9px] font-bold px-3 py-1.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 font-mono">
                    Valor Final: -10% automático
                  </span>
                </div>
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

        </div>
      </div>
    </div>
  );
}

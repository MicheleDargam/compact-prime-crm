"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push("/");
      } else {
        setError(data.error ?? "Erro ao autenticar.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--bg-primary)] overflow-hidden">

      {/* Lado Esquerdo: Branding / Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden border-r border-[var(--border-subtle)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0e] via-[#111117] to-[#0a0a0e] z-0" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--gold-500)]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--gold-400)]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />

        <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto animate-fade-in-up">
          <div className="mb-6 relative group">
            <div className="absolute inset-0 bg-[var(--gold-500)]/10 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <img
              src="/logo-compact.png"
              alt="Compact Prime Logo"
              className="w-64 md:w-72 h-auto object-contain drop-shadow-[0_0_15px_rgba(212,169,55,0.3)] relative z-10"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                e.currentTarget.parentElement!.innerHTML = '<div class="text-[var(--gold-300)] font-bold text-3xl tracking-widest uppercase relative z-10">CP</div>';
              }}
            />
          </div>

          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
            Compact Prime <span className="text-[var(--gold-300)]">CRM</span>
          </h1>

          <p className="text-xl font-light text-[var(--text-secondary)] italic mb-6">
            &quot;Qualidade que encanta, sabor que marca&quot;
          </p>

          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[var(--gold-400)] to-transparent mx-auto mb-6 opacity-50" />

          <p className="text-[var(--text-muted)] text-lg">
            Gestão inteligente para eventos memoráveis.
          </p>
        </div>
      </div>

      {/* Lado Direito: Formulário */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 z-10 bg-[var(--bg-primary)] lg:bg-transparent">

        {/* Mobile Logo */}
        <div className="lg:hidden flex flex-col items-center mb-8 animate-fade-in-up">
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--gold-500)]/10 blur-xl rounded-full opacity-50 pointer-events-none" />
            <img
              src="/logo-compact.png"
              alt="Compact Prime Logo"
              className="w-48 sm:w-56 h-auto object-contain mb-4 drop-shadow-[0_0_15px_rgba(212,169,55,0.3)] relative z-10"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                e.currentTarget.parentElement!.innerHTML = '<div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--gold-300)] to-[var(--gold-600)] flex items-center justify-center text-black font-bold text-xl mb-4 relative z-10">CP</div>';
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Compact Prime <span className="text-[var(--gold-300)]">CRM</span>
          </h1>
        </div>

        {/* Card de Login */}
        <div className="w-full max-w-md bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] shadow-card-hover p-8 animate-fade-in-up stagger-1">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Acesse sua conta</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Insira suas credenciais para gerenciar a operação.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Input Email (visual) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="email">
                E-mail Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[var(--text-muted)]" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@compactprime.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--gold-400)] focus:border-[var(--gold-400)] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[var(--text-muted)]" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--gold-400)] focus:border-[var(--gold-400)] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Erro */}
            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer sr-only" defaultChecked />
                  <div className="w-5 h-5 rounded border border-[var(--border-default)] bg-[var(--bg-input)] peer-checked:bg-[var(--gold-500)] peer-checked:border-[var(--gold-500)] transition-colors flex items-center justify-center">
                    <svg className="w-3 h-3 text-[var(--bg-primary)] opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  Lembrar acesso
                </span>
              </label>

              <a href="#" className="text-sm font-medium text-[var(--gold-400)] hover:text-[var(--gold-300)] transition-colors">
                Esqueci minha senha
              </a>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] text-[var(--bg-primary)] font-bold rounded-xl shadow-[var(--shadow-gold-glow)] hover:scale-[1.02] hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--gold-300)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? "Verificando..." : "Entrar"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>

          </form>

          {/* Footer Card */}
          <div className="mt-8 text-center border-t border-[var(--border-subtle)] pt-6">
            <p className="text-xs text-[var(--text-muted)]">
              &copy; {new Date().getFullYear()} Compact Prime CRM.<br className="sm:hidden"/> Todos os direitos reservados.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

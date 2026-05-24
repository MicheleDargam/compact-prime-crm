"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type NavItem = { label: string; icon: string; href: string };

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/" },
  { label: "Clientes", icon: "leads", href: "/leads" },
  { label: "Painel de Clientes", icon: "kanban", href: "/kanban" },
  { label: "Agenda", icon: "agenda", href: "/agenda" },
  { label: "Propostas", icon: "propostas", href: "/propostas" },
  { label: "Financeiro", icon: "financeiro", href: "/financeiro" },
  { label: "Distribuição Buffet", icon: "socias", href: "/socias-caixa" },
  { label: "Funcionários", icon: "funcionarios", href: "/funcionarios" },
  { label: "Configurações", icon: "config", href: "/configuracoes" },
];

/* Minimal SVG icon set */
function Icon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  const paths: Record<string, string> = {
    dashboard:
      "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
    leads:
      "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    kanban:
      "M9 4.5v15m6-15v15m-10.5 0h15A2.25 2.25 0 0021 17.25v-10.5A2.25 2.25 0 0018.75 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 003.75 19.5z",
    agenda:
      "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
    propostas:
      "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    financeiro:
      "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    socias:
      "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
    funcionarios:
      "M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm-3.75 5.625c0-1.036.84-1.875 1.875-1.875h0c1.036 0 1.875.839 1.875 1.875v.375H7.5v-.375z",
    config:
      "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z",
    menu: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
    close: "M6 18L18 6M6 6l12 12",
    logout: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75",
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name] ?? ""} />
    </svg>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  if (pathname === "/login") return null;

  return (
    <>
      {/* Mobile toggle */}
      <button
        id="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg cursor-pointer"
        style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
        aria-label="Toggle menu"
      >
        <Icon name={mobileOpen ? "close" : "menu"} className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 flex-shrink-0 border-r transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ background: "var(--bg-sidebar)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 pt-8 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-[var(--gold-300)] to-[var(--gold-600)] shadow-lg">
                <span className="text-black font-bold text-sm">CP</span>
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-wide" style={{ color: "var(--gold-300)" }}>Compact Prime</h1>
                <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>CRM</p>
              </div>
            </div>
          </div>

          <div className="mx-5 h-px" style={{ background: "var(--border-subtle)" }} />

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  onClick={() => setMobileOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group ${
                    isActive ? "text-[var(--gold-300)] bg-[var(--gold-500)]/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.03]"
                  }`}
                >
                  <span className={`transition-colors duration-200 ${isActive ? "text-[var(--gold-400)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"}`}>
                    <Icon name={item.icon} />
                  </span>
                  {item.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold-400)" }} />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom user */}
          <div className="px-5 pb-6">
            <div className="h-px mb-4" style={{ background: "var(--border-subtle)" }} />
            <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ background: "var(--gold-500)", color: "#000" }}>CP</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>Admin</p>
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>admin@compactprime.com</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sair"
                className="flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/[0.06] cursor-pointer"
                style={{ color: "var(--text-muted)" }}
              >
                <Icon name="logout" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

interface KpiItem {
  total: number;
  esteMes: number;
}

interface Kpis {
  novosClientes: KpiItem;
  eventosAgendados: KpiItem;
  propostasEnviadas: KpiItem;
  followupsPendentes: KpiItem;
}

const CARD_DEFS = [
  {
    key: "novosClientes" as keyof Kpis,
    title: "Novos Clientes",
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    accent: "var(--gold-400)",
  },
  {
    key: "eventosAgendados" as keyof Kpis,
    title: "Eventos Agendados",
    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
    accent: "var(--info)",
  },
  {
    key: "propostasEnviadas" as keyof Kpis,
    title: "Propostas Enviadas",
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    accent: "var(--success)",
  },
  {
    key: "followupsPendentes" as keyof Kpis,
    title: "Follow-ups Pendentes",
    icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    accent: "var(--warning)",
  },
];

export default function DashboardCards() {
  const [kpis, setKpis] = useState<Kpis | null>(null);

  useEffect(() => {
    fetch("/api/painel-clientes/kpis")
      .then((r) => r.json())
      .then((json) => { if (json.ok) setKpis(json.data); })
      .catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {CARD_DEFS.map((card, i) => {
        const data = kpis?.[card.key];
        const total = data?.total ?? 0;
        const esteMes = data?.esteMes ?? 0;

        return (
          <div
            key={card.title}
            className={`animate-fade-in-up stagger-${i + 1} group relative rounded-xl p-5 border transition-all duration-300 hover:scale-[1.02] cursor-default overflow-hidden`}
            style={{
              opacity: 0,
              background: "var(--bg-card)",
              borderColor: "var(--border-subtle)",
              boxShadow: "var(--shadow-card)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
              e.currentTarget.style.borderColor = "var(--border-default)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-card)";
              e.currentTarget.style.borderColor = "var(--border-subtle)";
            }}
          >
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.07] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.12]"
              style={{ background: card.accent }}
            />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                  {card.title}
                </p>
                <p className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {kpis ? total : "—"}
                </p>
                <p className="text-xs font-medium mt-1.5 text-[var(--text-muted)]">
                  {kpis ? `+${esteMes} este mês` : "carregando..."}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `color-mix(in srgb, ${card.accent} 12%, transparent)` }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={card.accent} strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

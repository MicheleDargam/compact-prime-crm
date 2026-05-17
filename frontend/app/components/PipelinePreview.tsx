"use client";

type PipelineLead = {
  name: string;
  event: string;
  value: string;
};

type PipelineColumn = {
  title: string;
  color: string;
  leads: PipelineLead[];
};

const columns: PipelineColumn[] = [
  {
    title: "Novo Lead",
    color: "var(--gold-400)",
    leads: [
      { name: "Maria Silva", event: "Casamento - 150 pax", value: "R$ 22.500" },
      { name: "João Souza", event: "Corporativo - 80 pax", value: "R$ 12.000" },
      { name: "Ana Lima", event: "Aniversário - 60 pax", value: "R$ 8.500" },
      { name: "Carlos Mendes", event: "Casamento - 200 pax", value: "R$ 35.000" },
      { name: "Fernanda Costa", event: "Debutante - 120 pax", value: "R$ 18.000" },
    ],
  },
  {
    title: "Proposta Enviada",
    color: "var(--warning)",
    leads: [
      { name: "Ricardo Alves", event: "Corporativo - 300 pax", value: "R$ 45.000" },
      { name: "Beatriz Ramos", event: "Casamento - 180 pax", value: "R$ 28.000" },
    ],
  },
  {
    title: "Negociação",
    color: "#a78bfa",
    leads: [
      { name: "Lucas Ferreira", event: "Formatura - 250 pax", value: "R$ 38.000" },
    ],
  },
  {
    title: "Fechado",
    color: "var(--success)",
    leads: [
      { name: "Patrícia Nunes", event: "Casamento - 170 pax", value: "R$ 26.500" },
      { name: "Diego Rocha", event: "Corporativo - 100 pax", value: "R$ 15.000" },
    ],
  },
];

export default function PipelinePreview() {
  return (
    <div className="animate-fade-in-up stagger-5" style={{ opacity: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Pipeline Comercial
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Visão geral dos leads por etapa
          </p>
        </div>
        <span className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
          {columns.reduce((sum, col) => sum + col.leads.length, 0)} leads ativos
        </span>
      </div>

      {/* Pipeline columns (horizontal scroll on mobile) */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "thin" }}>
        {columns.map((col) => (
          <div
            key={col.title}
            className="min-w-[240px] flex-1 rounded-xl border p-3"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                {col.title}
              </span>
              <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: "var(--bg-input)", color: "var(--text-muted)" }}>
                {col.leads.length}
              </span>
            </div>

            {/* Lead cards */}
            <div className="space-y-2">
              {col.leads.map((lead) => (
                <div
                  key={lead.name}
                  className="rounded-lg p-3 border transition-all duration-200 cursor-pointer hover:scale-[1.01]"
                  style={{ background: "var(--bg-secondary)", borderColor: "var(--border-subtle)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = col.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
                >
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{lead.name}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{lead.event}</p>
                  <p className="text-xs font-semibold mt-1.5" style={{ color: col.color }}>{lead.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

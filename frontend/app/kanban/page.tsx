import DashboardCards from "../components/DashboardCards";
import PipelineKanban from "../components/pipeline/PipelineKanban";

export default function KanbanPage() {
  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <header className="pt-2 lg:pt-0">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Kanban
            </h1>
            <p className="text-sm mt-1 italic" style={{ color: "var(--gold-300)" }}>
              Operação Comercial
            </p>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Subtle gold line */}
        <div
          className="mt-4 h-px w-full"
          style={{
            background:
              "linear-gradient(to right, var(--gold-500), var(--gold-500)/20, transparent)",
          }}
        />
      </header>

      {/* Summary cards */}
      <section id="dashboard-cards" aria-label="Resumo">
        <DashboardCards />
      </section>

      {/* Pipeline preview */}
      <section id="pipeline-preview" aria-label="Pipeline comercial">
        <PipelineKanban />
      </section>
    </div>
  );
}

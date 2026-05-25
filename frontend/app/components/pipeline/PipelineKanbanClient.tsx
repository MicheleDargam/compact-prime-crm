"use client";

import dynamic from "next/dynamic";

interface PipelineKanbanClientProps {
  searchTerm?: string;
  refreshTrigger?: number;
}

const PipelineKanban = dynamic<PipelineKanbanClientProps>(
  () => import("./PipelineKanban"),
  { ssr: false }
);

export default function PipelineKanbanClient({ searchTerm = "", refreshTrigger = 0 }: PipelineKanbanClientProps) {
  return <PipelineKanban searchTerm={searchTerm} refreshTrigger={refreshTrigger} />;
}

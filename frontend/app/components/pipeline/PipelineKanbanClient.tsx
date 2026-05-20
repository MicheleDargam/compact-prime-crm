"use client";

import dynamic from "next/dynamic";

const PipelineKanban = dynamic(() => import("./PipelineKanban"), { ssr: false });

export default function PipelineKanbanClient() {
  return <PipelineKanban />;
}

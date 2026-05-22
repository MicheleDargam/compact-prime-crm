"use client";

import { CrmDataProvider } from "../context/CrmDataContext";
import { ReactNode } from "react";

export default function CrmProvider({ children }: { children: ReactNode }) {
  return <CrmDataProvider>{children}</CrmDataProvider>;
}

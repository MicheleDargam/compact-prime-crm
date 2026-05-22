"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ExpenseCategory = "Fornecedores" | "Funcionários" | "Insumos" | "Operacional" | "Equipamentos";
export type ExpenseService = "buffet" | "decoracao" | "fotografia" | "geral";

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  supplier: string;
  service: ExpenseService;
  value: number;
  date: string;       // "DD/MM/YYYY"
  month: string;      // "Maio 2026"
  paymentMethod: string;
  observations: string;
  hasReceipt: boolean;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Fornecedores", "Funcionários", "Insumos", "Operacional", "Equipamentos",
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Fornecedores: "#f59e0b",
  Funcionários: "#3b82f6",
  Insumos: "#10b981",
  Operacional: "#8b5cf6",
  Equipamentos: "#f97316",
};

// Revenue per month for Buffet (mock)
const MONTHLY_REVENUES: Record<string, number> = {
  "Maio 2026": 85000,
  "Abril 2026": 102000,
  "Março 2026": 78000,
};

export function getBuffetRevenue(month: string): number {
  return MONTHLY_REVENUES[month] ?? 0;
}

export function isoToDisplayDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function dateToMonth(dateStr: string): string {
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  // "DD/MM/YYYY"
  const parts = dateStr.includes("/") ? dateStr.split("/") : dateStr.split("-");
  if (parts.length < 3) return "";
  const monthIndex = dateStr.includes("/")
    ? parseInt(parts[1], 10) - 1
    : parseInt(parts[1], 10) - 1;
  const year = dateStr.includes("/") ? parts[2] : parts[0];
  return `${monthNames[monthIndex]} ${year}`;
}

// Seed expenses matching the static values in socias-caixa page
const SEED_EXPENSES: Expense[] = [
  // Maio 2026 — Buffet: Fornecedores 15k, Funcionários 12k, Insumos 7k, Operacional 5k, Equipamentos 3k
  { id: "e001", description: "Fornecedores de alimentos", category: "Fornecedores", supplier: "FornecedoresAlim Ltda", service: "buffet", value: 15000, date: "05/05/2026", month: "Maio 2026", paymentMethod: "Transferência", observations: "", hasReceipt: true },
  { id: "e002", description: "Pagamento de equipe", category: "Funcionários", supplier: "Folha Interna", service: "buffet", value: 12000, date: "10/05/2026", month: "Maio 2026", paymentMethod: "Transferência", observations: "", hasReceipt: true },
  { id: "e003", description: "Insumos e descartáveis", category: "Insumos", supplier: "Distribuidora ABC", service: "buffet", value: 7000, date: "12/05/2026", month: "Maio 2026", paymentMethod: "Boleto", observations: "", hasReceipt: false },
  { id: "e004", description: "Energia e água", category: "Operacional", supplier: "Concessionárias", service: "buffet", value: 5000, date: "15/05/2026", month: "Maio 2026", paymentMethod: "Débito automático", observations: "", hasReceipt: true },
  { id: "e005", description: "Manutenção de equipamentos", category: "Equipamentos", supplier: "TechFix ME", service: "buffet", value: 3000, date: "20/05/2026", month: "Maio 2026", paymentMethod: "Pix", observations: "", hasReceipt: false },
  // Abril 2026 — Buffet: Fornecedores 18k, Funcionários 13.5k, Insumos 8k, Operacional 5k, Equipamentos 3.5k
  { id: "e006", description: "Fornecedores de alimentos", category: "Fornecedores", supplier: "FornecedoresAlim Ltda", service: "buffet", value: 18000, date: "04/04/2026", month: "Abril 2026", paymentMethod: "Transferência", observations: "", hasReceipt: true },
  { id: "e007", description: "Pagamento de equipe", category: "Funcionários", supplier: "Folha Interna", service: "buffet", value: 13500, date: "10/04/2026", month: "Abril 2026", paymentMethod: "Transferência", observations: "", hasReceipt: true },
  { id: "e008", description: "Insumos e descartáveis", category: "Insumos", supplier: "Distribuidora ABC", service: "buffet", value: 8000, date: "12/04/2026", month: "Abril 2026", paymentMethod: "Boleto", observations: "", hasReceipt: false },
  { id: "e009", description: "Energia e água", category: "Operacional", supplier: "Concessionárias", service: "buffet", value: 5000, date: "15/04/2026", month: "Abril 2026", paymentMethod: "Débito automático", observations: "", hasReceipt: true },
  { id: "e010", description: "Locação e manutenção de equipamentos", category: "Equipamentos", supplier: "TechFix ME", service: "buffet", value: 3500, date: "20/04/2026", month: "Abril 2026", paymentMethod: "Pix", observations: "", hasReceipt: false },
  // Março 2026 — Buffet: Fornecedores 14k, Funcionários 12k, Insumos 7k, Operacional 4k, Equipamentos 2k
  { id: "e011", description: "Fornecedores de alimentos", category: "Fornecedores", supplier: "FornecedoresAlim Ltda", service: "buffet", value: 14000, date: "05/03/2026", month: "Março 2026", paymentMethod: "Transferência", observations: "", hasReceipt: true },
  { id: "e012", description: "Pagamento de equipe", category: "Funcionários", supplier: "Folha Interna", service: "buffet", value: 12000, date: "10/03/2026", month: "Março 2026", paymentMethod: "Transferência", observations: "", hasReceipt: true },
  { id: "e013", description: "Insumos e descartáveis", category: "Insumos", supplier: "Distribuidora ABC", service: "buffet", value: 7000, date: "12/03/2026", month: "Março 2026", paymentMethod: "Boleto", observations: "", hasReceipt: false },
  { id: "e014", description: "Energia e água", category: "Operacional", supplier: "Concessionárias", service: "buffet", value: 4000, date: "15/03/2026", month: "Março 2026", paymentMethod: "Débito automático", observations: "", hasReceipt: true },
  { id: "e015", description: "Equipamentos novos", category: "Equipamentos", supplier: "TechFix ME", service: "buffet", value: 2000, date: "20/03/2026", month: "Março 2026", paymentMethod: "Pix", observations: "", hasReceipt: false },
];

export interface MovementLog {
  id: string;
  text: string;
  timestamp: string;
}

const SEED_LOGS: MovementLog[] = [
  { id: "l001", text: "[RET] Retirada registrada — Ana Paula: R$ 3.200,00 — Maio 2026", timestamp: "22/05/2026 09:14" },
  { id: "l002", text: "[DOC] Contrato #CP-2026-047 vinculado ao mês de Maio 2026", timestamp: "20/05/2026 15:32" },
  { id: "l003", text: "[CAI] Despesa registrada: Insumos e descartáveis — R$ 7.000,00", timestamp: "12/05/2026 11:08" },
  { id: "l004", text: "[REL] Relatório mensal de Abril 2026 exportado em PDF", timestamp: "05/05/2026 08:47" },
  { id: "l005", text: "[SIS] Mês de Abril 2026 encerrado. Lucro líquido: R$ 54.000,00", timestamp: "01/05/2026 00:00" },
];

interface CrmDataContextValue {
  expenses: Expense[];
  addExpense: (exp: Omit<Expense, "id">) => void;
  getBuffetExpensesByMonth: (month: string) => Expense[];
  getBuffetCategoriesForMonth: (month: string) => Record<ExpenseCategory, number>;
  buffetMovementLog: MovementLog[];
  addBuffetLog: (text: string) => void;
}

const CrmDataContext = createContext<CrmDataContextValue | null>(null);

export function CrmDataProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(SEED_EXPENSES);
  const [buffetMovementLog, setBuffetMovementLog] = useState<MovementLog[]>(SEED_LOGS);

  const addExpense = useCallback((exp: Omit<Expense, "id">) => {
    const newExp: Expense = { ...exp, id: `e${Date.now()}` };
    setExpenses((prev) => [newExp, ...prev]);
  }, []);

  const getBuffetExpensesByMonth = useCallback(
    (month: string) => expenses.filter((e) => e.service === "buffet" && e.month === month),
    [expenses]
  );

  const getBuffetCategoriesForMonth = useCallback(
    (month: string): Record<ExpenseCategory, number> => {
      const result: Record<ExpenseCategory, number> = {
        Fornecedores: 0, Funcionários: 0, Insumos: 0, Operacional: 0, Equipamentos: 0,
      };
      expenses
        .filter((e) => e.service === "buffet" && e.month === month)
        .forEach((e) => { result[e.category] += e.value; });
      return result;
    },
    [expenses]
  );

  const addBuffetLog = useCallback((text: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setBuffetMovementLog((prev) => [{ id: `l${Date.now()}`, text, timestamp }, ...prev]);
  }, []);

  return (
    <CrmDataContext.Provider value={{ expenses, addExpense, getBuffetExpensesByMonth, getBuffetCategoriesForMonth, buffetMovementLog, addBuffetLog }}>
      {children}
    </CrmDataContext.Provider>
  );
}

export function useCrmData(): CrmDataContextValue {
  const ctx = useContext(CrmDataContext);
  if (!ctx) throw new Error("useCrmData must be used inside CrmDataProvider");
  return ctx;
}

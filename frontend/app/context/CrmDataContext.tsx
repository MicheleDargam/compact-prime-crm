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

const SEED_EXPENSES: Expense[] = [];

export interface MovementLog {
  id: string;
  text: string;
  timestamp: string;
}

const SEED_LOGS: MovementLog[] = [];

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

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import CrmProvider from "./components/CrmProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Compact Prime CRM — Gestão Premium de Eventos",
  description:
    "CRM do buffet Compact Prime. Gerencie leads, propostas, agenda e financeiro em um só lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
        <CrmProvider>
          <Sidebar />
          <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
        </CrmProvider>
      </body>
    </html>
  );
}

# Arquitetura do CRM Compact Prime

## Objetivo
Criar um CRM inteligente para gestão de buffet com:
- Kanban de leads
- automações
- IA integrada
- agenda
- gestão de eventos
- follow-up automático

---

# Fluxo Principal

Instagram / WhatsApp
↓
n8n
↓
Gemini AI
↓
CRM Compact Prime
↓
Banco de Dados PostgreSQL/Supabase

---

# Frontend

Tecnologias:
- Next.js
- Tailwind CSS
- Shadcn UI
- dnd-kit

Funções:
- dashboard
- Kanban
- agenda
- gestão de leads
- financeiro
- responsividade mobile

---

# Backend

Responsável por:
- autenticação
- APIs
- integração banco
- controle de usuários
- webhooks

---

# Banco de Dados

Tecnologia:
- PostgreSQL
- Supabase

Tabelas iniciais:
- leads
- clientes
- eventos
- usuários
- mensagens
- tarefas

---

# IA

Tecnologia:
- Gemini

Funções:
- responder leads
- qualificar clientes
- gerar propostas
- follow-up automático
- atualizar CRM

---

# Automação

Tecnologia:
- n8n

Fluxos:
- captura de leads
- envio de mensagens
- integração WhatsApp
- atualização Kanban
- lembretes automáticos

---

# Hospedagem

Frontend:
- Vercel

Infraestrutura futura:
- VPS Docker
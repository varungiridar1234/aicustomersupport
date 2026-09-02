# ResolvAI - AI Customer Support Resolution Platform MVP

An enterprise-grade, production-quality AI-assisted customer support platform designed for software hackathons. ResolvAI transforms incoming customer requests into classified, prioritized, correctly routed, automatically assigned, knowledge-grounded, and human-approved resolution workflows.

---

## Core Architecture Principle

```
AI UNDERSTANDS AND RECOMMENDS
        ↓
BACKEND CONTROLS AND ENFORCES
        ↓
HUMAN REVIEWS AND APPROVES
        ↓
SYSTEM EXECUTES AND RECORDS
        ↓
CUSTOMER IS UPDATED
```

The AI **never** independently performs sensitive state transitions or claims actions completed. All state changes, workload routing, SLA tracking, and audit logging are strictly enforced by the Node.js backend.

---

## Key Features & Highlights

- **Ticket Ingestion Simulator**: Supports customer requests across Email, WhatsApp, Live Chatbot, and Web Form channels.
- **Gemini AI Classification & Reasoning**: Classifies incoming tickets into Categories (Payment, Technical, Delivery, Account, Security) and Priorities (Low, Medium, High, Critical) with confidence scores and rationale. Zod validated with heuristic fallback.
- **Deterministic Routing Engine**: Configurable routing matrix mapping categories and priorities to specialized support teams (Billing, Tech Support, Logistics, Account, Security).
- **Automatic Workload-Based Agent Assignment**: Deterministic algorithm assigning tickets to available team agents with lowest workload score:
  $$\text{Workload} = \sum (\text{Low}\times 1 + \text{Med}\times 2 + \text{High}\times 4 + \text{Critical}\times 8)$$
- **Dynamic SLA Management**: SLA targets (Critical=30m, High=2h, Medium=8h, Low=24h) with live countdown timers, `ON_TRACK`, `AT_RISK`, and `BREACHED` status alerts.
- **RAG Knowledge Base Grounding**: Chunked policy vector search matching tickets against company policy documents (Duplicate Payment SOP, Refund Policy, Outage SOP, Security Incident SOP).
- **AI Recommendation & Draft Generation**: Generates 4-step resolution plans for support agents and drafts customer-facing responses.
- **Mandatory Human Approval Workflow**: Agent interactive response editor, draft rejection, and **APPROVE & SEND** workflow button before customer update dispatch.
- **Immutable Vertical Audit Trail**: Complete event history recording every lifecycle action with actor credentials and timestamps.
- **Socket.IO Real-Time Alerts**: Live browser notifications for ticket assignment, SLA warnings, and updates.

---

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Lucide Icons + Socket.IO Client + Axios.
- **Backend**: Node.js + Express.js + Socket.IO + JWT + Zod.
- **Database**: MongoDB / Mongoose with MongoMemoryServer fallback for zero-setup execution out-of-the-box.
- **AI**: Gemini API (`@google/generative-ai`) + RAG cosine vector similarity engine.
- **Testing**: Jest + Supertest (100% test pass on routing, SLA, workload score, state machine, RBAC).

---

## Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Seed Demo Dataset
```bash
npm run seed
```

### 3. Run Automated Business Logic Tests
```bash
npm run test:backend
```

### 4. Start Development Server
```bash
npm start
# Backend runs on http://localhost:5000
# Frontend runs on http://localhost:5173
```

---

## Primary Demo Scenario ("Charged twice for my order")

1. Open Ticket Ingest form (`/ingest`).
2. Select **Email** channel and load **Duplicate Payment** preset (*"Charged twice for my order #8841"*).
3. Click **Submit Support Request**.
4. Observe the automated pipeline:
   - AI classifies: **Payment**, **High Priority** (95% confidence).
   - Backend routes to **Billing Team**.
   - Workload Engine selects **Alex Rivera** (Score: 0) over busy Marcus Vance (Score: 16).
   - RAG engine grounds response in **Duplicate Payment Policy**.
5. Click **Open Agent Ticket Detail**.
6. Review AI Classification, Policy Grounding Card, Step-by-Step Recommendation Plan, and AI Draft Response.
7. Click **APPROVE & SEND**. Response is dispatched via Email channel.
8. Click **Mark Resolved**. Status updates to `RESOLVED` and Audit Timeline records all actions chronologically.

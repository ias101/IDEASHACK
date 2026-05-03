# @platform — MVP Demo

A trust-first science commercialization platform that connects **Researchers (Academia)**, **Businesses (Industry)**, and **Investors (Capital)** in a structured, auditable collaboration environment.

> "Our system is built as a trust-first collaboration operating system, where identity verification, AI-based audit, and immutable action logs are first-class infrastructure — not add-ons."

---

## Overview

@platform solves a fundamental problem in deep-tech commercialization: **trust**. When a researcher, a business partner, and an investor collaborate to bring science to market, there is no neutral, verifiable record of who did what, when, under what IP terms, and at what stage. @platform makes trust, audit, and stage governance into first-class system capabilities.

This repository contains the **MVP demo** — a fully interactive front-end prototype built to demonstrate the core platform concepts for pitching, coursework presentation, or early user testing.

---

## Core Features

### 1. Identity & Verification
Every participant is institution-verified before gaining access to sensitive collaboration stages. Verification status (`UNVERIFIED → PENDING → VERIFIED → SUSPENDED`) is enforced at the system level, not just at the UI layer.

### 2. Venture Room
The central collaboration space — modeled as a **state machine**. Each Venture Room progresses through six stages:

```
Research-only → Validation → Communication → Prototype → Investor-ready → IP-sensitive
```

Stage advancement triggers a Trust Ledger entry and an AI risk check. Members, milestones, IP status, and collaboration history are all tracked within the room.

### 3. Trust Ledger
An **append-only audit system** — the single source of truth for all platform activity. No UPDATE or DELETE operations are permitted. Every significant action (stage change, member join, IP registration, AI audit, milestone completion) is permanently recorded with actor attribution, a trace ID, and a timestamp.

This is the key differentiator from existing platforms: trust is not bolted on — it is the foundation.

### 4. AI Audit Services
AI acts as an **explainable audit and prompt layer**, not a decision-maker. Three services:

- **Commercialization Audit** — Analyzes a research abstract and returns a structured report: commercial summary, application hypotheses (with market sizing), verified vs. assumed claims, risk analysis, and recommended validation actions. Every conclusion includes its reasoning.
- **Credibility Evidence Extractor** — Surfaces "why this person is worth collaborating with" from their Trust Ledger history. No black-box scores — only evidence-backed statements.
- **Collaboration Risk Detector** — Combines a rule engine (e.g., `IF milestone == Prototype AND IP == null → HIGH risk`) with language analysis to flag inconsistencies.

### 5. Sciencepreneur Passport
A **user profile aggregated from multiple sources**: verified identity, venture participation history, Trust Ledger events, and AI-extracted collaboration style. The Passport is a view, not a database table — it reflects the live state of a user's collaboration record.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| State | Zustand |
| Icons | Lucide React |
| AI Layer | Simulated (structured mock output; production-ready for LLM API integration) |
| Database | Mock data (production target: PostgreSQL with append-only Trust Ledger table) |

The architecture follows a **Modular Monolith** pattern at the MVP stage, designed to decompose into microservices as the platform matures.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later

### Installation

```bash
# Install dependencies
npm install
```

### Running the Demo

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### No-Install Version

A fully self-contained version is also available — no build step required:

```
open demo.html   # in any modern browser
```

This version uses React and Tailwind via CDN and has identical functionality.

---

## Project Structure

```
mvp-demo/
├── demo.html                   # Standalone single-file demo (no Node.js required)
├── index.html                  # Vite entry point
├── src/
│   ├── App.jsx                 # Router and protected route logic
│   ├── main.jsx                # React root
│   ├── index.css               # Tailwind base + custom animations
│   ├── store/
│   │   └── useStore.js         # Zustand global state (current user)
│   ├── data/
│   │   └── mockData.js         # All demo data: users, ventures, ledger, audit results, passports
│   ├── components/
│   │   ├── Layout.jsx          # App shell (sidebar + topbar + outlet)
│   │   ├── Sidebar.jsx         # Navigation with role-aware display
│   │   └── TopBar.jsx          # Header with trust status indicator
│   └── pages/
│       ├── Landing.jsx         # Marketing / entry page
│       ├── Login.jsx           # Role selection (demo authentication)
│       ├── Dashboard.jsx       # Overview: stats, active ventures, recent events
│       ├── VentureRoom.jsx     # Stage pipeline, milestones, AI risk alerts, members
│       ├── AIAudit.jsx         # Commercialization audit with animated AI simulation
│       ├── TrustLedger.jsx     # Filterable append-only event log
│       └── Passport.jsx        # User profile with trust metrics and AI style analysis
```

---

## Demo Walkthrough

The suggested flow for a pitch or presentation:

| Step | Action | What it demonstrates |
|---|---|---|
| 1 | Open the landing page | Platform positioning and three-party model |
| 2 | Click **Explore Demo** | Entry into the platform |
| 3 | Select **Dr. Sarah Chen (Researcher)** | Institution-verified identity |
| 4 | View the **Dashboard** | Active ventures, trust event feed, stage progress |
| 5 | Click **Bio-Degradable Polymer Solar Cells** | Venture Room: stage pipeline, AI risk alerts, IP status |
| 6 | Navigate to **AI Audit** → Load Demo Paper → Run | Structured commercialization analysis with reasoning |
| 7 | Navigate to **Trust Ledger** | Immutable audit trail — the core trust differentiator |
| 8 | Navigate to **My Passport** | AI collaboration style, evidence-based credibility |
| 9 | Switch roles (Business / Investor) | Role-differentiated access and perspective |

---

## Demo Data

The demo includes two pre-populated Venture Rooms:

**VR-001 — Bio-Degradable Polymer Solar Cells**
- Stage: `Prototype`
- Members: Dr. Sarah Chen (NUS, Researcher) + Marcus Wong (GreenTech Solutions, Business)
- IP: Provisional patent filed (SG 2025-001234)
- Risk alerts: 2 (1 HIGH, 1 MEDIUM)

**VR-002 — AI-Driven Antibiotic Resistance Detection**
- Stage: `Investor-ready`
- Members: Prof. James Lim (NTU) + Linda Park (MedDiag) + Victoria Lim (Vertex Ventures)
- IP: Full patent granted (SG 2024-009876)
- Risk alerts: 1 (LOW)

The Trust Ledger contains 11 pre-populated events spanning both ventures, covering room creation, member joins, stage changes, milestone completions, AI audits, and IP registrations.

---

## Design Principles

These principles from the technical specification are reflected throughout the demo:

1. **Strong Trust-by-Design** — Every significant action is auditable. The Trust Ledger is not a feature; it is infrastructure.
2. **AI Explainability First** — No black-box scores. Every AI output includes the reasoning behind each conclusion.
3. **Strong Module Boundaries** — Each domain (Identity, Passport, Venture Room, Trust Ledger, AI Audit) is a distinct service with a clear interface.
4. **Pre-legal Governance** — The platform does not replace legal systems. It provides structured front-end governance that makes legal disputes less likely.
5. **MVP-viable, Architecture-sound** — The current implementation is a modular monolith. The service boundaries are already drawn for a future microservices decomposition.

---

## Roadmap (Post-MVP)

| Phase | Key Changes |
|---|---|
| **MVP** (current) | Modular monolith, simulated AI, mock data |
| **Alpha** | Real PostgreSQL Trust Ledger, LLM API integration, OAuth2 + institution email verification |
| **Beta** | Service decomposition, real IP placeholder workflow, dispute resolution module |
| **Production** | SSO / Legal integration, Trust Ledger optionally anchored to blockchain, multi-region deployment |

---

## License

This project is a prototype developed for the IDEASHACK2026 and pitch demonstration. All data is simulated.

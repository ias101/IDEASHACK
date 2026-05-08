# Ardeal

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
| Frontend | React 18 + Vite + React Router v6 |
| Styling | Tailwind CSS |
| State | React Context API + `useState` |
| HTTP Client | Axios (with JWT interceptor) |
| Backend | Spring Boot 3.3 (Java 21) |
| Auth | Spring Security + JWT (jjwt 0.12) |
| Database | H2 (file-based, auto-persists to `backend/data/`) |
| ORM | Spring Data JPA / Hibernate |
| AI Layer | OpenAI API (`gpt-4o-mini`) — user-supplied key, proxied via backend |

The architecture is a **full-stack monorepo**: React frontend + Spring Boot REST API, with H2 as a local persistent database.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Java 21](https://adoptium.net/) + Maven (or use `./mvnw`)

### 1 — Start the Backend

```bash
cd backend && mvn spring-boot:run
```

### 2 — Start the Frontend

```bash
# From the project root
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 3 — Create an Account

Open [http://localhost:5173](http://localhost:5173), click **Register**, choose a role, and sign up.

### 4 — Add OpenAI API Key

Go to **Settings → OpenAI API Key** and paste your key. It is stored in H2 per-user and never sent to the browser.


---

## Project Structure

```
IDEASHACK/
├── demo.html                       # Standalone no-backend demo
├── index.html                      # Vite entry point
├── package.json / vite.config.js   # Frontend config (proxy → :8080)
├── src/                            # React frontend
│   ├── main.jsx / App.jsx          # Entry + React Router
│   ├── index.css                   # Tailwind + animations
│   ├── api/index.js                # Axios client (JWT interceptor + all endpoints)
│   ├── contexts/AuthContext.jsx    # Auth state (login/logout/refreshUser)
│   ├── components/
│   │   ├── Layout.jsx              # Protected route shell (Sidebar + TopBar)
│   │   ├── Sidebar.jsx             # Navigation with NavLink active states
│   │   ├── TopBar.jsx              # Header with verified badge
│   │   └── ui.jsx                  # Chip, Avatar, Card, Spinner, helpers
│   └── pages/
│       ├── Login.jsx / Register.jsx
│       ├── Dashboard.jsx           # Real venture + ledger data
│       ├── Ventures.jsx            # List + create ventures
│       ├── VentureRoom.jsx         # Full venture management
│       ├── AIAudit.jsx             # Real OpenAI audit
│       ├── TrustLedger.jsx         # Filterable real ledger
│       ├── Passport.jsx            # User profile + metrics
│       └── Settings.jsx            # Profile editor + API key manager
└── backend/                        # Spring Boot REST API
    ├── pom.xml
    └── src/main/java/com/ideashack/platform/
        ├── PlatformApplication.java
        ├── config/                 # SecurityConfig, WebConfig (CORS)
        ├── security/               # JwtUtil, JwtAuthFilter, UserDetailsService
        ├── model/                  # User, Venture, VentureMember, Milestone, LedgerEntry
        ├── repository/             # Spring Data JPA repos
        ├── service/                # Auth, User, Venture, Ledger, OpenAI services
        └── controller/             # Auth, User, Venture, Ledger, Audit endpoints
```

---

## Design Principles

These principles from the technical specification are reflected throughout the demo:

1. **Strong Trust-by-Design** — Every significant action is auditable. The Trust Ledger is not a feature; it is infrastructure.
2. **AI Explainability First** — No black-box scores. Every AI output includes the reasoning behind each conclusion.
3. **Strong Module Boundaries** — Each domain (Identity, Passport, Venture Room, Trust Ledger, AI Audit) is a distinct service with a clear interface.
4. **Pre-legal Governance** — The platform does not replace legal systems. It provides structured front-end governance that makes legal disputes less likely.
5. **MVP-viable, Architecture-sound** — The current implementation is a modular monolith. The service boundaries are already drawn for a future microservices decomposition.

---

## License

This project is a prototype developed for the IDEASHACK2026 and pitch demonstration. All data is simulated.


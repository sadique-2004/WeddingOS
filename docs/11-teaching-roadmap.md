# WeddingOS — Industry-Oriented AI Development Teaching Roadmap

> **Document ID:** `DOC-11`  
> **Curriculum Target:** 12 Sessions (approx. 24 hours total) | **Fallback Intensive:** 6 Sessions (12 hours)  
> **Pedagogical Model:** Senior Engineer Spec-Driven AI Development without Manual Coding  
> **Audience:** Full-Stack Engineering Students & Technical Bootcamps

---

## 1. Curriculum Architecture & Teaching Philosophy

In this workshop, students do **not** watch an instructor type syntax line-by-line. Instead, they operate as **Engineering Leads and Product Architects**. They learn how professional engineers direct AI coding assistants (such as Antigravity, Claude Code, or Cursor) by supplying clear requirements, reviewing architectural diffs, and rigorously testing outputs.

```
┌─────────────────────────────────────────────────────────────────┐
│                    THE 12-SESSION TEACHING ROADMAP              │
│                                                                 │
│   PHASE 1: PRODUCT & ARCHITECTURE (Sessions 1–4)                │
│   S01: Product Discovery & Problem Framing                      │
│   S02: Requirements Engineering & PRD Generation                │
│   S03: System Design & Distributed Architecture                 │
│   S04: Relational Database Modeling & Invariants                │
│                                                                 │
│   PHASE 2: API & DESIGN SYSTEM (Sessions 5–6)                   │
│   S05: REST API Contracts & OpenAPI / Swagger Documentation     │
│   S06: Royal UI Design System Tokens & Stitch Prototyping       │
│                                                                 │
│   PHASE 3: AI VERTICAL SLICE DEVELOPMENT (Sessions 7–9)         │
│   S07: Core Workspace, Authentication & Dashboard               │
│   S08: Ceremonies, Family Invitations & WhatsApp Dispatch       │
│   S09: Guest QR Pass, Camera Check-In Desk & Task Kanban        │
│                                                                 │
│   PHASE 4: ADVANCED MODULES & CLOUD (Sessions 10–12)            │
│   S10: Budget Ledger, Website Studio & Moderated Photo Gallery  │
│   S11: Automated Testing, Manual QA & AI Debugging Protocols    │
│   S12: Production Cloud Deployment (Vercel + Render) & Retros   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Session-by-Session Curriculum Breakdown

### Session 1: Product Discovery, User Personas & Problem Framing
- **Duration:** 2 hours
- **Learning Objectives:** Understand why software exists; distinguish a vague idea from a structured product; identify user pain points in Indian weddings.
- **Concepts Taught:** The cost of unstructured data, persona definitions, MVP scoping, joint-family decision workflows.
- **AI Tool Used:** Claude / ChatGPT / Antigravity (Chat mode).
- **Student Activity:** Critique a chaotic wedding planning spreadsheet and extract core entities.
- **Deliverable:** Initial Product Vision Statement and Persona Matrix.

---

### Session 2: Requirements Engineering & PRD Generation
- **Duration:** 2 hours
- **Learning Objectives:** Learn how senior product managers write Product Requirements Documents (PRDs); define functional vs non-functional requirements.
- **Concepts Taught:** Acceptance criteria, edge cases, out-of-scope boundaries (preventing scope creep).
- **AI Tool Used:** AI Assistant with `docs/01-product-requirements.md` context.
- **Student Activity:** Review an AI-generated user story for Family Invitations and identify 3 missing edge cases.
- **Deliverable:** Approved Feature Matrix and Acceptance Criteria.

---

### Session 3: System Design & Architecture
- **Duration:** 2 hours
- **Learning Objectives:** Translate product requirements into technical architecture; understand why a decoupled Vite SPA + Spring Boot REST API was selected.
- **Concepts Taught:** Client vs server boundaries, stateless bearer tokens (Clerk JWT), media CDNs, Mermaid diagramming.
- **AI Tool Used:** AI Assistant with `docs/02-system-architecture.md` context.
- **Student Activity:** Draw the data flow of a guest RSVP from mobile browser to MySQL database.
- **Deliverable:** System Architecture Diagram in Mermaid syntax.

---

### Session 4: Relational Database Modeling & Integrity Invariants
- **Duration:** 2 hours
- **Learning Objectives:** Design normalized relational schemas; understand foreign-key cascades, indexing, and business invariants.
- **Concepts Taught:** Why NoSQL is dangerous for financial ledgers; MySQL InnoDB tables; Last-Admin protection; duplicate check-in guards.
- **AI Tool Used:** AI Assistant with `docs/03-database-design.md` and `schema.sql`.
- **Student Activity:** Evaluate the `family_invitations` table schema and explain why token uniqueness is required.
- **Deliverable:** Normalized Entity-Relationship (ER) diagram and DDL script.

---

### Session 5: REST API Design & Interactive Swagger Documentation
- **Duration:** 2 hours
- **Learning Objectives:** Master RESTful API design principles, status codes, query parameters, and OpenAPI 3 specifications.
- **Concepts Taught:** DTO patterns, request validation, idempotent operations (`PUT` vs `PATCH`), public vs protected endpoints.
- **AI Tool Used:** AI Assistant with `docs/04-api-design.md`.
- **Student Activity:** Test endpoints using the live Swagger UI (`/swagger-ui.html`).
- **Deliverable:** Complete API Endpoint Contract.

---

### Session 6: Luxury UI Design System & Component Prototyping
- **Duration:** 2 hours
- **Learning Objectives:** Understand design tokens, CSS variables, typography pairing, and modern component systems.
- **Concepts Taught:** Royal Crimson (`#4b030e`) & Zari Gold (`#b88444`) tokens, Cormorant Garamond Serifs, Tailwind CSS v4, Google Stitch prompts.
- **AI Tool Used:** Google Stitch / Antigravity with `docs/05-ui-design-system.md`.
- **Student Activity:** Prompt Stitch to generate a luxury ceremonial itinerary card and inspect the generated Tailwind classes.
- **Deliverable:** Reusable UI Component Library specs.

---

### Session 7: AI-Assisted Implementation — Workspace, Auth & Dashboard
- **Duration:** 2 hours
- **Learning Objectives:** Execute the first vertical slice using AI pair programming; wire Clerk authentication and the Executive Dashboard.
- **Concepts Taught:** Spec-driven code generation, inspecting git diffs, running TypeScript compilation checks.
- **AI Tool Used:** Antigravity / Claude Code with `apps/web` and `services/api`.
- **Student Activity:** Guide the AI to generate the `DashboardPage.tsx` countdown widget and verify calculations against the target date.
- **Deliverable:** Working Dashboard with live countdown and budget runway.

---

### Session 8: Vertical Slice — Ceremonial Itinerary & WhatsApp Invitations
- **Duration:** 2 hours
- **Learning Objectives:** Build household-level invitation management and external WhatsApp link generation.
- **Concepts Taught:** URI encoding for WhatsApp URLs (`https://wa.me/?text=...`), headcount capacity arithmetic.
- **AI Tool Used:** AI Assistant with Prompt #16 from `docs/14-ai-prompt-library.md`.
- **Student Activity:** Send a test WhatsApp invitation to a peer and verify the pre-filled message text.
- **Deliverable:** Working Events and Invitations modules with WhatsApp dispatch.

---

### Session 9: Vertical Slice — Digital Guest Pass, QR Check-In & Kanban Tasks
- **Duration:** 2 hours
- **Learning Objectives:** Implement camera-based QR scanning and interactive Kanban checklists.
- **Concepts Taught:** `html5-qrcode` camera integration, duplicate scan prevention, optimistic drag-and-drop state.
- **AI Tool Used:** AI Assistant with `CheckInScannerPage.tsx` and `TasksPage.tsx`.
- **Student Activity:** Scan an invitation QR pass on a peer's phone using your laptop camera; trigger a duplicate scan alert.
- **Deliverable:** Operational QR Check-In desk and Tasks Kanban board.

---

### Session 10: Vertical Slice — Budget Ledger, Website Studio & Moderated Gallery
- **Duration:** 2 hours
- **Learning Objectives:** Build financial ledgers, public website customization, and crowdsourced photo moderation.
- **Concepts Taught:** Multi-part file streaming to Cloudinary, moderation queue states (`PENDING` -> `APPROVED`), theme switching.
- **AI Tool Used:** AI Assistant with `WebsiteStudioPage.tsx` and `GalleryPage.tsx`.
- **Student Activity:** Upload a photo as a "Guest" and approve it as an "Organizer" to see it appear in the public gallery.
- **Deliverable:** Working Budget Ledger, Website Studio, and Moderated Photo Gallery.

---

### Session 11: Automated Testing, Manual QA & AI Debugging Protocols
- **Duration:** 2 hours
- **Learning Objectives:** Learn how senior developers test and debug software produced with AI; avoid regressions.
- **Concepts Taught:** JUnit 5 MockMvc testing, TypeScript strict mode (`tsc -b`), regression triage, reading stack traces.
- **AI Tool Used:** AI Assistant with `docs/08-testing-and-quality-assurance.md`.
- **Student Activity:** Intentionally introduce a syntax bug, prompt the AI using the Pinpoint Debugging Prompt, and inspect the diff.
- **Deliverable:** Completed QA Matrix and passing test suite.

---

### Session 12: Production Cloud Deployment & Final Retrospective
- **Duration:** 2 hours
- **Learning Objectives:** Deploy a full-stack application to production cloud infrastructure; review architectural trade-offs.
- **Concepts Taught:** Vercel edge deployment, Render Docker containers, environment variable hygiene, DNS and custom domains.
- **AI Tool Used:** Cloud dashboards (Vercel & Render) + AI deployment audit.
- **Student Activity:** Deploy frontend to Vercel and backend to Render; test live end-to-end guest RSVP flow on mobile.
- **Deliverable:** Live, production-accessible WeddingOS URL (`https://wedding-os-tap.vercel.app`).

---

## 3. Fallback Plan: 6-Session Intensive Bootcamp (12 Hours)

If curriculum time is constrained to 12 hours total, combine sessions into 6 high-impact intensive blocks:
1. **Block 1 (2h):** Product Discovery, PRD & Architecture (Sessions 1 + 2 + 3)
2. **Block 2 (2h):** Relational Database, API Design & UI Tokens (Sessions 4 + 5 + 6)
3. **Block 3 (2h):** Core Vertical Slice: Auth, Dashboard & Events (Session 7 + 8)
4. **Block 4 (2h):** Guest Vertical Slice: QR Passes & Reception Check-In (Session 9)
5. **Block 5 (2h):** Website Studio, Themes & Photo Gallery (Session 10)
6. **Block 6 (2h):** Testing, Quality Assurance & Production Deployment (Sessions 11 + 12)

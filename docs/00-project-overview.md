# WeddingOS — Project Overview & Architecture Guide

> **Document ID:** `DOC-00`  
> **Status:** Active Baseline  
> **Target Audience:** Engineering Students, Workshop Instructors, Technical Reviewers  
> **Repository:** `D:\Build_With__AI_TapAcademy\WeddingOS`

---

## 1. Executive Summary

**WeddingOS** is an enterprise-grade digital wedding coordination operating system specifically tailored for modern Indian weddings. Unlike matrimonial or matchmaking applications, WeddingOS is a **post-engagement execution platform** designed to solve the chaos of coordinating 500+ guests, multiple multi-day ceremonial functions (Haldi, Mehendi, Sangeet, Pheras, Reception), five-star hotel room blocks, WhatsApp invitation dispatches, vendor contracts, itemized expenses, and private guest memories.

WeddingOS replaces scattered spreadsheets, chaotic WhatsApp groups, and lost notes with a single, synchronized, role-protected workspace for couples, trusted family hosts, and wedding planners.

---

## 2. Core Problem & Product Vision

### 2.1 The Problem Space
Indian weddings are logistically complex events involving:
- **Joint-Family Decision Making:** Decisions and guest lists are distributed across bride and groom households.
- **Household-Level Invitations:** In Indian culture, invitations are addressed to the entire household or family (e.g., *"Sharma Family - 4 Guests"*), not individual isolated accounts.
- **Scattered Information:** Functions, dress codes, venue Google Maps links, and schedules are frequently lost in messaging threads.
- **Budget Leakage:** Advance payments to caterers, decorators, and photographers are rarely tracked in real-time, resulting in massive cost overruns.
- **Photo Chaos:** Thousands of candid wedding memories taken by guests remain stranded on personal phones rather than collected in a moderated private album.

### 2.2 The Solution
WeddingOS unifies these disparate flows into an intuitive full-stack web application:
1. **Organizer Workspace:** A password-protected dashboard for the couple and wedding organizers to coordinate functions, tasks, RSVPs, check-ins, budgets, and vendors.
2. **Guest Digital Experience:** A personalized wedding pass with unique QR codes (`/invite/:token`) requiring zero account creation, plus a public wedding website (`/w/:slug`) featuring royal aesthetics and ceremony details.

---

## 3. Technology Stack (Actual Implementation)

Contrary to early conceptual musings of Next.js or MongoDB, WeddingOS is architected as a clean, decoupled **Vite + React 19 Frontend** with an enterprise **Java 21 / Spring Boot 3 Backend** backed by a **MySQL 8.0 / TiDB Serverless** relational database.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vite + React 19 Client SPA                   │
│          TypeScript • Tailwind CSS v4 • Lucide Icons            │
│                 Clerk React Authentication SDK                  │
│                     (Hosted on Vercel)                          │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTPS / REST (JSON)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                Spring Boot 3.3.4 REST API Server                │
│       Java 21 • Spring Data JPA • Hibernate 6 • SpringDoc       │
│               Clerk OAuth2 JWT Resource Server                  │
│                     (Hosted on Render)                          │
└──────────────────┬─────────────────────────────┬────────────────┘
                   │ JDBC                        │ HTTPS SDK
                   ▼                             ▼
┌──────────────────────────────────┐ ┌────────────────────────────┐
│ MySQL 8.0 / TiDB Relational DB  │ │     Cloudinary CDN         │
│  12 Normalized InnoDB Tables     │ │  Private Guest Photo Media │
│   (schema.sql & Flyway / JPA)    │ │   Secure Direct Uploads    │
└──────────────────────────────────┘ └────────────────────────────┘
```

### 3.1 Technology Matrix
| Layer | Technology | Version | Purpose in WeddingOS |
|---|---|---|---|
| **Frontend Framework** | React | 19.2.8 | Declarative component UI |
| **Build Tool & Bundler** | Vite | 8.3.4 | Ultra-fast HMR and optimized production builds |
| **Language (Frontend)** | TypeScript | 6.0 | Strict type safety for data contracts |
| **Styling** | Tailwind CSS | 4.3.3 | Utility-first royal design system tokens |
| **Icons & FX** | Lucide React, Confetti | Latest | High-fidelity visual feedback |
| **QR Engine** | qrcode & html5-qrcode | 1.5.4 / 2.3.8 | Invitation generation & camera scanner |
| **Client Auth** | @clerk/clerk-react | 5.61.10 | Passwordless Google sign-in & session JWTs |
| **Backend Framework** | Spring Boot | 3.3.4 | Enterprise modular monolith REST API |
| **Backend Language** | Java | 21 (LTS) | Strongly-typed business logic & JPA entities |
| **ORM & Data** | Spring Data JPA / Hibernate | 6.x | Entity mapping, transactions, relationship safety |
| **Database** | MySQL 8.0+ / TiDB | InnoDB | ACID-compliant relational storage with foreign keys |
| **API Documentation** | SpringDoc OpenAPI 3 | 2.6.0 | Interactive Swagger UI (`/swagger-ui.html`) |
| **Cloud Storage** | Cloudinary | Java SDK 1.38 | Secure guest photo uploads & transformations |
| **Frontend Hosting** | Vercel | SPA Rewrites | Global edge CDN distribution |
| **Backend Hosting** | Render | Docker Container | JDK 21 Alpine container runtime on port 8080 |

---

## 4. Key Application Modules

| Module | Route / Area | Core Capabilities |
|---|---|---|
| **1. Executive Dashboard** | `/app` | Live countdown, wedding overview, upcoming ceremonies, RSVP counters, budget runway. |
| **2. Ceremonial Itinerary** | `/app/events` | Haldi, Mehendi, Sangeet, Pheras, Reception schedules, dress codes, Google Maps venue links. |
| **3. Family Guest Management** | `/app/invitations` | Household-level invitation cards, guest headcount, dietary notes, WhatsApp message dispatch. |
| **4. Digital Invitation Pass** | `/invite/:token` | Zero-login guest portal with personalized greeting, itinerary schedule, and high-entropy QR pass. |
| **5. QR Reception Check-In Desk** | `/app/check-in` | Front-desk camera scanner, instant household verification, one-click check-in, duplicate scan alerts. |
| **6. Preparation Tasks** | `/app/tasks` | Drag-and-drop Kanban checklist, priority tags (`CRITICAL`, `HIGH`, `MEDIUM`), category assignments. |
| **7. Budget & Expense Tracker** | `/app/expenses` | Target budget configuration, itemized expense ledger, payment status (`PAID`, `PENDING`, `ADVANCE`). |
| **8. Vendor Directory** | `/app/vendors` | Caterers, florists, photographers directory, contact cards, quotation vs paid ledger. |
| **9. Website & Theme Studio** | `/app/website` | Guest-facing website generator, 3 royal themes, cover photograph selection, custom `/w/:slug`. |
| **10. Moderated Photo Gallery** | `/app/gallery` & `/gallery/:token` | Crowdsourced guest photo uploads, organizer moderation queue (Approve/Reject), public album view. |
| **11. Team & Permissions** | `/app/members` | Admin vs Organizer roles, 8 granular module permissions, Last-Admin protection invariant. |
| **12. Profile & Workspace Sync** | `/app/profile` | Couple profile details (Bride, Groom, Date, City, Venue), multi-device cloud synchronization. |

---

## 5. Repository Structure

```
WeddingOS/
├── apps/
│   └── web/                               # React 19 + TypeScript + Vite SPA
│       ├── public/                        # Static assets (logos, ceremony photos)
│       ├── src/
│       │   ├── app/                       # Router, layouts (OrganizerLayout)
│       │   ├── components/                # Reusable UI (Card, Modal, Button, Badge)
│       │   ├── pages/                     # 16 Feature page components
│       │   ├── services/                  # REST API Client (apiClient.ts), Auth (Clerk)
│       │   └── types/                     # TypeScript shared domain interfaces
│       ├── package.json
│       ├── vite.config.ts
│       └── vercel.json
├── services/
│   └── api/                               # Java 21 + Spring Boot 3.3.4 REST API
│       ├── src/main/java/com/weddingos/api/
│       │   ├── config/                    # Security, CORS, Cloudinary, OpenAPI configs
│       │   ├── controller/                # 11 Spring REST Controllers
│       │   ├── dto/                       # Request/Response Data Transfer Objects
│       │   ├── model/                     # 12 JPA Entities (Wedding, Invitation, etc.)
│       │   ├── repository/                # Spring Data JPA interfaces
│       │   └── service/                   # Business logic, workspace resolution
│       ├── src/main/resources/
│       │   └── application.yml            # Datasource, Clerk, and server configuration
│       ├── pom.xml                        # Maven dependency manifest
│       └── mvnw / mvnw.cmd                # Maven Wrapper binaries
├── docs/                                  # Complete Specification & Teaching Suite
│   ├── 00-project-overview.md             # (This file)
│   ├── 01-product-requirements.md         # Full PRD
│   ├── 02-system-architecture.md          # Architecture & data flow
│   ├── 03-database-design.md              # Relational schema & invariants
│   ├── 04-api-design.md                   # OpenAPI & REST endpoints
│   ├── 05-ui-design-system.md             # Color tokens, typography, components
│   ├── 06-ai-development-workflow.md      # AI pair-programming methodology
│   ├── 07-setup-and-deployment.md         # Local & cloud deployment guide
│   ├── 08-testing-and-quality-assurance.md# Automated & manual testing plans
│   ├── 09-git-and-release-workflow.md     # Branching & checkpointing guide
│   ├── 10-documentation-audit.md          # Traceability & discrepancy matrix
│   ├── 11-teaching-roadmap.md             # 12-session curriculum syllabus
│   ├── 12-instructor-playbook.md          # Practical teaching scripts & questions
│   ├── 13-feature-implementation-plan.md  # Step-by-step vertical slice roadmap
│   ├── 14-ai-prompt-library.md            # 25+ Copy-paste ready prompts
│   └── 15-dependencies-and-integrations.md# Accounts, API keys & environment guide
├── schema.sql                             # Master DDL with 12 normalized tables
├── Dockerfile                             # Multi-stage Docker build for backend
├── vercel.json                            # Root Vercel SPA routing configuration
└── README.md                              # Main developer & student entry point
```

---

## 6. How to Use This Documentation Suite

For **Students**:
1. Start with [docs/00-project-overview.md](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/00-project-overview.md) to grasp the product scope.
2. Follow the [docs/11-teaching-roadmap.md](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/11-teaching-roadmap.md) session-by-session.
3. Use [docs/14-ai-prompt-library.md](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/14-ai-prompt-library.md) to generate code and configurations under your instructor's supervision.

For **Instructors**:
1. Refer to [docs/12-instructor-playbook.md](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/12-instructor-playbook.md) for live class scripts, student engagement questions, and concept analogies.
2. Use [docs/13-feature-implementation-plan.md](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/13-feature-implementation-plan.md) to review vertical slices and Git checkpoints.
3. Consult [docs/15-dependencies-and-integrations.md](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/15-dependencies-and-integrations.md) to verify API keys and external services prior to class.

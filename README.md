# 👑 WeddingOS — Indian Wedding Management & Coordination Operating System

> **A Production-Grade Full-Stack Web Application Built with Spec-Driven AI Development**  
> *Stack: React 19 • TypeScript • Vite • Tailwind CSS v4 • Spring Boot 3 • Java 21 LTS • MySQL 8.0 / TiDB • Clerk • Cloudinary*

---

## 🌟 Overview

**WeddingOS** is a dedicated digital wedding coordination workspace designed for modern Indian weddings. Built to replace chaotic spreadsheets, lost WhatsApp lists, and fragmented planning notes, WeddingOS unifies the entire wedding journey — from multi-day ceremonial timelines (Haldi, Mehendi, Sangeet, Pheras, Reception) and family-based invitations to real-time QR reception check-ins, itemized expense tracking, vendor rosters, a live wedding website builder, and a moderated photo gallery.

WeddingOS was developed to demonstrate **how professional software engineers use AI tools in industry**: not by frantically copying prompts, but by operating as system architects who provide rigorous specifications, review code diffs, enforce security invariants, and validate tests.

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vite + React 19 Client SPA                   │
│          TypeScript • Tailwind CSS v4 • Lucide Icons            │
│                 Clerk React Authentication SDK                  │
│             (Deployed on Vercel: wedding-os-tap.vercel.app)     │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTPS / REST (JSON)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                Spring Boot 3.3.4 REST API Server                │
│       Java 21 • Spring Data JPA • Hibernate 6 • SpringDoc       │
│               Clerk OAuth2 JWT Resource Server                  │
│          (Deployed on Render: weddingos-api.onrender.com)       │
└──────────────────┬─────────────────────────────┬────────────────┘
                   │ JDBC                        │ HTTPS SDK
                   ▼                             ▼
┌──────────────────────────────────┐ ┌────────────────────────────┐
│ MySQL 8.0 / TiDB Relational DB  │ │     Cloudinary CDN         │
│  12 Normalized InnoDB Tables     │ │  Private Guest Photo Media │
│   (schema.sql & Flyway / JPA)    │ │   Secure Direct Uploads    │
└──────────────────────────────────┘ └────────────────────────────┘
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: Version 18+ or 20+
- **Java Development Kit**: JDK 21 LTS
- **MySQL**: 8.0+ running on `localhost:3306`

### 1. Initialize the Database
```bash
mysql -u root -p < schema.sql
```

### 2. Start the Backend API (Port 8080)
```powershell
cd services/api
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/weddingos_db?useSSL=false&serverTimezone=UTC"
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="your_mysql_password"
.\mvnw.cmd spring-boot:run
```
*Swagger UI is available at: `http://localhost:8080/swagger-ui.html`*

### 3. Start the Frontend Client (Port 5173)
```bash
cd apps/web
npm install
npm run dev
```
*Access the application at: `http://localhost:5173`*

---

## 📚 Complete Documentation Index

All technical specifications, architectural designs, and teaching materials are organized in the [`docs/`](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs) directory:

| Document ID | Title | Summary & Purpose |
|---|---|---|
| [**DOC-00**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/00-project-overview.md) | **Project Overview** | High-level architecture, business problems, technology stack reconciliation. |
| [**DOC-01**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/01-product-requirements.md) | **Product Requirements (PRD)** | Personas, user stories, acceptance criteria, and 11 functional modules. |
| [**DOC-02**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/02-system-architecture.md) | **System Architecture** | Mermaid diagrams, component responsibilities, Clerk auth flows, data flows. |
| [**DOC-03**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/03-database-design.md) | **Database Design** | Relational schema, ER diagram, 12 normalized tables, and invariants. |
| [**DOC-04**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/04-api-design.md) | **API Design & OpenAPI** | REST endpoints catalog, query parameters, DTOs, and Swagger UI specs. |
| [**DOC-05**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/05-ui-design-system.md) | **UI Design System** | Royal Crimson & Zari Gold tokens, typography, and Stitch prompts. |
| [**DOC-06**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/06-ai-development-workflow.md) | **AI Development Workflow** | Spec-driven pair programming, diff inspections, and debugging protocols. |
| [**DOC-07**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/07-setup-and-deployment.md) | **Setup & Deployment** | Step-by-step local running guide, Vercel SPA rewrites, and Render containers. |
| [**DOC-08**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/08-testing-and-quality-assurance.md) | **Testing & QA** | Testing pyramid, JUnit 5 MockMvc tests, type gates, and manual QA matrix. |
| [**DOC-09**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/09-git-and-release-workflow.md) | **Git & Release Workflow** | Branching strategy, conventional commits, and rollback procedures. |
| [**DOC-10**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/10-documentation-audit.md) | **Codebase Traceability Audit** | Reconciliation matrix comparing requirements vs docs vs actual code. |
| [**DOC-11**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/11-teaching-roadmap.md) | **Teaching Roadmap** | 12-session (24-hour) curriculum syllabus and 6-session intensive fallback. |
| [**DOC-12**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/12-instructor-playbook.md) | **Instructor Playbook** | Practical classroom delivery scripts, analogies, and student questions. |
| [**DOC-13**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/13-feature-implementation-plan.md) | **Feature Implementation Plan** | 12 vertical slices from requirements to Git checkpoints. |
| [**DOC-14**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/14-ai-prompt-library.md) | **AI Prompt Library** | 25+ copy-paste ready engineering prompts with review follow-ups. |
| [**DOC-15**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/15-dependencies-and-integrations.md) | **Dependencies & Integrations** | Free-tier cloud accounts, API keys, and environment variables. |
| [**STUDENT GUIDE**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/STUDENT_FRONTEND_GUIDE.md) | **Student Frontend Build Guide** | Hands-on 20-prompt curriculum to build the exact luxury React 19 client. |
| [**BACKEND GUIDE**](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/BACKEND_SPRING_BOOT_GUIDE.md) | **Spring Boot 3 & MySQL Guide** | Production Java 21 REST API architecture, invariants, and local running. |

---

## 🎯 Key Application Modules

1. **Executive Dashboard (`/app`):** Countdown clock, upcoming ceremony preview, real-time RSVP counts, and budget runway.
2. **Ceremonial Itinerary (`/app/events`):** Timeline sequence for Haldi, Mehendi, Sangeet, Pheras, and Reception with dress codes and Google Maps links.
3. **Family-Based Guest Invitations (`/app/invitations`):** Household-level invitations, headcounts, dietary notes, and one-click WhatsApp invitation links with full CRUD.
4. **Digital Guest Pass & Intent-First RSVP (`/invite/:token`):** Zero-login personal invitation card, intent-first 2-button RSVP (no QR initially), conditional gate QR pass reveal upon acceptance, and wedding website link.
5. **Front-Desk QR Check-In Desk (`/app/check-in`):** Camera scanner powered by `html5-qrcode`, household verification, and duplicate scan prevention alerts.
6. **Tasks & Checklist (`/app/tasks`):** Drag-and-drop Kanban board with priority badges (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and pre-seeded Indian wedding logistics generator.
7. **Budget & Expense Ledger (`/app/expenses`):** Target budget ceiling, itemized transaction ledger, advance payment calculations, and full CRUD.
8. **Vendor Directory (`/app/vendors`):** Phone directory and quotation ledgers for caterers, decorators, and photographers with full CRUD.
9. **Website Studio & Public Portal (`/app/website` & `/w/:slug`):** Personal wedding website builder with 3 royal themes, profile sync, synchronized ceremony timeline, dynamic unique slug generator with real-time conflict checking, and dynamic SEO titles.
10. **Crowdsourced Photo Gallery (`/app/gallery` & `/gallery/:token`):** Guest photo uploads via link/QR with organizer moderation queue (`PENDING` -> `APPROVED`).
11. **Team Roles & Permissions (`/app/members`):** Admin vs Organizer roles with an 8-module permission matrix and Last-Admin protection.
12. **Profile & Settings (`/app/profile`):** Couple details (Bride, Groom, Date, Venue), multi-device cloud synchronization, and workspace reset.

---

## 🛡️ License
Educational and commercial project developed for Tap Academy's "Build with AI" curriculum.
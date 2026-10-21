# WeddingOS — Reusable AI Prompt Library for Engineering & Instruction

> **Document ID:** `DOC-14`  
> **Status:** Production Prompt Engineering Standards  
> **Format:** 25 Copy-Paste Ready Prompts with Context Anchors and Review Follow-Ups

---

## 1. How to Use This Prompt Library

Each prompt in this library is designed using **Senior Engineering Prompt Architecture**:
- **Role:** Tells the AI what persona to adopt (Architect, Security Engineer, QA Lead).
- **Context:** Specifies the exact files in the repository the AI must inspect.
- **Task & Constraints:** Defines the exact technical deliverables and what must *not* be changed.
- **Review Follow-Up:** A critical second prompt to critique the AI's first proposal before executing code.

---

## 2. Product, Architecture & Design Prompts

### Prompt 01: Product Discovery & Problem Framing
- **Role:** Senior Product Manager
- **Context:** Project brief and Indian wedding logistics overview.
- **Prompt:**
  ```text
  You are a Senior Product Manager specializing in event coordination software. We are designing "WeddingOS", a digital management workspace for modern Indian weddings.
  Analyze the problem space of coordinating an Indian wedding involving 500+ guests, 5 ceremonial functions (Haldi, Mehendi, Sangeet, Pheras, Reception), family-level invitations, and vendor contracts.
  Identify the top 4 user personas, their primary pain points, and define why a family-first invitation model is culturally and logistically superior to individual e-commerce user accounts.
  Format your output as a structured Product Vision and Persona Matrix.
  ```
- **Review Follow-Up:**
  ```text
  Critique this persona matrix from the perspective of an elderly family member who is not tech-savvy. Identify any assumptions that would cause friction in a real wedding.
  ```

---

### Prompt 02: PRD Generation
- **Role:** Principal Product Manager
- **Context:** `docs/00-project-overview.md`
- **Prompt:**
  ```text
  Act as a Principal Product Manager. Based on the product vision in docs/00-project-overview.md, generate a formal Product Requirements Document (PRD) for WeddingOS MVP v1.0.
  Structure the requirements into 11 modules: Dashboard, Ceremonial Events, Family Invitations, Guest Pass, QR Check-In, Tasks, Budget/Expenses, Vendors, Website Builder, Moderated Gallery, and Team Permissions.
  For each module, provide at least 3 concrete Functional Requirements with unique IDs (e.g. FR-INV-01) and clear acceptance criteria. Define explicit non-goals (out-of-scope features).
  ```
- **Review Follow-Up:**
  ```text
  Review the generated PRD against the constraint of a 24-hour workshop. Flag any feature that is over-engineered and recommend a simpler MVP baseline.
  ```

---

### Prompt 03: System Design & Architecture
- **Role:** Principal Systems Architect
- **Context:** `docs/01-product-requirements.md`
- **Prompt:**
  ```text
  You are a Principal Software Architect. Design the technical architecture for WeddingOS based on the PRD in docs/01-product-requirements.md.
  Our selected stack is a Vite + React 19 Single Page Application on Vercel, a Java 21 / Spring Boot 3.3.4 REST API on Render, MySQL 8.0 / TiDB Serverless, Clerk for OAuth2 JWT auth, and Cloudinary for photo media.
  Explain the component boundaries, frontend-to-backend communication, and security controls. Generate a complete Mermaid diagram illustrating the end-to-end data flow between Client, Clerk, Spring Boot, MySQL, and Cloudinary.
  ```
- **Review Follow-Up:**
  ```text
  Analyze this architecture for single points of failure and cloud free-tier limitations (such as Render container cold starts). What client-side resilience patterns must we implement?
  ```

---

### Prompt 04: Relational Database Modeling
- **Role:** Lead Database Architect
- **Context:** `docs/01-product-requirements.md` and `docs/02-system-architecture.md`
- **Prompt:**
  ```text
  Act as a Lead Database Architect. Design a production-grade relational MySQL 8.0 database schema for WeddingOS based on docs/01-product-requirements.md.
  The schema must support 12 normalized tables: app_users, weddings, wedding_slugs, wedding_memberships, wedding_events, family_invitations, check_in_logs, preparation_tasks, expenses, vendor_contacts, wedding_websites, and gallery_photos.
  Use InnoDB, utf8mb4 encoding, strict foreign key constraints, indexes on lookup tokens, and DECIMAL(12,2) for all financial columns.
  Generate the complete schema.sql DDL script.
  ```
- **Review Follow-Up:**
  ```text
  Inspect the generated schema.sql for referential integrity. What happens when a wedding is deleted? Are all child entities protected or correctly cascaded?
  ```

---

### Prompt 05: REST API Design & Contracts
- **Role:** Senior Backend Architect
- **Context:** `docs/03-database-design.md` and `schema.sql`
- **Prompt:**
  ```text
  Act as a Senior Backend Architect. Design the REST API contracts for WeddingOS based on schema.sql and docs/03-database-design.md.
  Document all endpoints grouped by controller: /workspaces, /events, /invitations, /check-in, /tasks, /expenses, /vendors, /website, /gallery, and /members.
  Specify the HTTP method, endpoint path, required headers (Bearer token vs public), request DTO JSON, successful 200/201 response JSON, and relevant 400/403/404 error responses.
  Distinguish clearly between protected organizer routes and public guest routes.
  ```
- **Review Follow-Up:**
  ```text
  Review the endpoint contracts for RESTful consistency. Ensure idempotent operations use PUT, partial state updates use PATCH, and query parameters are documented.
  ```

---

### Prompt 06: Luxury UI Design System & Component Tokens
- **Role:** Senior Design Systems Engineer
- **Context:** Indian royal aesthetic requirements
- **Prompt:**
  ```text
  Act as a Senior Design Systems Engineer. Define the UI Design System for WeddingOS in Tailwind CSS.
  The aesthetic must evoke royal Indian palace luxury (Udaipur mandaps, zari embroidery, rich velvet).
  Define color tokens for Royal Crimson (#4b030e, #6f0617), Zari Gold (#b88444, #e6bd81), and Pearl Ivory (#faf7f2, #fdfbf7).
  Pair Cormorant Garamond (luxury serifs for headings) with Inter (crisp sans-serif for forms and tables).
  Provide example Tailwind component snippets for: 1) Luxury Card container, 2) Primary Crimson Gradient Button, 3) Status Badge Pill, and 4) Form Input.
  ```
- **Review Follow-Up:**
  ```text
  Verify that all color combinations meet WCAG AA contrast standards for accessibility, especially gold text on ivory backgrounds.
  ```

---

### Prompt 07: Google Stitch / UI Generation Prompt
- **Role:** AI UI Generator Prompt
- **Context:** `docs/05-ui-design-system.md`
- **Prompt:**
  ```text
  Generate a responsive web dashboard screen for WeddingOS using Tailwind CSS and React.
  Theme: Royal Indian Heritage. Use #4b030e (Deep Crimson), #6f0617 (Velvet Accent), #b88444 (Zari Gold), and #fdfbf7 (Ivory Card surfaces).
  Headings must use font-cormorant (serif).
  Include:
  1. Header banner with wedding countdown: "14 Days to Pheras in Udaipur"
  2. Four summary cards: Total Confirmed Guests (342/400), Budget Runway (₹12,50,000 Remaining), Next Function (Sangeet at 7:00 PM), and Checklist Progress (78% Done).
  3. Upcoming Ceremony card with venue photo, timings, and dress code badge.
  Touch targets must be at least 44px. Do not use generic bootstrap styling.
  ```

---

## 3. Implementation Prompts (Vertical Slices)

### Prompt 08: Implementation Planning
- **Role:** Senior Tech Lead
- **Context:** Target feature requirement from `docs/01-product-requirements.md` and `schema.sql`
- **Prompt:**
  ```text
  Act as a Senior Tech Lead. Before writing code, propose a step-by-step technical implementation plan for [FEATURE NAME, e.g. Family Invitations & WhatsApp Dispatch].
  Reference schema.sql and existing files in apps/web and services/api.
  Break the plan into:
  1. Backend JPA Entity, Repository, and Controller changes.
  2. Frontend TypeScript interfaces and apiClient.ts methods.
  3. React UI page components and user interactions.
  4. Manual and automated verification tests.
  Do not output code yet. Wait for my review of your plan.
  ```

---

### Prompt 09: Family Invitations & WhatsApp Dispatch (Frontend)
- **Role:** Senior Frontend Engineer
- **Context:** `apps/web/src/pages/invitations/InvitationsPage.tsx` and `docs/05-ui-design-system.md`
- **Prompt:**
  ```text
  Act as a Senior Frontend React Engineer. Implement the InvitationsPage.tsx component in apps/web/src/pages/invitations/.
  Requirements:
  1. Display family invitations in a grid of luxury cards using WeddingOS design tokens (crimson borders, gold accents).
  2. Show household name, total guests invited, confirmed count, and RSVP status badge (Pending = amber, Confirmed = emerald).
  3. Add a "Share via WhatsApp" button that generates a pre-filled https://wa.me/?text=... link including the family name, wedding ceremony dates, and unique invitation URL (/invite/:token).
  4. Use invitationsApi from ../../services/apiClient.ts with optimistic localStorage updates.
  Do not remove existing helper functions. Output clean, typed TypeScript code.
  ```

---

### Prompt 10: QR Reception Check-In Scanner
- **Role:** Full-Stack Engineer
- **Context:** `apps/web/src/pages/check-in/CheckInScannerPage.tsx` and `docs/01-product-requirements.md` (FR-CHK-01 to 04)
- **Prompt:**
  ```text
  Act as a Full-Stack Engineer. Implement CheckInScannerPage.tsx for the front-desk wedding reception team.
  Requirements:
  1. Mount an html5-qrcode camera scanner to scan guest QR passes in real time.
  2. On scan, call checkInApi.verify(token) to fetch household details and check whether already checked in.
  3. If already checked in, display a bold red warning alert: "Duplicate Scan! Checked in at [timestamp]".
  4. If valid, show household name and allocated headcount with a one-click "Confirm Arrival" button.
  5. Play a confetti animation or success badge upon arrival confirmation.
  Preserve error boundaries and camera permission handling.
  ```

---

### Prompt 11: Website & Theme Studio (Inheriting Profile Data)
- **Role:** Senior React UI Engineer
- **Context:** `apps/web/src/pages/website/WebsiteStudioPage.tsx`
- **Prompt:**
  ```text
  Act as a Senior React Engineer. In WebsiteStudioPage.tsx, streamline the Content & Story editor tab.
  Requirements:
  1. Remove redundant input fields for Bride Name, Groom Name, Wedding Date, and Location.
  2. Replace them with an elegant read-only profile sync card showing the couple names, date, and venue inherited directly from the user's wedding profile (with an "Edit in Profile" link).
  3. The Content tab must only provide editable inputs for: Welcome Headline and Welcome Letter / Story.
  4. Ensure handleSave only updates website customizations without overwriting or blanking out profile names.
  Verify that the interactive device preview on the right continues rendering couple details seamlessly.
  ```

---

### Prompt 12: Private Photo Gallery & Moderation Flow
- **Role:** Full-Stack Cloud Engineer
- **Context:** `services/api/src/main/java/com/weddingos/api/controller/GalleryController.java` and `schema.sql`
- **Prompt:**
  ```text
  Act as a Full-Stack Cloud Engineer. Implement the backend photo moderation endpoints in GalleryController.java.
  Requirements:
  1. POST /api/v1/public/gallery/{token}/upload: Public endpoint receiving MultipartFile + caption. Validates token, streams to Cloudinary in folder weddingos/{wedding_id}, and inserts into gallery_photos with status = 'PENDING'.
  2. GET /api/v1/gallery/pending: Protected organizer endpoint returning unapproved photos.
  3. PUT /api/v1/gallery/{id}/approve: Updates status to 'APPROVED'.
  4. GET /api/v1/public/gallery/{token}: Returns only photos where status = 'APPROVED'.
  Enforce multi-tenant wedding_id scoping on all database queries.
  ```

---

## 4. Testing, Debugging & QA Prompts

### Prompt 13: Pinpoint Debugging & Error Resolution
- **Role:** Senior Debugging Specialist
- **Context:** Target file path and exact terminal error message
- **Prompt:**
  ```text
  You are an expert Software Debugger. I ran `npm run build` (or `mvn test`) and encountered the following failure:
  [PASTE ERROR MESSAGE AND STACK TRACE HERE]
  Target file: [SPECIFY EXACT FILE PATH, e.g. apps/web/src/pages/tasks/TasksPage.tsx at line 89]
  Instructions:
  1. Diagnose the exact root cause in 2 concise sentences.
  2. Do not rewrite the whole file. Provide only the minimal, exact replacement code chunk to fix the issue.
  3. Ensure no regressions or broken imports are introduced.
  ```

---

### Prompt 14: Automated Slice Testing (Backend)
- **Role:** Senior QA Engineer
- **Context:** `services/api/src/test/java/com/weddingos/api/controller/ApiSafetyWebTest.java`
- **Prompt:**
  ```text
  Act as a Senior QA Automation Engineer. Write a Spring Boot WebMvcTest class ApiSafetyWebTest.java in services/api/src/test/.
  Verify the following security invariants:
  1. GET /api/v1/expenses returns 401 Unauthorized when no Bearer token is provided.
  2. GET /api/v1/invitations/public/{validToken} returns 200 OK without any auth header.
  3. GET /api/v1/website/public/{slug} returns 200 OK without any auth header.
  4. Attempting to delete the sole remaining Admin in /api/v1/members returns 400 Bad Request (Last-Admin protection).
  Use MockMvc, Mockito, and Spring Security Test annotations.
  ```

---

## 5. Git, Deployment & Audit Prompts

### Prompt 15: Conventional Git Commit Generator
- **Role:** Release Engineer
- **Context:** Output of `git diff --stat` and `git status`
- **Prompt:**
  ```text
  Review the following git diff summary:
  [PASTE GIT DIFF / STATUS HERE]
  Generate a clean, conventional commit message following the format:
  <type>(<scope>): <concise summary in present tense>
  - Bulleted list of specific technical modifications
  - Any invariant or bug fixed
  Keep the message professional and informative.
  ```

---

### Prompt 16: Production Deployment Health Audit
- **Role:** Principal DevOps / SRE Engineer
- **Context:** `Dockerfile`, `vercel.json`, and `application.yml`
- **Prompt:**
  ```text
  Act as a Principal Site Reliability Engineer. Audit the production deployment readiness of WeddingOS.
  Review our Vercel frontend configuration (vercel.json) and Render backend container (Dockerfile).
  Verify that:
  1. All SPA client-side routes rewrite to /index.html.
  2. The multi-stage Docker build runs as a non-root secure user (appuser).
  3. No plaintext passwords or API keys exist in git-tracked files.
  4. CORS configuration allows cross-origin requests between Vercel and Render.
  Provide a Go/No-Go release assessment with a checklist of required environment variables.
  ```

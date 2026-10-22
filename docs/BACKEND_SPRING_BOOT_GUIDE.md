# WeddingOS — Spring Boot 3 & MySQL Backend Architecture Guide

> **Module**: Production Enterprise Backend Architecture  
> **Stack**: Java 21 LTS, Spring Boot 3.3.4, Spring Data JPA, Hibernate 6, MySQL 8.0 / TiDB Serverless, OpenAPI 3 (Swagger UI), Maven Wrapper  
> **Target Audience**: Full-Stack Engineering Students & Instructors  
> **Reference Specs**: [`docs/03-database-design.md`](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/03-database-design.md) & [`docs/04-api-design.md`](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/04-api-design.md)

---

## 1. Architectural Overview

WeddingOS uses a modular, domain-driven REST API powered by **Spring Boot 3** and **MySQL 8.0**, adhering directly to the **Database Design Document (`docs/03-database-design.md`)** and **API Design Document (`docs/04-api-design.md`)**.

```
┌────────────────────────────────────────┐
│        Vite + React 19 Frontend        │
│        (http://localhost:5173)         │
└───────────────────┬────────────────────┘
                    │ REST (JSON) + CORS
                    ▼
┌────────────────────────────────────────┐
│    Spring Boot 3.3.4 API (Port 8080)   │
│    com.weddingos.api.controller.*      │
└───────────────────┬────────────────────┘
                    │ JPA / Hibernate ORM
                    ▼
┌────────────────────────────────────────┐
│    MySQL 8.0 Database (weddingos_db)   │
│    12 Normalized Tables & Invariants   │
└────────────────────────────────────────┘
```

---

## 2. Database Schema (12 Tables in `schema.sql`)

| Table Name | Primary Purpose | Key Invariants Enforced |
|---|---|---|
| `app_users` | Master registry of authenticated users | Unique Clerk user ID & email |
| `weddings` | Master wedding workspace & budget targets | Budget runway & countdown dates |
| `wedding_slugs` | Public guest website custom vanity URLs | Unique active slug (`ananya-rohan-2026`) |
| `wedding_memberships` | Role-based access control (RBAC) | **FR-MEM-03: Last Admin Protection** |
| `wedding_events` | 5 core ceremonial functions & venues | Chronological sequence & dress codes |
| `preparation_tasks` | Pre-wedding checklist & vendor tasks | Priority (`HIGH`/`CRITICAL`), due dates |
| `family_invitations` | Household invitation cards & tokens | Unique invitation tokens & RSVP status |
| `check_in_logs` | Reception arrival audit trail | **FR-CHK-04: Duplicate scan detection** |
| `vendor_contacts` | Vendor directory & phone roster | Quoted amount vs paid advance ledger |
| `expenses` | Itemized wedding budget transactions | Planned vs actual vs advance payment tracker |
| `wedding_websites` | Public website customization & theme | Theme keys, story copy, livestream toggle |
| `gallery_photos` | Crowdsourced guest wedding photos | Moderation state (`PENDING`/`APPROVED`) |

---

## 3. How to Run the Backend Locally

### Prerequisites
1. **JDK 21 LTS** installed (`java -version`).
2. **MySQL Server 8.0+** running on `localhost:3306`.
3. Set database credentials in `services/api/src/main/resources/application.yml` or via environment variables:
   - `SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/weddingos_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC`
   - `SPRING_DATASOURCE_USERNAME=root`
   - `SPRING_DATASOURCE_PASSWORD=YourPasswordHere`

### Running the Application

```bash
cd services/api

# On Windows (PowerShell):
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
.\mvnw.cmd spring-boot:run

# On macOS/Linux:
./mvnw spring-boot:run
```

Once running, Tomcat starts on **port 8080**:
- **Interactive Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI 3 JSON Spec**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 4. Key Security & Business Logic Invariants

### A. Team Administration & Last-Admin Protection (FR-MEM-03)
- **Problem**: In multi-organizer workspaces, accidentally demoting or deleting the last `ADMIN` permanently locks out the workspace.
- **Implementation** in `MemberService.java`:
  ```java
  if (existing.getRole() == WeddingMembership.Role.ADMIN && newRole != WeddingMembership.Role.ADMIN) {
      long adminCount = membershipRepository.countByWeddingIdAndRole(existing.getWedding().getId(), WeddingMembership.Role.ADMIN);
      if (adminCount <= 1) {
          throw new IllegalStateException("Security invariant (FR-MEM-03): Cannot demote the last remaining ADMIN in the workspace.");
      }
  }
  ```

### B. Gate Check-In & Duplicate QR Scan Detection (FR-CHK-04)
- **Problem**: When a QR code is forwarded or presented twice at reception, gate staff must be alerted immediately while keeping check-in operations idempotent.
- **Implementation** in `CheckInService.java`:
  - First scan sets `checkedInAt = NOW()` and logs `isDuplicateAttempt = false`.
  - Second scan returns `alreadyCheckedIn = true` with exact previous timestamp and officer name, recording `isDuplicateAttempt = true` in `check_in_logs`.

### C. Vanity Slug Uniqueness & Real-Time Conflict Checks (FR-WEB-01)
- **Problem**: Multiple couples cannot share the same public vanity URL.
- **Implementation**:
  - `GET /api/v1/public/w/{slug}/available?weddingId=...` verifies if a slug is currently free or belongs to the requesting wedding.
  - If claimed by another wedding, updates reject with `409 Conflict`.

### D. Zero-Auth Public Invitation & Two-Stage RSVP (FR-PASS-01 to 06)
- **Implementation** in `PublicInvitationController.java`:
  - `GET /api/v1/public/invite/{token}` exposes `PublicInvitationView` containing household display name, max attendees, RSVP status, bride & groom names, wedding date, city, and vanity slug.
  - Initial load presents the royal invitation card without an entry QR code.
  - `POST /api/v1/public/invite/{token}/rsvp` receives the attendance choice. When confirmed (`ATTENDING`), the frontend unlocks and displays the scannable gate QR pass.

---

## 5. API Reference Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/workspaces/active` | Active workspace countdown, spending vs budget cap |
| `PUT` | `/api/v1/workspaces/budget` | Adjust total wedding budget cap |
| `PUT` | `/api/v1/workspaces/details` | Update couple names, wedding date, city, venue, and slug |
| `GET` | `/api/v1/events` | List all ceremonial functions & itineraries |
| `POST` | `/api/v1/events` | Create new wedding ceremony |
| `PUT` | `/api/v1/events/{id}` | Update ceremony timings, dress code, venue |
| `DELETE` | `/api/v1/events/{id}` | Delete ceremony from itinerary |
| `GET` | `/api/v1/invitations` | Household guest list, RSVP tallies & tokens |
| `POST` | `/api/v1/invitations` | Create new family invitation |
| `PUT` | `/api/v1/invitations/{id}` | Update household headcounts or contacts |
| `DELETE` | `/api/v1/invitations/{id}` | Delete family invitation |
| `GET` | `/api/v1/public/invite/{token}` | Zero-auth public guest invitation view (No QR initially) |
| `POST` | `/api/v1/public/invite/{token}/rsvp` | Submit RSVP attendance (unlocks gate QR pass on accept) |
| `POST` | `/api/v1/check-in/confirm` | Live QR verification & arrival registration |
| `GET` | `/api/v1/check-in/logs` | Gate arrival audit history |
| `GET` | `/api/v1/tasks` | Kanban checklist items |
| `POST` | `/api/v1/tasks` | Create task item |
| `PUT` | `/api/v1/tasks/{id}` | Update task details or priority |
| `PATCH` | `/api/v1/tasks/{id}/status` | Update task status (`TODO`, `IN_PROGRESS`, `COMPLETED`) |
| `DELETE` | `/api/v1/tasks/{id}` | Remove task |
| `GET` | `/api/v1/expenses` | Ledger transactions, planned vs actual dues |
| `POST` | `/api/v1/expenses` | Record new expense voucher |
| `PUT` | `/api/v1/expenses/{id}` | Update expense voucher |
| `DELETE` | `/api/v1/expenses/{id}` | Delete expense voucher |
| `GET` | `/api/v1/vendors` | Vendor directory, contracts & balance dues |
| `POST` | `/api/v1/vendors` | Add vendor record |
| `PUT` | `/api/v1/vendors/{id}` | Update vendor details & quotation |
| `DELETE` | `/api/v1/vendors/{id}` | Remove vendor |
| `GET` | `/api/v1/website/config` | Website studio theme configuration |
| `PUT` | `/api/v1/website/config` | Update website studio settings |
| `GET` | `/api/v1/public/w/{slug}/available` | Real-time slug availability & conflict check |
| `GET` | `/api/v1/public/w/{slug}` | Public guest wedding website (`/w/ananya-rohan-2026`) |
| `GET` | `/api/v1/public/w/{slug}/gallery` | Public photo gallery stream |
| `POST` | `/api/v1/public/w/{slug}/gallery/upload-file` | Public guest photo upload |
| `GET` | `/api/v1/gallery/moderation` | Organizer moderation queue for photos |
| `POST` | `/api/v1/gallery/{id}/moderate` | Approve or reject guest photo |
| `GET` | `/api/v1/members` | Team roster, roles & 8-module permission matrix |
| `POST` | `/api/v1/members/invite` | Invite new Admin or Organizer to workspace |
| `PUT` | `/api/v1/members/{id}/role` | Promote/demote role (enforces Last-Admin invariant) |
| `DELETE` | `/api/v1/members/{id}` | Remove team member (enforces Last-Admin invariant) |

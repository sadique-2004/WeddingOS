# WeddingOS — Spring Boot 3 & MySQL Backend Architecture Guide

> **Module**: Production Enterprise Backend Architecture  
> **Stack**: Java 21, Spring Boot 3.3.4, Spring Data JPA, Hibernate 6, MySQL 8.0, OpenAPI 3 (Swagger UI), Maven Wrapper  
> **Target Audience**: Full-Stack Engineering Students & Instructors

---

## 1. Architectural Overview

WeddingOS uses a modular, domain-driven REST API powered by **Spring Boot 3** and **MySQL 8.0**, adhering directly to the **Database Design Document (`DBDD.md`)** and **API Design Document (`API_DESIGN.md`)**.

```
                           ┌──────────────────────────────┐
                           │   Vite + React 19 Frontend   │
                           │   (http://localhost:5173)    │
                           └──────────────┬───────────────┘
                                          │ REST (JSON) + CORS
                                          ▼
                      ┌────────────────────────────────────────┐
                      │    Spring Boot 3.3.4 API (Port 8080)   │
                      │   com.weddingos.api.controller.*       │
                      └───────────────────┬────────────────────┘
                                          │ JPA / Hibernate ORM
                                          ▼
                      ┌────────────────────────────────────────┐
                      │    MySQL 8.0 Database (weddingos_db)   │
                      │    12 Normalized Tables & FK Invariants │
                      └────────────────────────────────────────┘
```

---

## 2. Database Schema (12 Tables in `schema.sql`)

| Table Name | Primary Purpose | Key Invariants Enforced |
|---|---|---|
| `app_users` | Master registry of authenticated users | Unique Clerk user ID & email |
| `weddings` | Master wedding workspace & budget targets | Budget runway & countdown dates |
| `wedding_slugs` | Public guest website custom vanity URLs | Unique active slug (`ananya-kabir`) |
| `wedding_memberships` | Role-based access control (RBAC) | **FR-MEM-06: Last Admin Protection** |
| `wedding_events` | 5 core ceremonial functions & venues | Chronological sequence & dress codes |
| `preparation_tasks` | Pre-wedding checklist & vendor tasks | Priority (`HIGH`/`CRITICAL`), due dates |
| `family_invitations` | Household invitation cards & tokens | Unique invitation tokens & RSVP status |
| `check_in_logs` | Reception arrival audit trail | **FR-CHECK-04: Duplicate scan detection** |
| `vendor_contacts` | Vendor directory & phone roster | Quoted amount vs paid amount ledger |
| `expenses` | Itemized wedding budget transactions | Planned vs actual vs due payment tracker |
| `wedding_websites` | Public website customization & theme | Theme keys, story copy, livestream toggle |
| `gallery_photos` | Crowdsourced guest wedding photos | Moderation state (`PENDING`/`APPROVED`) |

---

## 3. How to Run the Backend Locally

### Prerequisites
1. **JDK 21** installed (`java -version`).
2. **MySQL Server 8.0** running on `localhost:3306`.
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

### A. Team Administration & Last-Admin Protection (FR-MEM-06)
- **Problem**: In multi-organizer workspaces, accidentally demoting or deleting the last `ADMIN` locks out the workspace.
- **Implementation** in `MemberService.java`:
  ```java
  if (existing.getRole() == WeddingMembership.Role.ADMIN && newRole != WeddingMembership.Role.ADMIN) {
      long adminCount = membershipRepository.countByWeddingIdAndRole(existing.getWedding().getId(), WeddingMembership.Role.ADMIN);
      if (adminCount <= 1) {
          throw new IllegalStateException("Security invariant (FR-MEM-06): Cannot demote the last remaining ADMIN in the workspace.");
      }
  }
  ```
- Any Admin can assign new Admins or Organizers via `POST /api/v1/members/invite` and `PUT /api/v1/members/{id}/role`.

### B. Gate Check-In & Duplicate QR Scan Detection (FR-CHECK-04)
- **Problem**: When a QR code is forwarded or presented twice at reception, gate staff must be alerted immediately while keeping check-in operations idempotent.
- **Implementation** in `CheckInService.java`:
  - First scan sets `checkedInAt = NOW()` and logs `isDuplicateAttempt = false`.
  - Second scan returns `alreadyCheckedIn = true` with exact previous timestamp and officer name, recording `isDuplicateAttempt = true` in `check_in_logs`.

---

## 5. API Reference Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/workspaces/active` | Active workspace countdown, spending vs budget cap |
| `PUT` | `/api/v1/workspaces/budget` | Adjust total wedding budget cap |
| `GET` | `/api/v1/events` | List all 5 ceremonial functions & itineraries |
| `POST` | `/api/v1/events` | Create new wedding ceremony |
| `GET` | `/api/v1/invitations` | Household guest list, RSVP tallies & tokens |
| `POST` | `/api/v1/invitations` | Create new family invitation |
| `POST` | `/api/v1/check-in/scan` | Live QR verification & duplicate scan detection |
| `GET` | `/api/v1/check-in/logs` | Gate arrival audit history |
| `GET` | `/api/v1/members` | Team roster, roles & 8-module permission matrix |
| `POST` | `/api/v1/members/invite` | Invite new Admin or Organizer to workspace |
| `PUT` | `/api/v1/members/{id}/role` | Promote/demote role (enforces FR-MEM-06) |
| `GET` | `/api/v1/expenses` | Ledger transactions, planned vs actual dues |
| `POST` | `/api/v1/expenses` | Record new expense voucher |
| `GET` | `/api/v1/vendors` | Vendor directory, contracts & balance dues |
| `GET` | `/api/v1/website` | Website studio theme configuration |
| `GET` | `/api/v1/public/w/{slug}` | Public guest wedding website (`/w/ananya-kabir`) |
| `GET` | `/api/v1/gallery` | Crowdsourced guest photos & moderation |
| `POST` | `/api/v1/gallery/upload` | Upload guest ceremony photo |

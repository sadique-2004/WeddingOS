# WeddingOS — Testing, Quality Assurance & Verification Standards

> **Document ID:** `DOC-08`  
> **Status:** Production Verification Suite  
> **Test Frameworks:** JUnit 5, Spring Boot Test, MockMvc, TypeScript Type Checking (`tsc -b`), Oxlint

---

## 1. Testing Strategy Overview

WeddingOS employs a **Multi-Layered Verification Pyramid**:
1. **Static Analysis & Type Gates:** Fast TypeScript compile checks (`tsc -b`) and linter checks (`oxlint`) prevent syntax and contract regressions before code is ever executed.
2. **Backend Unit & Slice Tests:** JUnit 5 and Spring Boot `@WebMvcTest` verify service business logic, invariants, and authorization rules.
3. **End-to-End Manual QA Matrix:** Step-by-step verification flows covering critical user journeys (RSVP submissions, QR scanning, budget math).

```
          / \
         /   \      E2E Manual User Journeys & Smoke Tests
        /-----\     (RSVP Pass, Camera QR Check-In, Cloudinary Upload)
       /       \    ---------------------------------------------------
      /  API &  \   Integration & Slice Tests (JUnit 5, MockMvc)
     / Controller\  (ApiSafetyWebTest, WorkspaceServiceTest)
    /-------------\ ---------------------------------------------------
   /  Static Type  \ Frontend Type Checking & Compilation
  /   Validation    \ (tsc -b, oxlint, Vite Production Bundle)
 /___________________\
```

---

## 2. Automated Test Suites

### 2.1 Backend Automated Tests (`services/api/src/test`)
To execute the complete backend automated test suite:
```powershell
cd services/api
.\mvnw.cmd test
```

| Test Class | Focus Area | Assertions & Invariants Verified |
|---|---|---|
| `ApiSafetyWebTest.java` | Security & Public API | Verifies unauthenticated users cannot access private admin endpoints (`/api/v1/expenses`, `/api/v1/members`), but can access public portals (`/api/v1/website/public/:slug`, `/api/v1/invitations/public/:token`). |
| `WorkspaceServiceTest.java` | Multi-Tenant Workspace Logic | Verifies workspace isolation, default wedding provisioning, and budget runway computation. |
| `WebsiteServiceTest.java` | Website Customization | Verifies theme configuration persistence, section toggles, and vanity slug uniqueness. |
| `SecretConfigurationTest.java` | Secret Hygiene | Asserts no production credentials or plaintext tokens are accidentally hardcoded in `application.yml`. |

---

### 2.2 Frontend Verification Gate (`apps/web`)
To verify client-side type soundness and build integrity:
```bash
cd apps/web
npm run build
```
- **Step 1:** Runs `tsc -b` (TypeScript Project Compiler in build mode). Validates that all prop interfaces, API DTOs, and route parameters match strictly.
- **Step 2:** Runs `vite build`. Transforms React JSX/TSX into production assets, ensuring zero broken module imports or bundling errors.

---

## 3. Comprehensive Manual QA Matrix

| ID | Module | Test Scenario | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| **QA-01** | **Invitations** | WhatsApp Link Generation | Click "Share via WhatsApp" on Kapoor Family card. | Generates `https://wa.me/?text=...` with family name, token link, and wedding date. | ✅ PASS |
| **QA-02** | **Guest Pass** | Submit RSVP Attendance | Open `/invite/:token`, set attendance to 3 guests, select Jain Vegetarian, click "Confirm RSVP". | Database updates `total_attending = 3`, `rsvp_status = CONFIRMED`. Dashboard reflects new headcount. | ✅ PASS |
| **QA-03** | **Check-In** | Scan QR Code at Reception | Open `/app/check-in`, scan invitation QR pass with camera. | Displays household name, seats allocated. Clicking "Check-In" marks `is_checked_in = true`. | ✅ PASS |
| **QA-04** | **Check-In** | Duplicate Scan Alert | Re-scan the same invitation QR code a second time. | Screen flashes warning badge: *"Already Checked In"* with timestamp of previous arrival. | ✅ PASS |
| **QA-05** | **Tasks** | Drag-and-Drop Kanban | Drag task card from "In Progress" to "Completed". | Card moves to column; `status` updates to `COMPLETED` in backend and localStorage. | ✅ PASS |
| **QA-06** | **Expenses** | Budget Runway Invariant | Add expense of ₹50,000 with advance paid ₹20,000. | Total spent increases by ₹50,000. Pending dues increases by ₹30,000. Remaining runway decreases. | ✅ PASS |
| **QA-07** | **Website** | Inherit Profile Names | Change Bride Name to "Ananya" in Profile; open Website Studio. | Website Studio displays "Ananya" with "Synced from Profile" badge without requiring re-entry. | ✅ PASS |
| **QA-08** | **Members** | Last-Admin Protection | Attempt to delete the sole remaining Admin in `/app/members`. | UI blocks deletion or backend returns `400 Bad Request: Cannot remove the last workspace administrator`. | ✅ PASS |
| **QA-09** | **Gallery** | Moderation Gate | Guest uploads photo via `/gallery/:token`. | Photo enters `PENDING` queue in `/app/gallery`. Does not appear in public album until Approved by Organizer. | ✅ PASS |

---

## 4. Production Release Verification Checklist

Prior to presenting or deploying a new release:
- [x] Run `npm run build` in `apps/web` with 0 errors.
- [x] Run `mvn test` in `services/api` with 0 failures.
- [x] Verify `.env` files are excluded from Git (`git status`).
- [x] Verify `/v3/api-docs` returns valid OpenAPI JSON on backend.
- [x] Verify Vercel production deployment loads dashboard on mobile viewport.

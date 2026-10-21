# WeddingOS — Feature Implementation Plan & Vertical Slice Sequence

> **Document ID:** `DOC-13`  
> **Status:** Production Implementation Roadmap  
> **Architecture Principle:** End-to-End Vertical Slices (UI -> API -> DB -> Tests -> Git)

---

## 1. Why Vertical Slices Instead of Horizontal Layers?

Beginner tutorials often teach "horizontal slicing" — building all database tables first, then all backend controllers, then all frontend screens. This creates disconnected code that cannot be run or tested until the entire project is finished.

In this workshop, students build **Vertical Slices**. Each slice implements one complete feature from the React UI down through the Spring Boot API, MySQL table, automated test, and Git commit.

```
                  HORIZONTAL SLICING (AVOID)
┌────────────────────────────────────────────────────────┐
│  Week 1: Build 12 MySQL tables (Cannot be tested)      │
│  Week 2: Build 11 Spring Controllers (No UI to see)    │
│  Week 3: Build 16 React screens (Everything crashes)   │
└────────────────────────────────────────────────────────┘

                  VERTICAL SLICING (WEDDINGOS APPROACH)
┌────────────────────────────────────────────────────────┐
│  Slice 1: Auth & Dashboard       (Works immediately!)  │
│  Slice 2: Events & Timeline      (Works immediately!)  │
│  Slice 3: Family Invitations     (Works immediately!)  │
│  Slice 4: QR Check-In Desk       (Works immediately!)  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Recommended Vertical Slice Sequence

### Vertical Slice 1: Authentication & Workspace Context
- **Business Requirement:** Users sign in with Google/Clerk; system provisions their isolated wedding workspace.
- **Frontend Work:** Integrate Clerk `<SignIn />`, `<SignUp />`, `<UserButton />`, and `getLocalAuthSession()` fallback in `apps/web/src/pages/auth/`.
- **Backend Work:** Implement `WorkspaceController.java` (`/api/v1/workspaces/active`) and `WorkspaceService.java` (`getWorkspaceForUser`).
- **Database Entities:** `app_users`, `weddings`, `wedding_slugs`.
- **Git Checkpoint:** `feat(auth): integrate Clerk Google auth and workspace scoping`
- **Student Learning Outcome:** Understand multi-tenant SaaS workspace resolution and JWT validation.

---

### Vertical Slice 2: Executive Dashboard & Countdown
- **Business Requirement:** Display live countdown to wedding date, upcoming event card, and budget runway snapshot.
- **Frontend Work:** `DashboardPage.tsx` with Cormorant Garamond headings and countdown timer math.
- **Backend Work:** Compute countdown days and aggregate stats in `WorkspaceService.java`.
- **Database Entities:** `weddings`, `wedding_events`, `expenses`.
- **Git Checkpoint:** `feat(dashboard): live countdown timer and workspace overview`
- **Student Learning Outcome:** State management, optimistic rendering, and date calculations.

---

### Vertical Slice 3: Ceremonial Events & Itinerary
- **Business Requirement:** Manage the 5 core ceremonial functions (Haldi, Mehendi, Sangeet, Pheras, Reception) with timings and dress codes.
- **Frontend Work:** `EventsPage.tsx` timeline view with Google Maps links and ceremony photo banners.
- **Backend Work:** `EventController.java` CRUD operations sorted chronologically by `event_date` and `start_time`.
- **Database Entities:** `wedding_events`.
- **Git Checkpoint:** `feat(events): ceremonial timeline and dress code guides`
- **Student Learning Outcome:** Relational foreign keys, date-time serialization, and REST CRUD contracts.

---

### Vertical Slice 4: Family-Based Invitations & WhatsApp Sharing
- **Business Requirement:** Manage invitations at the household level; generate one-click WhatsApp invitation messages.
- **Frontend Work:** `InvitationsPage.tsx` household cards, headcount summary pills, and WhatsApp deep-link generation (`https://wa.me/?text=...`).
- **Backend Work:** `InvitationController.java` CRUD with automatic 32-character token generation.
- **Database Entities:** `family_invitations`.
- **Git Checkpoint:** `feat(invitations): family household cards and WhatsApp dispatch`
- **Student Learning Outcome:** Domain-driven data modeling and client-side URI encoding.

---

### Vertical Slice 5: Digital Guest Pass (`/invite/:token`)
- **Business Requirement:** Zero-login personalized wedding invitation pass with RSVP submission and dynamic QR code.
- **Frontend Work:** `InviteAcceptPage.tsx` featuring royal theme styling, RSVP attendance selector, and `qrcode` canvas rendering.
- **Backend Work:** Public unauthenticated endpoint `GET /api/v1/invitations/public/{token}` and `PUT .../rsvp`.
- **Database Entities:** `family_invitations`.
- **Git Checkpoint:** `feat(pass): personalized guest invitation pass and QR code generation`
- **Student Learning Outcome:** Unauthenticated token authorization vs bearer tokens; cryptographic token entropy.

---

### Vertical Slice 6: Front-Desk QR Camera Check-In Desk
- **Business Requirement:** Front-desk hosts scan guest passes using their laptop or phone camera, instantly verifying seats and preventing duplicates.
- **Frontend Work:** `CheckInScannerPage.tsx` utilizing `html5-qrcode` camera video feed.
- **Backend Work:** `CheckInController.java` verifying tokens, updating `is_checked_in = true`, and recording arrival in `check_in_logs`.
- **Database Entities:** `family_invitations`, `check_in_logs`.
- **Git Checkpoint:** `feat(check-in): camera QR scanner and duplicate arrival prevention`
- **Student Learning Outcome:** Browser media devices API, real-time audit logging, and duplicate scan guards.

---

### Vertical Slice 7: Preparation Tasks Kanban Board
- **Business Requirement:** Organize tasks across `TODO`, `IN_PROGRESS`, and `COMPLETED` columns with priority tags.
- **Frontend Work:** `TasksPage.tsx` with drag-and-drop column movement and inline completion checkboxes.
- **Backend Work:** `TaskController.java` with priority handling (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Database Entities:** `preparation_tasks`.
- **Git Checkpoint:** `feat(tasks): interactive Kanban board and priority badges`
- **Student Learning Outcome:** Optimistic UI drag-and-drop state manipulation and database enum handling.

---

### Vertical Slice 8: Budget Ledger & Expense Transactions
- **Business Requirement:** Record planned vs actual vs advance payments; track pending dues and remaining runway.
- **Frontend Work:** `ExpensesPage.tsx` with budget progress bar and transaction ledger.
- **Backend Work:** `ExpenseController.java` computing financial invariants.
- **Database Entities:** `expenses`, `weddings`.
- **Git Checkpoint:** `feat(expenses): itemized transaction ledger and runway calculations`
- **Student Learning Outcome:** Strict monetary decimal precision (`BigDecimal` & `DECIMAL(12,2)`).

---

### Vertical Slice 9: Vendor Directory & Phone Roster
- **Business Requirement:** Maintain contact cards for caterers, florists, and photographers with quotation tracking.
- **Frontend Work:** `VendorsPage.tsx` category directory with one-click phone dialer links (`tel:+91...`).
- **Backend Work:** `VendorController.java` CRUD.
- **Database Entities:** `vendor_contacts`.
- **Git Checkpoint:** `feat(vendors): vendor phone directory and quotation ledger`
- **Student Learning Outcome:** Mobile URL schemes and contact management.

---

### Vertical Slice 10: Website & Theme Studio (`/app/website` & `/w/:slug`)
- **Business Requirement:** Generate public wedding website; customize themes, love stories, and module visibility.
- **Frontend Work:** `WebsiteStudioPage.tsx` with split-screen live mobile/desktop device preview; inherit couple names from Profile.
- **Backend Work:** `WebsiteController.java` managing theme configuration and vanity slugs.
- **Database Entities:** `wedding_websites`, `wedding_slugs`, `weddings`.
- **Git Checkpoint:** `feat(website): theme studio with split-screen preview and profile sync`
- **Student Learning Outcome:** Component composition, theme tokens, and URL routing.

---

### Vertical Slice 11: Private Photo Gallery & Moderation Queue
- **Business Requirement:** Crowdsource guest photos via link/QR; organizers moderate photos before they appear in public album.
- **Frontend Work:** `GalleryPage.tsx` (organizer moderation queue) and `PublicGalleryPage.tsx` (guest grid).
- **Backend Work:** `GalleryController.java` and `PublicGalleryController.java` streaming multi-part files to Cloudinary.
- **Database Entities:** `gallery_photos`.
- **Git Checkpoint:** `feat(gallery): guest photo upload and organizer moderation queue`
- **Student Learning Outcome:** Multi-part file streaming, cloud media storage, and moderation workflows.

---

### Vertical Slice 12: Team Roles & Last-Admin Protection
- **Business Requirement:** Manage co-organizers with 8 granular module permissions; protect workspace from admin lockout.
- **Frontend Work:** `MembersPage.tsx` permission matrix toggle switches.
- **Backend Work:** `MemberController.java` validating `FR-MEM-06` (Last Admin Protection).
- **Database Entities:** `wedding_memberships`.
- **Git Checkpoint:** `feat(members): RBAC permission matrix and last-admin guard`
- **Student Learning Outcome:** Role-based access control and critical defensive business invariants.

# WeddingOS — Product Requirements Document (PRD)

> **Document ID:** `DOC-01`  
> **Status:** Approved Master Specification (v1.1 Production Release)  
> **Target Audience:** Engineering Students, Workshop Instructors, Technical Reviewers  
> **Source Repository:** `D:\Build_With__AI_TapAcademy\WeddingOS`

---

## 1. Product Vision & Positioning

WeddingOS is an enterprise-grade digital wedding coordination operating system specifically tailored for modern Indian weddings. Unlike consumer matchmaking platforms or static website builders, WeddingOS is a **mission-critical operations center** that synchronizes logistics, multi-day ceremonial timelines, family-level invitations, expenses, and private guest memories during the high-stress countdown to an Indian wedding.

### 1.1 Non-Negotiable Product Principles
1. **Household-First Guest Architecture:** In Indian culture, invitations are addressed to an entire family (e.g., *"The Kapoors"* with 4 invited guests). The system tracks RSVPs, dietary needs, and reception check-ins at the family level.
2. **Zero-Friction Guest Access:** Guests must never be forced to download a native mobile app or create an account. Personalized invitations, RSVPs, and gallery uploads function directly from high-entropy, cryptographically secure URLs (`/invite/:token`, `/gallery/:token`).
3. **Organizer Control & Privacy:** Wedding finances, vendor contracts, advance payment ledgers, and internal checklists remain strictly private to authenticated organizers.
4. **Photo Moderation Gate:** Crowdsourced photos from attendees must pass through an organizer moderation queue (`PENDING` -> `APPROVED`) before appearing in the public gallery.
5. **No False Automation:** WhatsApp invitation links prepare pre-filled messages on the organizer's phone or desktop; WeddingOS does not charge or send unauthorized bot messages.

---

## 2. User Personas

| Persona | Role | Key Needs & Pain Points |
|---|---|---|
| **Priya & Rohan (The Couple)** | Primary Hosts / Workspace Owners | Need complete financial visibility over expenses, live RSVP counts, and an elegant public website for friends and colleagues. |
| **Uncle Rajesh (Family Host)** | Co-Organizer / Logistics Lead | Manages caterers and transport. Needs phone access to vendor contacts and real-time check-in logs during guest arrival. |
| **Vikram (Wedding Planner)** | Professional Coordinator | Oversees task deadlines, vendor quotation ledgers, and ceremony sequences across Haldi, Sangeet, and Reception. |
| **Aarav & Family (Guests)** | Wedding Attendees | Need clear ceremony times, Google Maps directions to the mandap, and a seamless digital pass for entry. |

---

## 3. Functional Requirements (FR)

### Module 1: Executive Dashboard (`/app`)
- **FR-DASH-01: Wedding Overview & Countdown:** Display days remaining until the wedding date, bride & groom names, and primary venue city.
- **FR-DASH-02: Itinerary Snapshot:** Show the next upcoming ceremony with scheduled date, start time, and venue name.
- **FR-DASH-03: Live RSVP & Capacity Counters:** Display confirmed attendee headcounts, pending RSVPs, and declined invitations against the wedding's expected capacity.
- **FR-DASH-04: Preparation Progress:** Track checklist task completion percentage (e.g., 68% completed).
- **FR-DASH-05: Budget Runway:** Real-time summary showing total target budget, recorded spending, total paid, pending dues, and remaining runway.

### Module 2: Ceremonial Itinerary Management (`/app/events`)
- **FR-EVT-01: Ceremonial Functions CRUD:** Organizers can create, edit, reorder, and remove wedding functions (Haldi, Mehendi, Sangeet, Pheras, Reception).
- **FR-EVT-02: Chronological Sequence:** Events must enforce valid start and end times and display in chronological order.
- **FR-EVT-03: Dress Code & Guidance:** Provide attire recommendations (e.g., *"Yellow Ethnic Chic for Haldi"*, *"Royal Velvet / Indo-Western for Reception"*).
- **FR-EVT-04: Venue & Navigation:** Include venue names, physical addresses, and clickable Google Maps navigation links.

### Module 3: Family-Based Guest Management (`/app/invitations`)
- **FR-INV-01: Household Entity:** Invitations must be structured by household (`display_name`, e.g., *"Kapoor Family"*, `head_of_family_name`).
- **FR-INV-02: Headcount Capacity:** Each invitation records allocated guest count (`total_guests_invited`) and confirmed attendees (`total_attending`).
- **FR-INV-03: RSVP Tracking:** Track status across `PENDING`, `CONFIRMED`, `DECLINED`, with dietary preferences (e.g., Jain vegetarian, vegan).
- **FR-INV-04: Secure Tokenized Link:** Generate a unique, high-entropy 32-character token for each family (`/invite/:token`).
- **FR-INV-05: WhatsApp Integration:** Generate `https://wa.me/?text=...` links with personalized ceremony details and invitation URLs for one-click sharing.
- **FR-INV-06: Full CRUD & Persistent State:** Organizers can create, edit headcounts, primary contacts, and delete invitations with immediate database synchronization.

### Module 4: Digital Invitation Pass & Two-Button RSVP (`/invite/:token`)
- **FR-PASS-01: Public Access Without Login:** Guests access their personal invitation pass directly via their unique URL without requiring sign-up or app installation.
- **FR-PASS-02: Luxury Invitation Presentation:** On initial visit, present the formal Indian wedding invitation card featuring bride & groom names, wedding date, venue, and a gracious welcome note.
- **FR-PASS-03: Two-Button Intent-First RSVP (Zero Initial QR):** Display two prominent actions: **"Joyfully Accept"** and **"Regretfully Decline"**. The scannable entry QR code must **NEVER** be displayed on initial load.
- **FR-PASS-04: Conditional QR Entry Pass Unlock:** The gate entry pass and scannable QR code are unlocked and revealed **ONLY** after the guest clicks "Joyfully Accept" and confirms their attendance (`ATTENDING`).
- **FR-PASS-05: Minimal VIP Pass View:** Once accepted, hide redundant acceptance controls and form inputs, transforming the screen into a clean, luxury digital admission pass displaying allocated attendees and live QR code for reception scanning.
- **FR-PASS-06: Public Wedding Website Link:** Include a prominent link/button directing guests to the couple's public wedding website (`/w/:slug`) to explore the full itinerary, dress codes, and love story.
- **FR-PASS-07: Gracious Decline State:** If "Regretfully Decline" is selected, transition to a warm, appreciative acknowledgment screen without rendering a gate QR pass.

### Module 5: QR Reception Check-In Desk (`/app/check-in`)
- **FR-CHK-01: Real-Time Camera Scanner:** Support camera feed scanning via `html5-qrcode` to scan guest passes.
- **FR-CHK-02: Household Verification:** Display household name, allocated seats, and confirmed status upon scan.
- **FR-CHK-03: One-Click Check-In:** Record arrival timestamp in the audit log.
- **FR-CHK-04: Duplicate Scan Prevention:** Alert the front-desk team immediately with an amber warning banner if an invitation has already been checked in.

### Module 6: Preparation Tasks (`/app/tasks`)
- **FR-TSK-01: Kanban Board:** Organize tasks into `TODO`, `IN_PROGRESS`, and `COMPLETED` columns.
- **FR-TSK-02: Priority Levels:** Support `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL` priorities with distinct color badges.
- **FR-TSK-03: Drag-and-Drop & Inline Toggle:** Allow organizers to drag cards across columns or check the completion box to update status instantly.
- **FR-TSK-04: Pre-Seeded Logistics Scenarios:** Provide a one-click generator or realistic default dataset representing authentic Indian wedding tasks (Safas with Turban Master, Mehendi artists, Dhol troupe, Welcome hampers, Mandap florist, Sound & lighting dry run) linked to ceremonies and priority tiers.

### Module 7: Budget & Expense Ledger (`/app/expenses`)
- **FR-EXP-01: Total Budget Target:** Set and update the overall budget ceiling for the wedding.
- **FR-EXP-02: Itemized Transactions:** Record expenses categorized by Venue, Catering, Decor, Photography, Attire, and Logistics.
- **FR-EXP-03: Payment Status Tracking:** Categorize payment states as `PAID`, `PENDING`, or `ADVANCE_PAID`.
- **FR-EXP-04: Real-Time Financial Invariants:** Automatically compute total spent, total paid, pending liabilities, and remaining budget runway.
- **FR-EXP-05: Full CRUD & Vendor Mapping:** Full creation, editing, deletion of expense vouchers with vendor linkages and database persistence.

### Module 8: Vendor Directory (`/app/vendors`)
- **FR-VND-01: Vendor Roster:** Store vendor business names, service categories, phone numbers, emails, and contact persons.
- **FR-VND-02: Financial Ledger:** Track quotation amount versus paid advance amount for each vendor contract.
- **FR-VND-03: Full CRUD Operations:** Create, update quotation/advance figures, and remove vendor records with immediate multi-tenant database synchronization.

### Module 9: Website & Theme Studio (`/app/website` & `/w/:slug`)
- **FR-WEB-01: Unique Vanity Slug Generation & Conflict Prevention:**
  - Auto-generate clean, URL-safe vanity slugs derived from couple names (e.g. `ananya-rohan-2026`).
  - Provide real-time debounced availability checks via `GET /api/v1/public/w/{slug}/available`.
  - Enforce global uniqueness: prevent conflicting claims by other weddings with HTTP 409 Conflict rejection.
- **FR-WEB-02: Public Wedding Website Portal (`/w/:slug`):** Zero-authentication public portal rendering the couple's active theme, dynamic browser tab title (`[Bride] & [Groom] Wedding | WeddingOS`), ceremonial sequence, venue Google Maps links, and dress codes.
- **FR-WEB-03: Automatic Ceremony Itinerary Synchronization:** The public website must dynamically read and display the exact ceremonial events created in the Events module (`/app/events`) without requiring duplicate manual entry.
- **FR-WEB-04: Royal Theme Selection:** Support 3 distinct aesthetics:
  1. *Classic Indian Heritage* (Royal Crimson, Zari Gold, Cormorant Garamond Serifs)
  2. *Minimal Elegant* (Ivory, Charcoal Slate, Clean Editorial Typography)
  3. *Modern Celebration Night* (Midnight Navy, Starry Champagne Gold)
- **FR-WEB-05: Synced Couple Profile:** Inherit Bride Name, Groom Name, Wedding Date, and Venue directly from the Wedding Profile without redundant inputs.
- **FR-WEB-06: Content & Story:** Custom welcome headlines and ceremonial love stories.
- **FR-WEB-07: Module Visibility Toggles:** Toggle public visibility of Ceremonial Itinerary, Attire Guides, Venue Maps, and Livestream feeds.
- **FR-WEB-08: Live / Draft Mode:** Toggle public visibility for search engine indexing or guest access.

### Module 10: Private Photo Gallery (`/app/gallery` & `/gallery/:token`)
- **FR-GAL-01: Guest Upload Portal:** Guests upload candid photos directly via `/gallery/:token` without logging in.
- **FR-GAL-02: Moderation Queue:** Uploaded photos enter `PENDING` state; organizers review and click `APPROVE` or `REJECT`.
- **FR-GAL-03: Public Album:** Only photos in `APPROVED` status are rendered in the public guest gallery.
- **FR-GAL-04: Cloudinary Storage:** Uploads are streamed securely to Cloudinary with CDN delivery.

### Module 11: Team Roles & Permissions (`/app/members`)
- **FR-MEM-01: Role Hierarchy:** Support `ADMIN` and `ORGANIZER` roles.
- **FR-MEM-02: Granular 8-Module Permissions:** Assignable permissions for events, tasks, guests, check-ins, expenses, vendors, website, and gallery moderation.
- **FR-MEM-03: Last-Admin Protection:** Prevent deletion or demotion of the final remaining workspace administrator.

---

## 4. Non-Functional Requirements (NFR)

1. **Performance:** 
   - Initial page load < 1.5 seconds on 4G connections.
   - Optimistic client-side caching ensures sub-50ms UI transitions on all CRUD actions.
2. **Security & Data Isolation:**
   - Multi-tenant data isolation: Each authenticated user is mapped to their unique wedding workspace.
   - Private operations require valid Clerk JWT bearer tokens.
   - Public guest tokens must possess 128-bit cryptographic entropy to prevent URL enumeration.
3. **Availability & Resilience:**
   - Stateless backend container allows auto-scaling and zero-downtime rolling deploys.
   - LocalStorage caching allows organizers to view checklists and schedules even in spotty hotel Wi-Fi.
4. **Responsive Design:**
   - Fluid support from 320px mobile screens (iPhone SE) to 4K desktop displays.

---

## 5. Out-of-Scope (Non-Goals for v1.0)
- Matrimonial profile search or matchmaking algorithms.
- Automatic SMS / WhatsApp billing gateways (messages are triggered client-side).
- In-app payment processing or credit card gateways.
- Seating charts or hotel room allocation matrices.

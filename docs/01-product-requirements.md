# WeddingOS — Product Requirements Document (PRD)

> **Document ID:** `DOC-01`  
> **Status:** Approved Baseline (v1.0 Production)  
> **Cross-Reference:** Original `docs/PRD.md`

---

## 1. Product Vision & Positioning

WeddingOS is a dedicated wedding operations management platform designed for couples, families, and wedding coordinators. Unlike consumer dating apps or static wedding portals, WeddingOS is a **mission-critical operations center** that manages logistics, guests, expenses, and ceremonial schedules during the high-stress countdown to an Indian wedding.

### 1.1 Non-Negotiable Product Principles
1. **Household-First Guest Architecture:** In Indian culture, an invitation is sent to an entire family (e.g., *"The Kapoors"* with 4 invited guests). The system must track RSVPs and check-ins at the family level.
2. **Zero-Friction Guest Access:** Guests must never be forced to download an app or create an account. Personalized invitations, RSVPs, and gallery uploads must function directly from high-entropy, cryptographically secure URLs (`/invite/:token`, `/gallery/:token`).
3. **Organizer Control & Privacy:** Wedding finances, vendor invoices, and internal checklists must remain strictly private to authorized organizers.
4. **Photo Moderation Gate:** Crowdsourced photos from attendees must pass through an organizer moderation queue before appearing in the public gallery.
5. **No False Automation:** WhatsApp invitation links prepare pre-filled messages on the organizer's phone or desktop; WeddingOS does not charge or send unauthorized bot messages.

---

## 2. User Personas

| Persona | Role | Key Needs & Pain Points |
|---|---|---|
| **Priya & Rohan (The Couple)** | Primary Hosts / Workspace Owners | Need full visibility over expenses, guest headcounts, and an elegant public website for friends and colleagues. |
| **Uncle Rajesh (Family Host)** | Co-Organizer / Logistics Lead | Manages caterers and transport. Needs phone access to vendor contacts and immediate check-in logs during arrival. |
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
- **FR-EVT-03: Dress Code & Guidance:** Provide attire recommendations (e.g., *"Yellow Ethnic Chic for Haldi"*, *"Royal Velvet / Tuxedo for Reception"*).
- **FR-EVT-04: Venue & Navigation:** Include venue names, physical addresses, and clickable Google Maps navigation links.

### Module 3: Family-Based Guest Management (`/app/invitations`)
- **FR-INV-01: Household Entity:** Invitations must be structured by household (`display_name`, e.g., *"Kapoor Family"*, `head_of_family_name`).
- **FR-INV-02: Headcount Capacity:** Each invitation records allocated guest count (`total_guests_invited`) and confirmed attendees (`total_attending`).
- **FR-INV-03: RSVP Tracking:** Track status across `PENDING`, `CONFIRMED`, `DECLINED`, with dietary preferences (e.g., Jain vegetarian, vegan).
- **FR-INV-04: Secure Tokenized Link:** Generate a unique, high-entropy 32-character token for each family (`/invite/:token`).
- **FR-INV-05: WhatsApp Integration:** Generate `https://wa.me/?text=...` links with personalized ceremony details and invitation URLs for one-click sharing.

### Module 4: Digital Invitation Pass (`/invite/:token`)
- **FR-PASS-01: Public Access Without Login:** Guests access their personal invitation pass directly via their unique URL.
- **FR-PASS-02: Interactive RSVP:** Guests can confirm attendance count and submit dietary notes directly on the pass.
- **FR-PASS-03: Dynamic Entry QR Code:** Render a scannable QR code encoding the invitation token for front-desk check-in.

### Module 5: QR Reception Check-In Desk (`/app/check-in`)
- **FR-CHK-01: Real-Time Camera Scanner:** Support camera feed scanning via `html5-qrcode` to scan guest passes.
- **FR-CHK-02: Household Verification:** Display household name, allocated seats, and confirmed status upon scan.
- **FR-CHK-03: One-Click Check-In:** Record arrival timestamp in the audit log.
- **FR-CHK-04: Duplicate Scan Prevention:** Alert the front-desk team immediately if an invitation has already been checked in.

### Module 6: Preparation Tasks (`/app/tasks`)
- **FR-TSK-01: Kanban Board:** Organize tasks into `TODO`, `IN_PROGRESS`, and `COMPLETED` columns.
- **FR-TSK-02: Priority Levels:** Support `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL` priorities with distinct color badges.
- **FR-TSK-03: Drag-and-Drop & Inline Toggle:** Allow organizers to drag cards across columns or check the completion box to update status instantly.

### Module 7: Budget & Expense Ledger (`/app/expenses`)
- **FR-EXP-01: Total Budget Target:** Set and update the overall budget ceiling for the wedding.
- **FR-EXP-02: Itemized Transactions:** Record expenses categorized by Venue, Catering, Decor, Photography, Attire, and Logistics.
- **FR-EXP-03: Payment Status Tracking:** Categorize payment states as `PAID`, `PENDING`, or `ADVANCE_PAID`.
- **FR-EXP-04: Real-Time Financial Invariants:** Automatically compute total spent, total paid, pending liabilities, and remaining budget runway.

### Module 8: Vendor Directory (`/app/vendors`)
- **FR-VND-01: Vendor Roster:** Store vendor business names, service categories, phone numbers, emails, and contact persons.
- **FR-VND-02: Financial Ledger:** Track quotation amount versus paid advance amount for each vendor contract.

### Module 9: Website & Theme Studio (`/app/website` & `/w/:slug`)
- **FR-WEB-01: Custom Vanity Slug:** Organizers can configure unique URLs (e.g., `weddingos.com/w/ananya-rohan`).
- **FR-WEB-02: Royal Theme Selection:** Support 3 distinct aesthetics:
  1. *Classic Indian Heritage* (Royal Crimson, Zari Gold, Cormorant Garamond Serifs)
  2. *Minimal Elegant* (Ivory, Charcoal Slate, Clean Editorial Typography)
  3. *Modern Celebration Night* (Midnight Navy, Starry Champagne Gold)
- **FR-WEB-03: Synced Couple Profile:** Inherit Bride Name, Groom Name, Wedding Date, and Venue directly from the Wedding Profile without redundant inputs.
- **FR-WEB-04: Content & Story:** Custom welcome headlines and ceremonial love stories.
- **FR-WEB-05: Module Visibility Toggles:** Toggle public visibility of Ceremonial Itinerary, Attire Guides, Venue Maps, and Livestream feeds.
- **FR-WEB-06: Live / Draft Mode:** Toggle public visibility for search engine indexing or guest access.

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

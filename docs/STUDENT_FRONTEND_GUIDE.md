# 👑 WeddingOS — Student Frontend Engineering Guide
> **Your Step-by-Step Practical Blueprint: Build a Production-Grade Indian Wedding Operating System with AI**  
> *Stack: Vite • React 19 • TypeScript • TailwindCSS v4 • Antigravity AI*

---

## 🌟 Welcome to the WeddingOS Build!

In this project, you are going to build **WeddingOS** — a luxury digital management workspace designed for Indian joint families, couples, and wedding planners.

### 🎯 What you will achieve:
By following this guide step-by-step with your AI assistant (Antigravity):
- You will create **11 enterprise organizer modules** (Dashboard, Itinerary, Tasks, WhatsApp Invites, Budget, Vendors, Website Builder, Moderated Gallery, QR Check-In Desk, Team Roles, Settings).
- You will build **guest-facing portals**: A personalized digital pass with dynamic QR codes (`/invite/:token`) and a public wedding website with 3 royal themes (`/w/:slug`).
- You will master the **Senior Software Engineer Workflow**: Spec-driven prompt engineering, design system tokenization, and quality assurance.

---

## 📁 Step 0: Prerequisites & Project Assets

Before running any prompts, make sure you have the following assets and documentation in place:

### 1. Master Documentation in `/docs`
Your curriculum provides complete architectural specifications:
- `01-product-requirements.md`: Complete product requirements, user personas, and acceptance criteria.
- `02-system-architecture.md`: Full-stack system design, component boundaries, and Clerk auth flows.
- `03-database-design.md`: Production MySQL 8.0 relational schema and invariants.
- `04-api-design.md`: REST API endpoints catalog and request/response contracts.
- `05-ui-design-system.md`: Royal luxury colors, font rules, and layout tokens.
- `BACKEND_SPRING_BOOT_GUIDE.md`: Spring Boot 3.3.4 & MySQL enterprise backend setup.

### 2. Static Assets in `apps/web/public/`
Verify these files are in `apps/web/public/`:
- `WeddingOSLogo.png`: Brand logo.
- `favicon.png`: Monogram crest icon.
- `dashboard-banner.jpg`: Royal palace banner.
- `events/`: Ceremony photos (`haldi.jpg`, `mehendi.jpg`, `sangeet.jpg`, `pheras.jpg`, `reception.jpg`).

---

## 🚀 Step 1: Initial Setup & Dependencies

Open your terminal in the project root and run these setup commands:

```bash
# 1. Initialize Vite React TypeScript app
npm create vite@latest apps/web -- --template react-ts
cd apps/web

# 2. Install TailwindCSS v4 & Icons
npm install @tailwindcss/vite tailwindcss@^4.0.0 lucide-react

# 3. Install Router & Authentication
npm install react-router-dom @clerk/clerk-react

# 4. Install QR Generation, Camera Scanner & FX
npm install qrcode @types/qrcode
npm install html5-qrcode
npm install canvas-confetti @types/canvas-confetti

# 5. Install Fast Linter
npm install -D oxlint @types/node
```

### 🛠️ Configuration File #1: `apps/web/vite.config.ts`
Replace `apps/web/vite.config.ts` with this configuration (enables local Wi-Fi testing for your phone):

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Allows opening http://<YOUR_LOCAL_IP>:5173 on your mobile phone!
    port: 5173,
  },
})
```

### 🛠️ Configuration File #2: `apps/web/index.html`
Open `apps/web/index.html` and add Google Fonts (`Cormorant Garamond` and `Inter`) inside the `<head>`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WeddingOS — Wedding Planning, Organized in One Place</title>
    <!-- Google Fonts: Cormorant Garamond & Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 🛠️ Configuration File #3: `apps/web/src/index.css`
Replace `apps/web/src/index.css` with the royal luxury design tokens from `docs/DESIGN_SYSTEM.md`:

```css
@import "tailwindcss";

@theme {
  /* Brand Luxury Palette */
  --color-ivory: #faf9f6;
  --color-wine: #4b030e;
  --color-deep-wine: #2f0209;
  --color-burgundy: #6f0617;
  --color-burgundy-hover: #580412;
  --color-champagne: #e6bd81;
  --color-antique-gold: #b88444;

  /* Typography */
  --font-serif: "Cormorant Garamond", Georgia, serif;
  --font-cormorant: "Cormorant Garamond", Georgia, serif;
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;

  /* Gold Glow Shadows */
  --shadow-gold-sm: 0 2px 10px rgba(184, 132, 68, 0.08);
  --shadow-gold-md: 0 8px 30px rgba(184, 132, 68, 0.12);
  --shadow-gold-glow: 0 0 25px rgba(230, 189, 129, 0.45);
  --shadow-card: 0 10px 40px -10px rgba(75, 3, 14, 0.06);
}

:root {
  --color-ivory: #faf9f6;
  --color-wine: #4b030e;
  --color-burgundy: #6f0617;
  --color-champagne: #e6bd81;
  --color-antique-gold: #b88444;
  font-family: var(--font-sans);
}

body {
  margin: 0;
  min-height: 100vh;
  background-color: #faf9f6;
  color: #1f2022;
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

.font-cormorant {
  font-family: var(--font-cormorant);
}

.gold-border {
  border: 1px solid rgba(230, 189, 129, 0.4);
}
```

> **📌 Golden Rule of Typography for this Project:**
> - `font-cormorant`: Use **only** for grand titles and section headings.
> - `font-sans font-bold tabular-nums`: Use for **all numbers, guest headcounts, dates, and currency (₹)** to ensure crisp legibility and alignment.

---

## 📦 Step 2: Environment Variables (`.env`)

Create a `.env` file in `apps/web/.env`:

```env
# Optional: Add your Clerk Publishable Key here if you have one.
# If you don't have one, our built-in 1-Click "Demo Login" handles it automatically!
VITE_CLERK_PUBLISHABLE_KEY=pk_test_placeholder_key
```

---

## 🏛️ Step 3: Shared Data Models & Local Stores

Before building screens, we must establish shared TypeScript models and local state stores so that when you add a family invitation in the Invitations module, it immediately appears in the Check-In Desk and on the Guest Digital Pass!

---

### 🤖 Prompt #1: TypeScript Data Models
**Copy & paste this prompt to Antigravity:**

```text
Create the following TypeScript type definitions for WeddingOS:

1. File: apps/web/src/types/invitation.ts
- Export type InvitationCircle = 'Nanihal (Maternal)' | 'Dadihal (Paternal)' | 'Friends & Colleagues' | 'VIP Patrons' | 'International'
- Export type RsvpStatus = 'PENDING' | 'ATTENDING' | 'NOT_ATTENDING'
- Export interface FamilyInvitation with fields:
  id: string, displayName: string, primaryContactName: string, phoneNumber: string, email?: string, circle: InvitationCircle, maxAttendees: number, actualAttendees: number, rsvpStatus: RsvpStatus, ceremoniesAllowed: string[], dietaryNotes?: string, invitationToken: string, checkedInAt?: string | null, checkedInBy?: string | null, organizerNotes?: string.
- Export interface CheckInLogEntry with fields:
  id: string, invitationId: string, familyName: string, primaryContact: string, attendeeCount: number, maxAttendees: number, circle: string, timestamp: string, checkedInBy: string, isDuplicateAttempt?: boolean.
- Export interface CheckInResult with fields:
  success: boolean, invitation: FamilyInvitation, alreadyCheckedIn: boolean, message: string, timestamp: string.

2. File: apps/web/src/types/membership.ts
- Export type WorkspaceRole = 'ADMIN' | 'ORGANIZER'
- Export interface ModulePermissions with 8 boolean keys: events, tasks, invitations, check_in, expenses, vendors, website, gallery.
- Export ALL_PERMISSIONS_ENABLED and DEFAULT_ORGANIZER_PERMISSIONS constants.
- Export interface WeddingMembership with fields:
  id: string, weddingId: string, userId: string, fullName: string, email: string, role: WorkspaceRole, modulePermissions: ModulePermissions, joinedAt: string, createdAt: string, title?: string, isCurrentSessionUser?: boolean.

3. File: apps/web/src/types/website.ts
- Export type WeddingThemeKey = 'CLASSIC_INDIAN' | 'MINIMAL_ELEGANT' | 'MODERN_CELEBRATION'
- Export interface PublicWebsiteConfig with fields:
  slug: string, themeKey: WeddingThemeKey, brideName: string, groomName: string, weddingDate: string, locationName: string, welcomeHeadline: string, welcomeMessage: string, isPublished: boolean, showSchedule: boolean, showDressCode: boolean, showVenues: boolean, showLivestream: boolean, livestreamUrl?: string, coverPhoto?: string.
```

---

### 🤖 Prompt #2: Shared Local Storage Stores
**Copy & paste this prompt to Antigravity:**

```text
Create the state management stores in apps/web/src/services/:

1. File: apps/web/src/services/invitationStore.ts
- Use localStorage keys: 'weddingos_family_invitations' and 'weddingos_checkin_logs'.
- Seed 5 realistic default Indian family invitations:
  * "The Singhania Family" (5 max guests, Dadihal, token: 'wos-singhania-8821', Jain dietary notes)
  * "Justice & Mrs. Verma" (2 max guests, VIP Patrons, token: 'wos-verma-4192')
  * "The Roy Chowdhury Clan" (6 max guests, Nanihal, token: 'wos-chowdhury-7301', checkedInAt: 45 mins ago, checkedInBy: 'Aisha Sharma')
  * "Dr. Siddharth & Dr. Neha Kapoor" (3 max guests, International, token: 'wos-kapoor-9920')
  * "Vikramaditya Oberoi & Partners" (2 max guests, Friends & Colleagues, token: 'wos-oberoi-5512')
- Export functions: getInvitations(), getInvitationByToken(token), addInvitation(data), updateInvitation(id, data), deleteInvitation(id), updateRSVP(token, count, status, notes), checkInFamily(id, count, by), and getCheckInLogs().
- Trigger a window CustomEvent 'weddingos_invitations_updated' whenever data changes so all UI components update in real-time.

2. File: apps/web/src/services/membershipStore.ts
- Use localStorage key: 'weddingos_workspace_members'.
- Seed 3 default members:
  * "Aisha Sharma" (ADMIN, Bride & Co-Owner, all permissions enabled, isCurrentSessionUser: true)
  * "Imran Khan" (ADMIN, Groom & Co-Owner, all permissions enabled)
  * "Priya Patel" (ORGANIZER, Hospitality Lead, permissions: events, tasks, invitations, check_in, gallery = true; expenses, vendors, website = false)
- Export functions: getMembers(), addMember(), updateMemberPermissions(), updateMemberRole(), and removeMember().
- Enforce Last Admin Rule (FR-MEM-06): Block deleting or demoting the last remaining ADMIN.
```

---

## 🛡️ Step 4: Authentication, Layouts & App Shell

---

### 🤖 Prompt #3: Auth Setup, ProtectedRoute & Demo Mode
**Copy & paste this prompt to Antigravity:**

```text
Set up the authentication wrapper and login pages:

1. File: apps/web/src/App.tsx
- Wrap the application with ClerkProvider using:
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_demo_key'
- Provide afterSignOutUrl="/sign-in" and render RouterProvider with router.

2. File: apps/web/src/app/components/ProtectedRoute.tsx
- Check useAuth() from Clerk.
- If user is signed in, render children.
- If not signed in, redirect to /sign-in?redirect_url=...

3. File: apps/web/src/pages/auth/SignInPage.tsx
- Design an editorial luxury login page with a royal palace couple portrait on the left and a gold-accented form on the right.
- Include email and password inputs with Clerk signIn.create integration.
- Provide a Google SSO button.
- CRUCIAL DEMO FEATURE: Include a prominent "Demo Access (1-Click Instant Login)" button that immediately bypasses login and navigates to /app/dashboard so students and evaluators can test with zero setup!

4. File: apps/web/src/pages/auth/SignUpPage.tsx
- Build matching registration view with redirect to /app/onboarding.
```

---

### 🤖 Prompt #4: Luxury Collapsible Sidebar & Router
**Copy & paste this prompt to Antigravity:**

```text
Build the application layout shell and central router:

1. File: apps/web/src/app/layouts/OrganizerLayout.tsx
- Create a luxury collapsible sidebar navigation adhering to docs/DESIGN_SYSTEM.md:
  * Expanded state: 72-unit width displaying WeddingOSLogo.png, full text titles, and a collapse button.
  * Collapsed state: 20-unit icon rail displaying favicon monogram.
- Include all 11 core organizer links with Lucide icons:
  * Dashboard (/app/dashboard) -> LayoutDashboard
  * Events & Functions (/app/events) -> CalendarDays
  * Preparation Tasks (/app/tasks) -> CheckSquare
  * Family Invitations (/app/invitations) -> Users2
  * Budget & Expenses (/app/expenses) -> DollarSign
  * Vendor Directory (/app/vendors) -> Briefcase
  * Website & Themes (/app/website) -> Globe
  * Photo Gallery (/app/gallery) -> Camera
  * Family Check-In (/app/check-in) -> QrCode
  * Team Members (/app/members) -> ShieldAlert
  * Settings (/app/settings) -> Settings
- Top Header: Display a dynamic countdown badge showing remaining days to the wedding (read from localStorage 'weddingos_active_wedding').
- Active navigation item style: Highlighted in burgundy (#6f0617) with champagne gold border (#e6bd81).
- Bottom user profile pill with Clerk Sign-Out button.

2. File: apps/web/src/app/router/index.tsx
- Set up createBrowserRouter with all routes:
  * Public: / (HomePage), /about (AboutPage), /sign-in, /sign-up
  * Guest: /invite/:token (GuestInvitePage), /w/:slug and /w/preview (PublicWeddingPage)
  * Protected Organizer: /app/onboarding (WorkspaceOnboardingPage)
  * Protected Nested in OrganizerLayout: dashboard, events, tasks, invitations, expenses, vendors, website, gallery, check-in, members, settings.
```

---

## 👑 Step 5: The 11 Organizer Modules

Now build the organizer management modules one-by-one.

---

### 🤖 Prompt #5: Workspace Setup Wizard
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/onboarding/WorkspaceOnboardingPage.tsx:
1. Create a 4-step royal setup wizard:
   - Step 1: Couple names (Bride & Groom, e.g. "Ananya Sharma" & "Kabir Singhania") and custom wedding URL slug (/w/ananya-kabir).
   - Step 2: Primary Muhurat Date picker and Destination City ("Udaipur, Rajasthan").
   - Step 3: Ceremonies checklist with presets (Haldi, Mehendi, Sangeet, Vedic Pheras, Grand Reception).
   - Step 4: Total Budget Target (default ₹2,500,000) and Expected Guest Capacity (default 350).
2. Save the resulting profile to localStorage under key 'weddingos_active_wedding'.
3. On completion, navigate directly to '/app/dashboard'.
```

---

### 🤖 Prompt #6: Executive Dashboard
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/dashboard/DashboardPage.tsx following PRD § 7.2:
1. Hero Section: Display public/dashboard-banner.jpg with a dark burgundy overlay, couple names, and an active ticking countdown clock (Days, Hours, Minutes, Seconds) updating every 1 second.
2. 4 Metric Cards (All numbers MUST use 'font-sans font-bold tabular-nums'):
   - Days Remaining to primary Muhurat
   - Confirmed Guests vs 350 Total Cap
   - Budget Utilization (Total Spent vs Target) with progress bar
   - Urgent Tasks Pending
3. Action Hub: 4 quick-action buttons ('Add Ceremony', 'WhatsApp Invites', 'Record Expense', 'Launch Check-In Desk').
4. Ceremony Run of Show: Sequential timeline of multi-day wedding functions with dates, times, and venues.
```

---

### 🤖 Prompt #7: Ceremonies & Itinerary Decks
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/events/EventsPage.tsx adhering to PRD § 7.3:
1. Day Filter Chips ('All Ceremonies', 'Day 1', 'Day 2'...) dynamically computed from event dates.
2. Seed 5 Default Ceremonies:
   - Sequence 01: Haldi Ceremony (Day 1 Morning, Poolside Courtyard, Dress: Turmeric Yellow & White)
   - Sequence 02: Mehendi & High Tea (Day 1 Afternoon, Royal Gardens, Dress: Emerald Green & Floral)
   - Sequence 03: Royal Sangeet & Musical Night (Day 1 Evening, Grand Ballroom, Dress: Indo-Western / Glamour)
   - Sequence 04: Traditional Vedic Pheras (Day 2 Evening, Palace Mandap, Dress: Royal Sherwani & Silk Sarees)
   - Sequence 05: Grand Royal Reception (Day 3 Evening, Lakeview Terrace, Dress: Black Tie / Regal Formals)
3. Event List Cards with 3-column desktop layout:
   - Left: Ceremony image from public/events/ (haldi.jpg, mehendi.jpg, sangeet.jpg, pheras.jpg, reception.jpg) with 'Sequence 01' pill overlay and start/end time.
   - Center: Ceremony Title in font-cormorant, description, venue address with Google Maps link, and dress code guidance pill.
   - Right: Expected Attendance displaying the number in 'font-sans text-3xl sm:text-4xl font-bold text-[#4b030e] leading-none tabular-nums' followed by 'Guests' label in uppercase tracking-wider, plus Edit and Delete buttons.
4. Add/Edit Ceremony Modal with full CRUD saved to localStorage.
```

---

### 🤖 Prompt #8: Preparation Tasks & Checklist
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/tasks/TasksPage.tsx matching PRD § 7.4:
1. View Toggle: Support switching between Kanban Column Board (To Do, In Progress, Completed) and Table List view.
2. Filter tabs: All, Attire, Decor, Logistics, Rituals, Catering, Legal.
3. Priority badges: Urgent (red), High (amber), Normal (neutral).
4. Task item: Title, category, due date, assignee, and instant completion checkbox with line-through animation.
5. 'Add Task' modal persisting to localStorage.
```

---

### 🤖 Prompt #9: Family Invitations & WhatsApp Dispatch
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/invitations/InvitationsPage.tsx connected to src/services/invitationStore.ts:
1. Metrics Bar: Total Families, Confirmed Attendees, Max Guest Cap, Pending Responses.
2. Invitations Table:
   - Family Name & Head of Family
   - Circle Badge (Nanihal, Dadihal, VIP, International)
   - Max Allowed Guests & Confirmed Count
   - RSVP Status Badge (Confirmed, Attending, Pending)
   - Actions: 'Share via WhatsApp', Edit, Delete.
3. WhatsApp Share Modal:
   - Generates bilingual (English & Hindi) invitation message.
   - Contains unique digital pass link: http://localhost:5173/invite/:token
   - 'Send via WhatsApp' button opens https://wa.me/{phone}?text=... for manual transmission.
4. 'Add Family' modal and CSV Export button.
```

---

### 🤖 Prompt #10: Budget & Expenditure Tracker
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/expenses/ExpensesPage.tsx adhering to PRD § 7.8:
1. Currency Helpers: Implement formatINR(val) (e.g. ₹25,00,000) and formatCompactINR(val) (e.g. ₹25.0L / ₹6.6L).
2. Top 4 Metric Cards (CRITICAL: All numbers MUST use 'font-sans font-bold tabular-nums'):
   - Total Budget Cap: formatCompactINR(totalBudget) in font-sans text-3xl sm:text-4xl font-bold text-[#3a0208] leading-none tabular-nums (with 'Edit Cap' modal).
   - Recorded Spending: formatCompactINR(totalRecorded) in font-sans text-3xl sm:text-4xl font-bold text-[#6f0617] leading-none tabular-nums (with percentage utilization bar).
   - Uncommitted Runway: formatCompactINR(remainingBudget) in font-sans text-3xl sm:text-4xl font-bold text-emerald-700 leading-none tabular-nums.
   - Cash Flow Status: Paid vs Pending Vendor Dues breakdown.
3. Category Breakdown: Progress bars for Venue, Catering, Decor, Photography, Jewelry, and Logistics.
4. Expenditure Ledger:
   - Date badge: Month text on top, and Day number in font-sans text-lg font-bold text-[#4b030e] leading-none mt-0.5 tabular-nums.
   - Title, Vendor Name, Category, Payment Status (PAID, PENDING, ADVANCE_PAID).
   - Amount formatted in INR using 'font-sans text-2xl sm:text-3xl font-bold text-[#4b030e] leading-none tabular-nums'.
5. Add Expense modal supporting title, vendor, category, amount, payment method (UPI, NEFT, Cash), and notes.
```

---

### 🤖 Prompt #11: Vendor Directory & Contacts
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/vendors/VendorsPage.tsx following PRD § 7.9:
1. Grid of vendor cards with category icons (Camera for Photography, Utensils for Catering, Music for DJ, Flower for Decor, BookOpen for Pandit Ji).
2. Card fields: Business Name, Contact Person, Direct 'Call' button (tel:) and 'WhatsApp' button (wa.me), Total Contract Value (₹), Advance Paid, and Payment Stage badge.
3. Search bar and category filter tabs.
4. Add Vendor modal saving to localStorage.
```

---

### 🤖 Prompt #12: Wedding Website Studio & Theme Engine
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/website/WebsiteStudioPage.tsx matching PRD § 7.10:
1. Split-screen Studio: Left side editor controls, Right side Live Interactive Preview.
2. 3 Theme Selectors:
   - Royal Udaipur (Wine #4b030e & Gold #e6bd81)
   - Emerald Palace (Emerald #0d4a36 & Mint Gold)
   - Marigold Festive (Festive Ochre #b45309 & Amber)
3. Fields: Custom URL slug (/w/:slug), Welcome Headline, Love Story Letter, Attire guidance, Google Maps embed link, and Livestream URL.
4. 'Publish Website' toggle that activates the public route and saves settings.
```

---

### 🤖 Prompt #13: Photo Gallery & Moderation Queue
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/gallery/GalleryPage.tsx following PRD § 7.11:
1. Tab Bar: 'Live Moderation Queue' (with badge count) and 'Approved Royal Gallery'.
2. Moderation Queue: Cards of pending guest uploads with uploader name, caption, ceremony tag, and two buttons: 'Approve & Publish' and 'Reject & Discard'.
3. Approved Gallery: High-resolution masonry grid filtered by ceremony (Haldi, Sangeet, Pheras, Reception), with full-screen lightbox preview, 'Pin to Highlights' toggle, and high-res download button.
4. 'Simulate Guest Upload' button to easily test the moderation flow in front of students.
```

---

### 🤖 Prompt #14: Family Reception QR Check-In Desk
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/check-in/CheckInPage.tsx adhering to PRD § 7.13 and DBDD § 5.6:
1. Live Camera QR Scanner: Embed html5-qrcode inside a scanner viewport with camera flip and torch toggle.
2. 1-Click Test Scenarios (Essential for testing without a physical webcam):
   - Provide a quick test bar with buttons: "Test Valid Scan (Singhania Family)", "Test Duplicate Scan (Roy Chowdhury Clan)", and "Reset Scans".
3. Manual Family Lookup: Instant search input by family name or phone number connected to invitationStore.
4. Check-In Verification & Admission:
   - Displays family permitted attendee cap.
   - Stepper / dropdown for actual arriving headcount.
   - 'Check In Family' button: Updates invitationStore, synthesizes a celebratory two-tone royal chime via the browser Web Audio API (no external MP3 required), and fires canvas-confetti.
5. Duplicate Detection Warning (FR-CHECK-04): If a family was already checked in, trigger an amber alert banner ('Duplicate Entry Attempt') detailing who admitted them and the exact relative timestamp (e.g. 'Checked in 45 mins ago by Aisha Sharma').
6. Admission Slip Modal: Printable royal entry pass showing Family Name, Admitted Headcount, Timestamp, and Barcode.
```

---

### 🤖 Prompt #15: Team Members & Granular Permissions
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/members/MembersPage.tsx connected to src/services/membershipStore.ts:
1. Team Roster Table: Full Name, Email, Role (ADMIN vs ORGANIZER), Title, and Status.
2. Role & Permission Matrix:
   - For ORGANIZER: 8 interactive toggle switches for Events, Tasks, Guests, Check-In, Expenses, Vendors, Website, and Gallery.
   - For ADMIN: All permissions automatically locked to Enabled.
3. Last Admin Safety Invariant (FR-MEM-06): Prevent demoting or deleting the final remaining ADMIN, displaying a protective warning tooltip.
4. 'Invite Organizer' modal generating shareable registration link.
```

---

### 🤖 Prompt #16: Workspace Settings & Livestream Studio
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/settings/SettingsPage.tsx following PRD § 8.1 & § 7.12:
1. General Wedding Details: Bride & Groom names, Wedding Date picker (dynamically updates countdown across the app), City, and Custom URL slug.
2. Virtual Livestream Studio: YouTube/Vimeo video embed URL, 'Livestream is Active' badge toggle, and live player preview.
3. Audio Preferences: Toggle QR scanner audio chime feedback on/off.
4. 'Export Complete Wedding Backup': Generates and downloads a clean JSON file of the entire wedding state.
5. Danger Zone: 'Reset Workspace to Factory Settings' with confirmation modal.
```

---

## 💌 Step 6: Guest-Facing Experience & Marketing

---

### 🤖 Prompt #17: Guest Digital Pass & Intent-First RSVP (`/invite/:token`)
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/invite/GuestInvitePage.tsx matching PRD § 7.6 & § 7.13:
1. Read the :token route param and find the family via invitationStore (or publicApi).
2. Intent-First Royal Invitation Screen (Zero Initial QR Code!):
   - Display a regal royal invitation card featuring Bride & Groom names, Wedding Date, Venue, and warm ceremonial welcome note.
   - Present two clear, prominent intent buttons: "Joyfully Accept" and "Regretfully Decline".
   - CRITICAL REQUIREMENT: Do NOT display any QR code on initial load.
3. Interactive RSVP Form (On Clicking "Joyfully Accept"):
   - Attending Headcount selector (dropdown from 1 up to maxAttendees).
   - Dietary preferences (Strict Jain Vegetarian, Traditional Vegetarian, Halal, Vegan).
   - Optional ceremony attendance notes.
   - "Confirm My Attendance" submit button.
4. Unlock Digital Pass on Acceptance:
   - When confirmed (status = ATTENDING), hide redundant buttons and form fields.
   - Reveal the luxury digital gate admission pass featuring the scannable QR code generated via 'qrcode' library.
   - Display confirmed guest count and a direct button linking to the couple's public wedding website (`/w/:slug`) so guests can explore the full itinerary.
5. Gracious Decline Flow:
   - If "Regretfully Decline" is selected, transition to a warm, appreciative acknowledgment screen with zero QR pass.
```

---

### 🤖 Prompt #18: Public Wedding Website (`/w/:slug` & `/w/preview`)
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/public/PublicWeddingPage.tsx:
1. Dynamically update document title to "[Bride] & [Groom] Wedding | WeddingOS" for SEO and browser tabs.
2. Read active theme from website settings (Royal Udaipur wine/gold, Emerald Palace, or Marigold Festive).
3. Synchronized Ceremonies: Dynamically render the exact ceremonial events created in the Events module (/app/events) with dates, times, venues, and Google Maps links without manual duplication.
4. Sections:
   - Editorial Hero: Couple portrait, ceremonial title, and ticking countdown clock.
   - Couple Welcome Note & Love Story.
   - Ceremonies Schedule: Sequence cards with dates, timings, venues, and Google Maps links.
   - Traditional Dress Code Guide with attire palette swatches.
   - Virtual Livestream player (if enabled).
   - 'Share a Memory' button opening guest photo upload modal.
5. In WebsiteStudioPage.tsx, integrate automatic unique vanity slug generation (e.g. ananya-rohan-2026) with real-time debounced availability verification against GET /api/v1/public/w/:slug/available.
```

---

### 🤖 Prompt #19: Luxury Marketing Homepage & About Page
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/HomePage.tsx and apps/web/src/pages/AboutPage.tsx:
1. HomePage:
   - Hero Section: Editorial headline in font-cormorant, Clerk CTAs, and interactive floating phone mockup showing the digital RSVP pass.
   - Core Feature Showcase: Joint-family invitations, WhatsApp integration, QR check-in, and budget ledger.
   - Real Palace Wedding Testimonials.
   - Royal Pricing Tiers and FAQ accordion.
2. AboutPage: Explains WeddingOS product principles (Family-First, Frictionless Guest Experience, Privacy by Default, No False Automation).
```

---

### 🤖 Prompt #20: Royal 404 Page
**Copy & paste this prompt to Antigravity:**

```text
Build apps/web/src/pages/NotFoundPage.tsx:
1. Royal 404 display featuring a gold-crested badge with text "404".
2. Heading: "Page Not Found" in font-serif font-bold text-[#4b030e].
3. Message: "The link you opened may have been moved, expired, or does not exist. Please check the address or return home."
4. Button: "Return to Home" with Home icon redirecting to "/".
```

---

## 🔍 Step 7: Testing & Verification Checklist

Once you finish running all the prompts, run this verification routine:

### 1. Static Code Quality Check
In your terminal, run:
```bash
npx oxlint apps/web/src
```
**Expected Outcome**: Finished with **0 errors**.

### 2. Live Mobile Phone Test
1. Start your dev server: `npm run dev`
2. Check your terminal for the Network URL (e.g. `http://192.168.1.37:5173`).
3. Open that URL on your phone browser.
4. Try out the guest RSVP flow and experience the mobile-first luxury interface!

### 3. Complete End-to-End Test Loop
- [ ] **Onboarding**: Create a wedding for "Ananya & Kabir".
- [ ] **Events**: Confirm attendee counts (e.g. `220 Guests`) display in clean `font-sans font-bold tabular-nums`.
- [ ] **Invitations**: Open WhatsApp share modal for "The Singhania Family" and copy their link (`/invite/wos-singhania-8821`).
- [ ] **Guest RSVP**: In a new tab, open the guest link, confirm for 4 guests, and verify the live QR pass renders.
- [ ] **Check-In**: Go to `/app/check-in`, scan or click "Test Valid Scan", and verify the audio chime and admission slip.
- [ ] **Duplicate Protection**: Scan again and verify the amber duplicate warning alert fires.
- [ ] **Expenses**: Verify all currency numbers are in `font-sans font-bold tabular-nums`.
- [ ] **Members**: Confirm that deleting the primary Admin is safely blocked.

---

## 🎉 Congratulations!
You now have a 100% complete, visually stunning, enterprise-grade frontend application. You are ready to transition to the **Backend (Java 21, Spring Boot 3.3.4, Spring Data JPA, and MySQL 8.0)** phase following [`docs/BACKEND_SPRING_BOOT_GUIDE.md`](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/BACKEND_SPRING_BOOT_GUIDE.md) and [`docs/04-api-design.md`](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/04-api-design.md)!

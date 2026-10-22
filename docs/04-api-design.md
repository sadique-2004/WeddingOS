# WeddingOS — API Design & REST Endpoints Specification

> **Document ID:** `DOC-04`  
> **Status:** Approved Master API Specification (v1.1 Production Release)  
> **Base URL:** `/api/v1` | **Interactive Swagger UI:** `http://localhost:8080/swagger-ui.html`  
> **OpenAPI Specification JSON:** `http://localhost:8080/v3/api-docs`  
> **Client Implementation:** `apps/web/src/services/apiClient.ts`

---

## 1. Overview & Conventions

All endpoints adhere to REST conventions over HTTPS using JSON request and response payloads.
- **Protected Endpoints:** Require an `Authorization: Bearer <clerk_session_jwt>` header.
- **Public Guest Endpoints:** Unauthenticated; identified via high-entropy `invitationToken` or vanity `slug`.
- **Standard HTTP Codes:**
  - `200 OK`: Request succeeded.
  - `201 Created`: Resource successfully created.
  - `400 Bad Request`: Validation failure or business rule violation (e.g. Last Admin demotion).
  - `401 Unauthorized`: Missing or invalid Clerk JWT.
  - `403 Forbidden`: Insufficient module permission.
  - `404 Not Found`: Entity or token does not exist.
  - `409 Conflict`: Resource collision (e.g., requested slug already claimed by another wedding).
  - `500 Internal Server Error`: Unhandled application exception.

---

## 2. API Endpoints Catalog

### 2.1 Workspace & Dashboard Controller (`/workspaces`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/workspaces/active` | Bearer | Get current wedding overview, countdown, budget runway, and RSVP summary. Optional query params: `weddingId`, `userEmail`, `clerkUserId`, `userName`. |
| `GET` | `/workspaces/{weddingId}` | Bearer | Retrieve specific workspace by ID. |
| `POST` | `/workspaces` | Bearer | Create a new wedding workspace. Body: `{ "brideName": "Ananya", "groomName": "Rohan", "city": "Udaipur", "totalBudgetTarget": 3500000.00 }`. |
| `PUT` | `/workspaces/budget` | Bearer | Update total target budget ceiling. Query param: `?weddingId=...`. Body: `{ "totalBudgetTarget": 3500000.00 }`. |
| `PUT` | `/workspaces/details` | Bearer | Update couple names, date, city, venue, and vanity slug. Query param: `?weddingId=...`. |
| `POST` | `/workspaces/{id}/reset` | Bearer | Factory reset all workspace data to a clean blank slate (protected invariant). |

### 2.2 Ceremonial Events Controller (`/events`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/events` | Bearer | List all ceremonial functions for active wedding (`?weddingId=...`). Returns array sorted chronologically. |
| `POST` | `/events` | Bearer | Create new ceremonial event. Body: `{ "name": "Sangeet Night", "eventType": "SANGEET", "eventDate": "2026-12-17", "startTime": "19:00", "endTime": "23:30", "venueName": "Promenade Lawn", "dressCode": "Royal Velvet / Indo-Western", "mapUrl": "https://maps.google.com/..." }`. |
| `PUT` | `/events/{id}` | Bearer | Update event details, timings, dress code, or map URL. |
| `DELETE` | `/events/{id}` | Bearer | Remove event from wedding schedule. |

### 2.3 Family Invitations & RSVP Controller (`/invitations` & `/public/invite`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/invitations` | Bearer | List all family invitation cards, guest allocations, RSVP statuses, and check-in states. |
| `POST` | `/invitations` | Bearer | Create a new family invitation. Automatically generates 32-char unguessable token. Body: `{ "displayName": "The Kapoor Family", "headOfFamilyName": "Rajesh Kapoor", "phoneNumber": "+919876543210", "totalGuestsInvited": 4 }`. |
| `PUT` | `/invitations/{id}` | Bearer | Update household details, contact phone, or allocated headcount. |
| `DELETE` | `/invitations/{id}` | Bearer | Delete invitation card with database persistence. |
| `GET` | `/public/invite/{token}` | **Public** | **Zero-Auth Guest Portal**: Returns `PublicInvitationView` containing household display name, max attendees, RSVP status, bride & groom names, wedding date, city, venue, and vanity slug. *(Displays invitation card with zero initial QR code)*. |
| `POST` | `/public/invite/{token}/rsvp` | **Public** | **Intent-First RSVP Submission**: Body: `{ "rsvpStatus": "ATTENDING", "actualAttendees": 4, "dietaryNotes": "Jain Vegetarian" }`. *(On acceptance, unlocks scannable QR code pass)*. |

### 2.4 QR Reception Check-In Controller (`/check-in`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/check-in/verify/{token}` | Bearer | Verify scanned QR code pass. Returns invitation details, allocated count, and duplicate check-in warning state. |
| `POST` | `/check-in/confirm` | Bearer | Record arrival of family. Body: `{ "invitationToken": "abc123token...", "actualGuestsArrived": 4, "scannedBy": "Front Desk Host" }`. Logs to `check_in_logs`. |
| `GET` | `/check-in/logs` | Bearer | View arrival audit trail with timestamps and attendance counts. |

### 2.5 Preparation Tasks Controller (`/tasks`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/tasks` | Bearer | Fetch Kanban checklist items. Sorted by status and priority. |
| `POST` | `/tasks` | Bearer | Create checklist item. Body: `{ "title": "Finalize Mandap Floral Decor", "category": "Decor", "priority": "CRITICAL", "dueDate": "2026-11-30" }`. |
| `PUT` | `/tasks/{id}` | Bearer | Update title, description, category, priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), or status (`TODO`, `IN_PROGRESS`, `COMPLETED`). |
| `PATCH` | `/tasks/{id}/status` | Bearer | Drag-and-drop column transition. Body: `{ "status": "COMPLETED" }`. |
| `DELETE` | `/tasks/{id}` | Bearer | Remove task from checklist. |

### 2.6 Budget & Expense Ledger Controller (`/expenses`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/expenses` | Bearer | Fetch itemized expenses ledger and computed summary totals (total budget, actual spent, advance paid, runway). |
| `POST` | `/expenses` | Bearer | Record expense voucher. Body: `{ "category": "Catering", "itemName": "Royal Rajasthani Banquet", "plannedAmount": 800000, "actualAmount": 850000, "advancePaid": 300000, "paymentStatus": "ADVANCE_PAID", "vendorId": 1 }`. |
| `PUT` | `/expenses/{id}` | Bearer | Update transaction amounts, vendor linkages, or payment status. |
| `DELETE` | `/expenses/{id}` | Bearer | Delete expense record with real-time recalculation of runway. |

### 2.7 Vendor Directory Controller (`/vendors`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/vendors` | Bearer | List all hired vendors, categories, contact phone numbers, and quotation ledgers. |
| `POST` | `/vendors` | Bearer | Add vendor. Body: `{ "vendorName": "Shutterbug Studios", "category": "Photography", "contactPerson": "Amit", "phoneNumber": "+919812345678", "quotedAmount": 250000, "advancePaid": 100000 }`. |
| `PUT` | `/vendors/{id}` | Bearer | Update vendor contact info, category, quotation, or advance amount. |
| `DELETE` | `/vendors/{id}` | Bearer | Remove vendor from directory. |

### 2.8 Wedding Website & Public Portal (`/website` & `/public/w`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/website/config` | Bearer | Fetch current theme (`CLASSIC_INDIAN`, `MINIMAL_ELEGANT`, `MODERN_CELEBRATION`), visibility toggles, livestream URL, and custom copy. |
| `PUT` | `/website/config` | Bearer | Update studio settings. Body: `{ "themeKey": "CLASSIC_INDIAN", "welcomeHeadline": "Together with our families...", "welcomeMessage": "With the blessings of our elders...", "isPublished": true, "showSchedule": true, "showDressCode": true, "showVenues": true, "showLivestream": false }`. |
| `GET` | `/public/w/{slug}/available` | **Public** | **Real-Time Slug Availability & Conflict Check**: Query: `?weddingId=...`. Returns `{ "available": true, "slug": "ananya-rohan-2026", "isCurrent": false }`. Returns `409 Conflict` if claimed by another wedding. |
| `GET` | `/public/w/{slug}` | **Public** | **Public Wedding Portal**: Returns couple details, active theme, synchronized ceremony sequence, dress codes, venues, and livestream. |
| `GET` | `/public/w/{slug}/gallery` | **Public** | Public photo stream of approved guest memories. |
| `POST` | `/public/w/{slug}/gallery/upload-file` | **Public** | Guest photo upload via `multipart/form-data` (file, caption, uploaderName). Streamed to Cloudinary with status `PENDING`. |

### 2.9 Photo Gallery & Moderation Controller (`/gallery`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/gallery` | Bearer | Fetch all photos for active wedding. |
| `GET` | `/gallery/moderation` | Bearer | Fetch organizer moderation queue of unapproved photos awaiting review. |
| `POST` | `/gallery/upload-file` | Bearer | Organizer direct photo upload with optional ceremony tags. |
| `POST` | `/gallery/{id}/moderate` | Bearer | Moderate photo. Body: `{ "status": "APPROVED" }` or `{ "status": "REJECTED" }`. |
| `DELETE` | `/gallery/{id}` | Bearer | Permanently delete photo. |

### 2.10 Team Roles & Memberships Controller (`/members`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/members` | Bearer | List wedding organizers and assigned permission flags. |
| `POST` | `/members/invite` | Bearer | Invite co-organizer. Body: `{ "email": "cousin.raj@gmail.com", "role": "ORGANIZER", "title": "Guest Relations Lead" }`. |
| `PUT` | `/members/{id}/role` | Bearer | Update role (ADMIN vs ORGANIZER). Enforces **Last-Admin Protection** (cannot demote sole admin). |
| `PUT` | `/members/{id}/permissions` | Bearer | Update 8-module permission matrix flags. |
| `DELETE` | `/members/{id}` | Bearer | Remove organizer. Enforces **Last-Admin Protection** (cannot delete sole admin). |

---

## 3. Frontend Client Integration (`apiClient.ts`)

The frontend interacts with these endpoints via typed service wrappers defined in `apps/web/src/services/apiClient.ts`:
- `workspacesApi`: Active workspace summary, budget ceiling, couple details, and reset.
- `eventsApi`: Ceremonial itinerary listing, creation, and deletion.
- `invitationsApi`: Household list, token dispatch, and WhatsApp generation.
- `publicApi`: Zero-auth public invitation views, two-stage RSVP submissions, public website slug validation, and guest gallery uploads.
- `checkInApi`: Real-time camera QR scanning, verification, and gate arrival logging.
- `tasksApi`: Drag-and-drop Kanban state transitions and priority toggles.
- `expensesApi`: Itemized transactions, planned vs actual ledger calculations, and runway.
- `vendorsApi`: Vendor contacts, contract quotation ledgers, and advance payments.
- `websiteApi`: Theme selection, live website preview, and slug availability verification.
- `galleryApi`: Direct file uploads to Cloudinary and organizer moderation queues.
- `membersApi`: Team roster, role promotions, and 8-module permission flags.

All client requests include automated Bearer token attachment via Clerk, a 10-second `AbortController` timeout, and optimistic `localStorage` cache synchronization.

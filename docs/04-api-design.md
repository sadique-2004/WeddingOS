# WeddingOS — API Design & REST Endpoints Specification

> **Document ID:** `DOC-04`  
> **Status:** Implemented Production API  
> **Base URL:** `/api/v1` | **Interactive Swagger UI:** `http://localhost:8080/swagger-ui.html`  
> **OpenAPI Specification JSON:** `http://localhost:8080/v3/api-docs`  
> **Reference File:** Original `docs/API_DESIGN.md` | Client Implementation: `apps/web/src/services/apiClient.ts`

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
  - `500 Internal Server Error`: Unhandled application exception.

---

## 2. API Endpoints Catalog

### 2.1 Workspace & Dashboard Controller (`/workspaces`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/workspaces/active` | Bearer | Get current wedding overview, countdown, budget runway, and RSVP summary. Optional query params: `weddingId`, `userEmail`, `clerkUserId`, `userName`. |
| `PUT` | `/workspaces/budget` | Bearer | Update total target budget ceiling. Body: `{ "totalBudgetTarget": 3500000.00 }`. |
| `PUT` | `/workspaces/details` | Bearer | Update bride, groom, wedding date, city, venue, and slug. Body: `{ "brideName": "Ananya", "groomName": "Rohan", "weddingDate": "2026-12-18", "city": "Udaipur", "venueName": "The Oberoi Udaivilas", "slug": "ananya-rohan" }`. |
| `POST` | `/workspaces/{id}/reset` | Bearer | Factory reset all workspace data to a clean blank slate. |

### 2.2 Ceremonial Events Controller (`/events`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/events` | Bearer | List all ceremonial functions for wedding. Returns array sorted chronologically. |
| `POST` | `/events` | Bearer | Create new ceremonial event. Body: `{ "name": "Sangeet Night", "eventType": "SANGEET", "eventDate": "2026-12-17", "startTime": "19:00", "endTime": "23:30", "venueName": "Promenade Lawn", "dressCode": "Royal Velvet / Indo-Western", "mapUrl": "https://maps.google.com/..." }`. |
| `PUT` | `/events/{id}` | Bearer | Update event details, timings, dress code, or map URL. |
| `DELETE` | `/events/{id}` | Bearer | Remove event from wedding schedule. |

### 2.3 Family Invitations & RSVP Controller (`/invitations`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/invitations` | Bearer | List all family invitation cards, guest allocations, RSVP statuses, and check-in states. |
| `POST` | `/invitations` | Bearer | Create a new family invitation. Automatically generates 32-char unguessable token. Body: `{ "displayName": "The Kapoor Family", "headOfFamilyName": "Rajesh Kapoor", "phoneNumber": "+919876543210", "totalGuestsInvited": 4 }`. |
| `PUT` | `/invitations/{id}` | Bearer | Update household details or allocated headcount. |
| `DELETE` | `/invitations/{id}` | Bearer | Delete invitation card. |
| `GET` | `/invitations/public/{token}` | **Public** | Guest portal access. Returns personalized invitation card, ceremony details, and current RSVP status. |
| `PUT` | `/invitations/public/{token}/rsvp` | **Public** | Guest submits RSVP. Body: `{ "totalAttending": 3, "dietaryNotes": "Jain Vegetarian", "rsvpStatus": "CONFIRMED" }`. |

### 2.4 QR Reception Check-In Controller (`/check-in`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/check-in/verify/{token}` | Bearer | Verify scanned QR code pass. Returns invitation details, allocated count, and whether already checked in. |
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

### 2.6 Budget & Expense Controller (`/expenses`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/expenses` | Bearer | Fetch itemized expenses ledger and computed summary totals. |
| `POST` | `/expenses` | Bearer | Record expense. Body: `{ "category": "Catering", "itemName": "Royal Rajasthani Banquet", "plannedAmount": 800000, "actualAmount": 850000, "advancePaid": 300000, "paymentStatus": "ADVANCE_PAID" }`. |
| `PUT` | `/expenses/{id}` | Bearer | Update transaction amounts or payment status. |
| `DELETE` | `/expenses/{id}` | Bearer | Delete expense record. |

### 2.7 Vendor Directory Controller (`/vendors`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/vendors` | Bearer | List all hired vendors, categories, contact phone numbers, and quotation ledgers. |
| `POST` | `/vendors` | Bearer | Add vendor. Body: `{ "vendorName": "Shutterbug Studios", "category": "Photography", "contactPerson": "Amit", "phoneNumber": "+919812345678", "quotedAmount": 250000, "advancePaid": 100000 }`. |
| `PUT` | `/vendors/{id}` | Bearer | Update vendor contact or ledger. |
| `DELETE` | `/vendors/{id}` | Bearer | Remove vendor. |

### 2.8 Wedding Website Controller (`/website`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/website/config` | Bearer | Fetch current theme, visibility toggles, livestream URL, and custom copy. |
| `PUT` | `/website/config` | Bearer | Update studio settings. Body: `{ "themeKey": "CLASSIC_INDIAN", "welcomeHeadline": "Together with our families...", "welcomeMessage": "With the blessings of our elders...", "isPublished": true, "showSchedule": true, "showDressCode": true, "showVenues": true, "showLivestream": false, "livestreamUrl": "" }`. |
| `GET` | `/website/public/{slug}` | **Public** | Public guest-facing website. Returns couple details, ceremonies, dress codes, venues, and livestream. |

### 2.9 Gallery & Moderation Controllers (`/gallery` & `/public/gallery`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `POST` | `/public/gallery/{token}/upload` | **Public** | Guest photo upload via `multipart/form-data` (file + optional caption). Streams to Cloudinary; saved as `PENDING`. |
| `GET` | `/public/gallery/{token}` | **Public** | Public guest gallery. Returns array of `APPROVED` photos. |
| `GET` | `/gallery/pending` | Bearer | Organizer moderation queue of photos awaiting review. |
| `PUT` | `/gallery/{id}/approve` | Bearer | Approve photo to appear in public gallery. |
| `DELETE` | `/gallery/{id}` | Bearer | Reject/delete inappropriate photo. |

### 2.10 Team Roles & Memberships Controller (`/members`)
| Method | Endpoint | Auth | Purpose & Payload |
|---|---|---|---|
| `GET` | `/members` | Bearer | List wedding organizers and assigned permission flags. |
| `POST` | `/members` | Bearer | Invite co-organizer. Body: `{ "email": "cousin.raj@gmail.com", "role": "ORGANIZER", "title": "Guest Relations Lead" }`. |
| `PUT` | `/members/{id}/permissions` | Bearer | Update 8-module permission matrix. |
| `DELETE` | `/members/{id}` | Bearer | Remove organizer. Enforces **Last-Admin Protection** (cannot delete only admin). |

---

## 3. Frontend Client Integration (`apiClient.ts`)

The frontend interacts with these endpoints via typed service wrappers defined in `apps/web/src/services/apiClient.ts`:
- `workspacesApi`
- `eventsApi`
- `invitationsApi`
- `checkInApi`
- `tasksApi`
- `expensesApi`
- `vendorsApi`
- `websiteApi`
- `galleryApi`
- `membersApi`

Every call enforces a 10-second timeout and synchronizes optimistically with `localStorage` for offline resilience.

# WeddingOS — API Design Document

**Document version:** 1.0  
**Status:** Proposed MVP contract for review  
**API style:** REST over HTTPS, JSON  
**Backend:** Java + Spring Boot + Spring Security  
**Authentication:** Clerk-issued JWT, validated by the backend  
**Database:** MySQL via Spring Data JPA / Hibernate  
**Related documents:** `PRD.md`, `SYSTEM_DESIGN.md`, `DBDD.md`

---

## 1. Purpose and Source of Truth

This document defines the proposed HTTP API contract for the WeddingOS MVP: route structure, authorization, request/response conventions, validation, error handling, and endpoint inventory.

- `PRD.md` is authoritative for product scope and behavior.
- `SYSTEM_DESIGN.md` defines component architecture and cross-cutting concerns.
- `DBDD.md` defines relational storage and data integrity.
- This document defines the external API contract. It must not introduce features excluded by the PRD.

Endpoint paths and payloads below are a proposed baseline. Review them before implementation and keep the frontend, backend tests, and API documentation in sync.

## 2. MVP Scope Reflected in This API

Included API capabilities:

- Current user profile and wedding workspace onboarding
- Wedding workspace details and organizer memberships
- Events and preparation tasks
- Family-based invitations, event assignment, RSVP, and wedding-wide family check-in
- Expense tracking and vendor contacts
- Public wedding website configuration and publication
- Guest gallery access, uploads, and organizer moderation
- External livestream configuration
- Organizer invitations persisted before invitees sign up

Explicitly out of scope:

- Individual guest accounts or individual family-member records
- WhatsApp/SMS delivery APIs or automated messaging
- Real-time notifications or WebSockets
- Parking, seating, accommodation, transport coordination
- Vendor accounts, vendor marketplace, payment processing
- Vendor-to-event associations in the MVP
- A separate RSVP history log

## 3. API Conventions

### 3.1 Base URL and versioning

Use a configurable base URL. Proposed local example:

```text
http://localhost:8080/api/v1
```

Production must use HTTPS. Keep the `/api/v1` prefix for all application API routes. Public website and guest-link routes are still API endpoints and should remain versioned.

### 3.2 Content types

- Requests with JSON bodies: `Content-Type: application/json`
- JSON responses: `Content-Type: application/json`
- Photo upload: `multipart/form-data` for the initial MVP implementation, unless a direct-to-object-storage upload flow is selected during storage design.
- Do not return storage credentials, raw object-store keys, or permanent public object URLs to guests.

### 3.3 IDs and timestamps

- Internal IDs are numeric identifiers represented as JSON numbers in the initial API contract.
- Timestamps are ISO 8601 UTC strings, for example `2026-10-15T10:30:00Z`.
- Date-only values use `YYYY-MM-DD`.
- Local event times use `HH:mm:ss` and are interpreted in the wedding's local context; do not silently convert date/time-only fields to UTC timestamps.
- Money is returned as a decimal number plus a currency code. Clients must not use binary floating-point arithmetic for financial calculations where exactness matters.

### 3.4 Naming

- JSON properties use `camelCase`.
- Enum values are uppercase strings, such as `ATTENDING`, `PENDING`, `ADMIN`, and `ORGANIZER`.
- Request and response DTOs are separate from JPA entities. Never serialize database entities directly.
- Write operations should return the created or updated representation unless the endpoint specifies `204 No Content`.

### 3.5 Pagination, sorting, and filtering

For list endpoints that may grow, support:

```text
?page=0&size=20&sort=createdAt,desc
```

Defaults: `page=0`, `size=20`; maximum `size=100`. Reject unsupported sort fields rather than passing client input directly into database query construction. Response shape:

```json
{
  "items": [],
  "page": 0,
  "size": 20,
  "totalItems": 0,
  "totalPages": 0
}
```

Simple bounded lists may omit pagination only when the endpoint is inherently small (for example, a small theme catalogue).

## 4. Authentication and Authorization

### 4.1 Authentication flow

1. The frontend signs in through Clerk.
2. The frontend sends the Clerk-issued access token as `Authorization: Bearer <token>`.
3. Spring Security validates the token's signature and required claims using the supported Clerk JWT/JWKS configuration.
4. The backend maps the verified Clerk subject to `app_users.clerk_user_id` and resolves the internal user.
5. Each protected request checks membership and the required permission for the target wedding.

The backend must not trust a user ID, role, wedding ID, or permission set supplied only by the client. A valid JWT proves identity, not authorization to access a particular wedding.

### 4.2 Route access classes

| Access class | Required access |
|---|---|
| Authenticated | Valid Clerk JWT and internal user mapping |
| Wedding organizer | Authenticated user with active membership in the target wedding and required module permission |
| Wedding Admin | Active `ADMIN` membership; used for membership and role administration |
| Public website | Published website only; no organizer JWT required |
| Guest invitation link | Valid, non-revoked family invitation token; token grants invitation-specific access only |
| Guest gallery link | Valid, non-revoked stable gallery token; grants gallery-specific guest access only |

### 4.3 Module permissions

The product supports `ADMIN` and `ORGANIZER` roles and configurable module permissions. Define a central permission policy rather than scattering role checks throughout controllers. Suggested module keys (to be aligned with the final System Design) are `WEDDING`, `EVENTS`, `GUESTS`, `TASKS`, `BUDGET`, `VENDORS`, `WEBSITE`, `GALLERY`, `LIVESTREAM`, and `ORGANIZERS`.

- Admins can manage organizer membership and roles.
- Organizers can only perform operations allowed by their effective module permissions.
- Never allow an organizer to grant themselves additional permissions.
- Protect the last-Admin invariant transactionally.
- Every resource query and mutation must be scoped to the authorized wedding.

### 4.4 Token handling

- Never log Clerk bearer tokens, invitation tokens, or gallery tokens.
- Store only token digests in the database where specified by DBDD.
- Guest tokens must be high entropy, revocable, and limited to the specific guest resource.
- Do not put organizer credentials or privileged data in guest-link responses.

## 5. Standard Response and Error Format

### 5.1 Success responses

Single resource:

```json
{
  "data": {
    "id": 42,
    "name": "Mehndi"
  }
}
```

List response uses the pagination envelope defined above. For a `204 No Content` response, return no body.

### 5.2 Error response

Use a consistent error envelope based on RFC 9457 Problem Details, with stable application fields:

```json
{
  "type": "about:blank",
  "title": "Validation failed",
  "status": 400,
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/weddings/42/events",
  "code": "VALIDATION_ERROR",
  "fieldErrors": [
    {
      "field": "name",
      "code": "NotBlank",
      "message": "Name is required."
    }
  ],
  "traceId": "request-correlation-id"
}
```

`fieldErrors` may be omitted when not relevant. Never expose stack traces, SQL, secrets, raw tokens, internal object keys, or sensitive personal data in error responses.

### 5.3 HTTP status conventions

| Status | Use |
|---|---|
| `200 OK` | Successful read or update with representation |
| `201 Created` | Resource created; include `Location` where useful |
| `204 No Content` | Successful deletion or action with no representation |
| `400 Bad Request` | Malformed JSON, invalid query parameter, or validation failure |
| `401 Unauthorized` | Missing, invalid, expired, or unverifiable authentication token |
| `403 Forbidden` | Authenticated user lacks permission |
| `404 Not Found` | Resource absent; also use when disclosure of existence would be unsafe |
| `409 Conflict` | Duplicate slug, conflicting state, or invalid state transition |
| `413 Payload Too Large` | Upload exceeds configured limit |
| `415 Unsupported Media Type` | Unsupported upload/content type |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Unexpected server failure; generic client message only |

## 6. Endpoint Inventory

`{weddingId}`, `{eventId}`, and similar path variables refer to internal resource IDs. All organizer routes must enforce wedding-level authorization even if a nested ID is supplied.

### 6.1 Health and current user

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/health` | Public/infra policy | Liveness check; return minimal status only |
| `GET` | `/api/v1/me` | Authenticated | Current internal user profile and accessible workspace summary |
| `PATCH` | `/api/v1/me` | Authenticated | Update editable profile fields, if profile editing is in MVP |

Do not return secrets or raw JWT claims wholesale from `/me`.

### 6.2 Wedding workspace

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/v1/weddings` | Authenticated | Create workspace and initial Admin membership transactionally |
| `GET` | `/api/v1/weddings` | Authenticated | List workspaces available to the current user; normally zero or one in MVP |
| `GET` | `/api/v1/weddings/{weddingId}` | Wedding organizer | Read workspace details |
| `PATCH` | `/api/v1/weddings/{weddingId}` | Wedding permission | Update wedding details |
| `DELETE` | `/api/v1/weddings/{weddingId}` | Admin, subject to retention policy | Deletion workflow; do not implement hard deletion until policy is finalized |

Proposed create request:

```json
{
  "title": "Aisha and Imran's Wedding",
  "brideName": "Aisha",
  "groomName": "Imran",
  "weddingDate": "2027-02-18",
  "locationName": "Bengaluru",
  "description": "We look forward to celebrating with you."
}
```

The server derives the creator from the verified identity and creates their `ADMIN` membership. It must not accept `createdByUserId` or a client-selected role as trusted values.

### 6.3 Organizer memberships and invitations

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/weddings/{weddingId}/members` | Admin or allowed organizer permission | List current members |
| `PATCH` | `/api/v1/weddings/{weddingId}/members/{membershipId}` | Admin | Change role or configured permissions |
| `DELETE` | `/api/v1/weddings/{weddingId}/members/{membershipId}` | Admin | Remove member, unless this would remove/demote the last Admin |
| `POST` | `/api/v1/weddings/{weddingId}/organizer-invitations` | Admin | Persist pending invitation before signup |
| `GET` | `/api/v1/weddings/{weddingId}/organizer-invitations` | Admin | List invitations |
| `POST` | `/api/v1/organizer-invitations/accept` | Authenticated invitee | Accept an invitation after identity and invitee match are verified |
| `POST` | `/api/v1/weddings/{weddingId}/organizer-invitations/{invitationId}/revoke` | Admin | Revoke pending invitation |

The invitation lifecycle is: `PENDING` → `ACCEPTED`, or `PENDING` → `REVOKED`/`EXPIRED`. Persist pending invitations before the invitee has an account. Acceptance must be idempotent and transactional: verify invitation token/status/expiry, verify the authenticated account matches the intended invitee, create or activate the membership, then mark the invitation accepted. Never create a placeholder `app_users` row solely to reserve an invitation.

The exact email delivery mechanism is not part of this API contract; do not add an automated email/WhatsApp provider dependency without approval.

### 6.4 Wedding events

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/weddings/{weddingId}/events` | Events permission | List events, sorted by date/time |
| `POST` | `/api/v1/weddings/{weddingId}/events` | Events write permission | Create event |
| `GET` | `/api/v1/weddings/{weddingId}/events/{eventId}` | Events permission | Read event |
| `PATCH` | `/api/v1/weddings/{weddingId}/events/{eventId}` | Events write permission | Update event |
| `DELETE` | `/api/v1/weddings/{weddingId}/events/{eventId}` | Events write permission | Delete event after reference checks |

Validate `endTime` is later than `startTime` when both are provided. Event IDs must belong to the path's wedding. When deleting an event, follow DBDD reference/deletion rules and return `409` if the operation cannot safely proceed.

### 6.5 Preparation tasks

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/weddings/{weddingId}/tasks` | Tasks permission | List/filter tasks |
| `POST` | `/api/v1/weddings/{weddingId}/tasks` | Tasks write permission | Create task |
| `GET` | `/api/v1/weddings/{weddingId}/tasks/{taskId}` | Tasks permission | Read task |
| `PATCH` | `/api/v1/weddings/{weddingId}/tasks/{taskId}` | Tasks write permission | Update task/status/assignment |
| `DELETE` | `/api/v1/weddings/{weddingId}/tasks/{taskId}` | Tasks write permission | Delete task |

Suggested filters: `status`, `priority`, `assignedToMe`, and `dueBefore`. Assignee and related event must belong to the same wedding. Accept only the DBDD-supported status and priority values.

### 6.6 Family invitations, RSVP, and check-in

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/weddings/{weddingId}/family-invitations` | Guests permission | List/search family invitation groups |
| `POST` | `/api/v1/weddings/{weddingId}/family-invitations` | Guests write permission | Create family invitation and token |
| `GET` | `/api/v1/weddings/{weddingId}/family-invitations/{invitationId}` | Guests permission | Read invitation details |
| `PATCH` | `/api/v1/weddings/{weddingId}/family-invitations/{invitationId}` | Guests write permission | Update contact/details/attendee cap |
| `DELETE` | `/api/v1/weddings/{weddingId}/family-invitations/{invitationId}` | Guests write permission | Revoke/delete invitation according to retention policy |
| `PUT` | `/api/v1/weddings/{weddingId}/family-invitations/{invitationId}/events` | Guests write permission | Replace event assignments for the invitation |
| `POST` | `/api/v1/weddings/{weddingId}/family-invitations/{invitationId}/check-in` | Check-in permission | Check in the family once for the entire wedding |
| `POST` | `/api/v1/guest-invitations/resolve` | Guest invitation token | Resolve the token to a minimal guest-safe invitation summary |
| `PUT` | `/api/v1/guest-invitations/rsvp` | Guest invitation token | Update the latest RSVP state |

Proposed RSVP request:

```json
{
  "rsvpStatus": "ATTENDING",
  "attendeeCount": 4
}
```

RSVP rules:
- Only `PENDING`, `ATTENDING`, and `NOT_ATTENDING` are valid statuses.
- `attendeeCount` must be between zero and `maxAttendees`.
- `PENDING` and `NOT_ATTENDING` require `attendeeCount: 0`.
- The latest RSVP overwrites the previous state; do not create an RSVP history resource/table.
- Token resolution must not expose organizer notes, private contact data, or other family invitations.
- A revoked or invalid invitation token must not allow reads or RSVP changes.

Check-in is wedding-wide, not event-specific. The first valid request records the timestamp and authenticated organizer. A repeated request should return a stable `409 CHECK_IN_ALREADY_RECORDED` response or an idempotent success representation; choose one convention and apply it consistently. Recommended behavior: return `200` with `alreadyCheckedIn: true` so scanning retries do not appear as system failures.

### 6.7 Expenses

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/weddings/{weddingId}/expenses` | Budget permission | List/filter expenses |
| `POST` | `/api/v1/weddings/{weddingId}/expenses` | Budget write permission | Create expense |
| `GET` | `/api/v1/weddings/{weddingId}/expenses/{expenseId}` | Budget permission | Read expense |
| `PATCH` | `/api/v1/weddings/{weddingId}/expenses/{expenseId}` | Budget write permission | Update expense |
| `DELETE` | `/api/v1/weddings/{weddingId}/expenses/{expenseId}` | Budget write permission | Delete expense |
| `GET` | `/api/v1/weddings/{weddingId}/budget-summary` | Budget permission | Return totals and category breakdown |

Suggested filters: `category`, `fromDate`, `toDate`, and `vendorContactId`. The summary must be computed from authorized wedding data on the server. Validate that related event and vendor IDs belong to the same wedding. Do not add payment-processing behavior.

### 6.8 Vendor contacts

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/weddings/{weddingId}/vendors` | Vendors permission | List/search vendor contacts |
| `POST` | `/api/v1/weddings/{weddingId}/vendors` | Vendors write permission | Create vendor contact |
| `GET` | `/api/v1/weddings/{weddingId}/vendors/{vendorId}` | Vendors permission | Read vendor contact |
| `PATCH` | `/api/v1/weddings/{weddingId}/vendors/{vendorId}` | Vendors write permission | Update vendor contact |
| `DELETE` | `/api/v1/weddings/{weddingId}/vendors/{vendorId}` | Vendors write permission | Delete vendor contact subject to expense references |

There is no vendor-to-event endpoint or association in the MVP. Vendors may be referenced by expenses.

### 6.9 Wedding website

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/weddings/{weddingId}/website` | Website permission | Read website configuration |
| `PUT` | `/api/v1/weddings/{weddingId}/website` | Website write permission | Create or replace website configuration |
| `POST` | `/api/v1/weddings/{weddingId}/website/publish` | Website publish permission | Publish website |
| `POST` | `/api/v1/weddings/{weddingId}/website/unpublish` | Website publish permission | Unpublish website |
| `GET` | `/api/v1/public/weddings/{slug}` | Public | Read published website content by slug |
| `GET` | `/api/v1/public/wedding-themes` | Public | List the three supported themes |

Supported `themeKey` values: `CLASSIC_INDIAN`, `MINIMAL_ELEGANT`, `MODERN_CELEBRATION`. Public endpoint responses must contain only publishable content and approved event details. An unpublished website must not be returned as public content. Slugs must be normalized and unique; collisions return `409 SLUG_ALREADY_EXISTS`.

### 6.10 Gallery and photo moderation

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/weddings/{weddingId}/gallery` | Gallery permission | Read gallery configuration |
| `PATCH` | `/api/v1/weddings/{weddingId}/gallery` | Gallery write permission | Enable/disable gallery or guest uploads |
| `POST` | `/api/v1/weddings/{weddingId}/gallery/link/rotate` | Admin or gallery security permission | Revoke old stable link and create a new one |
| `GET` | `/api/v1/guest-gallery/{token}` | Guest gallery token | List approved photos only |
| `POST` | `/api/v1/guest-gallery/{token}/photos` | Guest gallery token | Upload a photo for moderation |
| `GET` | `/api/v1/weddings/{weddingId}/gallery/photos` | Gallery moderation permission | List photos by moderation status |
| `POST` | `/api/v1/weddings/{weddingId}/gallery/photos/{photoId}/approve` | Gallery moderation permission | Approve photo |
| `POST` | `/api/v1/weddings/{weddingId}/gallery/photos/{photoId}/reject` | Gallery moderation permission | Reject photo |
| `DELETE` | `/api/v1/weddings/{weddingId}/gallery/photos/{photoId}` | Gallery moderation permission | Remove photo from gallery |

Gallery rules:
- One stable guest-facing link is used for both viewing and upload entry.
- A valid gallery token does not grant organizer access.
- Guest listing returns `APPROVED` photos only.
- Guest uploads are accepted only when the gallery is enabled and `uploadsEnabled` is true.
- New uploads start in `PENDING` status and are not visible to guests until approved.
- Validate actual file content, allowed image formats, file size, and upload rate; do not trust filename or client-provided MIME type.
- Use private object storage and controlled/short-lived delivery URLs where needed. Never expose permanent storage credentials.
- Link rotation invalidates the previous token for both viewing and upload.
- The exact upload-size limit, format allowlist, retention, and object-storage provider remain open decisions and must be configuration-driven until finalized.

### 6.11 Livestream

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/weddings/{weddingId}/livestream` | Livestream permission | Read configured external livestream details |
| `PUT` | `/api/v1/weddings/{weddingId}/livestream` | Livestream write permission | Create/update external livestream configuration |
| `DELETE` | `/api/v1/weddings/{weddingId}/livestream` | Livestream write permission | Remove configuration |
| `GET` | `/api/v1/public/weddings/{slug}/livestream` | Public, if published for public display | Return only the approved public livestream link/details |

This feature integrates an external livestream URL/provider. WeddingOS does not host or process the livestream itself. Validate URL scheme and supported provider rules before publication.

## 7. Representative DTO Contracts

These are examples, not exhaustive generated schemas.

### 7.1 Event creation

Request:

```json
{
  "name": "Mehndi",
  "eventDate": "2027-02-16",
  "startTime": "17:00:00",
  "endTime": "21:00:00",
  "venueName": "Garden Hall",
  "address": "Bengaluru",
  "description": "Mehndi ceremony",
  "dressCode": "Festive attire",
  "mapUrl": "https://maps.example/venue",
  "sortOrder": 1
}
```

Response:

```json
{
  "data": {
    "id": 101,
    "weddingId": 42,
    "name": "Mehndi",
    "eventDate": "2027-02-16",
    "startTime": "17:00:00",
    "endTime": "21:00:00",
    "venueName": "Garden Hall",
    "address": "Bengaluru",
    "description": "Mehndi ceremony",
    "dressCode": "Festive attire",
    "mapUrl": "https://maps.example/venue",
    "sortOrder": 1,
    "createdAt": "2026-10-15T10:30:00Z",
    "updatedAt": "2026-10-15T10:30:00Z"
  }
}
```

### 7.2 Family invitation creation

Request:

```json
{
  "displayName": "Khan Family",
  "primaryContactName": "Rahim Khan",
  "phoneNumber": "+91XXXXXXXXXX",
  "email": null,
  "maxAttendees": 5,
  "eventIds": [101, 102],
  "organizerNotes": "Call before the event"
}
```

Response should include invitation details for the organizer and the guest-facing share URL once the token has been generated. The raw token should be returned only when needed to construct/share the link; store only its digest, avoid logging it, and do not include it in subsequent ordinary list responses.

### 7.3 Expense creation

Request:

```json
{
  "title": "Photography advance",
  "amount": 15000.00,
  "currencyCode": "INR",
  "expenseDate": "2026-10-15",
  "category": "PHOTOGRAPHY",
  "relatedEventId": 101,
  "vendorContactId": 205,
  "notes": "Advance payment recorded manually"
}
```

This records an expense only. It does not initiate a payment.

### 7.4 Gallery photo upload

For multipart uploads, the `file` part contains the image. An optional `uploaderLabel` may be supplied as a text field. The server validates the file and returns metadata with status `PENDING`. Do not return the private object key or an unrestricted permanent object URL.

## 8. Validation and State Transitions

- Use Bean Validation on request DTOs (`@NotBlank`, `@Size`, `@Email`, `@PositiveOrZero`, and custom validators as appropriate).
- Validate ownership of all nested IDs; matching the numeric ID alone is not enough.
- Use explicit service-layer state transitions for publish/unpublish, invitation acceptance/revocation, RSVP, check-in, and photo moderation.
- Make operations idempotent where clients may retry after network failures (for example, organizer invitation acceptance and family check-in).
- Use database transactions for multi-table operations such as wedding creation + initial membership, family invitation + event associations, organizer invitation acceptance, and photo moderation metadata updates.
- Return `409 Conflict` for state conflicts, duplicate unique values, or unsupported transitions.
- Use optimistic locking (`@Version`) selectively if concurrent organizer edits can overwrite important state; define it in the persistence/API contract before relying on it.

## 9. Security and Privacy Requirements

1. Validate Clerk JWTs on the server using trusted issuer/JWKS configuration; do not decode without signature verification.
2. Enforce wedding-level authorization in service methods, not just React route guards or controller path structure.
3. Apply deny-by-default authorization for new endpoints.
4. Never trust client-supplied `userId`, `createdByUserId`, role, membership, or moderation actor fields.
5. Rate-limit guest token resolution, RSVP submissions, gallery reads where appropriate, and uploads.
6. Store invitation/gallery token digests; use HTTPS and avoid tokens in application logs, analytics, and error reporting.
7. Validate upload bytes and dimensions; reject unsupported or oversized files and consider malware scanning before production.
8. Keep gallery objects private; return approved photos only to guest visitors.
9. Validate and normalize user-supplied URLs to reduce unsafe schemes and SSRF/open-redirect risks. The backend must not fetch arbitrary user URLs unless explicitly required and safely constrained.
10. Configure CORS for known frontend origins; do not use wildcard origins with credentials.
11. Add request correlation IDs and audit important organizer actions without logging sensitive payloads or raw tokens.
12. Return `404` instead of `403` where revealing the existence of another wedding's resource would create an information leak; use one consistent policy.

## 10. Open Decisions and Implementation Notes

These points remain unresolved in related product/design documents and must not be silently hardcoded:

1. **Workspace limit:** clarify whether “one wedding per user” means one created workspace or one workspace membership total.
2. **Gallery storage and upload policy:** object-storage provider, upload limit, format allowlist, retention, and signed URL behavior.
3. **Guest-link delivery:** invitation and gallery URLs are shareable manually; the API does not imply automated WhatsApp/SMS sending.
4. **Organizer invitation delivery:** pending invitations must be stored before signup, but email delivery/provider behavior needs separate approval.
5. **Deletion and retention:** define wedding deletion, invitation revocation/deletion, gallery/photo retention, and storage cleanup before production.
6. **Budget rules:** confirm zero-value expense and refund/negative amount policy.
7. **Public cover images:** confirm when wedding/event cover images are publicly retrievable.
8. **API schema tooling:** Springdoc/OpenAPI is recommended for generating and reviewing the machine-readable contract, but implementation dependency/version remains to be confirmed.
9. **Rate-limit values and upload limits:** set concrete values before public launch.

## 11. Suggested Implementation Order

Build and verify one vertical slice at a time rather than implementing all endpoints at once:

1. Clerk JWT validation, current-user mapping, and workspace authorization.
2. Wedding creation and read/update endpoints.
3. Events CRUD with DTO validation, error mapping, and tests.
4. Tasks CRUD.
5. Family invitations and event assignments.
6. Guest token resolution and latest-state RSVP.
7. Expenses and vendor contacts.
8. Website configuration/publication.
9. Organizer invitations and membership management.
10. Gallery upload/moderation with private object storage.
11. Livestream configuration and final security review.

For each slice, add controller/service/repository tests, authorization tests, and API examples before moving on. The workshop/demo implementation may cover only a small vertical slice; that does not change the full MVP API contract.

## 12. Definition of Ready for Implementation

- Endpoint inventory is reviewed against the PRD and DBDD.
- Route access classes and module permissions are approved.
- DTOs and validation rules are agreed for the first implementation slice.
- Clerk JWT verification works end-to-end in a local environment.
- Cross-wedding authorization tests exist before sensitive CRUD is exposed.
- Guest token generation, hashing, revocation, and redaction behavior are specified.
- Gallery storage/upload decisions are finalized before implementing upload endpoints.
- OpenAPI output and example requests are reviewed by frontend and backend implementers.

---

**End of document**

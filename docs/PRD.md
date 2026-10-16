# WeddingOS --- Product Requirements Document (PRD)

**Version:** 1.0\
**Status:** MVP product specification

> This document defines WeddingOS product vision, scope, user needs,
> behavior, and acceptance criteria. It intentionally describes what the
> product must do, not the implementation technologies or service providers.

## 1. Product Overview

### 1.1 Vision

WeddingOS is a digital wedding-management workspace that helps a couple
and trusted organizers coordinate an Indian wedding from one place. It
brings wedding details, events, preparation tasks, family-level
invitations, RSVP counts, expenses, vendor contacts, a shareable wedding
website, and wedding memories into one simple product.

The experience should feel organized and dependable for organizers,
beautiful and clear for guests, and approachable for family members who
are not highly technical.

### 1.2 Problem

Wedding planning often depends on disconnected spreadsheets, messaging
threads, phone calls, paper lists, and separate links. This can cause
inconsistent information, missed tasks, unclear RSVP totals, and
scattered photos. WeddingOS centralizes planning while keeping guest
interactions lightweight.

### 1.3 Platform

-   Responsive web application for mobile, tablet, and desktop.
-   No native mobile application is required for MVP v1.0.
-   Guests can use invitation, wedding website, and gallery links
    without creating accounts or installing an application.
-   Initial operating costs should be low; prefer affordable or
    usage-based services where practical.

### 1.4 Product principles

1.  Family-first invitations: manage an invited family/group as a unit,
    not as individual guest accounts.
2.  Simple guest experience: common guest actions should work from a
    shared link.
3.  Privacy by default: internal planning data and private galleries
    must not be publicly exposed.
4.  Organizer control: authorized organizers manage planning information
    and moderate guest uploads.
5.  Explicit scope: do not add excluded features without a deliberate
    PRD revision.
6.  Mobile usability: key flows must work on a phone.
7.  No false automation: WhatsApp sharing prepares a message for the
    organizer to send manually; WeddingOS does not send it
    automatically.

## 2. Goals and Success Criteria

### 2.1 MVP goals

-   Give a couple and trusted organizers one planning workspace.
-   Make wedding details, events, tasks, guest responses, expenses, and
    vendors easy to review.
-   Manage invitations and attendance counts at family/group level.
-   Provide a shareable wedding website with three predefined themes.
-   Provide a private-by-link gallery with moderated guest uploads.
-   Support family-level invitation check-in.
-   Protect data through authentication, authorization, and workspace
    isolation.
-   Deliver core flows responsively and at low initial operating cost.

### 2.2 Success criteria

The MVP is ready when: - An authorized user can create and manage a
wedding workspace. - Admin and Organizer permissions are enforced in
backend operations, not only in the UI. - Events, tasks, family
invitations, expenses, and vendor contacts persist after refresh. - A
guest can open a valid invitation link, submit or update an RSVP within
the allowed attendee limit, and receive clear feedback. - WhatsApp
sharing opens a pre-filled message for manual sending. - A website can
be configured using one of three themes and published under a unique
slug. - Guest uploads remain pending until approved by an authorized
organizer. - A private gallery is not publicly indexed or ordinarily
discoverable. - Family check-in marks the invitation checked in without
counting individual attendees. - Key flows have loading, empty, success,
validation, and error states. - Cross-workspace access and unauthorized
moderation attempts are rejected.

Quantitative adoption targets are not specified in the source
requirements and should be set separately if needed.

## 3. Users, Roles, and Permissions

### 3.1 Users

-   **Couple / wedding owner:** creates or owns the workspace, maintains
    wedding details, invites trusted organizers, and reviews planning
    progress.
-   **Admin:** has full workspace administration, can manage membership
    and permissions, and can manage all modules.
-   **Organizer:** helps coordinate the wedding and can access only
    modules/actions granted by an Admin.
-   **Invited family/guest:** opens a shareable invitation, responds to
    RSVP, views guest-facing content, and may upload photos through a
    link. Guests do not have organizer accounts or dashboards.

### 3.2 Role rules

-   MVP supports **Admin** and **Organizer**.
-   Multiple Admins are allowed.
-   Admins can manage membership and configurable module permissions.
-   The last remaining Admin must not be removable or demotable.
-   Authorization must be enforced in backend/data operations. Hiding UI
    controls is not a security boundary.
-   Every internal-data operation must verify workspace membership and
    permission.
-   A user must not access another wedding's data by changing a URL,
    identifier, or request payload.
-   Invalid, expired, or revoked organizer invitations must fail safely.

### 3.3 Family guest model

-   Guests do not create WeddingOS accounts for MVP.
-   Guest invitations represent a family/group, not individual
    family-member profiles.
-   An invitation has an allowed attendee count where applicable.
-   RSVP attendance must not exceed that count.
-   Check-in operates on the family invitation as a unit.

## 4. MVP Scope

### 4.1 Included

1.  Wedding workspace and key details.
2.  Dashboard and countdown.
3.  Wedding event management.
4.  Preparation checklist and tasks.
5.  Family-based guest records and invitations.
6.  Event-level invitations and RSVP tracking.
7.  Manual WhatsApp sharing using a pre-filled message.
8.  Expense and basic budget tracking.
9.  Vendor contact list.
10. Public wedding website with three predefined themes.
11. Private-by-link photo gallery.
12. Guest photo uploads through link and QR code.
13. Organizer photo moderation.
14. External livestream link integration.
15. Family invitation QR and family-level check-in.
16. Admin/Organizer roles with configurable module access.
17. Responsive UI, validation, basic error logging, and deployment
    checks.

### 4.2 Explicitly excluded from MVP v1.0

-   Multiple wedding workspaces per user.
-   Planner accounts designed to manage many weddings.
-   Guest login or individual guest accounts.
-   Individual family-member profiles or complex household/family-tree
    modeling.
-   Parking management.
-   Seating plans or assignments.
-   Guest hotel, room, or accommodation management.
-   Transport management.
-   Vendor marketplace accounts, bookings, or vendor payments.
-   Payment processing, instalment management, advanced budget
    analytics, or forecasting.
-   WhatsApp Business API, automated WhatsApp delivery, or SMS.
-   Real-time notifications, push notifications, or real-time
    collaboration infrastructure.
-   A custom livestreaming platform.
-   Drag-and-drop website building or unrestricted custom page design.
-   Advanced analytics, extensive activity logs, or enterprise project
    management.
-   Individual attendee entry counting at check-in.

Do not add excluded features because they appear in screenshots,
examples, or future suggestions. Scope changes require product-owner
approval and a PRD update.

## 5. Core Product Rules

1.  **Workspace limit:** MVP supports one wedding workspace per user.
    Multi-wedding management is out of scope.
2.  **Family-level invitations:** an invitation represents a
    family/group; individual guest accounts are not required.
3.  **Event-specific attendance:** invitations may apply to the events
    for which the family is invited; RSVP counts must reflect the
    applicable event.
4.  **Attendee limit:** guests cannot RSVP for more attendees than the
    invitation permits.
5.  **RSVP changes:** guests may submit or change an RSVP through a
    valid link, subject to invitation rules and the allowed attendee
    count.
6.  **Manual WhatsApp:** a pre-filled message may be prepared, but the
    organizer sends it manually in WhatsApp.
7.  **Website URL:** use a path-based format such as
    `weddingos.com/w/yourwedding`; a branded subdomain is not required.
8.  **Unique slug:** the website slug must be unique and shareable;
    invalid, unavailable, or changed slugs must be handled safely.
9.  **Three themes:** provide exactly three predefined website themes;
    this is not a general-purpose drag-and-drop builder.
10. **Gallery privacy:** gallery access is private-by-link and must not
    be publicly indexed or ordinarily discoverable. A shared link is not
    equivalent to per-person authentication.
11. **Moderation:** guest uploads remain pending and invisible to
    gallery link holders until an authorized organizer approves them.
12. **Moderation actions:** authorized organizers can approve, reject,
    or remove photos.
13. **Family check-in:** check-in marks the family invitation as checked
    in; it does not record individual entry counts.
14. **Repeated check-in:** warn if an already checked-in invitation is
    scanned again.
15. **External livestream:** support an external livestream URL, such as
    YouTube Live; WeddingOS does not host video.
16. **No real-time notifications:** reminders, where supported, are
    organizer-managed/manual rather than automated push notifications.
17. **Final Admin protection:** the last Admin cannot be removed or
    demoted.
18. **Backend enforcement:** authorization and workspace isolation must
    be enforced server-side.

## 6. Primary User Journeys

### 6.1 Create and prepare a wedding

1.  User authenticates.
2.  User creates a workspace and enters key wedding details.
3.  Dashboard and countdown appear.
4.  User adds events, tasks, expenses, and vendor contacts.
5.  User invites trusted organizers and configures module access.
6.  Saved changes persist and clear success/error feedback is shown.

**Outcome:** the workspace becomes the central planning location.

### 6.2 Invite an organizer

1.  Admin opens membership settings.
2.  Admin creates an organizer invitation and chooses allowed module
    access.
3.  Invitee accepts through a valid link and authenticates as required.
4.  Organizer receives only the assigned permissions.
5.  Invalid, expired, or revoked links fail safely.

**Outcome:** membership and permissions match the Admin's configuration;
the final Admin is protected.

### 6.3 Manage events and tasks

1.  Authorized organizer opens Events or Tasks.
2.  Organizer creates or edits a record.
3.  Required fields and invalid values are validated.
4.  Record is saved and shown.
5.  Relevant dashboard displays update.

**Outcome:** planning information persists and remains reviewable.

### 6.4 Invite a family and collect RSVP

1.  Organizer creates a family/group record and sets the allowed
    attendee count.
2.  Organizer associates it with relevant events.
3.  WeddingOS provides a unique invitation link and QR code where
    applicable.
4.  Organizer opens a pre-filled WhatsApp message and sends it manually.
5.  Guest opens the link without signing in and submits RSVP.
6.  RSVP is constrained by the attendee limit.
7.  Organizer reviews RSVP status and counts.
8.  Guest may update the response through a valid link.

**Outcome:** organizers have current response counts without requiring
guest accounts.

### 6.5 Publish a wedding website

1.  Authorized organizer configures supported guest-facing content.
2.  Organizer chooses one of three themes and previews the website.
3.  Organizer publishes using a unique path-based slug.
4.  Guests can open the public page.
5.  Invalid/unavailable slugs show a clear not-found or unavailable
    state.

**Outcome:** a responsive shareable wedding website is published.

### 6.6 Collect and moderate photos

1.  Organizer enables/configures the gallery.
2.  WeddingOS provides a gallery link and QR code.
3.  Guest uploads an allowed image without an account.
4.  Upload is validated and marked pending.
5.  Authorized organizer reviews it.
6.  Organizer approves, rejects, or removes it.
7.  Only approved photos appear to gallery link holders.
8.  Visitors can view/download approved photos where supported.

**Outcome:** guest photos are collected without exposing unreviewed
uploads.

### 6.7 Check in a family

1.  Authorized organizer opens or scans the invitation QR code.
2.  WeddingOS displays the family invitation identity and
    allowed-attendee information.
3.  Organizer marks the invitation checked in.
4.  Repeated scans trigger a warning.
5.  No individual entry count is recorded.

**Outcome:** lightweight family-level verification at entry.

### 6.8 Record expenses and vendors

1.  Authorized organizer records an expense and its basic details.
2.  Workspace shows recorded expenses and a basic total.
3.  Organizer creates or updates vendor contacts.
4.  Records remain available to authorized members.

**Outcome:** simple spending and vendor information is centralized;
advanced financial analysis is excluded.

## 7. Functional Requirements

Requirement IDs are stable references for implementation and testing.

### 7.1 Authentication and workspace

-   **FR-AUTH-01:** Users can securely sign up, log in, log out, and recover access.
-   **FR-AUTH-02:** Protected organizer functionality requires
    authentication.
-   **FR-AUTH-03:** Protected requests must verify the user’s authenticated identity.
-   **FR-AUTH-04:** Authenticated users are associated with the correct
    workspace membership.
-   **FR-WS-01:** An authorized user can create a wedding workspace.
-   **FR-WS-02:** Workspace stores/displays wedding details required by
    dashboard and public website.
-   **FR-WS-03:** Enforce one wedding workspace per user for MVP.
-   **FR-WS-04:** Isolate internal data between wedding workspaces.

### 7.2 Dashboard and countdown

-   **FR-DASH-01:** Dashboard summarizes relevant wedding information.
-   **FR-DASH-02:** Display a countdown based on the configured wedding
    date.
-   **FR-DASH-03:** Dashboard values come from persisted data, not
    hard-coded demo values.
-   **FR-DASH-04:** Show useful empty states when information is not yet
    available.

### 7.3 Events

-   **FR-EVT-01:** Authorized users can create, view, update, and delete
    events subject to permissions.
-   **FR-EVT-02:** Event forms validate required fields and invalid
    values.
-   **FR-EVT-03:** Events belong to the correct workspace.
-   **FR-EVT-04:** Event information is available to invitation and
    website workflows where configured.

### 7.4 Tasks

-   **FR-TASK-01:** Authorized users can create, view, update, and
    delete preparation tasks subject to permissions.
-   **FR-TASK-02:** Tasks support a clear completion state.
-   **FR-TASK-03:** Tasks persist and belong to the correct workspace.
-   **FR-TASK-04:** Completed and incomplete tasks are distinguishable.

### 7.5 Membership and permissions

-   **FR-MEM-01:** Admins can invite organizers.
-   **FR-MEM-02:** Invalid, expired, or revoked invitations fail safely.
-   **FR-MEM-03:** Admins can assign/update configurable module
    permissions.
-   **FR-MEM-04:** Admins can remove organizers subject to final-Admin
    protection.
-   **FR-MEM-05:** Support multiple Admins.
-   **FR-MEM-06:** Prevent removal/demotion of the final Admin.
-   **FR-MEM-07:** Every protected backend operation enforces current
    membership and permissions.

### 7.6 Family guests, invitations, and RSVP

-   **FR-GUEST-01:** Organizers can create/manage family/group guest
    records.
-   **FR-GUEST-02:** Guest records do not require individual
    family-member profiles.
-   **FR-GUEST-03:** Organizer can set an allowed attendee count.
-   **FR-GUEST-04:** Family invitations can be associated with relevant
    events.
-   **FR-GUEST-05:** Generate a unique, difficult-to-guess invitation
    link/token.
-   **FR-GUEST-06:** Guests can open valid invitation links without
    accounts.
-   **FR-GUEST-07:** Guests can submit RSVP through a valid link.
-   **FR-GUEST-08:** Reject RSVP counts above the allowed attendee
    limit.
-   **FR-GUEST-09:** Support RSVP changes through a valid link according
    to invitation rules.
-   **FR-GUEST-10:** Organizers can review RSVP status and relevant
    counts.
-   **FR-GUEST-11:** Invalid, expired, or unauthorized links fail safely
    with understandable feedback.
-   **FR-GUEST-12:** Guests cannot access event invitations for events
    their family was not invited to.
-   **FR-GUEST-13:** Do not require an email address for every family
    invitation; manual WhatsApp sharing remains possible.

### 7.7 WhatsApp sharing

-   **FR-SHARE-01:** Organizers can open a pre-filled WhatsApp message
    for an invitation.
-   **FR-SHARE-02:** Message includes the relevant link and supported
    wedding/event details.
-   **FR-SHARE-03:** Organizer sends the message manually in WhatsApp.
-   **FR-SHARE-04:** Product does not claim automatic message delivery.
-   **FR-SHARE-05:** Automated messaging and push reminders are out of
    scope.

### 7.8 Expenses

-   **FR-EXP-01:** Authorized users can record basic expense details.
-   **FR-EXP-02:** Authorized users can view/update/delete expenses
    subject to permissions.
-   **FR-EXP-03:** Show a basic total based on recorded expenses.
-   **FR-EXP-04:** Scope expense data to the correct workspace.
-   **FR-EXP-05:** Advanced forecasting, instalments, payments, and
    analytics are excluded.

### 7.9 Vendors

-   **FR-VEND-01:** Authorized users can create and maintain a simple
    vendor contact list.
-   **FR-VEND-02:** Vendor records support basic contact and service
    details.
-   **FR-VEND-03:** Vendor information is limited to authorized
    workspace members.
-   **FR-VEND-04:** Marketplace features, vendor accounts, bookings, and
    payments are excluded.

### 7.10 Wedding website

-   **FR-WEB-01:** Authorized organizer can configure guest-facing
    website content.
-   **FR-WEB-02:** Provide three predefined themes.
-   **FR-WEB-03:** Organizer can preview before publishing.
-   **FR-WEB-04:** Publish using a unique path-based slug.
-   **FR-WEB-05:** Public URL follows a path format such as `/w/{slug}`.
-   **FR-WEB-06:** Handle unavailable, invalid, or changed slugs safely.
-   **FR-WEB-07:** Website is responsive and shows intended guest-facing
    content only.
-   **FR-WEB-08:** Do not expose organizer contact details or internal
    planning data.
-   **FR-WEB-09:** Branded subdomains and unrestricted page builders are
    not required.

### 7.11 Gallery and moderation

-   **FR-GAL-01:** Organizer can configure/enable the gallery.
-   **FR-GAL-02:** Provide a private-by-link gallery URL.
-   **FR-GAL-03:** Provide QR or QR-friendly gallery sharing.
-   **FR-GAL-04:** Guests can upload supported images without an
    account.
-   **FR-GAL-05:** Validate file type/size and apply basic upload-abuse
    controls.
-   **FR-GAL-06:** New guest uploads default to pending review.
-   **FR-GAL-07:** Only authorized organizers can approve, reject, or
    remove photos.
-   **FR-GAL-08:** Only approved photos appear to gallery link holders.
-   **FR-GAL-09:** Show clear feedback for failed uploads and invalid
    files.
-   **FR-GAL-10:** Use efficient image loading; grids should not load
    full-resolution images unnecessarily.
-   **FR-GAL-11:** Gallery is not publicly indexed or ordinarily
    discoverable.
-   **FR-GAL-12:** Do not imply a shared link verifies each visitor's
    identity.
-   **FR-GAL-13:** Visitors can view/download approved photos where
    supported.

### 7.12 Livestream

-   **FR-LIVE-01:** Authorized organizer can configure an external
    livestream URL.
-   **FR-LIVE-02:** Validate URL and handle invalid/unsupported links
    safely.
-   **FR-LIVE-03:** Present configured livestream link in the relevant
    guest-facing view.
-   **FR-LIVE-04:** WeddingOS does not host or record livestream video.

### 7.13 Family check-in

-   **FR-CHECK-01:** Support check-in using family invitation identity
    or QR code.
-   **FR-CHECK-02:** Show family invitation identity and
    allowed-attendee information.
-   **FR-CHECK-03:** Authorized organizer can mark invitation checked
    in.
-   **FR-CHECK-04:** Warn if an already checked-in invitation is scanned
    again.
-   **FR-CHECK-05:** Do not collect/manage individual attendee entry
    counts.
-   **FR-CHECK-06:** Check-in requires appropriate permissions.

### 7.14 Shared UX

-   **FR-UX-01:** Key operations show appropriate loading, success,
    empty, and error states.
-   **FR-UX-02:** Forms show clear validation messages and identify
    invalid fields.
-   **FR-UX-03:** Invalid, expired, unavailable, and unauthorized links
    fail safely.
-   **FR-UX-04:** Do not present unsaved/demo values as persisted data.
-   **FR-UX-05:** Destructive actions should have suitable confirmation
    or recovery behavior where appropriate.

## 8. Navigation and Screen Inventory

### 8.1 Organizer workspace

-   Sign in/authentication entry.
-   Wedding creation and setup.
-   Dashboard/countdown.
-   Events.
-   Preparation tasks/checklist.
-   Family guests and invitations.
-   RSVP overview.
-   Expenses/basic totals.
-   Vendor contacts.
-   Website configuration, theme selection, preview, and publishing.
-   Gallery management and moderation queue.
-   Livestream configuration.
-   Family check-in.
-   Organizer membership and permissions.
-   Workspace settings.

### 8.2 Guest-facing views

-   Public wedding website by slug.
-   Family invitation and RSVP by unique link.
-   Gallery by private link.
-   Guest photo upload interface.
-   Organizer invitation acceptance.
-   Family check-in view for authorized organizers.

Exact route names beyond the confirmed public wedding path are
implementation decisions for system/API design.

## 9. Product-Level Data Concepts

This section describes concepts, not the physical database schema.

-   **Wedding workspace:** boundary for wedding planning data.
-   **Membership:** association between a user and workspace, including
    role/permissions.
-   **Event:** wedding function with date/time and relevant details.
-   **Task:** preparation item with completion state.
-   **Family/group guest:** invited family/group represented as one
    unit.
-   **Invitation:** token-based shareable route to guest invitation/RSVP
    functionality.
-   **RSVP:** family/group response for a relevant event.
-   **Allowed attendee count:** maximum permitted attendance count for
    an invitation.
-   **Expense:** record of wedding-related spending.
-   **Vendor contact:** basic service-provider contact details.
-   **Website configuration:** guest-facing content, selected theme,
    publication state, and slug.
-   **Gallery:** private-by-link collection of approved wedding photos.
-   **Gallery upload:** submitted image with moderation state.
-   **Livestream link:** reference to an external stream.
-   **Check-in state:** whether a family invitation has been checked in.

Tables, keys, indexes, relationships, and migrations belong in
`DBDD.md`.

## 10. Privacy and Security Requirements

-   **SEC-01:** Authenticated wedding-management data is available only
    to authorized members of that wedding.
-   **SEC-02:** Changing a URL, identifier, or request payload cannot
    grant access to another wedding's internal data.
-   **SEC-03:** Invitation and gallery tokens are difficult to guess.
-   **SEC-04:** Invalid, expired, or revoked tokens are rejected safely.
-   **SEC-05:** Private galleries are not publicly indexed or ordinarily
    discoverable.
-   **SEC-06:** Guest uploads validate file type/size and apply basic
    rate/abuse controls.
-   **SEC-07:** Only authorized organizers moderate or delete gallery
    content.
-   **SEC-08:** Organizer and guest contact details are not exposed on
    public wedding pages.
-   **SEC-09:** Protected backend requests validate authentication
    through the selected provider's token mechanism.
-   **SEC-10:** User input and external URLs are validated.
-   **SEC-11:** Secrets and service credentials are not exposed in
    client-side code or public repositories.
-   **SEC-12:** Public guest flows expose only the minimum information
    needed for the intended action.
-   **SEC-13:** Workspace isolation and authorization rules are tested.
-   **SEC-14:** Privacy messaging accurately describes link-based
    access; it does not promise per-person identity verification.

A UI-only restriction is insufficient. The system design must translate
these requirements into concrete controls.

## 11. Error and Edge Cases

### Organizer accounts and permissions

-   Invitee already has an account.
-   Organizer invitation is invalid, expired, or revoked.
-   Admin removes an organizer.
-   Multiple Admins exist.
-   Admin attempts to remove/demote the final Admin.
-   Organizer attempts an action outside assigned module permissions.
-   User attempts cross-workspace access by changing an identifier.

### Guests and RSVP

-   Invalid or expired invitation link.
-   Duplicate RSVP submission.
-   RSVP changes after initial submission.
-   RSVP exceeds allowed attendee count.
-   Invitation has no email address and is shared manually through
    WhatsApp.
-   Guest opens an event invitation not assigned to their family.
-   Invitation is revoked or disabled.
-   RSVP totals remain consistent after a response changes.

### Website and livestream

-   Slug is already in use, changed, or unavailable.
-   Visitor requests a nonexistent slug.
-   Livestream URL is malformed, unsupported, or unavailable.
-   Public content must not expose private workspace data.

### Gallery

-   Unsupported or oversized upload.
-   Upload failure or interrupted connection.
-   Repeated/abusive upload attempts.
-   Photo pending moderation, rejected, or removed.
-   Invalid, disabled, or unavailable gallery link.
-   Unapproved photo never appears in the visitor gallery.
-   Gallery is not publicly indexed.

### Check-in

-   First valid check-in.
-   Repeated scan.
-   Invalid invitation or invitation associated with another wedding.
-   Organizer lacks permission.
-   UI does not imply individual attendees have been counted.

## 12. Non-Functional Requirements

### Usability and accessibility

-   Responsive on common mobile, tablet, and desktop sizes.
-   Usable on typical mobile networks.
-   Accessible contrast, keyboard-friendly forms, clear labels, and
    visible validation.
-   Clear loading, empty, success, and error states.
-   Guest flows avoid unnecessary account creation or installation.

### Reliability and integrity

-   Wedding, event, task, guest, RSVP, expense, vendor, membership,
    website, and gallery records persist reliably.
-   Data remains scoped to the correct workspace.
-   RSVP changes do not create inconsistent counts.
-   Upload and livestream failures are handled gracefully.
-   Critical flows are tested end to end.

### Performance

-   Avoid full-resolution gallery images in grids.
-   Lazy-load images where appropriate.
-   Paginate or efficiently load large family and photo lists.
-   Keep common interactions responsive under expected MVP usage.
-   Numeric performance budgets are not specified in the source PRD and
    should be agreed before production load testing.

### Maintainability

-   Separate UI, business rules, and data access.
-   Keep product requirements, system design, database design, and API
    contracts in separate documents.
-   Build incrementally and test core flows and permissions.

### Cost and operations

-   Keep initial operating cost low.
-   Prefer free-tier/usage-based services where appropriate, after
    checking current limits and production suitability.
-   Monitor photo storage and bandwidth.
-   Provide basic error logging and deployment checks.
-   Advanced analytics and real-time operations dashboards are not
    required.

## 13. Product Release Strategy

Build incrementally so each phase produces a testable working slice.

### Phase 1 --- Foundation

-   Project setup and environment configuration.
-   Authentication and protected backend requests.
-   Wedding creation and details.
-   Workspace membership and basic roles.
-   Dashboard shell and countdown.

### Phase 2 --- Planning

-   Events.
-   Preparation tasks.
-   Dashboard calculations and empty states.

### Phase 3 --- Family invitations

-   Family guest records.
-   Event-level invitations.
-   Unique invitation links.
-   Guest invitation page.
-   RSVP and attendee limits.
-   Pre-filled WhatsApp message and manual sharing.
-   RSVP overview.

### Phase 4 --- Expenses and vendors

-   Expense tracker and basic totals.
-   Vendor contact list.

### Phase 5 --- Wedding website

-   Three predefined themes.
-   Website configuration, preview, and publishing.
-   Unique slug and minimal guest-facing content.
-   External livestream link.

### Phase 6 --- Memories and entry

-   Private-by-link gallery.
-   Guest uploads and organizer moderation.
-   Approved-photo viewing/download where supported.
-   Gallery QR code.
-   Family invitation QR and family-level check-in.

### Phase 7 --- Production readiness

-   Authorization and workspace-isolation review.
-   Validation and error handling.
-   Responsive/accessibility review.
-   End-to-end testing.
-   Basic logging and deployment checks.
-   Review photo storage/bandwidth costs.
-   Production deployment and smoke tests.

This sequence does not permit in-scope requirements to be silently
omitted from the MVP release.

## 14. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  Incorrect workspace authorization   Enforce server-side
  exposes private data                membership/permissions and test
                                      cross-workspace access.

  Guest links are forwarded beyond    Use difficult-to-guess tokens;
  intended recipients                 explain link-based access; support
                                      safe revocation/disable behavior
                                      where applicable.

  Unreviewed photos become visible    Default uploads to pending and test
                                      visitor gallery results.

  Photo costs grow unexpectedly       Validate uploads, limit file size,
                                      optimize display, and monitor
                                      usage.

  Technology migration causes scope   Treat this PRD as product source of
  drift                               truth and review system design
                                      against it.

  AI-generated code compiles but      Test permissions, isolation,
  misses permissions                  invalid links, RSVP limits, and
                                      moderation.

  Free-tier limits change             Verify current service limits
                                      before deployment and document
                                      provider choices separately.

  Public website exposes internal     Define guest-facing fields and test
  data                                public responses for data leakage.
  -----------------------------------------------------------------------

## 15. MVP Acceptance Criteria

### Workspace and access

-   [ ] Users can securely authenticate and access only their authorized workspace.
-   [ ] Protected API requests reject missing or invalid authentication.
-   [ ] Authorized user can create/manage their wedding workspace.
-   [ ] Cross-workspace access is rejected even if a URL or identifier
    is changed.
-   [ ] Admin and Organizer roles are enforced server-side.
-   [ ] Organizer module permissions restrict UI actions and backend
    operations.
-   [ ] Final Admin cannot be removed or demoted.

### Planning

-   [ ] Dashboard shows saved wedding information and countdown.
-   [ ] Events can be created, viewed, edited, and deleted according to
    permissions.
-   [ ] Tasks can be created, viewed, edited, deleted, and marked
    complete according to permissions.
-   [ ] Expenses persist and basic totals reflect recorded expenses.
-   [ ] Vendor contacts can be created and maintained.

### Invitations and RSVP

-   [ ] Family/group invitation can be created with allowed attendee
    count.
-   [ ] Invitation can be associated with relevant events.
-   [ ] Guest opens valid invitation without signing in.
-   [ ] Guest can submit and change RSVP through a valid link.
-   [ ] RSVP above the allowed attendee count is rejected.
-   [ ] Invalid/expired invitation links fail safely.
-   [ ] RSVP counts update consistently after creation or change.
-   [ ] WhatsApp sharing opens a pre-filled message and does not claim
    automatic delivery.

### Website and livestream

-   [ ] Organizer can select one of three predefined themes.
-   [ ] Organizer can preview and publish the wedding website.
-   [ ] Public website uses a unique path-based slug.
-   [ ] Invalid/unavailable slugs show a clear safe state.
-   [ ] Public pages do not expose organizer contact details or internal
    planning data.
-   [ ] Configured external livestream link is presented to guests.

### Gallery and check-in

-   [ ] Guest can upload a supported image without an account.
-   [ ] Unsupported and oversized files are rejected with clear
    feedback.
-   [ ] Guest uploads are pending by default.
-   [ ] Unapproved photos are not visible to gallery link holders.
-   [ ] Only authorized organizers can approve, reject, or remove
    photos.
-   [ ] Approved photos appear in the gallery.
-   [ ] Gallery is private-by-link and not publicly indexed or
    ordinarily discoverable.
-   [ ] Family invitation can be marked checked in.
-   [ ] Repeated check-in produces a warning.
-   [ ] Individual attendee entry counts are not collected.

### Quality and readiness

-   [ ] Key screens have appropriate loading, empty, success,
    validation, and error states.
-   [ ] Core flows work on common mobile and desktop viewports.
-   [ ] Authorization, workspace isolation, RSVP limits, token handling,
    and moderation have repeatable tests.
-   [ ] Secrets are not committed or exposed in client-side code.
-   [ ] Basic logging and deployment checks are in place.
-   [ ] Gallery grids avoid unnecessarily loading full-resolution
    images.

## 16. Future Opportunities (Not MVP Commitments)

Potential later ideas, not part of v1.0 without approved scope change: -
Multiple wedding workspaces per user and planner accounts for multiple
weddings. - Advanced analytics and richer budget reports. - Automated
messaging integrations and real-time notifications. - Individual guest
accounts or individual attendee tracking. - Parking, seating,
accommodation, and transport management. - Vendor marketplace and
payments. - Advanced website customization. - Expanded moderation
workflows and operational audit history.

## 17. Glossary

-   **Admin:** Organizer role with full workspace administration and
    membership/permission management.
-   **Organizer:** Trusted workspace member with configurable module
    access.
-   **Family/group guest:** Invited family/group represented as one
    unit.
-   **Invitation token/link:** Difficult-to-guess shareable link for
    guest invitation actions.
-   **RSVP:** Family/group response for a relevant wedding event.
-   **Allowed attendee count:** Maximum attendance count permitted by an
    invitation.
-   **Private-by-link gallery:** Gallery accessible through a shareable
    link, not intended for public indexing or ordinary discovery.
-   **Moderation:** Organizer review before guest-uploaded photos become
    visible.
-   **Family check-in:** Marking a family invitation checked in without
    individual entry counts.
-   **MVP:** Minimum viable product defined by this document.

## 18. Change History and Governance

### Version 1.0 --- Product-focused PRD

-   Consolidates the confirmed WeddingOS MVP scope, product rules,
    user journeys, privacy expectations, and acceptance criteria.
-   Keeps implementation technologies and service-provider decisions
    outside this product requirements document.

### Change control

Any change to MVP scope, roles, privacy behavior, family invitations,
RSVP rules, gallery moderation, check-in behavior, or explicit
exclusions must be approved by the product owner and recorded in this
PRD before implementation. Technical documents must remain consistent
with this product specification.

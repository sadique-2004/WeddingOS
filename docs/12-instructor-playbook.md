# WeddingOS — Instructor Practical Classroom Playbook

> **Document ID:** `DOC-12`  
> **Status:** Instructor Guide & Teaching Script  
> **Pedagogical Rule:** Zero Manual Coding — High Student Engagement & Architectural Dialogue

---

## 1. Instructor Delivery Principles

As the instructor, your goal is **not** to show off how fast an AI generates code, but to demonstrate **how a senior software engineer thinks and directs an AI**.

### Core Teaching Guidelines:
1. **Never Prompt in Silence:** While the AI tool is generating a response or file, engage the classroom immediately with an architectural question (e.g., *"Look at this endpoint: why did we use `PUT` instead of `POST` here?"*).
2. **Use Concrete Analogies:** Ground abstract technical concepts in real-world wedding scenarios.
3. **Inspect Every Diff Live:** Project the `git diff` on the screen and walk students through added and deleted lines before accepting the change.
4. **Celebrate Caught Hallucinations:** When the AI hallucinates a non-existent method or forgets an invariant, pause the class to celebrate catching it: *"This is exactly why software engineers get paid — to catch what AI misses."*

---

## 2. Classroom Delivery Scripts by Module

---

### Phase A: Requirements & Product Discovery (Sessions 1 & 2)

#### 🎙️ Instructor Opening Script:
> *"Good morning, everyone! Today we are building **WeddingOS**, an operating system for managing an Indian wedding. Now, raise your hand if you think this is just another e-commerce or dating app.  
> It isn’t. In an e-commerce app, one user buys one product. In an Indian wedding, Uncle Rajesh arrives with his wife, two kids, and a cousin, and you need to know which table they sit at, whether they eat Jain food, and if they've checked in at the hotel lobby.  
> Before we touch any AI tool or write a single line of code, we are going to write a Product Requirements Document (PRD). If your requirements are sloppy, the AI will build sloppy software."*

#### 💡 The Household Analogy:
> *"Why don’t we require every single wedding guest to create a username and password? Imagine telling your 75-year-old grandmother to download an app and create a password with a special character just to find out what time the Haldi ceremony starts. They won't do it!  
> That's why we design **Family-Based Invitations** with zero-login, tokenized digital passes."*

#### ❓ Student Engagement Questions:
1. **Question:** *"If a family RSVP says 4 invited, but the user enters 6 attending, should the system allow it?"*
   - **Expected Answer:** *"No, the input should be bounded by `total_guests_invited` unless the organizer grants an exception, otherwise venue capacity will be breached."*
2. **Question:** *"Why shouldn't WhatsApp invitations be sent automatically by a backend server bot?"*
   - **Expected Answer:** *"Because WhatsApp Business API charges per message and numbers can be flagged as spam. Preparing a pre-filled `wa.me` link on the organizer's personal phone feels warm and personal while costing ₹0."*

---

### Phase B: System & Database Design (Sessions 3 & 4)

#### 🎙️ Instructor Opening Script:
> *"Today we design our system architecture and database. A lot of beginner developers jump straight to MongoDB because someone on YouTube said 'NoSQL is easy.'  
> But what happens in a wedding budget ledger if an expense transaction is half-written and the server crashes? Or what happens if someone deletes an invitation, but the check-in log still points to it?  
> We use a **Relational MySQL Database** with ACID transactions and foreign-key constraints. Let’s look at `schema.sql`."*

#### 💡 The Hotel Room Key Analogy:
> *"Think of the `invitation_token` like an RFID hotel room card. The guest doesn't need to know the database primary key `id = 42`. They just tap the card (`/invite/9f8a7c2b...`). If the card is lost, we issue a new token without altering their guest history."*

#### ❓ Student Engagement Questions:
1. **Question:** *"Why did we create a separate `wedding_slugs` table instead of just putting a `slug` column inside the `weddings` table?"*
   - **Expected Answer:** *"To separate routing concerns from core wedding profile details, and to support vanity slug re-assignments or history tracking without mutating the primary wedding record."*
2. **Question:** *"What happens if an organizer tries to delete the last Admin in the wedding team?"*
   - **Expected Answer:** *"The workspace becomes an orphaned lock-out where no one can manage permissions. The database/service layer must enforce **Last-Admin Protection** (`FR-MEM-06`)."*

---

### Phase C: AI-Assisted Implementation (Sessions 7, 8 & 9)

#### 🎙️ Instructor Demonstration Protocol:
1. **Step 1:** Open [docs/14-ai-prompt-library.md](file:///d:/Build_With__AI_TapAcademy/WeddingOS/docs/14-ai-prompt-library.md).
2. **Step 2:** Select the specific prompt (e.g. Prompt #16: Family Invitations).
3. **Step 3:** Show students the exact files being referenced in the prompt.
4. **Step 4:** Send the prompt to the AI assistant.
5. **Step 5:** While the AI generates code, ask students:
   > *"What CSS classes should we expect the AI to use for the VIP guest badge according to `DOC-05`?"*
6. **Step 6:** Inspect the resulting code diff:
   - Check for hardcoded mock data.
   - Check that `apiClient.ts` methods are called correctly.
7. **Step 7:** Run `npm run build` in the terminal to verify zero compilation errors.
8. **Step 8:** Test the feature live in the browser.
9. **Step 9:** Execute a Git commit:
   ```bash
   git add apps/web/src/pages/invitations/InvitationsPage.tsx
   git commit -m "feat(invitations): family household cards and WhatsApp dispatch"
   ```

---

### Phase D: Testing & Quality Assurance (Session 11)

#### 🎙️ Instructor Opening Script:
> *"Any developer can get an AI to write code that looks pretty. But does it work when things go wrong?  
> Today we are going to act as brutal Quality Assurance engineers. We will test edge cases: duplicate QR scans, network timeouts, and budget overruns."*

#### 💡 The Flight Boarding Pass Analogy:
> *"What happens at an airport gate if two people try to board using the exact same boarding pass barcode? An alarm sounds! That is why in our Reception Check-In scanner (`FR-CHK-04`), if an invitation pass is scanned twice, the screen flashes red with a timestamp of when they first entered."*

#### ❓ Student Engagement Questions:
1. **Question:** *"Why did we add an AbortController with a 10-second timeout to our frontend API calls?"*
   - **Expected Answer:** *"Because on free cloud tiers like Render, the backend container may be sleeping. If it takes longer than 10 seconds to wake up, the frontend must gracefully fall back to local storage rather than freezing the screen indefinitely."*
2. **Question:** *"Why must financial amounts always use `BigDecimal` in Java and `DECIMAL(12,2)` in MySQL rather than `Double` or `Float`?"*
   - **Expected Answer:** *"Because floating-point binary representations cause rounding inaccuracies (like `0.1 + 0.2 = 0.30000000000000004`), which is unacceptable in financial ledgers."*

---

## 3. Common Student Misconceptions & Corrections

| Misconception | Industry Reality & Correction |
|---|---|
| *"AI wrote the code, so it must be bug-free."* | AI frequently hallucinates deprecated APIs, misses boundary conditions, or silently drops existing comments. Always inspect the diff. |
| *"We only need Git at the end to push to GitHub."* | Git is an iterative checkpoint tool. If an AI generates a bad diff that breaks the project, a 2-second `git restore .` saves hours of rework. |
| *"Frontend validation is sufficient."* | Anyone can bypass frontend validation with curl or Postman. The server must always re-validate permissions, headcounts, and invariants. |
| *"We should put all wedding photos directly in MySQL as BLOBs."* | Databases are for structured relational data. Binary media must be stored in object storage / CDNs (Cloudinary), with only URLs saved in the database. |

# WeddingOS — Dependencies, Integrations & Accounts Inventory

> **Document ID:** `DOC-15`  
> **Status:** Production Service Inventory  
> **Cost Model:** 100% Free-Tier / Low-Cost Friendly for Students and Instructors

---

## 1. External Services & Cloud Accounts Inventory

| Service | Category | Why It Is Needed | Free Tier Limit | Account Setup Required? |
|---|---|---|---|---|
| **Clerk** | Authentication & Identity | Google One-Tap SSO, passwordless sign-in, user management, and cryptographically verified JWT bearer tokens. | 10,000 monthly active users (100% Free) | Yes — Instructor creates one account at [clerk.com](https://clerk.com). |
| **Cloudinary** | Media Storage & CDN | Streaming direct photo uploads from wedding guests, image thumbnail transformations, and secure CDN delivery. | 25 GB storage / credits per month (100% Free) | Yes — Instructor creates account at [cloudinary.com](https://cloudinary.com). |
| **TiDB Serverless** | Managed Cloud MySQL | Cloud-hosted relational database for production with full MySQL 8.0 wire compatibility and SSL/TLS. | 5 GiB storage / 50M request units per month (100% Free) | Yes — Instructor creates cluster at [pingcap.com/tidb-serverless](https://www.pingcap.com). |
| **Vercel** | Frontend Edge Hosting | Global CDN distribution for the Vite + React Single Page Application, automated GitHub deployments, and SPA rewrites. | Unlimited non-commercial deployments (100% Free) | Yes — Instructor links GitHub repo to [vercel.com](https://vercel.com). |
| **Render** | Backend Container Hosting | Dockerized container hosting for the Spring Boot Java 21 REST API. | 750 free compute hours/month (Free Tier Web Service) | Yes — Instructor connects repo at [render.com](https://render.com). |

---

## 2. Environment Variables & Secret Hygiene

### 2.1 Frontend Environment (`apps/web/.env`)
Create `apps/web/.env` locally (never commit to Git):
```ini
# Clerk Publishable Key (Safe for browser client)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Backend REST API Base URL
VITE_API_URL=http://localhost:8080/api/v1
```

### 2.2 Backend Environment (`services/api/` or Render Dashboard)
Configure these environment variables in your shell or Render service settings:
```ini
# Server Port
PORT=8080

# Relational Database Connection (MySQL / TiDB)
SPRING_DATASOURCE_URL=jdbc:mysql://<host>:<port>/weddingos_db?useSSL=true&sslMode=VERIFY_IDENTITY
SPRING_DATASOURCE_USERNAME=<db_user>
SPRING_DATASOURCE_PASSWORD=<db_password>

# Clerk Authentication Issuer URL
CLERK_ISSUER=https://<your-instance>.clerk.accounts.dev
CLERK_AUTHORIZED_PARTIES=https://wedding-os-tap.vercel.app,http://localhost:5173

# Cloudinary Storage Connection String
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

---

## 3. Step-by-Step Service Setup Protocols

### 3.1 Clerk Authentication Setup (5 Minutes)
1. Sign in to [clerk.com](https://clerk.com) and create an application named `WeddingOS`.
2. Under **User & Authentication > Social Connections**, enable **Google**.
3. Under **API Keys**, copy the **Publishable Key** (starts with `pk_test_` or `pk_live_`).
4. In Clerk Dashboard > **JWT Templates / Endpoints**, copy your **Issuer URL** (e.g. `https://wealthy-otter-99.clerk.accounts.dev`).
5. Set `VITE_CLERK_PUBLISHABLE_KEY` in `apps/web/.env` and `CLERK_ISSUER` in `services/api`.

---

### 3.2 Cloudinary Media Setup (3 Minutes)
1. Sign in to [cloudinary.com](https://cloudinary.com).
2. On your Dashboard, find the **API Environment variable**:
   `cloudinary://<api_key>:<api_secret>@<cloud_name>`
3. Set `CLOUDINARY_URL` in your backend environment.
4. **Verification Test:** Upload a test photo via `/api/v1/public/gallery/:token/upload`. The image will appear in your Cloudinary Media Library under the `weddingos/` folder.

---

### 3.3 TiDB Serverless Cloud Database Setup (5 Minutes)
1. Create a free Serverless Cluster at [pingcap.com](https://www.pingcap.com).
2. Click **Connect > General Connection**.
3. Select **MySQL CLI** to copy the host, port (`4000`), user, and password.
4. Run the schema script:
   ```bash
   mysql -u <user> -h <host> -P 4000 -p --ssl-mode=VERIFY_IDENTITY < schema.sql
   ```
5. Configure `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`.

---

## 4. Local Tooling Dependencies

| Software Dependency | Required Version | Verification Command | Installation URL |
|---|---|---|---|
| **Node.js & npm** | Node 18.x or 20.x+ | `node -v` | [nodejs.org](https://nodejs.org) |
| **Java Development Kit** | JDK 21 LTS | `java -version` | [adoptium.net (Eclipse Temurin 21)](https://adoptium.net) |
| **MySQL Server** | MySQL 8.0+ | `mysql --version` | [dev.mysql.com](https://dev.mysql.com/downloads/installer/) |
| **Git** | 2.30+ | `git --version` | [git-scm.com](https://git-scm.com) |
| **Maven Wrapper** | 3.9+ (Bundled) | `.\mvnw.cmd -v` | Included in `services/api/` |

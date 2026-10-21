# WeddingOS — Setup, Configuration & Production Deployment Guide

> **Document ID:** `DOC-07`  
> **Status:** Production Setup & Deployment Blueprint  
> **Frontend Host:** Vercel (`wedding-os-tap.vercel.app`)  
> **Backend Host:** Render Container (`weddingos-api.onrender.com`)  
> **Database:** MySQL 8.0 / TiDB Serverless Cloud  
> **Reference Files:** [Dockerfile](file:///d:/Build_With__AI_TapAcademy/WeddingOS/Dockerfile) | [vercel.json](file:///d:/Build_With__AI_TapAcademy/WeddingOS/vercel.json)

---

## 1. Local Development Setup

### 1.1 Prerequisites
Ensure the following tools are installed on your machine:
- **Node.js**: Version 18+ or 20+ (`node -v`)
- **Java Development Kit (JDK)**: Version 21 LTS (`java -version`)
- **MySQL Server**: Version 8.0+ running on `localhost:3306` (or TiDB cloud endpoint)
- **Git**: (`git --version`)

---

### 1.2 Database Initialization
1. Start your local MySQL server.
2. Open your terminal or MySQL Workbench and run the master schema script:
   ```bash
   mysql -u root -p < schema.sql
   ```
   *This creates `weddingos_db` and all 12 normalized tables with foreign keys and sample demo records.*

---

### 1.3 Backend Setup (`services/api`)
1. Open terminal in `services/api/`:
   ```bash
   cd services/api
   ```
2. Configure your environment variables in PowerShell or your bash shell:
   ```powershell
   $env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/weddingos_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
   $env:SPRING_DATASOURCE_USERNAME="root"
   $env:SPRING_DATASOURCE_PASSWORD="your_password"
   ```
3. Run the Spring Boot application using the Maven wrapper:
   ```powershell
   # Windows PowerShell
   .\mvnw.cmd spring-boot:run

   # macOS / Linux
   ./mvnw spring-boot:run
   ```
4. Verify backend health:
   - Server runs on: `http://localhost:8080`
   - Open Swagger UI in your browser: `http://localhost:8080/swagger-ui.html`
   - Open OpenAPI JSON: `http://localhost:8080/v3/api-docs`

---

### 1.4 Frontend Setup (`apps/web`)
1. Open a new terminal in `apps/web/`:
   ```bash
   cd apps/web
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create your local `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your Clerk publishable key:
   ```ini
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
   VITE_API_URL=http://localhost:8080/api/v1
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Access the application in your browser at `http://localhost:5173`.

---

## 2. Production Cloud Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRODUCTION CLOUD TOPOLOGY                  │
│                                                                 │
│   Frontend SPA (Vercel)            Backend API (Render)         │
│   https://wedding-os-tap.vercel.app  https://weddingos-api.onrender.com │
│          │                                   │                  │
│          ▼                                   ▼                  │
│   Vercel Global Edge               Dockerized JDK 21 Alpine     │
│   Static HTML / JS Assets          Spring Boot 3.3.4 (Port 8080)│
│                                              │                  │
│                                              ▼                  │
│                                    TiDB Serverless Cloud        │
│                                    (MySQL 8.0 Wire Compatible)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend Deployment on Vercel

1. **Repository Link:** Connect your GitHub repository (`WeddingOS`) to Vercel.
2. **Framework Preset:** Vite.
3. **Root Directory:** Edit root directory to `apps/web` (or leave root if using root `vercel.json`).
4. **Build & Output Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Environment Variables in Vercel Dashboard:**
   | Variable Name | Example Value / Purpose |
   |---|---|
   | `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` from Clerk Dashboard |
   | `VITE_API_URL` | `https://weddingos-api.onrender.com/api/v1` |
6. **SPA Client Routing Rewrites (`vercel.json`):**
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   *Ensures refreshing `/app/tasks` or `/invite/abc123token` routes correctly to the client-side router without 404 errors.*

---

## 4. Backend Deployment on Render

Render hosts the backend container built via the root [Dockerfile](file:///d:/Build_With__AI_TapAcademy/WeddingOS/Dockerfile).

1. **Service Type:** Web Service (Docker runtime).
2. **Docker Path:** `Dockerfile` in root directory.
3. **Health Check Path:** `/v3/api-docs` or `/swagger-ui.html`.
4. **Environment Variables in Render Dashboard:**
   | Variable Name | Purpose & Format |
   |---|---|
   | `PORT` | `8080` (Default container port) |
   | `SPRING_DATASOURCE_URL` | `jdbc:mysql://<host>:4000/weddingos_db?useSSL=true&sslMode=VERIFY_IDENTITY` |
   | `SPRING_DATASOURCE_USERNAME` | Database username |
   | `SPRING_DATASOURCE_PASSWORD` | Database password |
   | `CLERK_ISSUER` | `https://<your-instance>.clerk.accounts.dev` |
   | `CLOUDINARY_URL` | `cloudinary://<api_key>:<api_secret>@<cloud_name>` |
   | `CLERK_AUTHORIZED_PARTIES` | `https://wedding-os-tap.vercel.app,http://localhost:5173` |

---

## 5. Troubleshooting & Common Pitfalls

### Pitfall 1: Render Cold-Start Delay (Free Tier)
Render free web services spin down after 15 minutes of inactivity. The first request may take 30–50 seconds to boot the JVM.
- **Solution:** WeddingOS frontend enforces optimistic local storage caching, rendering the dashboard immediately while the backend completes boot-up in the background.

### Pitfall 2: CORS Cross-Origin Block
If the frontend shows `Access to XMLHttpRequest has been blocked by CORS policy`:
- Verify `CLERK_AUTHORIZED_PARTIES` on Render includes your exact Vercel production domain.
- Verify `com.weddingos.api.config.SecurityConfig` allows `*` or your Vercel URL in allowed origins.

### Pitfall 3: Missing Environment Variables
If the backend crashes on startup with `Cannot create JDBC driver`:
- Check that `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` are configured correctly in the Render environment tab.

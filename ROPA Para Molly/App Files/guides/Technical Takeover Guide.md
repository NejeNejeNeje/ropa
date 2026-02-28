# 🛠️ ROPA — Technical Takeover Guide
### *For Molly's Technical Friend — Complete Control in One Document*

> **Who this is for:** You — the technical person helping Molly set this up. This document gives you complete control over the ROPA platform: what it is, how to deploy it, how to configure every service, and how to maintain it long-term.
>
> **Time to production:** ~1.5–2 hours from zero.

---

## Part 1: Architecture Overview

ROPA is a **Next.js 16 (App Router)** full-stack web application. Here's the layer map:

```
Browser (PWA)
    ↓
Next.js 16 App Router (Vercel)
    ↓
tRPC v11 API layer (type-safe, no REST gaps)
    ↓
Prisma v6 ORM
    ↓
SQLite (local dev) / PostgreSQL via Neon (production)
```

**Auth:** Auth.js v5 (NextAuth) — Credentials provider + Google SSO pre-wired.  
**Email:** Resend (7 branded templates: welcome, password reset, offer notifications, escrow release).  
**File storage:** Vercel Blob (listing photos).  
**Payments:** Stripe pre-wired via `/api/checkout`.  
**Push notifications:** Firebase (service worker + `/api/push/subscribe`).  
**PWA:** `manifest.json` + `sw.js` — fully installable on iOS and Android.

---

## Part 2: Local Setup (Run It Right Now)

```bash
# 1. Navigate to the project folder
cd "ROPA"

# 2. Install dependencies
npm install

# 3. Initialize the local SQLite database
npx prisma db push
npx prisma generate

# 4. Start the dev server
npm run dev
```

Open http://localhost:3000 — use the **Quick Login** panel to test. The app ships with seeded demo data (users, listings, matches, karma entries).

> **Note:** The app uses an internal SQLite file (`prisma/dev.db`) locally. No database setup needed for local testing.

---

## Part 3: Production Deployment — Step by Step

### 3.1 Database — Neon PostgreSQL (Required)

1. Create account at [neon.tech](https://neon.tech) (free tier)
2. Create project: name `ropa-production`, region nearest to target users
3. Copy the **connection string** from Connection Details:
   ```
   postgresql://user:password@ep-....aws.neon.tech/neondb?sslmode=require
   ```
4. push the schema to Neon:
   ```bash
   DATABASE_URL="<neon-connection-string>" npx prisma db push
   ```
   You should see: `Your database is now in sync with your Prisma schema. ✅`

### 3.2 Hosting — Vercel (Required)

1. Push code to a GitHub repo:
   ```bash
   git init && git add . && git commit -m "ROPA production"
   git remote add origin https://github.com/YOUR_USERNAME/ropa.git
   git push -u origin main
   ```
2. Create Vercel account at [vercel.com](https://vercel.com) → **Add New Project** → Import GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. **DO NOT deploy yet** — add env vars first (Step 3.3)

### 3.3 Environment Variables (Vercel Dashboard → Settings → Environment Variables)

**Required — app won't work without these:**

| Variable | Value | How to Get |
|----------|-------|-----------|
| `DATABASE_URL` | Neon connection string | From Step 3.1 |
| `AUTH_SECRET` | Random 32-byte string | Run: `npx auth secret` |
| `AUTH_URL` | `https://your-app.vercel.app` | Set after first deploy |

**Recommended — unlocks critical features:**

| Variable | Value | Unlock |
|----------|-------|--------|
| `RESEND_API_KEY` | `re_...` | Transactional emails (welcome, password reset, offer updates, swap confirmations) |
| `EMAIL_FROM` | `ROPA <noreply@yourdomain.com>` | Email sender address |
| `BLOB_READ_WRITE_TOKEN` | Auto-set by Vercel Blob | Listing photo uploads |

**Optional — premium features:**

| Variable | Value | Unlock |
|----------|-------|--------|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | "Sign in with Google" button |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | — |
| `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | `true` | Shows Google button on login |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Monetary payments |
| `FIREBASE_SERVER_KEY` | From Firebase Console | Push notifications |

### 3.4 Deploy

Click **Deploy** in Vercel. First build: ~3 minutes. After success, copy your live URL (e.g. `https://ropa-xyz.vercel.app`).

Go back to **Settings → Environment Variables**, update `AUTH_URL` to your live URL, then **Redeploy**.

---

## Part 4: Granting Molly Admin Access

After Molly creates her account on the live site:

**Option A — Prisma Studio (GUI):**
```bash
DATABASE_URL="<neon-connection-string>" npx prisma studio
```
Opens at `localhost:5555`. Click **User** table → find Molly's record → set `role` to `admin` → Save.

**Option B — Direct SQL via Neon Console:**
In the Neon dashboard, open the SQL editor and run:
```sql
UPDATE "User" SET role = 'admin' WHERE email = 'mollys-email@example.com';
```

After setting admin, navigate to `/admin` — she'll see the full 9-tab dashboard.

---

## Part 5: Activating Optional Services

### 5.1 Email Service — Resend
1. [resend.com](https://resend.com) → Create API Key → name: `ropa-production`
2. Key starts with `re_` → add to Vercel as `RESEND_API_KEY`
3. Also add `EMAIL_FROM` = `ROPA <noreply@yourdomain.com>` (or your custom domain)
4. This activates 7 email types: welcome, password reset, offer received/accepted/countered/declined, escrow released
5. ⚠️ To send from a custom domain (e.g. `hello@getropa.com`), verify it in Resend's Domains tab

### 5.2 Photo Uploads — Vercel Blob
1. Vercel Dashboard → **Storage** tab → **Create Store** → **Blob** → name: `ropa-images`
2. Vercel automatically injects `BLOB_READ_WRITE_TOKEN` into your env vars ✅
3. Redeploy. Photo uploads activate immediately.

### 5.3 Google Login — Google OAuth
1. [console.cloud.google.com](https://console.cloud.google.com) → New Project → `ropa`
2. **APIs & Services → OAuth consent screen**: External, app name "ROPA"
3. **Credentials → Create OAuth 2.0 Client ID**: Web Application
   - Authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
4. Copy Client ID + Client Secret → add to Vercel
5. Also add: `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`

### 5.4 Payments — Stripe
1. [stripe.com](https://stripe.com) → Developers → API Keys → copy **Secret key** (`sk_live_...`)
2. Add as `STRIPE_SECRET_KEY` to Vercel
3. ⚠️ You need to activate the Stripe account with real business details to receive live payments

### 5.5 Push Notifications — Firebase
1. [firebase.google.com](https://firebase.google.com) → Console → New Project → `ropa`
2. Project Settings → Cloud Messaging → copy Server Key
3. Add as `FIREBASE_SERVER_KEY` to Vercel

---

## Part 6: Database Management

### Seeding Demo Data (Optional for Production)
```bash
DATABASE_URL="<neon-connection-string>" npx prisma db seed
```
Creates sample users, listings, and matches. Only run this if Molly wants demo data in production.

### Schema Changes
If you ever need to modify the database structure (e.g. add a field):
1. Edit `prisma/schema.prisma`
2. Run: `DATABASE_URL="..." npx prisma db push`
3. Run: `npx prisma generate`
4. Redeploy on Vercel

### Backup
Neon includes automatic daily backups on the free tier. For manual backup:
```bash
pg_dump "<neon-connection-string>" > ropa_backup_$(date +%Y%m%d).sql
```

---

## Part 7: Ongoing Maintenance

### Deploying Updates
Every `git push` to the `main` branch triggers an automatic Vercel redeploy. No action needed.

### Type-checking Before Deploy
```bash
npx tsc --noEmit
```
Zero errors = safe to ship.

### Viewing Logs
In Vercel dashboard → your project → **Functions** tab — shows real-time server logs.

### Monitoring
Enable **Vercel Analytics** (free) in the Vercel dashboard for page views and performance data.

---

## Part 8: Custom Domain (Recommended)

1. Buy a domain (e.g. `getropa.com`) from any registrar (Namecheap, Cloudflare)
2. Vercel → **Settings → Domains** → add the domain
3. Configure DNS as Vercel instructs (usually `A` and `CNAME` records)
4. Update `AUTH_URL` env var to the new domain
5. Propagation: usually < 1 hour

---

## Part 9: Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Login page shows "Configuration Error" | `AUTH_SECRET` missing or `AUTH_URL` wrong | Check both env vars in Vercel |
| Photos won't upload | `BLOB_READ_WRITE_TOKEN` not configured | Set up Vercel Blob (Part 5.2) |
| Password reset emails not arriving | `RESEND_API_KEY` missing or domain not verified | Check Resend setup |
| DB connection error on deploy | Wrong `DATABASE_URL` or schema not pushed | Re-run `npx prisma db push` |
| `/admin` redirects away | User doesn't have `role = 'admin'` | Use Prisma Studio or SQL (Part 4) |
| App works locally but not in Vercel | Missing environment variable | Compare local `.env` to Vercel vars |
| Build fails with TypeScript errors | Code issue | Run `npx tsc --noEmit` locally to see errors |

---

## Part 10: Key Files to Know

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema — all models live here |
| `src/lib/auth.ts` | Auth.js configuration |
| `src/server/routers/_app.ts` | tRPC router — all API endpoints |
| `src/app/admin/` | Admin dashboard pages (9 tabs) |
| `next.config.ts` | Next.js config (image domains, etc.) |
| `.env.example` | Template for all environment variables |

---

*Built with ❤️ as a gift for Molly. You are now the keeper of this platform. Take good care of it.*

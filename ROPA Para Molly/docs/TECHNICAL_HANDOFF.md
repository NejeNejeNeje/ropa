# ROPA — Technical Handoff Guide

> **Version 1.1** — Production Readiness, Security, and PWA
> Updated: February 2026

This document is the technical source of truth for the ROPA platform. It covers the production-ready tech stack, database schema, environment configuration, and deployment instructions.

---

## 🏗️ Technology Stack

ROPA is a high-performance Next.js application optimized for Vercel deployment and global scaling.

*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
*   **API Layer:** [tRPC v11](https://trpc.io/) (End-to-end type safety)
*   **Database:** PostgreSQL (Hosted on [Neon](https://neon.tech))
*   **ORM:** [Prisma v6](https://www.prisma.io/)
*   **Authentication:** [Auth.js / NextAuth v5](https://authjs.dev/)
*   **Email:** [Resend](https://resend.com/) (Password resets)
*   **PWA:** manifest.json + sw.js (Mobile installable)
*   **Security:** Zod (input validation), rate-limiting middleware, and hashed sessions.

---

## 🗄️ Database Architecture (Prisma)

The database design is built for auditability and scale.

| Model | Purpose | Key Relationships |
|---|---|---|
| `User` | Profile, Karma, Trust Tier, Auth | 1:M with Listings, Matches, Offers |
| `Listing` | Item for swap/sale | Belongs to `User`. Linked to `DropZone` |
| `Match` | Successful reciprocal swipe or accepted offer | Links 2 Users + 2 Listings. Has 1:M `Message`. |
| `Offer` | Financial/Trade proposal | Links `Buyer` to `Listing` & `Seller`. |
| `KarmaEntry`| **Audit Ledger** for all trust points | 100% of points must have an entry here. |
| `TravelPost` | Community content feed | Belongs to `User`. Optional `linkedListingId`. |

---

## 🚀 Environment Setup

The application is "Gift-Ready": it runs with just the first three variables, while the others unlock premium features as they are configured.

### Required (MVP)
```env
DATABASE_URL="..."    # Neon PostgreSQL connection string
AUTH_SECRET="..."     # Use `npx auth secret` to generate
AUTH_URL="..."        # e.g., https://ropa.trade (or localhost:3000)
```

### Optional (Feature Boosters)
```env
RESEND_API_KEY="..."        # Unlocks Password Resets
BLOB_READ_WRITE_TOKEN="..." # Unlocks Photo Uploads (Vercel Blob)
GOOGLE_CLIENT_ID="..."      # Unlocks Google SSO
STRIPE_SECRET_KEY="..."     # Unlocks Monetary Payments
FIREBASE_SERVER_KEY="..."   # Unlocks Push Notifications
```

---

## 🌐 Deployment Checklist

### 1. Vercel Auto-Deploy
- Connect GitHub repo.
- Set Framework Preset: **Next.js**.
- Add variables listed above.
- **Build Command:** `npm run build` (standard).

### 2. Post-Deploy Configuration
- **Admin Access:** Login to the app → Find your userId in Prisma Studio → Set `role = "ADMIN"`. Navigate to `/admin` to verify.
- **PWA Icons:** Default icons are included. Replace `public/*.png` with your own branding icons before branding launch.
- **Analytics:** Enable Vercel Analytics in the dashboard for real-time user traffic monitoring.

---

## 🛠️ Maintenance & Scaling
- **Schema Updates:** Edit `prisma/schema.prisma` → `npx prisma db push` → `npx prisma generate`.
- **Type Safety:** Run `npx tsc --noEmit` before any deploy to ensure zero breakage.
- **Rate Limiting:** Registration rate limits are currently in-memory. For high-scale, migrate to Redis (e.g., Upstash) in `src/app/api/auth/register/route.ts`.

---

## 🎁 The "Gift" State
- **Build:** Success (Tested February 2026)
- **TypeScript:** 0 Errors
- **Routes:** 50+ Routes verified
- **Performance:** Optimized static site generation for ToS, Privacy, and Landing.

*Platform delivered by Manuel V.*

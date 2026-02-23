# ROPA — Technical Handoff Guide

> **Version 1.0** — Architecture, Setup, and Infrastructure

This document is the technical source of truth for the ROPA platform. It covers the tech stack, database schema, environment configuration, and deployment instructions.

---

## 🏗️ Technology Stack

ROPA is built on a modern, type-safe Next.js stack, optimized for fast iteration and Vercel edge deployment.

*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
*   **Language:** Server-side and Client-side TypeScript
*   **Database:** PostgreSQL (hosted on [Neon](https://neon.tech))
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **API Layer:** [tRPC](https://trpc.io/) (Type-safe, end-to-end APIs)
*   **Authentication:** [Auth.js / NextAuth v5](https://authjs.dev/)
*   **Styling:** Vanilla CSS Modules with custom CSS variables (`globals.css`)
*   **Hosting:** [Vercel](https://vercel.com/) (Production)
*   **Image Storage:** (Pending: Configure Vercel Blob or Cloudinary via `images[]` field on creation)

---

## 🗄️ Database Architecture (Prisma)

The core relational structure centers around **Users**, **Listings**, and the **Swapping mechanism (Swipes, Offers, Matches)**.

| Model | Purpose | Key Relationships |
|---|---|---|
| `User` | Core identity, Profile, Karma, Trust Tier, Auth details | 1:M with Listings, Matches, Offers, Messages |
| `Listing` | Item for swap (Title, Size, Category, Lat/Lng) | Belongs to `User`. Linked to `DropZone` |
| `Swipe` | The discovery mechanic (Left/Right/Super on a Listing) | Links `User` (Swiper) to `Listing` |
| `Offer` | Financial/Trade proposal for a non-free item | Links `Buyer` to `Listing` & `Seller`. |
| `Match` | A successful reciprocal swipe OR an accepted offer | Links two `Users` and two `Listings`. Has Many `Messages`. |
| `Message` | Chat functionality between matched users | Belongs to `Match`. Has `isRead` receipts. |
| `DropZone`| Physical partner locations with local swap shelves | Has many `Listings` currently checked in. |
| `SwapCircle`| Local meetups and community events | Has many `CircleRSVP` |
| `KarmaEntry`| Append-only ledger for gamification points | Belongs to `User` |

> *To update the DB Schema:* Edit `prisma/schema.prisma` → Run `npx prisma db push` → Run `npx prisma generate`.

---

## 🔒 Authentication & Access

ROPA uses Auth.js (NextAuth) for session management.
*   **Providers:** Currently configured for mock credential login (for dev/demo), but ready for Google/Apple OAuth integration via the `auth.ts` config file.
*   **Admin Access:** Ensure your user record in the DB has `role = "ADMIN"` to access the `/admin` dashboard routes. Admin routes are strictly protected by middleware.

---

## 🚀 Environment Setup

To run this project locally or deploy it, you need the following `.env` variables:

```env
# 1. Database
# Your Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/ropa?sslmode=require"

# 2. NextAuth
# Generate a secret via: `npx auth secret` or `openssl rand -base64 32`
AUTH_SECRET="your_secret_here"
# The canonical URL of your deployed app (or localhost)
AUTH_URL="http://localhost:3000"

# 3. Third-Party Auth (Optional but Recommended)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### Local Development Loop
1.  `npm install`
2.  Add `.env` values.
3.  `npx prisma db push` (sync DB schema)
4.  `npx prisma generate` (generate TypeScript client)
5.  `npm run dev`

---

## 🌐 Deployment & Handoff Checklist

### Vercel Deployment
ROPA is optimized for Vercel. 
1.  Connect your GitHub repository to a new Vercel Project.
2.  Set the Framework Preset to **Next.js**.
3.  Add the Environment Variables (`DATABASE_URL`, `AUTH_SECRET`, etc.).
4.  Vercel automatically handles the build step (`next build`) and deploys Serverless Functions for the API routes/tRPC procedures.

### Post-Handoff Next Steps for the New Owner
1.  **Image Uploads:** The `docs/USER_GUIDE.md` notes image uploads are coming. Implement Vercel Blob or an S3 bucket in `trpc/listing.ts` to replace the `/listing/new` mock photo stub.
2.  **Domain Mapping:** Map your custom domain in Vercel. Ensure `AUTH_URL` is updated.
3.  **Production Seed:** If using the "Hostel Seed" GTM strategy, script a production DB seed of the first 3-5 Drop Zones and high-quality local listings to avoid an empty-state feed on Launch Day.

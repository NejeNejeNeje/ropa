# ROPA — AI Project Context File
*This document is written for an AI assistant to read in full at the start of a session with a new project owner. It provides the complete technical context needed to understand, debug, extend, and operate the ROPA application.*

---

## Project Identity

- **Name:** ROPA (Spanish for "clothes")
- **What it is:** A production-grade, mobile-first PWA for travelers to swap clothes. Features include Tinder-style swiping, an auction-based offer engine, P2P chat, geo-aware partner check-ins (Drop Zones), community events (Swap Circles), and a full moderation suite.
- **Production URL:** Deployed on Vercel (check `AUTH_URL` env var).
- **Database:** PostgreSQL on Neon (serverless).
- **PWA Status:** Manifest, service worker, and splash screens configured. Installable on iOS/Android.
- **Security:** CSRF protection, rate limiting on auth, strict input validation (Zod), and auth middleware.

---

## Tech Stack (exact versions)

```
Framework:     Next.js 15 (App Router)
Language:      TypeScript (strict mode)
API:           tRPC v11 
Database:      PostgreSQL via Prisma v6 ORM
Auth:          Auth.js (NextAuth) v5
Styling:       Vanilla CSS Modules + Custom Design Tokens (globals.css)
Messaging:     Resend (configured for password resets)
Storage:       Vercel Blob (pre-wired for photo uploads)
Deployment:    Vercel
```

---

## Directory Map

```
/
├── prisma/
│   └── schema.prisma          ← Single source of truth for all DB models
├── public/                    ← PWA assets, manifest, and icons
├── src/
│   ├── app/
│   │   ├── admin/             ← 9-tab moderation dashboard (protected)
│   │   ├── api/               ← REST API routes (auth, upload, admin, checkout)
│   │   ├── chat/              ← P2P messaging interface
│   │   ├── circles/           ← Swap Circle event management
│   │   ├── dev/               ← Development-only helper routes (Quick Login)
│   │   ├── dropzones/         ← Physical location check-ins
│   │   ├── feed/              ← Core "Swipe" discovery feed
│   │   ├── profile/           ← User dashboard, karma, and profile editing
│   │   └── travelswap/        ← Cross-city swap requests
│   ├── components/            ← Shared UI (SwipeCard, OfferSheet, Providers)
│   ├── server/
│   │   └── routers/           ← 40+ tRPC procedures across 10+ sub-routers
│   └── lib/                   ← Prisma, Auth, Zod, and tRPC configuration
└── ROPA Para Molly/           ← Complete business & technical handoff package
```

---

## Key Feature Status

| Feature | Status | Implementation Detail |
|---|---|---|
| **Admin Dashboard** | ✅ Complete | 9 tabs: Overview, Users, Listings, Offers, Matches, Circles, Zones, Community, Karma |
| **Authentication** | ✅ Production | Credentials + Pre-wired Google OAuth. Rate-limited registration. |
| **Password Reset** | ✅ Complete | Flow: /forgot-password → Resend email → Token → /reset-password |
| **P2P Chat** | ✅ Complete | Polling-based Real-time chat with image support and read receipts. |
| **Offer Engine** | ✅ Complete | Accept/Decline/Counter workflows with distance and quality scoring. |
| **Matching** | ✅ Complete | Reciprocal swipe detection and offer-to-match conversion. |
| **Moderation** | ✅ Complete | Server-side blocking, listing deactivation, and community post deletion. |
| **PWA** | ✅ Complete | Manifest and icons configured for "Add to Home Screen" usage. |
| **Image Uploads** | � Pre-wired | UI ready; API uses Vercel Blob (requires BLOB_READ_WRITE_TOKEN). |
| **Payments** | 🟡 Pre-wired | Checkout route ready; requires STRIPE_SECRET_KEY. |

---

## Technical Guardrails

1. **Auth Middleware:** All `/admin/*` and protected user routes are guarded in `src/middleware.ts` or route-level layouts.
2. **input Validation:** Every tRPC procedure and API route uses strict **Zod** validation with character limits to prevent overflow/DB injection.
3. **Karma Ledger:** Karma is an append-only transaction ledger (`KarmaEntry`). Never update `user.karma` without a corresponding entry.
4. **Responsive UI:** The entire app is mobile-first but fully responsive. The Admin dashboard uses a sidebar/drawer pattern for desktop.

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | YES | Neon Postgres connection string |
| `AUTH_SECRET` | YES | NextAuth encryption secret |
| `AUTH_URL` | YES | Public base URL of the app |
| `RESEND_API_KEY` | OPT | Sends password reset emails |
| `BLOB_READ_WRITE_TOKEN` | OPT | Enables photo uploads |
| `STRIPE_SECRET_KEY` | OPT | Enables payments |

---

## Common Support Commands

```bash
npm run dev           # Development mode
npx prisma studio     # Visual database editor
npm run build         # Production compile (includes type check & suspense audit)
npx tsc --noEmit      # Manual strict type check
```

*Final Update: February 2026*

# ROPA — Technical Architecture & Engineering Decisions
*For the engineer or developer taking ownership of this codebase*

---

## What Was Built

ROPA is a **mobile-first, full-stack web application** for clothes swapping between travelers. It combines Tinder-style swipe mechanics with an auction-based offer engine, P2P chat, geo-aware drop zones, and community events — all in one product. It was fully built from scratch and is live on Vercel backed by PostgreSQL on Neon.

---

## Why Each Technology Was Chosen

### Next.js 15 (App Router)
We deliberately chose Next.js with the App Router (not Pages Router) because:
- **Server Components by default** mean the feed page has zero client bundle for initial data — it's server-rendered.
- **Serverless functions** for every API route (`/app/api/*`) deploy natively to Vercel Edge without configuration.
- The App Router's nested layout system lets us have a single `layout.tsx` that wraps auth context, session state, and the tRPC provider once — all child pages inherit these with no prop drilling.

### tRPC v11
REST was explicitly avoided. Reasons:
- Every backend procedure (`listing.create`, `match.getMessages`, `offer.accept`) is **automatically typed end-to-end**. If you rename a field in the Prisma schema, TypeScript will flag every frontend call that reads that field before you ship.
- No API versioning problem at this stage of the product.
- The `protectedProcedure` wrapper creates a single, composable authentication guardrail — applied once, enforced everywhere it's used.

### Prisma + PostgreSQL (Neon)
- **Prisma** gives us a schema-as-code workflow: the `prisma/schema.prisma` file IS the database. Run `npx prisma db push` and the cloud DB reflects it instantly.
- **Neon** (serverless PostgreSQL) was chosen over SQLite (the original prototype DB) because: it supports production connection pooling, scales to zero when idle (cost-effective for a new product), and has native branching for preview environments.
- The migration path (SQLite → Neon) was already executed. The codebase is production-ready with PostgreSQL.

### Auth.js (NextAuth v5)
- Works natively with Next.js App Router middleware.
- The `auth()` function can be called in server components AND API routes without wrapping anything.
- The system is configured for email/credential login now, and the provider list in `src/lib/auth.ts` is where you add Google/Apple OAuth with 5 lines.

### CSS Modules (no Tailwind)
- A **custom design token system** lives in `src/app/globals.css` using CSS custom properties (variables). Every color, spacing value, radius, and z-index is a named token.
- This makes theming (e.g., adding a light mode) a single-file change.
- CSS Modules give full scoping — no class name collisions possible between components, even with generic names like `.button` or `.card`.

---

## Key Architecture Decisions

### 1. The Offer Engine (`src/server/routers/offer.ts`)
This is the most complex module. When a user swipes right on a paid item the flow is:
```
User Swipe → OfferSheet UI → offer.create tRPC
  → Haversine distance calc (buyer lat/lng vs. listing lat/lng)
  → Composite seller score (proximity 30% + karma 15% + trust 15% + experience 15% + style overlap 15% + bid type 10%)
  → Low-ball auto-decline (seller can set a minimum offer % threshold)
  → 24h expiry set
  → Returns { offer, autoDeclined } 
```
The `sellerScore` field on the `Offer` model is what the seller's dashboard sorts by — best-fit buyers rise to the top, not just highest bidders. This is a key product differentiator.

### 2. The Match Logic (`src/server/routers/swipe.ts`)
A match is created when:
- User A swipes RIGHT on a listing owned by User B **AND**
- User B has previously swiped RIGHT on any active listing owned by User A

The `swipe.create` mutation does a reciprocal lookup in a single round-trip. The resulting `Match` links `userA`, `userB`, `listingA`, and `listingB` — the two items being swapped.

### 3. Chat System (`src/server/routers/match.ts` + `/app/chat/[matchId]`)
The chat is database-backed (no WebSocket). A 3-second polling loop on `match.getMessages` provides near-real-time updates. This was a deliberate MVP decision — it avoids the infrastructure overhead of a WebSocket server while being entirely adequate for the low-frequency conversation pattern of meetup coordination.
- `message.markRead` is called on page open, not on every message received, to minimize DB writes.
- **Auth guard** on `getMessages` verifies the calling user is a member of the match (added post-audit).

### 4. Meetup Coordination (`/api/matches/[id]/meetup`)
This is a REST route (not tRPC) because it handles a simple status-machine update that doesn't need the full tRPC type chain. The meetup flow is:
```
Propose (POST) → meetupStatus: "proposed"
  → Other user Confirms (PATCH) → meetupStatus: "confirmed"
  → Map deep-links generated (Google Maps + Apple Maps via coordinates or address)
```
This is stored directly on the `Match` record — no join table needed for MVP.

### 5. Admin Dashboard (`/app/admin/*`)
The admin system is a completely separate UI (at `/admin`) protected by a middleware role check (`role === "ADMIN"`). It uses **direct REST API routes** (`/api/admin/*/status`, `/api/admin/*/block`) rather than tRPC — keeping a clean separation between the user-facing type-safe API and the admin operations panel. Admin users are set by manually updating `role` in the DB.

---

## Database Schema: The Relational Core

```
User
 ├─ has many → Listing (items they've posted)
 ├─ has many → Swipe (listings they've swiped on)
 ├─ has many → Offer (as buyer or seller)
 ├─ has many → Match (as userA or userB)
 │                └─ has many → Message
 ├─ has many → KarmaEntry (points ledger)
 └─ has many ↔ SwapBuddy (M:M self-join after completed swaps)

DropZone
 └─ has many → Listing (items currently checked in via QR)

SwapCircle
 └─ has many → CircleRSVP → User
```

---

## Known Gaps & Future Recommendations

| Area | Current State | Recommended Next Step |
|---|---|---|
| Image Upload | Form accepts photos but no storage wired | Add Vercel Blob (`@vercel/blob`) — 3 env vars + 20 lines |
| Real-time Chat | 3s polling | Upgrade to Ably or Supabase Realtime for push |
| OAuth | Email/password only | Add `GoogleProvider` to `src/lib/auth.ts` |
| Notifications | None | Integrate a push service (Expo, Firebase Cloud Messaging) |
| Payments | None | Integrate Stripe (the `offer.accept` transaction hook is the right place) |
| Profile Edit | Button visible but no route | Create `/profile/edit` with `trpc.user.update` |

---

## Running the Project

```bash
# 1. Clone and install
git clone <repo-url>
npm install

# 2. Set environment variables  (see .env.example)
cp .env.example .env  # fill in DATABASE_URL and AUTH_SECRET

# 3. Sync the DB schema and generate the Prisma client
npx prisma db push
npx prisma generate

# 4. Start the dev server
npm run dev
# → http://localhost:3000

# 5. Build for production
npm run build
npm start
```

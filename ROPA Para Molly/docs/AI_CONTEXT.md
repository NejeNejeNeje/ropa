# ROPA — AI Project Context File
*This document is written for an AI assistant to read in full at the start of a session with a new project owner. It provides the complete technical context needed to understand, debug, extend, and operate the ROPA application.*

---

## Project Identity

- **Name:** ROPA (Spanish for "clothes")
- **What it is:** A full-stack, mobile-first web application for travelers to swap clothes with each other, browse hostels' physical swap shelves (Drop Zones), and attend community swap events (Swap Circles).
- **Production URL:** Deployed on Vercel (check `AUTH_URL` env var for the live domain).
- **GitHub:** The main branch is always deployed to Vercel automatically on push.
- **Database:** PostgreSQL on Neon (serverless). Connection string is in `DATABASE_URL` env var.

---

## Tech Stack (exact versions)

```
Framework:     Next.js 15 (App Router, "use client" / "use server" model)
Language:      TypeScript (strict mode)
API:           tRPC v11 (all user-facing API calls)
Database:      PostgreSQL via Prisma v6 ORM
Auth:          Auth.js (NextAuth) v5
Styling:       CSS Modules + CSS custom properties in globals.css
Deployment:    Vercel (auto-deploy from main branch)
Node:          >=18
Package Mgr:   npm
```

---

## Directory Map

```
/
├── prisma/
│   └── schema.prisma          ← Single source of truth for all DB models
├── src/
│   ├── app/
│   │   ├── layout.tsx         ← Root layout: wraps Providers (tRPC + Session)
│   │   ├── globals.css        ← Design token system (all CSS variables)
│   │   ├── feed/page.tsx      ← Swipe feed (core product screen)
│   │   ├── matches/page.tsx   ← All matches + meetup coordination
│   │   ├── chat/[matchId]/    ← Chat thread for a specific match
│   │   ├── listing/new/       ← Create a new listing form
│   │   ├── explore/page.tsx   ← Drop Zones, Swap Circles, Community Feed
│   │   ├── circles/page.tsx   ← Swap Circles list + RSVP
│   │   ├── dropzones/page.tsx ← Drop Zone browsing
│   │   ├── community/page.tsx ← Travel post feed
│   │   ├── profile/page.tsx   ← User profile, karma, trust tier
│   │   ├── travelswap/        ← Travel-based long-distance swap requests
│   │   ├── offers/page.tsx    ← Seller/Buyer offers dashboard
│   │   ├── admin/             ← Admin-only dashboard (requires role=ADMIN in DB)
│   │   └── api/
│   │       ├── auth/          ← NextAuth route handlers
│   │       ├── trpc/[trpc]/   ← tRPC HTTP handler
│   │       └── matches/[id]/meetup/ ← Meetup proposal/confirm REST route
│   ├── components/
│   │   ├── Navigation.tsx     ← Bottom nav bar (shows unread message badge)
│   │   ├── SwipeCard.tsx      ← Animated swipeable listing card (Framer Motion)
│   │   ├── OfferSheet.tsx     ← Bottom drawer for making price offers
│   │   ├── MeetupSheet.tsx    ← Bottom drawer for proposing/confirming meetups
│   │   ├── MatchNotification.tsx ← Modal shown on a new match event
│   │   ├── FilterPanel.tsx    ← Feed filter drawer
│   │   └── Providers.tsx      ← tRPC + SessionProvider wrapper
│   ├── server/
│   │   └── routers/           ← All tRPC backend logic lives here
│   │       ├── _app.ts        ← Master router (combines all sub-routers)
│   │       ├── listing.ts     ← create, getFeed, getById, getUserListings
│   │       ├── match.ts       ← getAll, accept, complete, getMessages, getUnreadCount
│   │       ├── message.ts     ← send, markRead
│   │       ├── offer.ts       ← create, accept, decline, counter, getForSeller, getForBuyer
│   │       ├── swipe.ts       ← create (RIGHT/LEFT/SUPER), match detection
│   │       ├── circle.ts      ← getUpcoming, getPast, getById, rsvp, cancelRsvp
│   │       ├── dropZone.ts    ← getAll, getByCity, getById, scanQR
│   │       ├── community.ts   ← getFeed (travel posts)
│   │       ├── karma.ts       ← getLog
│   │       ├── travelswap.ts  ← Travel-based swap requests
│   │       └── user.ts        ← me, update, getSwapBuddies, checkTrustUpgrade
│   └── lib/
│       ├── auth.ts            ← NextAuth config (add OAuth providers here)
│       ├── trpc.ts            ← tRPC server-side setup, protectedProcedure def
│       ├── trpc-client.ts     ← tRPC React client hooks
│       └── prisma.ts          ← Prisma singleton client
└── docs/                      ← Handoff documentation (this folder)
```

---

## All tRPC Procedures (Backend API)

### `listing`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `create` | mutation | 🔒 | Create a new listing. Awards 10 karma if free. |
| `getFeed` | query | public | Paginated feed. Excludes own listings + already-swiped items. |
| `getById` | query | public | Single listing with user and drop zone. |
| `getByDropZone` | query | public | All active listings at a drop zone. |
| `getUserListings` | query | public | All listings by a user ID. |

### `match`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `getAll` | query | 🔒 | All matches for current user with last message. |
| `accept` | mutation | 🔒 | Set match status to 'accepted'. |
| `complete` | mutation | 🔒 | Mark swap done. Awards 20 karma each, creates SwapBuddy. |
| `getMessages` | query | 🔒 | Full message thread ASC. **Verifies membership first.** |
| `getUnreadCount` | query | 🔒 | Total unread messages from others. Used for nav badge. |

### `message`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `send` | mutation | 🔒 | Send a message to a match thread. Bumps match.updatedAt. |
| `markRead` | mutation | 🔒 | Mark all unread messages in a match as read. |

### `offer`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `create` | mutation | 🔒 | Submit offer. Calculates sellerScore + distance. Auto-declines lowballs. |
| `accept` | mutation | 🔒 | Accept offer → atomic tx: creates Match, declines others, awards karma. |
| `decline` | mutation | 🔒 | Seller declines offer. |
| `counter` | mutation | 🔒 | Seller counters with a new amount. |
| `acceptCounter` | mutation | 🔒 | Buyer accepts seller counter → creates Match. |
| `declineCounter` | mutation | 🔒 | Buyer declines counter. |
| `getForSeller` | query | 🔒 | All offers on seller's listings (auto-expires stale ones). |
| `getForBuyer` | query | 🔒 | All offers buyer has submitted. |
| `setMinOfferPercent` | mutation | 🔒 | Seller sets auto-decline floor %. |

### `swipe`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `create` | mutation | 🔒 | Record a swipe + check for reciprocal match. |
| `getStats` | query | 🔒 | Total swipes, rights, match rate. |

### `circle`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `getUpcoming` | query | public | Upcoming swap circles with RSVPs. |
| `getPast` | query | public | Past events. |
| `getById` | query | public | Single circle details. |
| `rsvp` | mutation | 🔒 | RSVP to a circle (checks capacity, marks isFull). |
| `cancelRsvp` | mutation | 🔒 | Cancel RSVP. |

### `dropZone`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `getAll` | query | public | All drop zones ordered by activity. |
| `getByCity` | query | public | Drop zones in a city. |
| `getById` | query | public | Single drop zone with current active listings. |
| `scanQR` | mutation | 🔒 | Link a listing to a drop zone and increment count. |

### `user`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `me` | query | 🔒 | Current user's full profile. |
| `update` | mutation | 🔒 | Update profile fields. |
| `getSwapBuddies` | query | 🔒 | Users the current user has completed swaps with. |

---

## Key Business Logic Notes for AI

1. **A "Match" is created in two ways:**
   - Via `swipe.create` when a reciprocal swipe is detected (both users swiped right on each other's listings).
   - Via `offer.accept` or `offer.acceptCounter` in a database transaction.

2. **Karma is an append-only ledger.** Never update `karmaPoints` directly on `User` without also creating a `KarmaEntry` record. The `KarmaEntry` table IS the audit log.

3. **The `activeListings` field on `DropZone` is managed manually** via `dropZone.scanQR`. It is NOT computed from the count of related listings. Do not try to auto-compute it from a relation count without migrating this design.

4. **Admin access** requires `role = "ADMIN"` on the `User` model. Set this manually via Prisma Studio (`npx prisma studio`) or a direct SQL update.

5. **The chat page polls every 3 seconds.** This is intentional (MVP decision to avoid WebSocket infrastructure). If you see high DB query load in Neon, this is where to look first.

6. **`getFeed` excludes swiped listings** by looking up `Swipe` records for the current session user before filtering. On a large dataset, add a DB index on `Swipe(swiperId, listingId)`.

---

## Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."   # Neon connection string (with ?sslmode=require)
AUTH_SECRET="..."                  # Random 32-byte secret. Generate: npx auth secret
AUTH_URL="https://yourdomain.com"  # Or http://localhost:3000 for local

# Optional (for future OAuth)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

---

## Common Commands (for session use)

```bash
npm run dev                  # Start local dev server
npx prisma studio            # Visual DB browser at localhost:5555
npx prisma db push           # Apply schema changes to DB (no migration file)
npx prisma generate          # Regenerate TypeScript client after schema change
npx tsc --noEmit             # TypeScript check (should return 0 errors)
git push origin main         # Triggers auto-deploy to Vercel
```

---

## Known Remaining TODOs

| ID | Area | Status | Notes |
|---|---|---|---|
| C2 | Image Upload | ❌ Not implemented | Schema and UI ready. Needs Vercel Blob wiring. |
| I1 | Profile Edit | ❌ Not implemented | Button visible at `/profile`. No route exists. |
| I5 | Detail pages | ❌ Not implemented | `/circles/[id]` and `/dropzones/[id]` user-facing pages missing. |
| N1 | Community Likes | ❌ Stub | Like/comment buttons in `/community` have no handlers. |
| N2 | TravelSwap Form | ❌ Stub | Form visible but no tRPC call on submit. |

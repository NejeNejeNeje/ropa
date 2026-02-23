# ROPA — AI Project Context File
*Upload this document to your AI assistant at the start of every development session. It provides complete technical context to understand, debug, extend, and operate ROPA.*

---

## Project Identity

- **Name:** ROPA (Spanish for "clothes")
- **What it is:** A full-stack, mobile-first PWA for travelers to swap clothes, browse hostel swap shelves (Drop Zones), chat + schedule meetups, and attend community swap events (Swap Circles).
- **Production URL:** https://ropa-trade.vercel.app (connect a custom domain via Vercel settings)
- **Git:** Push to `main` triggers auto-deploy on Vercel
- **Database:** PostgreSQL on Neon (serverless). Connection string in `DATABASE_URL` env var.
- **MVP Score:** 8.5/10 — fully beta-ready. Only Stripe (SwapShield payments) remains.

---

## Tech Stack (exact versions)

```
Framework:     Next.js 15 (App Router, "use client" / "use server" model)
Language:      TypeScript (strict mode)
API:           tRPC v11 (all user-facing API calls)
Database:      PostgreSQL via Prisma v6 ORM
Auth:          Auth.js (NextAuth) v5
Styling:       CSS Modules + CSS custom properties in globals.css
Storage:       Vercel Blob (user-uploaded listing images, community post images)
Push:          Web Push API + VAPID (web-push npm package)
Deployment:    Vercel (auto-deploy from main branch)
Node:          >=18
Package Mgr:   npm
```

---

## Directory Map

```
/
├── prisma/
│   ├── schema.prisma          ← Single source of truth for all DB models
│   └── seed.ts                ← Database seeder (npm run db:seed)
├── public/
│   └── sw.js                  ← Service Worker (handles Web Push notifications)
├── src/
│   ├── app/
│   │   ├── layout.tsx         ← Root layout: wraps Providers (tRPC + Session)
│   │   ├── globals.css        ← Design token system (all CSS variables)
│   │   ├── feed/page.tsx      ← Swipe feed (core product screen)
│   │   ├── matches/page.tsx   ← All matches, chat entry points
│   │   ├── chat/[matchId]/    ← Chat thread: 3s poll, push banner, MeetupWidget
│   │   ├── listing/new/       ← Create listing form with Vercel Blob image upload
│   │   ├── explore/page.tsx   ← Drop Zones, Swap Circles, Community Feed
│   │   ├── circles/page.tsx   ← Swap Circles list (cards link to /circles/[id])
│   │   ├── circles/[id]/      ← Circle detail page with RSVP
│   │   ├── dropzones/page.tsx ← Drop Zone browsing (cards link to /dropzones/[id])
│   │   ├── dropzones/[id]/    ← Drop Zone detail page with active listings
│   │   ├── community/page.tsx ← Travel post feed + PostComposer + ShareSheet
│   │   ├── profile/page.tsx   ← User profile, karma, trust tier
│   │   ├── profile/edit/      ← Profile edit form
│   │   ├── travelswap/        ← Travel-based bilateral swap request matching
│   │   ├── offers/page.tsx    ← Seller/Buyer offers dashboard
│   │   ├── admin/             ← Admin-only dashboard (requires role="admin" in DB)
│   │   └── api/
│   │       ├── auth/          ← NextAuth route handlers
│   │       ├── trpc/[trpc]/   ← tRPC HTTP handler
│   │       ├── upload/        ← Vercel Blob image upload (auth-protected)
│   │       ├── push/subscribe/← Save/delete Web Push subscriptions
│   │       └── matches/[id]/meetup/ ← Meetup propose (POST) + confirm/cancel (PATCH)
│   ├── components/
│   │   ├── Navigation.tsx     ← Bottom nav bar (shows unread message badge)
│   │   ├── SwipeCard.tsx      ← Animated swipeable listing card (Framer Motion)
│   │   ├── OfferSheet.tsx     ← Bottom drawer for making price offers
│   │   ├── MeetupWidget.tsx   ← In-chat meetup scheduler with Drop Zone chips
│   │   ├── PostComposer.tsx   ← Community post creator modal (image + caption + tags)
│   │   ├── ShareSheet.tsx     ← Instagram Stories share (Web Share API + Canvas)
│   │   ├── FilterPanel.tsx    ← Feed filter drawer
│   │   └── Providers.tsx      ← tRPC + SessionProvider wrapper
│   ├── hooks/
│   │   └── usePushNotifications.ts ← SW registration + subscribe/unsubscribe hook
│   ├── lib/
│   │   ├── auth.ts            ← NextAuth config (add OAuth providers here)
│   │   ├── trpc.ts            ← tRPC server-side setup, protectedProcedure def
│   │   ├── trpc-client.ts     ← tRPC React client hooks
│   │   ├── prisma.ts          ← Prisma singleton client
│   │   ├── push.ts            ← sendPushToUser(userId, payload) utility
│   │   └── StoryCardGenerator.ts ← Canvas-based 1080×1920 story card generator
│   └── server/
│       └── routers/           ← All tRPC backend logic
│           ├── _app.ts        ← Master router (combines all sub-routers)
│           ├── listing.ts     ← create, getFeed, getById, getByDropZone, getUserListings
│           ├── match.ts       ← getAll, accept, complete, getMessages, getUnreadCount
│           ├── message.ts     ← send (+ push notification), markRead
│           ├── offer.ts       ← create, accept, decline, counter, acceptCounter, declineCounter, getForSeller, getForBuyer, setMinOfferPercent
│           ├── swipe.ts       ← create (RIGHT/LEFT/SUPER), getStats
│           ├── circle.ts      ← getUpcoming, getPast, getById, rsvp, cancelRsvp
│           ├── dropZone.ts    ← getAll, getByCity, getById, scanQR
│           ├── community.ts   ← getFeed, createPost (+10 karma), toggleLike
│           ├── karma.ts       ← getLog
│           ├── travelswap.ts  ← create, findMatches (bilateral + partial chains)
│           └── user.ts        ← me, updateProfile, getSwapBuddies
```

---

## All tRPC Procedures

### `listing`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `create` | mutation | 🔒 | Create listing. Awards 10 karma if free. Accepts `images: [{url, id}]` array. |
| `getFeed` | query | public | Paginated feed. Excludes own listings + already-swiped. |
| `getById` | query | public | Single listing with user + drop zone. |
| `getByDropZone` | query | public | All active listings at a drop zone. |
| `getUserListings` | query | public | All listings by a userId. |

### `match`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `getAll` | query | 🔒 | All matches with last message + meetup fields. |
| `accept` | mutation | 🔒 | Set match status to 'accepted'. |
| `complete` | mutation | 🔒 | Mark swap done. Awards 20 karma each, creates SwapBuddy. |
| `getMessages` | query | 🔒 | Full message thread ASC. Verifies membership. |
| `getUnreadCount` | query | 🔒 | Total unread messages from others. Used for nav badge. |

### `message`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `send` | mutation | 🔒 | Send message. Fires push notification to recipient (fire-and-forget). |
| `markRead` | mutation | 🔒 | Mark all unread messages in a match as read. |

### `offer`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `create` | mutation | 🔒 | Submit offer. Calculates sellerScore + distance. Auto-declines lowballs. |
| `accept` | mutation | 🔒 | Accept → atomic tx: creates Match, declines others, awards karma. |
| `decline` | mutation | 🔒 | Seller declines. |
| `counter` | mutation | 🔒 | Seller counters with new amount. |
| `acceptCounter` | mutation | 🔒 | Buyer accepts counter → creates Match. |
| `declineCounter` | mutation | 🔒 | Buyer declines counter. |
| `getForSeller` | query | 🔒 | All offers on seller's listings (auto-expires stale). |
| `getForBuyer` | query | 🔒 | All offers buyer has submitted. |
| `setMinOfferPercent` | mutation | 🔒 | Set auto-decline floor %. |

### `swipe`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `create` | mutation | 🔒 | Record swipe. Checks for reciprocal = creates Match if found. |
| `getStats` | query | 🔒 | Total swipes, rights, match rate. |

### `circle`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `getUpcoming` | query | public | Upcoming swap circles with RSVPs. |
| `getPast` | query | public | Past events. |
| `getById` | query | public | Single circle details. |
| `rsvp` | mutation | 🔒 | RSVP (checks capacity, marks isFull). |
| `cancelRsvp` | mutation | 🔒 | Cancel RSVP. |

### `dropZone`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `getAll` | query | public | All drop zones ordered by activity. |
| `getByCity` | query | public | Drop zones in a city. |
| `getById` | query | public | Single drop zone with active listings. |
| `scanQR` | mutation | 🔒 | Link listing to drop zone + increment count. |

### `community`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `getFeed` | query | public | Paginated travel post feed. |
| `createPost` | mutation | 🔒 | Create post (imageUrl, caption, city, country, tags). Awards +10 karma. |
| `toggleLike` | mutation | 🔒 | Increment like count on a post. |

### `travelSwap`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `create` | mutation | 🔒 | Create swap request (city, destination, needs[], offers[]). Expires in 7 days. |
| `findMatches` | query | 🔒 | Find bilateral + partial matches for a swap request. |

### `user`
| Procedure | Type | Auth | Description |
|---|---|---|---|
| `me` | query | 🔒 | Current user's full profile. |
| `updateProfile` | mutation | 🔒 | Update name, bio, location, preferences. |
| `getSwapBuddies` | query | 🔒 | Users the current user has completed swaps with. |

---

## Key Business Logic Rules (Do Not Break)

1. **A Match is created in two ways:**
   - `swipe.create` when a reciprocal swipe is detected (both users swiped RIGHT on each other's listings)
   - `offer.accept` or `offer.acceptCounter` inside an atomic database transaction

2. **Karma is an append-only ledger.** Never update `karmaPoints` directly on `User` without also writing a `KarmaEntry` record. The `KarmaEntry` table IS the audit log.

3. **`activeListings` on `DropZone` is managed manually** via `dropZone.scanQR`. It is NOT computed from a relation count. Do not auto-compute it without a schema migration.

4. **Admin access** requires `role = "admin"` on the `User` model. Set manually via Prisma Studio or SQL:
   ```sql
   UPDATE "User" SET role = 'admin' WHERE email = 'admin@example.com';
   ```

5. **Chat polls every 3 seconds.** This is intentional (MVP WebSocket avoidance). On high load, index `Swipe(swiperId, listingId)` and `Message(matchId, isRead)`.

6. **Push notifications** are fire-and-forget. `message.send` calls `sendPushToUser()` which catches errors silently. Expired subscriptions (HTTP 410/404) are auto-cleared from the DB.

7. **Image uploads** go through `/api/upload` → Vercel Blob → stored as `imageUrl` strings. The listing `images` field is `String` (JSON array of `{url, id}` objects) in the DB.

8. **Meetup API** is at `/api/matches/[id]/meetup` (REST, not tRPC). POST to propose, PATCH with `{ action: "confirm" | "cancel" }`. Only the non-proposing party can confirm.

---

## Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."          # Neon PostgreSQL connection string
AUTH_SECRET="..."                         # 32+ char random secret
NEXTAUTH_URL="https://ropa-trade.vercel.app"

# Vercel Blob (image uploads)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Web Push Notifications (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."       # URL-safe base64, no = chars
VAPID_PRIVATE_KEY="..."                  # Must match public key
VAPID_SUBJECT="mailto:admin@ropa.trade"

# Stripe — NOT YET CONFIGURED (the one remaining feature)
# STRIPE_SECRET_KEY="sk_live_..."
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
# STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## Common Commands

```bash
npm run dev                  # Start local dev server (localhost:3000)
npx prisma studio            # Visual DB browser (localhost:5555)
npx prisma db push           # Apply schema changes to DB (no migration file)
npx prisma generate          # Regenerate TypeScript client after schema change
npx tsc --noEmit             # TypeScript check (must be 0 errors before deploy)
npx next build               # Full build (must exit 0 before deploy)
git push origin main         # Triggers auto-deploy to Vercel
vercel --prod                # Manual production deploy
npm run db:seed              # Re-seed database (WARNING: wipes existing data)
```

---

## Feature Status (Current)

| Feature | Status | Notes |
|---------|--------|-------|
| Swipe-to-match feed | ✅ Live | 3-step: swipe → offer → match |
| Listing creation + image upload | ✅ Live | Vercel Blob, multi-image |
| Offer system (bid/counter/accept) | ✅ Live | Auto-decline lowballs |
| Chat (3s poll) | ✅ Live | Read receipts, auto-resize textarea |
| Web Push notifications | ✅ Live | On new message, VAPID via web-push |
| Meetup scheduling in chat | ✅ Live | Drop Zone chips, propose/confirm/cancel |
| Drop Zones (list + detail) | ✅ Live | Cards link to /dropzones/[id] |
| Swap Circles (list + detail) | ✅ Live | Cards link to /circles/[id], RSVP |
| Community feed + post creation | ✅ Live | Image + caption + tags, +10 karma |
| Instagram Stories share | ✅ Live | Web Share API + Canvas story card |
| TravelSwap Exchange | ✅ Live | Bilateral need↔have matching |
| Karma & trust tiers | ✅ Live | Append-only ledger |
| Profile edit | ✅ Live | Name, bio, city, preferences |
| Admin dashboard | ✅ Live | Users, listings, offers, drop zones |
| **Stripe / SwapShield** | ⏳ Pending | Code ready, needs live Stripe account |

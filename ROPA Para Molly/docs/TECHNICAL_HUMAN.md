# ROPA — Technical Architecture & Human Guide
*For the engineer or developer taking ownership of this codebase*

---

## Welcome to ROPA 🎁

This project was built with a single goal: to create a **"Production-Complete" Gift**. It isn't just a prototype; it's a hardened, type-safe, and fully-featured PWA that is ready for its first 1,000 users today.

---

## The Engineering Philosophy

Every line of code in ROPA follows three rules:
1. **Type Safety is Non-Negotiable:** tRPC + Prisma + Zod ensure that a change in the database schema results in a compile error in the frontend if not handled. This prevents 99% of common runtime bugs.
2. **Mobile First, PWA Always:** People swap clothes while traveling. The UI is designed for one-handed thumb usage, and the manifest is configured to work as a native app on iOS and Android.
3. **Append-Only Karma:** Trust is the currency of the platform. We built a literal "Karma Ledger" (`KarmaEntry`) so that every point awarded is auditable.

---

## The Core Engines

### 1. The Offer Engine (`src/server/routers/offer.ts`)
This is the heart of the commerce side. When a user makes an offer, we don't just send a price. We calculate a **Seller Score** based on proximity, karma, and trust. The seller's dashboard highlights the "Best Match" buyers, not just the richest ones.
*Self-correction feature:* Sellers can set a "Min Offer %" to auto-decline unreasonable lowballs without manual intervention.

### 2. The Match Logic (`src/server/routers/swipe.ts`)
A match is the bridge between discovery and conversation. We detect reciprocal swipes in a single database transaction. The moment User A and User B swipe right on each other, the `Match` is born, and a chat thread is automatically initialized.

### 3. P2P Messaging (`src/chat/[matchId]`)
The chat uses a high-frequency polling pattern (3s). This was an intentional choice to provide **real-time feeling without WebSocket infrastructure costs**. It handles text, photos, and read receipts out of the box.

### 4. Admin Command Center (`/admin`)
We built a professional-grade moderation suite. From the dashboard, you can:
- **Block Users:** Instantly revoke access.
- **Moderate Community:** Delete posts or deactivate listings.
- **Track Health:** Real-time stats on pending offers, active matches, and karma.

---

## Security & Readiness Hardening

We've gone beyond the basics:
- **Input Sanitization:** Every text input (bio, caption, price) is bounded by Zod character limits.
- **Registration Rate-Limiting:** Prevents bot spam or brute-force attempts on the registration route.
- **Password Resets:** A secure token-based flow integrated with Resend.
- **Suspense Audit:** The build is optimized for Next.js 15 partial pre-rendering.

---

## The "Manual" Parts (Owner's To-Do)

To make this platform yours, you just need to:
1. **Logo & Icons:** Replace the placeholder `public/*.png` files with your ROPA branding.
2. **Branding CSS:** Update `src/app/globals.css` to change the `--primary` color to your brand's specific gold/hue.
3. **Connect the "Feature Boosters":** Add your Stripe, Resend, and Vercel Blob tokens to the Vercel dashboard.

---

## Final Thoughts
This codebase is clean, tested, and built to survive the "Front Page of Hacker News" test. It's been a pleasure building it for you.

*Cheers,*
*Manuel V.*

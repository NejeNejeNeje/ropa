# ROPA 👗🌎

> **Trade clothes while traveling** — a production-ready, peer-to-peer social marketplace for travelers.

ROPA (Spanish for "clothes") is a mobile-first PWA designed for the sustainable travel enthusiast. It combines social discovery with a hardened commerce engine to help travelers keep their luggage light and their wardrobe fresh.

---

## 🎁 Handoff Package
This repository is pre-configured and documented for a smooth owner handoff. All core documentation lives in the `ROPA Para Molly/docs/` directory:

1.  [**User Guide**](ROPA%20Para%20Molly/docs/USER_GUIDE.md) — How to operate the platform and moderate content.
2.  [**Technical Handoff**](ROPA%20Para%20Molly/docs/TECHNICAL_HANDOFF.md) — Architecture, schema, and environment setup.
3.  [**User Stories**](USER_STORIES.md) — Registry of 90+ supported capabilities.
4.  [**Business Strategy**](ROPA%20Para%20Molly/docs/BUSINESS_STRATEGY.md) — GTM, partnerships, and monetization.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.example .env
# ROPA uses a local SQLite database by default so it runs instantly!
# Just add an AUTH_SECRET in .env (you can generate one with `npx auth secret`)

# 3. Initialize the internal database
npx prisma db push
npx prisma generate

# 4. Start the engine
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and use the **🚀 Quick Login** panel on the login page to enter as a Demo User or Admin.

---

## 💎 Key Features

- 📱 **PWA Ready** — Installable "Add to Home Screen" experience for iOS/Android.
- 🔥 **Swipe discovery** — Tinder-style cards for одежда discovery.
- 💬 **P2P Chat** — Polling-based real-time messaging with image support.
- ⚖️ **Advanced Offers** — Negotiation loop (Accept/Decline/Counter) with "Best Match" scoring.
- 📍 **Drop Zones** — Partner hostels/cafes with physical swap shelves.
- 🌍 **Swap Circles** — Community meetup and swap event management.
- ⭐ **Karma Ledger** — Append-only trust system and gamified status tiers.
- 🛡️ **Admin Suite** — 9-tab moderation dashboard for platform health.

---

## 🛠️ The Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **API** | tRPC v11 (Strict Type-safety) |
| **Database** | **SQLite (Internal)** for local / **PostgreSQL** for Production |
| **Auth** | Auth.js v5 (NextAuth) |
| **PWA** | Manifest + Custom Service Worker |
| **Messaging** | Resend (Password Resets) |
| **Infrastructure** | Vercel |

---

## 🚀 Production Deployment (Cloud Database)

ROPA ships with an internal SQLite database so you can test it on your computer immediately. Before launching on Vercel, you must migrate it to a cloud database (PostgreSQL):

1. **Update the Engine:** Open `prisma/schema.prisma` and change `provider = "sqlite"` to `provider = "postgresql"`.
2. **Create Cloud DB:** Create a free serverless Postgres database on [Neon.tech](https://neon.tech).
3. **Deploy:** Connect your GitHub repo to a Vercel project and set your `DATABASE_URL` (from Neon), `AUTH_SECRET`, and `AUTH_URL`.
4. **Boosters:** Add "Feature Booster" keys (Stripe, Resend, Vercel Blob) when ready to scale.

---

## License
Created with ❤️ for Molly.
🏆 **Production Grade: Ready for Launch**

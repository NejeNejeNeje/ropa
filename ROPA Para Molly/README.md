# ROPA 🎒
> Trade clothes while traveling — a social marketplace for travelers who swap fashion.

## 📚 Handoff Documentation

The complete project handoff package is available in the `docs/` directory:

1. [🎁 Gift Letter](docs/GIFT_LETTER.md) — A personal note about what you're receiving.
2. [🛠️ IT Setup Guide](docs/SETUP_GUIDE_IT.md) — **Start here if you're the technical friend.** Step-by-step setup for every account and service.
3. [📱 User Guide](docs/USER_GUIDE.md) — App usage, core flows (Swipe, Chat, Meetups), and the Karma system.
4. [📊 Business Strategy](docs/BUSINESS_STRATEGY.md) — Monetization levers, B2B Drop Zone partnerships, and Go-To-Market strategy.
5. [📈 Market Analysis](docs/MARKET_ANALYSIS.md) — Market size, competitive landscape, and growth opportunity.
6. [🔧 Technical Handoff](docs/TECHNICAL_HANDOFF.md) — Architecture, database schema, environment setup, and deployment.

---

## Quick Start (Local Testing)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your values (minimum: AUTH_SECRET)

# 3. Run locally (uses built-in SQLite database)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **🚀 Demo Login** to explore.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **API** | tRPC v11 (type-safe, end-to-end) |
| **Database** | Prisma v6 + SQLite (dev) / PostgreSQL (production) |
| **Auth** | Auth.js / NextAuth v5 |
| **Styling** | CSS Modules + custom design token system |
| **Hosting** | Vercel (production) |

---

## Key Features


- 🔥 **Swipe Feed** — Tinder-like card swiping for clothing listings
- 💰 **Swipe Auction** — Bid on items when swiping right (underbid/match/overbid)
- 💬 **Counter-Offers** — Full negotiation loop (seller counters → buyer accepts/declines)
- 📍 **Drop Zones** — Physical swap locations at hostels, cafés, coworking spaces
- 🌍 **Swap Circles** — Community swap events
- ⭐ **Karma System** — Trust scores based on trading history
- 🛡️ **Rate Limiting** — Max 3 offers per buyer per listing per 24h
- 📉 **Lowball Filter** — Sellers can auto-decline offers below X% of asking price

---

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── feed/              # Swipe feed
│   ├── offers/            # Seller/Buyer offers dashboard
│   ├── explore/           # Drop zones + circles
│   ├── matches/           # Chat with matched traders
│   ├── profile/           # User profile
│   └── login/             # Auth (login + register)
├── components/            # Shared UI components
├── lib/                   # Auth, Prisma, tRPC setup
└── server/routers/        # tRPC API routes
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Demo data seed script
```

---

## Deployment

### Option 1: Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL` — Use a hosted DB (PlanetScale, Neon, Supabase)
- `AUTH_SECRET` — Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` — Your production URL

### Option 2: Docker

```bash
docker build -t swappack .
docker run -p 3000:3000 swappack
```

### Option 3: Any Node.js Host

```bash
npm run build
npm start
```

---

## Database

### Switch to PostgreSQL

1. Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/swappack"
   ```

2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Run migrations:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

---

## License

MIT

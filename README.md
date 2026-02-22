# SwapPack 🎒

> Trade clothes while traveling — a social marketplace for travelers who swap fashion.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# 3. Initialize database
npx prisma db push
npx prisma generate

# 4. Seed demo data
npx prisma db seed

# 5. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **🚀 Demo Login** to explore.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Database — SQLite for dev, swap for PostgreSQL in production
DATABASE_URL="file:./dev.db"

# Auth — CHANGE THIS in production
AUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Generating AUTH_SECRET

```bash
openssl rand -base64 32
```

---

## Demo Credentials

| User | Email | Password |
|------|-------|----------|
| **Demo User** | `you@swappack.com` | `swappack123` |
| Maya Chen | `maya@example.com` | `swappack123` |
| Liam Okafor | `liam@example.com` | `swappack123` |
| Sofía Rivera | `sofia@example.com` | `swappack123` |

All seed users share the same password: `swappack123`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **API** | tRPC v11 (type-safe) |
| **Database** | Prisma v6 + SQLite |
| **Auth** | NextAuth v5 (Credentials) |
| **Styling** | CSS Modules + custom design system |

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

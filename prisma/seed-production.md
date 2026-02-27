# 🌱 ROPA — Production Seed Guide

> A guide for seeding the first real data into the production database, as part of the "Hostel Seed" GTM strategy.

---

## Why Seed?

A fresh deployment of ROPA shows an empty feed. The "Hostel Seed" strategy avoids the chicken-and-egg problem by pre-loading:
- **3-5 Drop Zones** in hub cities where traveling communities already exist
- **High-quality demo listings** so users see a vibrant feed on Day 1

---

## Step 1 — Run the Initial Seed Script

From the project root with your production `DATABASE_URL` set:

```bash
# With your production Neon DATABASE_URL
DATABASE_URL="postgresql://..." npx ts-node prisma/seed.ts
```

This creates the demo user accounts and sample listings.

---

## Step 2 — Add Your First Drop Zones via Admin Dashboard

After deploying, navigate to `/admin/drop-zones` and click **"Add Drop Zone"**.

Recommended Hub Cities for Launch:

| City | Venue Type | Why |
|---|---|---|
| **Medellín, Colombia** | Hostel | Massive digital nomad community; Lleras Park area |
| **Lisbon, Portugal** | Hostel / Coworking | Backpacker + startup hub; LX Factory area |
| **Bali, Indonesia** | Coworking | Long-term traveler scene; Canggu area |

### Sample Drop Zone Data (for first 3):

```json
[
  {
    "name": "Selina Medellín El Poblado",
    "type": "hostel",
    "address": "Calle 7 # 42-28, El Poblado",
    "city": "Medellín",
    "country": "Colombia",
    "hours": "Daily 8am–10pm",
    "description": "Community swap shelf at the hostel reception. Open to guests and ROPA members."
  },
  {
    "name": "LX Factory Swap Corner",
    "type": "coworking",
    "address": "Rua Rodrigues de Faria 103, Alcântara",
    "city": "Lisbon",
    "country": "Portugal",
    "hours": "Mon–Sat 10am–7pm",
    "description": "Creative district swap shelf. Leave something, take something."
  },
  {
    "name": "Dojo Bali Canggu",
    "type": "coworking",
    "address": "Jl. Batu Mejan No.88, Canggu",
    "city": "Bali",
    "country": "Indonesia",
    "hours": "Daily 8am–8pm",
    "description": "Nomad hub swap station. Perfect for seasonal traveler wardrobe refreshes."
  }
]
```

---

## Step 3 — Set Yourself as Admin

See `SETUP_GUIDE_IT.md` → Step 3 for instructions on using Prisma Studio to grant yourself admin access.

---

## Step 4 — Verify the Live Feed

After seeding:
1. Open your live app URL
2. Create a non-admin test account
3. Verify the `/feed` page shows listings
4. Verify `/dropzones` shows your new Drop Zones

---

## Ongoing: Community Growth

- Post the app in **digital nomad Facebook groups** for the hub cities
- Ask the first 5 users to list items — this creates social proof
- The Karma system will naturally reward early users with Bronze → Silver upgrades, creating an engaged founding community

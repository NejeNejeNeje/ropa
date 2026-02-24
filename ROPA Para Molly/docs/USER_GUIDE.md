# ROPA — Owner's User Guide

Welcome, Molly! This guide explains how to operate your new platform from the "Captain's Chair."

---

## 1. Entering the Admin Dashboard

The `/admin` dashboard is the hidden heart of ROPA. It is strictly protected.

1.  **Grant yourself access:** 
    - Log in to ROPA with your own account.
    - Open the database (via Prisma Studio or Neon Console).
    - Find your user record and change `role` to `"ADMIN"`.
2.  **Navigate:** Go to `ropa.trade/admin`. You will see a sidebar with 9 active sections.

---

## 2. Platform Moderation

### Managing Users
- **The Ledger:** Every user's "Karma" determines their Trust Tier (Bronze, Silver, Gold).
- **The Shield:** If a user is reported or misbehaving, you can click **"Block User"** in their detail profile to instantly kick them from the platform.

### Content Moderation
- **Listings:** If an item is inappropriate, you can deactivate it from the Listings tab. It will disappear from the feed instantly.
- **Community:** Use the Community tab to review photos posted by travelers. Use the **"Delete Post"** button to remove anything that violates guidelines.

### Dispute Resolution
- **Offers & Matches:** If two users can't agree on a swap or price, you can view their match details to see their agreed price and message history to help mediate.

---

## 3. Growing the Ecosystem

### Drop Zones (Partnerships)
Drop Zones are hostels, cafes, or shops that host a swap shelf.
- **To add a new one:** Use Prisma Studio to create a `DropZone` record.
- **The QR Loop:** Users at that hostel scan the QR code to "Check In" their clothes to your shelf.

### Swap Circles (Events)
These are local meetups.
- **Active Moderation:** You can "Complete" a circle after it happens, or "Cancel" it if the host drops out.
- **RSVPs:** You can monitor how many people are coming to each event in real-time.

---

## 4. The Tech Roadmap (Next Steps)

Ropa is ready for users, but here is what we recommend as your first "Upgrades":

1.  **Activate "The Boosters":** Add your API keys for **Stripe** (monetary swaps), **Resend** (password emails), and **Vercel Blob** (photo uploads).
2.  **Launch Your First "Partner" Drop Zone:** Go to a local hostel, set up a small shelf, and create their record in the database.
3.  **Announce is PWA-Ready:** Tell your users they can "Add to Home Screen" on their iPhones/Androids for an app-like experience.

---

## 5. Getting Help
The `docs/` folder contains a file called `AI_CONTEXT.md`. If you ever hire a new developer or use an AI assistant, **show them that file first.** It gives them the "Neural Map" of everything we built.

Enjoy building the future of sustainable travel fashion! 👗🌎

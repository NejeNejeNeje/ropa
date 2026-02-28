# 🛠️ ROPA — IT Setup Guide
## *For Molly's Technical Friend*

> **Who this is for:** You. Molly's IT-savvy friend who's helping bring this platform to life.
>
> **What this covers:** Everything you need to go from "folder on my desktop" to "live app anyone can use."
>
> **Time estimate:** About 1–2 hours for a first-time setup.

---

## 📐 The Big Picture

ROPA is a fully-built web application. Think of it like a restaurant kitchen that's been built, equipped, and stocked — it just needs to be plugged into the utility grid (electricity, water, gas). In our case, the "utilities" are 5 cloud services. Some are required, some are optional but unlock powerful features.

```
ROPA App
  ├── 🔌 REQUIRED
  │    ├── Neon       — cloud database (where all the data lives)
  │    ├── Vercel     — cloud hosting (where the app runs)
  │    └── AUTH_SECRET — one random secret key you generate yourself (30 seconds)
  │
  └── 🚀 OPTIONAL (but highly recommended)
       ├── Resend      — email service (for password reset emails)
       ├── Vercel Blob — photo storage (for listing photos)
       ├── Google OAuth — "Sign in with Google" button
       ├── Stripe      — payment processing (for paid swaps)
       └── Firebase    — push notifications (for new match alerts)
```

---

## ✅ STEP 0 — Prerequisites

Before starting, make sure you have:
- [ ] A GitHub account (free at [github.com](https://github.com))
- [ ] Node.js 18+ installed locally ([nodejs.org](https://nodejs.org))
- [ ] The ROPA project folder on your computer
- [ ] A terminal / command prompt open

---

## 🗄️ STEP 1 — Database: Neon (Required)

Neon is a free cloud PostgreSQL database. This is where all users, listings, matches, and messages will be stored.

### 1a. Create your Neon account & database

1. Go to **[neon.tech](https://neon.tech)** → Click **"Sign Up"** (free)
2. After login, click **"New Project"**
3. Give it a name: `ropa-production`
4. Region: pick the one closest to your expected users (e.g. `US East` for Americas, `EU West` for Europe)
5. Click **"Create Project"**

### 1b. Get your connection string

1. On your project page, find the **"Connection Details"** panel
2. Make sure **"Connection string"** is selected
3. Copy the full string — it looks like:
   ```
   postgresql://user:password@ep-something.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. 📝 **Save this** — this is your `DATABASE_URL`

### 1c. Set up the database schema

In your terminal, navigate to the ROPA project folder and run:

```bash
# Install dependencies (only needed once)
npm install

# Push the schema to your Neon database
DATABASE_URL="<your-neon-connection-string>" npx prisma db push

# This should print: "Your database is now in sync with your Prisma schema. ✅"
```

> 💡 **Note:** The schema is already configured for PostgreSQL. No changes needed to `prisma/schema.prisma`.

---

## 🌐 STEP 2 — Hosting: Vercel (Required)

Vercel is where the app will live on the internet. They have a generous free tier.

### 2a. Create your Vercel account

1. Go to **[vercel.com](https://vercel.com)** → Sign up with your GitHub account
2. You'll need to push the ROPA code to a GitHub repository first:
   ```bash
   # In the ROPA project folder:
   git init
   git add .
   git commit -m "Initial ROPA production setup"
   # Create a new repo on github.com, then:
   git remote add origin https://github.com/YOUR_USERNAME/ropa.git
   git push -u origin main
   ```

### 2b. Deploy to Vercel

1. On Vercel dashboard → **"Add New Project"**
2. Import your `ropa` GitHub repository
3. Framework Preset: **Next.js** (should auto-detect)
4. **DO NOT click Deploy yet** — add environment variables first

### 2c. Add Environment Variables

In the Vercel project settings, go to **Settings → Environment Variables** and add these:

| Variable Name | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Your Neon connection string | From Step 1b |
| `AUTH_SECRET` | *see below* | Random 32-char secret |
| `AUTH_URL` | `https://your-project.vercel.app` | Your Vercel URL (set after first deploy) |

**Generating AUTH_SECRET:**
```bash
# Run this in your terminal — it generates a secure random secret
npx auth secret
# Copy the output value — it should look like a long random string
```

### 2d. First deploy

Click **"Deploy"** in Vercel. Your first build will take ~2-3 minutes. Once done, you'll get a URL like `ropa-xyz.vercel.app`.

### 2e. Update AUTH_URL

After you see your live URL:
1. Go back to Vercel → **Settings → Environment Variables**
2. Update `AUTH_URL` to your actual live URL (e.g. `https://ropa.vercel.app`)
3. Click **"Redeploy"** from the Deployments tab

---

## 🔑 STEP 3 — Set Yourself as Admin

After the app is live and you've created your account:

1. In your terminal:
   ```bash
   DATABASE_URL="<your-neon-connection-string>" npx prisma studio
   ```
2. This opens a visual database browser at `localhost:5555`
3. Click the **"User"** table → find your user record
4. Set `role` to `admin`
5. Click **"Save 1 change"**
6. Navigate to `https://your-app.vercel.app/admin` → you should see the full admin dashboard

---

## 📧 STEP 4 — Email: Resend (Recommended)

Without this, users won't receive transactional emails (welcome messages, password resets, offer notifications, swap confirmations). It takes 5 minutes to set up.

1. Go to **[resend.com](https://resend.com)** → Sign up (free tier: 100 emails/day)
2. After login → **"API Keys"** → **"Create API Key"**
3. Name it `ropa-production`
4. Copy the key (starts with `re_`)
5. Add to Vercel environment variables:
   | Variable | Value |
   |---|---|
   | `RESEND_API_KEY` | `re_your_key_here` |
   | `EMAIL_FROM` | `ROPA <noreply@yourdomain.com>` |

> ⚠️ **Important:** Resend requires you to verify your sending domain for production. For testing, you can send from their shared domain. See [resend.com/docs](https://resend.com/docs) → "Domains" for setup.

---

## 🖼️ STEP 5 — Photo Storage: Vercel Blob (Recommended)

This allows users to upload photos for their listings. Without it, listings have no photos.

1. In your **Vercel project dashboard** → go to **"Storage"** tab
2. Click **"Create Store"** → Select **"Blob"**
3. Name it `ropa-images` → click **"Create"**
4. Vercel will automatically add `BLOB_READ_WRITE_TOKEN` to your environment variables ✅
5. **Redeploy** the project — photo uploads will start working immediately

---

## 🔐 STEP 6 — Google Login: Google OAuth (Optional)

This adds the "Sign in with Google" button to the login page.

1. Go to **[console.cloud.google.com](https://console.cloud.google.com)**
2. Create a new project → name it `ropa`
3. Go to **"APIs & Services"** → **"OAuth consent screen"**
   - User Type: External → fill in app name "ROPA", support email
4. Go to **"Credentials"** → **"Create Credentials"** → **"OAuth 2.0 Client ID"**
   - Application Type: **Web application**
   - Authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`
5. Copy **Client ID** and **Client Secret**
6. Add to Vercel:
   | Variable | Value |
   |---|---|
   | `GOOGLE_CLIENT_ID` | Your Client ID |
   | `GOOGLE_CLIENT_SECRET` | Your Client Secret |
   | `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | `true` |

---

## 💳 STEP 7 — Payments: Stripe (Optional)

Enables monetary transactions for paid listings.

1. Go to **[stripe.com](https://stripe.com)** → sign up
2. Start in **Test Mode** first (toggle in dashboard top-right)
3. Go to **Developers → API Keys**
4. Copy your **Secret key** (starts with `sk_test_...`)
5. Add to Vercel:
   | Variable | Value |
   |---|---|
   | `STRIPE_SECRET_KEY` | `sk_test_...` (use live key when ready) |

> 📝 To receive real payments, you'll need to activate your Stripe account with business details and switch to live keys (`sk_live_...`)

---

## 🔔 STEP 8 — Push Notifications: Firebase (Optional)

Sends push notifications to users' phones when they get a new match or message.

1. Go to **[firebase.google.com](https://firebase.google.com)** → Sign in with Google
2. **"Go to console"** → **"Create a project"** → name it `ropa`
3. Enable **Cloud Messaging** (FCM): Project Settings → Cloud Messaging tab
4. Get your **Server Key** from the Cloud Messaging settings
5. Add to Vercel:
   | Variable | Value |
   |---|---|
   | `FIREBASE_SERVER_KEY` | Your FCM server key |

---

## 🚀 STEP 9 — Final Checklist & Go Live

```
Required (app will not work without these):
  ✅  DATABASE_URL        — Neon connection string
  ✅  AUTH_SECRET         — Random secret (npx auth secret)
  ✅  AUTH_URL            — Your Vercel URL

Recommended (important features):
   ⬜  RESEND_API_KEY       — Transactional emails (welcome, password reset, offers, swaps)
   ⬜  EMAIL_FROM           — Sender address (e.g. "ROPA <noreply@yourdomain.com>")
  ⬜  BLOB_READ_WRITE_TOKEN — Photo uploads (auto-set by Vercel Blob)

Optional (premium features):
  ⬜  GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + NEXT_PUBLIC_GOOGLE_AUTH_ENABLED
  ⬜  STRIPE_SECRET_KEY
  ⬜  FIREBASE_SERVER_KEY
```

After adding variables in Vercel, always **Redeploy** for them to take effect.

---

## 🌍 Custom Domain (Optional but Recommended)

To use `getropa.com` or similar:
1. Buy a domain from any registrar (Namecheap, Cloudflare, Google Domains)
2. In Vercel: **Settings → Domains** → add your domain
3. Follow Vercel's DNS configuration instructions (usually takes < 1 hour to propagate)
4. Update `AUTH_URL` in environment variables to your new domain

---

## 🆘 Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| "Internal server error" on login | `AUTH_SECRET` missing or `AUTH_URL` wrong | Check both env vars in Vercel |
| Can't upload photos | `BLOB_READ_WRITE_TOKEN` not set | Set up Vercel Blob (Step 5) |
| Password reset emails not arriving | `RESEND_API_KEY` missing or domain not verified | Set up Resend (Step 4) and add `EMAIL_FROM` |
| DB connection errors | Wrong `DATABASE_URL` or schema not pushed | Re-run `npx prisma db push` |
| `/admin` redirects me away | Your user doesn't have `role = "admin"` | Use Prisma Studio (Step 3) |

---

## 📞 Resources

- **Vercel docs:** [vercel.com/docs](https://vercel.com/docs)
- **Neon docs:** [neon.tech/docs](https://neon.tech/docs)
- **Prisma docs:** [prisma.io/docs](https://prisma.io/docs)
- **Auth.js docs:** [authjs.dev](https://authjs.dev)
- **Resend docs:** [resend.com/docs](https://resend.com/docs)

---

*This platform was built with ❤️ as a gift. You're holding real, production-grade software. Treat it like the treasure it is.*

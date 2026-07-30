# Delhi k Zaiqay — Admin Dashboard (deployable version)

This is your dashboard, converted from a Claude artifact into a real web app with:
- **Database**: Supabase (hosted Postgres, free tier)
- **Login**: Supabase Auth (just you — email + password)
- **Hosting**: Vercel (free tier)
- **Your subdomain**: e.g. `admin.delhikzaiqay.com`

The app code itself (menu costing, sales, expenses, delivery) is unchanged — only the storage layer changed, from Claude's artifact storage to a real database that syncs across every device you log into.

---

## Step 1 — Create your Supabase project (the database)

1. Go to https://supabase.com → sign up (free) → **New project**.
2. Give it a name (e.g. `delhi-k-zaiqay`), set a database password (save it somewhere), pick the region closest to you, click **Create**. Wait ~1 minute while it provisions.
3. Once it's ready, go to **SQL Editor** (left sidebar) → **New query**.
4. Open `supabase_setup.sql` from this project, copy all of it, paste into the query editor, click **Run**. This creates the two tables the app needs and locks them down so only you can read/write your own data.
5. Go to **Project Settings → API** (left sidebar, gear icon → API). Copy two values — you'll need them in Step 3:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (a long string)
6. Go to **Authentication → Providers** and make sure **Email** is enabled (it is by default). Also under **Authentication → URL Configuration**, you can leave defaults for now — we'll revisit after your subdomain is live.

Optional but recommended: under **Authentication → Providers → Email**, turn **off** "Confirm email" if you don't want to deal with confirmation emails for your own single account (Settings → Auth → toggle "Enable email confirmations"). If you leave it on, you'll get a confirmation email when you sign up in Step 6.

---

## Step 2 — Get the code onto GitHub

Vercel deploys from a GitHub repo, so:

1. Go to https://github.com → sign up if you don't have an account → **New repository** (e.g. `delhi-dashboard`, private is fine).
2. On your computer, open a terminal in this project folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial dashboard"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/delhi-dashboard.git
   git push -u origin main
   ```
   (Replace `YOUR-USERNAME` with your actual GitHub username, and create the repo on GitHub first so the URL exists.)

---

## Step 3 — Test it locally (optional but recommended)

1. Make sure you have Node.js installed (https://nodejs.org, LTS version).
2. In the project folder:
   ```bash
   npm install
   cp .env.example .env.local
   ```
3. Open `.env.local` and paste in your Supabase **Project URL** and **anon public** key from Step 1.
4. Run:
   ```bash
   npm run dev
   ```
5. Open the local address it prints (usually `http://localhost:5173`). You should see the login screen. Click "Create your admin account", sign up with your email + a password, and (if email confirmation is on) confirm via the email Supabase sends. Then sign in and try the dashboard — add a dish, refresh the page, confirm it's still there.

---

## Step 4 — Deploy to Vercel

1. Go to https://vercel.com → sign up using your GitHub account (this makes importing repos one click).
2. Click **Add New → Project**, select your `delhi-dashboard` repo, click **Import**.
3. Vercel auto-detects Vite. Before clicking Deploy, expand **Environment Variables** and add:
   - `VITE_SUPABASE_URL` → your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon public key
4. Click **Deploy**. Wait ~1 minute. You'll get a live link like `delhi-dashboard.vercel.app` — open it and confirm login + dashboard work there too.

---

## Step 5 — Point your subdomain at it

You said you're not 100% sure where your domain is registered — here's how to check and proceed either way:

**Find your registrar (if unsure):**
Go to https://who.is, type in your domain (e.g. `delhikzaiqay.com`), and look at the "Registrar" field. That tells you where to log in to manage DNS (GoDaddy, Namecheap, Hostinger, etc.) — or if your website was built by a designer/agency, they may have registered it for you and can grant you access.

**Once you're logged into wherever your DNS is managed:**

1. In Vercel, go to your project → **Settings → Domains** → type in your desired subdomain, e.g. `admin.delhikzaiqay.com` → **Add**.
2. Vercel will show you a DNS record to add — normally a **CNAME** record:
   - Type: `CNAME`
   - Name/Host: `admin` (just the subdomain part)
   - Value/Target: `cname.vercel-dns.com`
3. Go to your domain's DNS management page (in GoDaddy it's "DNS Management", in Namecheap it's "Advanced DNS", in Hostinger it's "DNS Zone Editor") and add that exact CNAME record.
4. Wait 10–60 minutes for DNS to propagate, then refresh the Domains page in Vercel — it should show a green checkmark once it detects the record. Visit `https://admin.delhikzaiqay.com` — it should load your dashboard with HTTPS automatically handled by Vercel.

---

## Step 6 — Update Supabase's allowed URL

Once your subdomain is live, go back to Supabase → **Authentication → URL Configuration** and set:
- **Site URL**: `https://admin.delhikzaiqay.com`
- Add the same under **Redirect URLs**

This makes sure login/session behavior works correctly on your real domain (not just the vercel.app preview link).

---

## Using it day to day

- Visit your subdomain on your phone or laptop, sign in with the one admin account you created.
- Everything you enter (dishes, ingredients, sales, expenses, delivery zones) is saved to your Supabase database instantly and will show up the same on any device you log into.
- If you ever add staff who need their own logins, come back and we can add that (right now it's built for one account, as you asked for).

## Costs

- Supabase free tier: fine for this scale (500MB database, well beyond what a menu/sales log needs).
- Vercel free tier: fine for a single admin dashboard, no traffic costs at this scale.
- Only cost is what you already pay for your domain registration/renewal.

## If something breaks

- **Blank page after deploy**: check Vercel → your project → Deployments → click the latest one → check the build log for errors, and double check the two environment variables are spelled exactly right.
- **"Not signed in" errors in the app**: your Supabase session may have expired — just sign in again.
- **Can't sign up**: check Supabase → Authentication → Users to see if the account was actually created; check spam folder for the confirmation email if confirmations are enabled.

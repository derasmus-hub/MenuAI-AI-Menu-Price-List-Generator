# MenuAI — Production Deployment Guide

## Architecture

```
[Vercel]  menuai.pl        →  Frontend (React SPA)
[Railway] api.menuai.pl    →  Backend  (FastAPI)
[Supabase]                 →  Database (PostgreSQL)
[Stripe]                   →  Payments
```

---

## 1. Backend — Railway

### Setup
1. Create a new Railway project from your GitHub repo
2. Set **Root Directory** to `backend`
3. Railway auto-detects Python via `requirements.txt` + `Procfile`

### Environment Variables (Railway Dashboard)
```
ANTHROPIC_API_KEY=sk-ant-api03-...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJI...
BASE_URL=https://api.menuai.pl
FRONTEND_URL=https://menuai.pl
CORS_ORIGINS=https://menuai.pl,https://www.menuai.pl
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```

### Custom Domain
1. Railway Settings → Networking → Custom Domain
2. Add `api.menuai.pl`
3. Create CNAME record: `api.menuai.pl → <railway-provided-domain>`

### Notes
- Templates directory is at `../templates` relative to `backend/` — Railway clones the full repo, so this path works
- WeasyPrint needs system dependencies — Railway's default Python image includes them. If PDF generation fails, add a `nixpacks.toml`:
  ```toml
  [phases.setup]
  aptPkgs = ["libpango-1.0-0", "libpangocairo-1.0-0", "libgdk-pixbuf-2.0-0", "libffi-dev", "shared-mime-info"]
  ```

---

## 2. Frontend — Vercel

### Setup
1. Import GitHub repo to Vercel
2. Set **Root Directory** to `frontend`
3. Framework preset: **Vite**
4. Build command: `npm run build` (auto-detected)
5. Output directory: `dist` (auto-detected)

### Environment Variables (Vercel Dashboard)
```
VITE_API_URL=https://api.menuai.pl
```

### Custom Domain
1. Vercel Settings → Domains → Add `menuai.pl`
2. Update DNS:
   - `menuai.pl` → A record to Vercel IP `76.76.21.21`
   - `www.menuai.pl` → CNAME to `cname.vercel-dns.com`

---

## 3. Supabase

### Setup
1. Create project at supabase.com
2. Go to SQL Editor → New Query
3. Paste and run `backend/migrations/001_create_tables.sql`
4. Copy the project URL and **service_role** key (not anon key) for backend usage

### Important
- Use the **service_role** key in Railway (not the anon key) — this bypasses RLS for backend writes
- The anon key is fine for local dev with the in-memory fallback

---

## 4. Stripe

### Products Setup
1. Stripe Dashboard → Products → Create Product
   - Name: `MenuAI Premium`
   - Price: `49.00 PLN` (one-time)
   - Copy the `price_xxx` ID → set as `STRIPE_PRICE_ID`

### Webhook Setup
1. Stripe Dashboard → Developers → Webhooks → Add Endpoint
   - URL: `https://api.menuai.pl/api/webhook/stripe`
   - Events: `checkout.session.completed`
2. Copy the webhook signing secret → set as `STRIPE_WEBHOOK_SECRET`

### Go Live
- Switch from `sk_test_` to `sk_live_` keys when ready
- Create a separate webhook endpoint for production

---

## 5. Domain DNS Records

| Type  | Name  | Value                        |
|-------|-------|------------------------------|
| A     | @     | 76.76.21.21 (Vercel)         |
| CNAME | www   | cname.vercel-dns.com         |
| CNAME | api   | \<your-app\>.up.railway.app  |

---

## Production Checklist

### Backend (Railway)
- [ ] `ANTHROPIC_API_KEY` set (real key, not placeholder)
- [ ] `SUPABASE_URL` + `SUPABASE_KEY` set (service_role key)
- [ ] `BASE_URL` set to `https://api.menuai.pl`
- [ ] `FRONTEND_URL` set to `https://menuai.pl`
- [ ] `CORS_ORIGINS` includes production frontend domain
- [ ] `STRIPE_SECRET_KEY` set (live mode: `sk_live_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` set (production webhook)
- [ ] `STRIPE_PRICE_ID` set (49 PLN product)
- [ ] Deploy succeeds, health check passes: `curl https://api.menuai.pl/api/health`

### Frontend (Vercel)
- [ ] `VITE_API_URL` set to `https://api.menuai.pl`
- [ ] Deploy succeeds, site loads at `https://menuai.pl`
- [ ] SPA routing works (direct link to `/create` and `/success` loads correctly)

### Database (Supabase)
- [ ] Migration `001_create_tables.sql` executed
- [ ] `menus` and `payments` tables exist
- [ ] RLS policies applied
- [ ] Backend can insert and query menus

### Stripe
- [ ] Product created (49 PLN, one-time)
- [ ] Webhook endpoint registered for `checkout.session.completed`
- [ ] Webhook signature verified (test with Stripe CLI: `stripe trigger checkout.session.completed`)

### End-to-End Tests
- [ ] Create menu via text input → preview loads
- [ ] Create menu via photo upload → preview loads
- [ ] Edit menu in editor → changes reflected in preview
- [ ] Switch between 5 templates → all render correctly
- [ ] Free PDF download → downloads with watermark
- [ ] Publish → public URL works, QR code generates
- [ ] Copy link → clipboard has correct production URL
- [ ] Premium purchase → Stripe Checkout opens
- [ ] After payment → redirected to /success, menu marked as paid
- [ ] Paid menu → no watermark on public page
- [ ] QR codes point to production `BASE_URL` (not localhost)

### Security
- [ ] `.env` is in `.gitignore` (never committed)
- [ ] No API keys in frontend code
- [ ] Stripe webhook signature verification enabled
- [ ] CORS restricted to production domains only
- [ ] Supabase RLS enabled on all tables

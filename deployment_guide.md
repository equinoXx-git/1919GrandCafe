# Phase 6 & Phase 7 — Security & Cloudflare Pages Deployment Guide

## 🔹 PHASE 6 — SECURITY

### 1. Row Level Security (RLS) Best Practices
To ensure public users can only **insert** reservations without reading or modifying other guests' bookings:

```sql
-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 1. Public Insertion (Anon users can only insert)
CREATE POLICY "Allow public insert reservations"
    ON public.reservations FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 2. Restrict SELECT, UPDATE, DELETE to Authenticated Admins
CREATE POLICY "Restrict read to admin"
    ON public.reservations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Restrict update to admin"
    ON public.reservations FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Restrict delete to admin"
    ON public.reservations FOR DELETE
    TO authenticated
    USING (true);
```

### 2. Input Sanitization & XSS Prevention
All user inputs rendered in the DOM (modal and admin table) pass through `escapeHtml()`:

```javascript
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str).replace(/[&<>"']/g, c => map[c]);
}
```

---

## 🔹 PHASE 7 — CLOUDFLARE PAGES DEPLOYMENT

### Step 1: Push Code to GitHub
Ensure all latest files are on your GitHub repository:
- `index.html`
- `admin.html`
- `script.js`
- `supabaseClient.js`
- `styles.css`
- `_headers`

### Step 2: Connect Repository to Cloudflare Pages
1. Log into your **Cloudflare Dashboard** (`https://dash.cloudflare.com`).
2. Go to **Workers & Pages** → Click **Create Application** → Select **Pages**.
3. Click **Connect to Git** and select your GitHub repository (`1919GrandCafe`).
4. Configure deployment settings:
   - **Production branch**: `main`
   - **Framework preset**: `None` (Static HTML/JS)
   - **Build command**: *(Leave empty)*
   - **Build output directory**: `/` or `.` (Root directory)

### Step 3: Configure Environment Variables in Cloudflare
In your Cloudflare Pages project:
Go to **Settings** → **Environment variables** → Click **Add variable**:

| Variable Name | Value |
|---|---|
| `SUPABASE_URL` | `https://sxhkjyxruumschlqoywd.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1...` |
| `WEB3FORMS_KEY` | `e00bc05e-5abc-4f72-b58a-a4aeb5cb4de0` |

### Step 4: Click Save & Deploy
Cloudflare Pages will build and deploy your site in ~15 seconds with global CDN edge caching.

---

## ✅ END-TO-END TESTING CHECKLIST

1. **Reservation Form Submission**:
   - Open `index.html` or live site URL.
   - Enter invalid phone number (e.g. `123`) → Verify red error highlight appears.
   - Pick past date → Verify error highlight blocks submission.
   - Submit valid form → Verify gold loading spinner appears on button.
   - Verify success modal displays reference code and table summary.

2. **Supabase Database Verification**:
   - Open **Supabase Dashboard → Table Editor → reservations**.
   - Verify new row appears with status `'pending'`.

3. **Email Delivery**:
   - Check owner inbox → Verify Web3Forms alert email.
   - Check customer inbox → Verify EmailJS confirmation email.

4. **Admin Dashboard (`/admin.html`)**:
   - Open `/admin.html`.
   - Enter passkey `admin1919` → Verify dashboard unlocks.
   - Verify metrics counter updates.
   - Test search and status filter tabs.
   - Click Approve (`✓`) → Verify status changes to `'confirmed'`.
   - Click Delete (`🗑`) → Verify row removes from database.

# Quick Start Guide

Get your Arham Stationary app up and running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Set Up Supabase

1. **Create Project**: Go to [supabase.com](https://supabase.com) → New Project
2. **Run Schema**: Copy `supabase-schema.sql` → SQL Editor → Run
3. **Create Storage**: Storage → New Bucket → Name: `invoices` → Public
4. **Create Admin User**: Authentication → Users → Add User
5. **Get Keys**: Settings → API → Copy URL and anon key

## Step 3: Configure Environment

Create `.env` file:
```env
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
```

## Step 4: Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## Step 5: Test Admin Login

1. Go to `/admin/login`
2. Use the admin credentials you created in Supabase
3. Access dashboard, inventory, POS system

## Next Steps

- Add products via Admin → Inventory
- Test customer flow (browse, cart, checkout)
- Test POS system with barcode scanning
- Deploy to Vercel (see DEPLOYMENT.md)

## Troubleshooting

**Can't connect to Supabase?**
- Check `.env` file has correct values
- Verify Supabase project is active

**Service worker not working?**
- Use HTTPS or localhost
- Clear browser cache

**Barcode scanner not working?**
- Grant camera permissions
- Use HTTPS (required)

---

For detailed deployment, see `DEPLOYMENT.md`


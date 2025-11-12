# Quick Deployment Guide

## 🚀 Fastest Way: Vercel CLI

### Step 1: Deploy
```bash
vercel --prod
```

### Step 2: When prompted, add these environment variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `VITE_RAZORPAY_KEY_ID` - (Optional) Razorpay key

### Step 3: Get your Supabase keys
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## 📋 Pre-Deployment Checklist

### Supabase Setup (if not done):
- [ ] Database tables created (run `supabase-schema.sql`)
- [ ] Storage bucket `invoices` created (public)
- [ ] Admin user created in Authentication
- [ ] Email authentication enabled

### Environment Variables Needed:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_RAZORPAY_KEY_ID=rzp_xxxxx (optional)
```

## 🌐 Alternative Platforms

### Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag & drop `dist` folder OR connect GitHub
3. Add environment variables in site settings
4. Deploy!

### GitHub Pages
1. Push code to GitHub
2. Go to repository Settings > Pages
3. Select source branch (usually `main`)
4. Select folder: `/dist`
5. Save

## 🔧 Manual Deployment

If you want to host manually:
1. Upload contents of `dist` folder to your web server
2. Ensure server supports SPA routing (redirect all routes to index.html)
3. Set environment variables in your hosting platform

## ✅ After Deployment

1. Test your live site
2. Verify Supabase connection works
3. Test admin login
4. Test customer checkout flow
5. Check PWA installation works

## 🆘 Need Help?

- Check `DEPLOYMENT.md` for detailed instructions
- Verify environment variables are set correctly
- Check browser console for errors
- Ensure Supabase project is active


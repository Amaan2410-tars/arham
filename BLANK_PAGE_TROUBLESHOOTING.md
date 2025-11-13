# 🔍 Troubleshooting Blank White Page on Custom Domain

If you're seeing a blank white page on `arhamenterprise.online`, follow these steps:

## Step 1: Check Browser Console (Most Important!)

1. **Open Developer Tools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Go to the **Console** tab

2. **Look for errors:**
   - Red error messages indicate what's wrong
   - Common errors:
     - `Failed to fetch` - Network/CORS issue
     - `Cannot read property...` - JavaScript error
     - `Module not found` - Build issue
     - `VITE_SUPABASE_URL is not defined` - Missing environment variable

3. **Take a screenshot or copy the error messages**

## Step 2: Check Network Tab

1. In Developer Tools, go to **Network** tab
2. Refresh the page (`Ctrl+R` or `Cmd+R`)
3. Look for:
   - **Red/failed requests** (status 404, 500, etc.)
   - **Missing files** (main.js, main.css, etc.)
   - **CORS errors**

## Step 3: Verify Domain Configuration in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Domains**
4. Check:
   - ✅ Domain shows "Valid Configuration"
   - ✅ SSL certificate is issued (green lock icon)
   - ✅ Both `arhamenterprise.online` and `www.arhamenterprise.online` are configured

## Step 4: Check Latest Deployment

1. In Vercel dashboard, go to **Deployments** tab
2. Check the latest deployment:
   - ✅ Status should be "Ready" (green)
   - ❌ If "Error" or "Failed", click to see build logs
3. **If deployment failed:**
   - Check build logs for errors
   - Common issues:
     - Missing environment variables
     - Build errors
     - TypeScript errors

## Step 5: Verify Environment Variables

1. In Vercel dashboard → **Settings** → **Environment Variables**
2. Verify these are set for **Production**:
   - `VITE_SUPABASE_URL` = `https://wxctyxovukjllvrfefkr.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (your anon key)
3. **Important:** After adding/changing env vars, you must **redeploy**!

## Step 6: Force Redeploy

If you changed environment variables or DNS:

1. In Vercel dashboard → **Deployments**
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete
5. Clear browser cache and try again

## Step 7: Test on Vercel URL

1. Check if the site works on the Vercel URL:
   - Go to your Vercel dashboard
   - Click on your project
   - Click the deployment URL (e.g., `arhamstore-xxxxx.vercel.app`)
2. **If Vercel URL works but custom domain doesn't:**
   - DNS propagation issue (wait 15-30 minutes)
   - Domain not properly connected
   - SSL certificate not issued yet

## Step 8: Clear Browser Cache

1. **Hard refresh:**
   - Windows: `Ctrl+Shift+R` or `Ctrl+F5`
   - Mac: `Cmd+Shift+R`
2. **Or clear cache:**
   - Press `F12` → **Application** tab → **Clear storage** → **Clear site data**

## Step 9: Check DNS Propagation

1. Visit [whatsmydns.net](https://www.whatsmydns.net)
2. Enter your domain: `arhamenterprise.online`
3. Check if DNS records are propagated globally
4. If not, wait 15-30 minutes and check again

## Step 10: Check for JavaScript Errors in Code

If console shows specific errors, check:

### Error: "Cannot find module" or "Module not found"
- **Fix:** Rebuild and redeploy
- Check `package.json` for missing dependencies

### Error: "VITE_SUPABASE_URL is not defined"
- **Fix:** Add environment variable in Vercel
- Redeploy after adding

### Error: "Failed to fetch" or CORS error
- **Fix:** Check Supabase URL is correct
- Verify Supabase project is active

### Error: "TypeError: Cannot read property..."
- **Fix:** Check browser console for exact line
- This is a code error that needs fixing

## Quick Fixes

### Fix 1: Redeploy with Correct Environment Variables
```bash
# In Vercel dashboard:
1. Settings → Environment Variables
2. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
3. Deployments → Redeploy latest
```

### Fix 2: Check Domain DNS
```bash
# In your domain provider:
1. Verify A record: @ → 216.198.79.1
2. Verify CNAME: www → c836ca400b65848e.vercel-dns-017.com.
3. Wait 15-30 minutes for propagation
```

### Fix 3: Force SSL Certificate
```bash
# In Vercel:
1. Settings → Domains
2. Click on your domain
3. Wait for SSL certificate (usually automatic, takes 5-10 minutes)
```

## Still Not Working?

**Share these details:**
1. Screenshot of browser console (F12 → Console tab)
2. Screenshot of Network tab showing failed requests
3. Vercel deployment status (screenshot)
4. Any error messages you see

## Common Solutions

### Solution 1: Domain Not Connected
- **Symptom:** Blank page, no errors in console
- **Fix:** Verify domain in Vercel → Settings → Domains shows "Valid Configuration"

### Solution 2: Missing Environment Variables
- **Symptom:** Console shows "VITE_SUPABASE_URL is not defined"
- **Fix:** Add env vars in Vercel and redeploy

### Solution 3: Build Failed
- **Symptom:** Deployment shows "Error" in Vercel
- **Fix:** Check build logs, fix errors, redeploy

### Solution 4: DNS Not Propagated
- **Symptom:** Domain shows old site or nothing
- **Fix:** Wait 15-30 minutes, check DNS propagation

### Solution 5: JavaScript Error
- **Symptom:** Console shows specific error
- **Fix:** Fix the code error, commit, push, redeploy

---

**Next Steps:**
1. Open browser console (F12)
2. Take a screenshot of any errors
3. Check Vercel deployment status
4. Share what you find!


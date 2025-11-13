# Fixing 404 Errors on Vercel

## The Problem
Getting 404 errors for JavaScript/CSS files means Vercel isn't finding the built files.

## Solution: Verify Vercel Build Settings

### Step 1: Check Build Settings in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **General**
4. Scroll to **Build & Development Settings**
5. Verify these settings:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Root Directory: ./
```

### Step 2: Verify Build Output

1. In Vercel dashboard, go to **Deployments** tab
2. Click on the latest deployment
3. Click **View Build Logs**
4. Look for:
   - ✅ `Build completed successfully`
   - ✅ Files being created in `dist/` folder
   - ❌ Any errors about missing files

### Step 3: Check Deployment Files

1. In the deployment page, scroll down
2. Look for **"Source"** or **"Files"** section
3. Verify you can see:
   - `dist/index.html`
   - `dist/assets/` folder with JS/CSS files
   - `dist/manifest.json`
   - `dist/sw.js`

### Step 4: Force Redeploy

If settings look correct but still getting 404s:

1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete
5. Test again

## Common Issues

### Issue 1: Output Directory Wrong
- **Symptom:** 404 for all assets
- **Fix:** Set Output Directory to `dist` (not `build` or `public`)

### Issue 2: Build Command Wrong
- **Symptom:** Build completes but no files
- **Fix:** Set Build Command to `npm run build`

### Issue 3: Files Not Being Generated
- **Symptom:** Build succeeds but dist folder is empty
- **Fix:** Check build logs for errors, verify `package.json` has correct build script

### Issue 4: Framework Preset Wrong
- **Symptom:** Build fails or wrong output structure
- **Fix:** Set Framework Preset to **Vite**

## Quick Checklist

- [ ] Framework Preset = **Vite**
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `dist`
- [ ] Install Command = `npm install`
- [ ] Root Directory = `./` (or leave empty)
- [ ] Latest deployment shows "Ready" status
- [ ] Build logs show successful build
- [ ] Deployment files show `dist/` folder with assets

## If Still Not Working

1. **Check build logs** for any errors
2. **Verify environment variables** are set correctly
3. **Try redeploying** from a fresh commit
4. **Check Vercel status page** for any service issues

---

**After fixing settings, wait for the new deployment to complete, then test your site again.**


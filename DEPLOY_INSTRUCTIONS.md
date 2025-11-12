# 🚀 Deploy Updates to Vercel

## Option 1: If You Already Have a GitHub Repository Connected to Vercel

If your Vercel project is already connected to a GitHub repository:

1. **Add and commit your changes:**
   ```bash
   git add src/lib/supabase.ts vite.config.ts
   git commit -m "Fix: Add Supabase URL validation and adjust chunk size limit"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```
   (or `git push origin master` if your branch is called master)

3. **Vercel will automatically deploy** - it will detect the push and start a new deployment

---

## Option 2: If You Don't Have a GitHub Repository Yet

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon → **New repository**
3. Name it (e.g., `arham-store` or `website`)
4. Choose **Public** or **Private**
5. **Don't** initialize with README (you already have files)
6. Click **Create repository**

### Step 2: Connect Your Local Code to GitHub

1. **Initialize git (if not done):**
   ```bash
   git init
   ```

2. **Add all files:**
   ```bash
   git add .
   ```

3. **Create .gitignore (if you don't have one):**
   Create a file named `.gitignore` with:
   ```
   node_modules/
   dist/
   .env
   .env.local
   .DS_Store
   ```

4. **Commit:**
   ```bash
   git commit -m "Initial commit: Add Supabase validation and chunk size config"
   ```

5. **Add remote and push:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repo name)

### Step 3: Connect to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Vercel will auto-detect it's a Vite project
5. **Add environment variables:**
   - `VITE_SUPABASE_URL` = Your Supabase URL (https://xxxxx.supabase.co)
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
6. Click **Deploy**

---

## Option 3: Manual Deploy via Vercel CLI (Quick Method)

If you have Vercel CLI installed:

1. **Install Vercel CLI (if not installed):**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **When prompted, add environment variables:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## ✅ What Changed

The updates include:

1. **`src/lib/supabase.ts`**:
   - Added validation to prevent DNS_HOSTNAME_RESOLVED_PRIVATE errors
   - Added debug logging to show the actual URL value during build
   - Will throw clear error if URL points to localhost/private IP

2. **`vite.config.ts`**:
   - Set `chunkSizeWarningLimit` to 1000 KB to suppress chunk size warnings

---

## 🔍 After Deployment

1. **Check build logs** in Vercel dashboard
2. Look for the debug message: `🔍 [DEBUG] VITE_SUPABASE_URL value: ...`
3. This will show you what URL Vercel is actually using
4. If you still see DNS errors, the debug log will show the problematic URL

---

## 📝 Quick Commands Summary

```bash
# If you have a GitHub repo already:
git add src/lib/supabase.ts vite.config.ts
git commit -m "Fix: Add Supabase URL validation and adjust chunk size limit"
git push origin main

# If starting fresh:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```


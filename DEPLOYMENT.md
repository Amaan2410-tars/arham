# Deployment Guide

## Step-by-Step Deployment Instructions

### 1. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Project Name: `arham-stationary`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
4. Wait for project to be created (2-3 minutes)

#### Set Up Database
1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" to execute
5. Verify tables are created in **Table Editor**

#### Create Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. Click "Create Bucket"
3. Name: `invoices`
4. Make it **Public**
5. Click "Create Bucket"

#### Set Up Authentication
1. Go to **Authentication** > **Settings**
2. Enable "Email" provider
3. Configure email templates if needed
4. Go to **Authentication** > **Users**
5. Click "Add User" to create an admin account
6. Set email and password (you'll use this to login to admin panel)

#### Get API Keys
1. Go to **Settings** > **API**
2. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`

### 2. Local Development Setup

#### Install Dependencies
```bash
npm install
```

#### Create Environment File
Create `.env` in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_RAZORPAY_KEY_ID=your-razorpay-key (optional)
```

#### Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

### 3. Vercel Deployment (Frontend)

#### Option A: Deploy via Vercel Dashboard
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID` (optional)
7. Click "Deploy"

#### Option B: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts and add environment variables when asked.

### 4. Android APK Build

#### Prerequisites
- Android Studio installed
- Java JDK 11+
- Android SDK

#### Build Steps

1. **Build the web app:**
```bash
npm run build
```

2. **Initialize Capacitor (if not done):**
```bash
npx cap init
```
   - App name: `Arham Stationary POS`
   - App ID: `com.arhamstationary.app`
   - Web dir: `dist`

3. **Add Android platform:**
```bash
npx cap add android
```

4. **Sync files:**
```bash
npx cap sync
```

5. **Open in Android Studio:**
```bash
npx cap open android
```

6. **In Android Studio:**
   - Wait for Gradle sync to complete
   - Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
   - Wait for build to complete
   - APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

7. **For Release APK:**
   - Go to **Build** > **Generate Signed Bundle / APK**
   - Create a keystore (first time) or use existing
   - Select APK
   - Choose release build variant
   - Build and sign

### 5. Post-Deployment Checklist

#### Supabase
- [ ] Database tables created
- [ ] Storage bucket created
- [ ] Admin user created
- [ ] RLS policies active
- [ ] Test admin login

#### Frontend (Vercel)
- [ ] Environment variables set
- [ ] Site accessible
- [ ] Test customer flow (browse, cart, checkout)
- [ ] Test admin login
- [ ] Test POS system

#### Android APK
- [ ] APK builds successfully
- [ ] Install on tablet
- [ ] Test barcode scanning
- [ ] Test POS functionality
- [ ] Test offline mode

### 6. Troubleshooting

#### Common Issues

**Supabase Connection Error**
- Check environment variables are correct
- Verify Supabase project is active
- Check RLS policies allow access

**Service Worker Not Working**
- Ensure site is served over HTTPS
- Clear browser cache
- Check browser console for errors

**Barcode Scanner Not Working**
- Grant camera permissions
- Use HTTPS (required for camera)
- Test on actual device (not emulator)

**Build Errors**
- Clear `node_modules` and reinstall
- Check Node.js version (18+)
- Verify all dependencies installed

**Android Build Fails**
- Update Android SDK
- Check Java version
- Clean and rebuild in Android Studio

### 7. Maintenance

#### Regular Tasks
- Monitor Supabase usage and billing
- Update dependencies monthly
- Backup database regularly
- Review and update product inventory
- Check for security updates

#### Monitoring
- Set up Supabase alerts for errors
- Monitor Vercel deployment logs
- Track user analytics
- Review sales reports

### 8. Support Contacts

- **Email**: irfanali55@gmail.com
- **Phone**: 9533732344
- **Address**: 8-1-423/11, Teja Colony Main Rd, Alkapoor Twp Main Rd, near 7 Tombs Road, Hyderabad, Telangana 500104

---

**Note**: Keep your `.env` file secure and never commit it to version control. Always use environment variables in production.


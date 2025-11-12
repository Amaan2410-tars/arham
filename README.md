# Arham Stationary & Disposal - Full Stack Web Application

A modern, full-stack e-commerce and POS management system built with React, Vite, Tailwind CSS, and Supabase.

## Features

### Customer Website
- 🏠 Modern homepage with featured products and categories
- 🛍️ Product browsing with search and filters
- 🛒 Shopping cart with real-time updates
- 💳 Checkout with multiple payment options (COD, UPI, Razorpay)
- 📄 Auto-generated PDF invoices
- 📱 Fully responsive design
- 🌙 Dark mode support
- ✨ Smooth animations with Framer Motion

### Admin Dashboard
- 🔐 Secure authentication with Supabase Auth
- 📊 Dashboard with sales metrics and alerts
- 📦 Inventory management (Add/Edit/Delete/Import/Export)
- 📋 Order management
- 📈 Sales reports with CSV export
- 🧾 Invoice history and PDF viewer

### POS System (Tablet Optimized)
- 💳 Touch-optimized interface for tablets
- 📷 Barcode scanning using device camera
- 🧮 Real-time cart calculations with GST
- 🖨️ Professional PDF invoice generation
- 💾 Automatic stock updates
- 🎉 Confetti animations on successful sales

### PWA & Mobile App
- 📱 Progressive Web App (PWA) support
- 🔄 Offline caching with service worker
- 📲 Installable on mobile devices
- 🤖 Android APK build with Capacitor

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Backend**: Supabase (Database, Auth, Storage)
- **Barcode Scanning**: @zxing/library
- **PDF Generation**: jsPDF
- **Mobile**: Capacitor
- **Hosting**: Vercel (Frontend) + Supabase (Backend)

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vercel account (for deployment)

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Go to Storage and create a bucket named `invoices` (make it public)
4. Go to Authentication > Settings and configure email authentication
5. Create an admin user in Authentication > Users

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id (optional)
```

You can find these values in your Supabase project settings.

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Backend (Supabase)

- Already hosted on Supabase cloud
- No additional deployment needed

## Android APK Build

### 1. Install Capacitor CLI (if not already installed)

```bash
npm install -g @capacitor/cli
```

### 2. Initialize Capacitor

```bash
npx cap init
```

### 3. Add Android Platform

```bash
npm run build
npx cap add android
```

### 4. Sync and Open

```bash
npx cap sync
npx cap open android
```

### 5. Build APK in Android Studio

- Open the project in Android Studio
- Build > Build Bundle(s) / APK(s) > Build APK(s)
- The APK will be in `android/app/build/outputs/apk/`

## Project Structure

```
├── public/
│   ├── manifest.json          # PWA manifest
│   └── sw.js                   # Service worker
├── src/
│   ├── components/
│   │   ├── auth/               # Authentication components
│   │   ├── layout/             # Navbar, Footer
│   │   └── PWAInstall.tsx      # PWA install prompt
│   ├── contexts/               # React contexts (Theme, Cart)
│   ├── lib/
│   │   └── supabase.ts         # Supabase client
│   ├── pages/
│   │   ├── admin/              # Admin pages
│   │   └── ...                 # Customer pages
│   ├── utils/
│   │   └── invoice.ts          # PDF invoice generation
│   ├── App.tsx
│   └── main.tsx
├── supabase-schema.sql         # Database schema
└── capacitor.config.ts         # Capacitor config
```

## Database Schema

The application uses the following Supabase tables:

- `products` - Product catalog
- `orders` - Customer orders
- `invoices` - Generated invoices
- `pos_sales` - POS transactions
- `users` - Managed by Supabase Auth

See `supabase-schema.sql` for full schema and RLS policies.

## Features in Detail

### Dark Mode
- Toggle available in navbar
- Persists across sessions
- System preference detection

### Barcode Scanning
- Uses device camera
- Supports multiple barcode formats
- Real-time product lookup

### PDF Invoices
- Professional layout
- Includes shop details, items, totals, GST
- Auto-uploaded to Supabase Storage
- Download and print support

### Offline Support
- Service worker caches pages
- Works when network is unavailable
- Automatic cache updates

## Troubleshooting

### Service Worker Not Registering
- Ensure you're using HTTPS (or localhost)
- Check browser console for errors
- Clear browser cache

### Barcode Scanner Not Working
- Grant camera permissions
- Use HTTPS (required for camera access)
- Check browser compatibility

### Supabase Connection Issues
- Verify environment variables
- Check Supabase project status
- Review RLS policies

## Support

For issues or questions:
- Email: irfanali55@gmail.com
- Phone: 9533732344

## License

Proprietary - Arham Stationary & Disposal

---

Built with ❤️ for Arham Stationary & Disposal


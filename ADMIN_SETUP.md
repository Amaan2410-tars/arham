# Admin Portal Setup Guide

## 🔐 Access Admin Portal

**Live URL:** https://arhamstore-5myf8loed-amaan2410-tars-projects.vercel.app/admin/login

## 👤 Create Admin User

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Select your project: `wxctyxovukjllvrfefkr`

### Step 2: Create Admin User
1. Go to **Authentication** → **Users**
2. Click **"Add User"** → **"Create new user"**
3. Fill in:
   - **Email**: `admin@arhamstationary.com` (or your preferred email)
   - **Password**: Choose a strong password
   - **Auto Confirm User**: ✅ Enable this (skips email verification)
4. Click **"Create User"**

### Step 3: Login to Admin Portal
1. Go to: https://arhamstore-5myf8loed-amaan2410-tars-projects.vercel.app/admin/login
2. Enter your email and password
3. Click "Login"

## 📋 Admin Portal Features

### 1. Dashboard
- **Total Sales**: View cumulative sales
- **Orders Today**: See today's order count
- **Low Stock Alerts**: Products with stock < 10

### 2. Inventory Management
- Add new products
- Edit existing products
- Delete products
- Import/Export CSV
- Manage stock levels
- Add barcodes

### 3. Orders
- View all customer orders
- See order details
- Track order status
- View customer information

### 4. POS System
- Touch-optimized interface for tablets
- Barcode scanning using camera
- Real-time cart with GST calculation
- Generate PDF invoices
- Automatic stock updates

### 5. Invoices
- View all generated invoices
- Download PDF invoices
- Search invoices by invoice number
- View invoice details

### 6. Reports
- Sales reports
- Export to CSV
- Filter by date range
- View sales analytics

## 🗄️ Database Setup (If Not Done)

### Step 1: Run Database Schema
1. Go to Supabase Dashboard → **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **"Run"** (or press Ctrl+Enter)
5. Verify tables are created in **Table Editor**

### Step 2: Create Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. Click **"Create Bucket"**
3. Name: `invoices`
4. Make it **Public** ✅
5. Click **"Create Bucket"**

### Step 3: Enable Email Authentication
1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, enable **Email**
3. Configure email templates if needed

## 🔒 Security Notes

- Only authenticated users can access admin features
- Admin users are managed through Supabase Authentication
- All admin routes are protected
- RLS (Row Level Security) policies are enabled

## 🆘 Troubleshooting

### Can't Login?
- Verify user exists in Supabase Authentication → Users
- Check email and password are correct
- Ensure "Auto Confirm User" was enabled when creating user
- Check browser console for errors

### Database Errors?
- Verify `supabase-schema.sql` was run successfully
- Check RLS policies are active
- Verify tables exist in Table Editor

### Storage Issues?
- Ensure `invoices` bucket exists and is public
- Check bucket policies allow uploads

## 📞 Support

- Email: irfanali55@gmail.com
- Phone: 9533732344


# Fix Supabase Storage RLS Policy for Invoice Uploads

## The Problem
Getting error: `new row violates row-level security policy` when uploading PDF invoices to Supabase storage.

## The Solution: Add RLS Policy for Storage

### Step 1: Go to Supabase Dashboard
1. Visit [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `wxctyxovukjllvrfefkr`

### Step 2: Open Storage
1. Click **Storage** in the left sidebar
2. Click on the **`invoices`** bucket
3. Go to the **Policies** tab

### Step 3: Add Upload Policy

#### Option A: Allow Authenticated Users (Recommended)
1. Click **"New Policy"**
2. Select **"For full customization"**
3. Policy name: `Allow authenticated users to upload invoices`
4. Allowed operation: **INSERT** (for uploading)
5. Policy definition:
   ```sql
   (bucket_id = 'invoices'::text) AND (auth.role() = 'authenticated'::text)
   ```
6. Click **"Review"** then **"Save policy"**

#### Option B: Allow All Users (Less Secure - for testing only)
1. Click **"New Policy"**
2. Select **"For full customization"**
3. Policy name: `Allow public uploads`
4. Allowed operation: **INSERT**
5. Policy definition:
   ```sql
   bucket_id = 'invoices'::text
   ```
6. Click **"Review"** then **"Save policy"**

### Step 4: Add Read Policy (Optional - for downloading)
1. Click **"New Policy"** again
2. Policy name: `Allow authenticated users to read invoices`
3. Allowed operation: **SELECT**
4. Policy definition:
   ```sql
   (bucket_id = 'invoices'::text) AND (auth.role() = 'authenticated'::text)
   ```

### Step 5: Verify Bucket is Public (if needed)
1. In the **Settings** tab of the bucket
2. Check **"Public bucket"** is enabled (if you want public access)
3. Or keep it private and use the RLS policies above

## Quick SQL Method (Alternative)

If you prefer SQL, go to **SQL Editor** and run:

```sql
-- Allow authenticated users to upload to invoices bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoices');

-- Allow authenticated users to read from invoices bucket
CREATE POLICY "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'invoices');
```

## After Adding Policies

1. **Test the upload** by completing a POS sale
2. **Check the browser console** - should see "PDF uploaded successfully"
3. **Verify in Supabase** - go to Storage → invoices bucket, you should see the PDF files

## Important Notes

- **POS sales will still complete** even if PDF upload fails (it's optional)
- The sale is saved to the database regardless of PDF upload status
- PDF upload is just for record-keeping and invoice downloads
- You can always generate invoices later if needed

## Troubleshooting

### Still getting errors?
1. Check you're logged in as an admin user
2. Verify the bucket name is exactly `invoices` (case-sensitive)
3. Check the policy is saved and active
4. Try the SQL method if the UI method doesn't work

### Need help?
- Check Supabase logs: Dashboard → Logs → Storage
- Verify your user is authenticated: Check browser console for session info
- Test with a simple upload first to verify policies work


# Supabase Setup Guide

## Option 1: Use Local Files (Recommended for Testing)

If you don't want to use Supabase, simply don't set the environment variables. The application will automatically use local JSON files:
- `products.json` - for products
- `orders.json` - for orders
- `settings.json` - for site settings

**No setup required!** Just run:
```bash
npm start
```

## Option 2: Setup Supabase (For Production)

### Step 1: Create a Supabase Project
1. Go to https://supabase.com
2. Sign up or login
3. Click "New Project"
4. Fill in:
   - Name: `haider-collection`
   - Database Password: (choose a strong password)
   - Region: (closest to you)
5. Wait for project to be created (2-3 minutes)

### Step 2: Run the SQL Schema
1. In Supabase Dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy ALL content from `supabase-schema.sql` file
4. Paste into the query editor
5. Click "Run" button
6. You should see success messages for all tables created

### Step 3: Create Storage Bucket
1. Go to "Storage" in Supabase Dashboard
2. Click "New Bucket"
3. Name: `product-images`
4. Make it **Public**
5. Click "Create Bucket"

### Step 4: Set Up Environment Variables

#### For Local Development:
Create a `.env` file in project root:
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=product-images
```

To get these values:
- **SUPABASE_URL**: Go to Project Settings > API > Project URL
- **SUPABASE_SERVICE_ROLE_KEY**: Go to Project Settings > API > service_role key (click "Reveal" button)

#### For Vercel Deployment:
1. Go to your Vercel project
2. Settings > Environment Variables
3. Add these three variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
4. Redeploy your application

### Step 5: Start the Application
```bash
npm start
```

## Verifying Setup

### Check if Supabase is Working:
1. Start the server
2. Check the console - you should NOT see any Supabase errors
3. Go to admin dashboard
4. Try adding a product - it should work without errors
5. Try uploading a hero image - it should work

### If You See Errors:
- "Could not find the table" → Run the SQL schema again
- "Invalid API key" → Check your environment variables
- "Bucket not found" → Create the storage bucket

## Troubleshooting

### Hero Image Upload Fails
- Make sure `settings` table exists (check SQL Editor)
- Make sure storage bucket `product-images` is created and public
- Check environment variables are set correctly

### Products Not Showing Discount Price
- Make sure `original_price` column exists in products table
- Re-run the SQL schema if needed
- Check browser console for errors

### Migration from JSON to Supabase
If you have existing products in `products.json`:
1. Go to admin dashboard
2. You'll need to re-add products through the admin panel
3. Or use the Supabase SQL editor to import data

## Quick Reference: SQL Commands

### Check if tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Add original_price to existing products table:
```sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS original_price numeric(10,2);
```

### Create settings table manually:
```sql
CREATE TABLE IF NOT EXISTS settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Allow service role manage settings"
  ON settings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

## Support
If you continue to have issues, make sure:
1. You're using the latest code from GitHub
2. Your Supabase project is active
3. All environment variables are set correctly
4. The SQL schema ran without errors

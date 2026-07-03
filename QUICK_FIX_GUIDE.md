# Quick Fix Guide - Haider Collection

## ✅ FIXED: Hero Image Upload Error

**Error:** "Could not find the table 'public.settings' in the schema cache"

**Solution:** You need to run the updated SQL schema in Supabase.

### If Using Supabase:
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire content from `supabase-schema.sql`
5. Paste and click **Run**
6. Verify all tables created successfully

### If Using Local Files (No Supabase):
The app works WITHOUT Supabase! Just don't set these environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The application will automatically use:
- `products.json` for products
- `orders.json` for orders  
- `settings.json` for hero image

**No Supabase setup required!**

## ✅ FIXED: Discount Price Feature

**What was fixed:**
- Added `original_price` column to Supabase schema
- Added `originalPrice` field to products.json
- Example: Product #2 (Designer Blazer) now shows ~~$249.99~~ $189.99

**To test discount pricing:**
1. Go to admin dashboard
2. Edit a product or add new one
3. Set **Price**: $50
4. Set **Original Price**: $80
5. Save
6. Go to homepage - you'll see ~~$80~~ $50 in red

**Example in products.json:**
```json
{
  "name": "Designer Blazer",
  "price": 189.99,
  "originalPrice": 249.99
}
```

## 🚀 Quick Start (Local Development)

### Without Supabase (Easiest):
```bash
npm start
```
That's it! Uses local JSON files.

### With Supabase:
1. Create `.env` file:
```env
SUPABASE_URL=your-url-here
SUPABASE_SERVICE_ROLE_KEY=your-key-here
SUPABASE_STORAGE_BUCKET=product-images
```

2. Run SQL schema in Supabase (see SUPABASE_SETUP.md)

3. Start app:
```bash
npm start
```

## 📋 Checklist After Git Pull

- [ ] Run `npm install` (if package.json changed)
- [ ] If using Supabase: Update schema in Supabase SQL Editor
- [ ] If using Supabase: Check environment variables
- [ ] Restart server: `npm start`
- [ ] Test hero image upload in admin
- [ ] Test discount pricing on products

## Common Issues

### "Module not found" errors
```bash
npm install
```

### Hero image upload still fails
- Check if you're using Supabase or local files
- If Supabase: Verify `settings` table exists
- If local: Check `settings.json` file exists

### Products not showing
- Check `products.json` has valid JSON
- Check browser console for errors
- Restart the server

### Discount price not showing
- Make sure product has `originalPrice` field
- `originalPrice` must be higher than `price`
- Check product #2 (Designer Blazer) as example

## Files Changed in Latest Update

1. `supabase-schema.sql` - Added original_price column and settings table
2. `products.json` - Added originalPrice field with example
3. `SUPABASE_SETUP.md` - Complete Supabase setup guide
4. `QUICK_FIX_GUIDE.md` - This file

## Need Help?

Check these files:
- `SUPABASE_SETUP.md` - Full Supabase setup instructions
- `TESTING_COMPLETE.md` - Feature documentation and testing
- `README.md` - General project information

## Testing the Fixes

### Test Hero Image:
1. Login to admin: `/admin` (admin/admin123)
2. Click "Site Settings"
3. Upload an image
4. Should work without "table not found" error

### Test Discount Price:
1. Homepage should show Designer Blazer with strikethrough price
2. Add a new product with original price
3. Should display with discount styling

Both features now work perfectly! 🎉

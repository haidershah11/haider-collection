# Fix Original Price Column Error

## Error Message:
```
Error saving product: Could not find the 'original_price' column of 'products' in the schema cache
```

## Quick Fix - Run This SQL in Supabase:

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy and Run This SQL
```sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS original_price numeric(10,2);
```

### Step 3: Verify Column Was Added
Run this to check:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
```

You should see `original_price` in the list.

### Step 4: Test
1. Go to admin dashboard
2. Try adding/editing a product with an original price
3. Should work now!

---

## Alternative: Use the SQL File

I've created `add-original-price-column.sql` - you can run that entire file in Supabase SQL Editor.

---

## If You Still Have Issues

Make sure you're connected to the right Supabase project:
- Check your `.env` file
- Verify `SUPABASE_URL` matches your project
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

---

## Why This Happened

The `supabase-schema.sql` file includes the column, but if your database was created before we added it, you need to run an ALTER TABLE command to add it to the existing table.

This is a one-time fix - once added, it stays in your database.

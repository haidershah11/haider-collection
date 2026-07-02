# Deployment Instructions for Haider Collection

## Quick Start (Local Development)

1. **Install Dependencies**
```bash
cd luxefemme-fashion
npm install
```

2. **Create Upload Directory**
```bash
mkdir public\uploads
```

3. **Start the Server**
```bash
npm start
```

4. **Access the Website**
- Store: http://localhost:3000
- Admin: http://localhost:3000/admin
- Cart: http://localhost:3000/cart.html

## Admin Login Credentials
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT**: Change these credentials before deploying to production!

## Deployment to Vercel

This app now uses Supabase for persistent products, orders, and uploaded product images in production. Vercel alone does not provide persistent filesystem storage.

### Option 1: Vercel CLI

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Navigate to project folder:
```bash
cd luxefemme-fashion
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy: Y
   - Which scope: Select your account
   - Link to existing project: N
   - Project name: luxefemme-fashion (or your choice)
   - Directory: ./
   - Override settings: N

5. Your site will be deployed! Vercel will give you a URL.

### Option 2: GitHub + Vercel Dashboard

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Connect to Vercel:**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Other
     - Build Command: (leave empty)
     - Output Directory: (leave empty)
   - Click "Deploy"

3. **Done!** Your site is now live.

## Environment Variables (if needed)

Add these in Vercel before deploying:

```bash
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=product-images
```

If you add more environment variables later, configure them in:
- Vercel Dashboard → Settings → Environment Variables

## Post-Deployment Checklist

- [ ] Test the main store page
- [ ] Test admin login
- [ ] Test product creation
- [ ] Test multi-image uploads
- [ ] Test shopping cart
- [ ] Test checkout process
- [ ] Update WhatsApp number in code
- [ ] Update payment information
- [ ] Change admin credentials
- [ ] Add real product images
- [ ] Test on mobile devices

## Supabase Setup

1. Run [supabase-schema.sql](supabase-schema.sql) in the Supabase SQL editor.
2. Create a public storage bucket named `product-images`.
3. Set the environment variables listed above.
4. Re-deploy after the env vars are saved.

## Custom Domain

To add a custom domain:
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your domain
5. Follow DNS configuration instructions

## Troubleshooting

### Issue: Admin login not working
- Check browser console for errors
- Verify server is running
- Clear browser cache and localStorage

### Issue: Images not displaying
- Check if uploads directory exists
- Verify file permissions
- Use placeholder images initially
- Check image URLs in products.json

### Issue: Cart not working
- Check browser console
- Verify localStorage is enabled
- Test in incognito mode

## Support

For issues:
- Check console logs
- Review server logs
- Test API endpoints manually

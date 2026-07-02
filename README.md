# Haider Collection - Luxury Women's Clothing E-commerce

A complete e-commerce solution for luxury women's clothing with admin dashboard, beautiful animations, and checkout system.

## Features

- **Complete E-commerce Flow**: Product listing → Cart → Checkout
- **Admin Dashboard**: Add/edit/delete products with multiple image uploads
- **Payment Options**: COD, JazzCash/EasyPaisa with WhatsApp instructions
- **Floating WhatsApp Button**: Direct customer support
- **Beautiful Animations**: Smooth transitions without slowing down the site
- **Responsive Design**: Works on all devices
- **Product Management**: Categories, sizes, colors, featured products
- **Shopping Cart**: Persistent cart with local storage
- **Product Detail Modal**: Click any product to view the gallery, description, and sizes

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: HTML, CSS, JavaScript
- **Storage**: Supabase in production, local JSON fallback for development
- **Deployment**: Vercel-ready with Supabase Storage and Postgres

## Installation

1. Navigate to the project folder:
```bash
cd luxefemme-fashion
```

2. Install dependencies:
```bash
npm install
```

3. Create the uploads directory:
```bash
mkdir public\uploads
```

4. Create a Supabase project for production data persistence.

## Running the Project

1. Start the server:
```bash
npm start
```

2. Open your browser and visit:
```
http://localhost:3000
```

3. Admin panel:
```
http://localhost:3000/admin
Username: admin
Password: admin123
```

## Project Structure

```
luxefemme-fashion/
├── public/
│   ├── css/
│   │   ├── style.css
│   │   └── animations.css
│   ├── js/
│   │   └── main.js
│   ├── images/
│   └── uploads/
├── views/
│   ├── index.html
│   └── admin/
├── server.js
├── package.json
├── products.json
└── .gitignore
```

## Deployment to Vercel

This project uses Supabase for production persistence because Vercel's filesystem is temporary. Use Vercel for hosting and Supabase for product data, orders, and uploaded images.

### 1) Create your Supabase project

1. Go to https://supabase.com and sign in.
2. Click **New project**.
3. Choose your organization.
4. Enter a project name, for example `luxefemme-fashion`.
5. Set a strong database password and save it.
6. Choose a region close to your customers.
7. Click **Create new project** and wait for it to finish.

### 2) Get the Supabase keys

1. Open your Supabase project.
2. Go to **Project Settings**.
3. Click **API**.
4. Copy these values:
	- **Project URL** → use as `SUPABASE_URL`
	- **service_role key** → use as `SUPABASE_SERVICE_ROLE_KEY`
5. Do not expose the `service_role` key in frontend code. It is server-only.

### 3) Create the database tables

1. In Supabase, go to **SQL Editor**.
2. Click **New query**.
3. Open [supabase-schema.sql](supabase-schema.sql) in this repo.
4. Copy the full SQL from that file.
5. Paste it into the Supabase SQL editor.
6. Click **Run**.

This creates:
- `products`
- `orders`

### 4) Create the Supabase Storage bucket

1. In Supabase, go to **Storage**.
2. Click **New bucket**.
3. Name the bucket `product-images`.
4. Make the bucket public so product images can be viewed on the store.
5. Create the bucket.

If you use a different bucket name, update `SUPABASE_STORAGE_BUCKET` to match it.

### 5) Set environment variables in Vercel

1. Go to https://vercel.com and open your project.
2. Go to **Settings**.
3. Open **Environment Variables**.
4. Add these variables:

```bash
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_STORAGE_BUCKET=product-images
```

5. Save the variables for Production, Preview, and Development if needed.

### 6) Run locally first

1. Install dependencies:
```bash
npm install
```

2. Start the app:
```bash
npm start
```

3. Open:
```text
http://localhost:3000
```

4. Confirm the site loads and the products appear.

### 7) Test the admin panel locally

1. Open:
```text
http://localhost:3000/admin
```
2. Log in with:
	- Username: `admin`
	- Password: `admin123`
3. Add a test product.
4. Upload multiple images.
5. Save the product.
6. Refresh the page and confirm the product remains visible.

### 8) Deploy to Vercel

Option A: Vercel CLI

1. Install the CLI:
```bash
npm install -g vercel
```
2. From the project folder, run:
```bash
vercel
```
3. Follow the prompts and choose the project settings.

Option B: GitHub + Vercel Dashboard

1. Push the project to GitHub.
2. In Vercel, click **Add New Project**.
3. Import the GitHub repository.
4. Make sure the root directory is the project root.
5. Deploy.

### 9) Verify production behavior

After deployment, check all of these:
- Homepage loads correctly.
- Hero image fills the background.
- Clicking a product opens the product details modal.
- Admin can add multiple images for a product.
- Uploaded images still exist after refresh.
- Orders still exist after refresh.
- Footer location shows Attock City, Punjab, Pakistan.
- WhatsApp and phone numbers show `03135591513`.

### 10) Important note

Vercel can host the app, but it cannot keep uploaded files on its filesystem permanently. That is why this project uses Supabase Storage and Supabase Postgres in production.

## Push To GitHub

Use this section if you want to upload the full project to GitHub for the first time.

### 1) Create a GitHub account

1. Go to https://github.com.
2. Click **Sign up**.
3. Enter your email address.
4. Create a username.
5. Create a strong password.
6. Solve the verification steps.
7. Verify your email address when GitHub sends you the confirmation email.

### 2) Create a new GitHub repository

1. Sign in to GitHub.
2. Click the **+** icon in the top-right corner.
3. Choose **New repository**.
4. Enter a repository name, for example `haider-collection`.
5. Choose **Public** or **Private**.
6. Do not add a README, `.gitignore`, or license if your local project already has files.
7. Click **Create repository**.

### 3) Open the project in terminal

1. Open this project folder in VS Code.
2. Open the terminal.
3. Make sure you are inside the project folder.
4. If needed, move into the folder with:

```bash
cd "d:\New folder\luxefemme-fashion"
```

### 4) Set your Git username and email

If this is your first time using Git on this computer, set your name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Use the same email address that you use on GitHub.

### 5) Initialize Git in the project

If the project is not already a Git repository, run:

```bash
git init
```

If Git is already initialized, you can skip this step.

### 6) Check the current status

```bash
git status
```

This shows which files are new or changed.

### 7) Add all files to Git

```bash
git add .
```

This stages the complete project so it can be committed.

### 8) Create the first commit

```bash
git commit -m "Initial commit for Haider Collection"
```

If Git asks who you are, make sure your `user.name` and `user.email` are set correctly.

### 9) Connect the local project to GitHub

On your GitHub repository page, copy the repository URL. It will look like one of these:

```text
https://github.com/your-username/haider-collection.git
```

or

```text
git@github.com:your-username/haider-collection.git
```

Then run:

```bash
git remote add origin https://github.com/your-username/haider-collection.git
```

If a remote already exists, update it instead:

```bash
git remote set-url origin https://github.com/your-username/haider-collection.git
```

### 10) Push the code to GitHub

If your repository branch is `main`, run:

```bash
git branch -M main
git push -u origin main
```

If your repository uses `master`, push to `master` instead:

```bash
git push -u origin master
```

### 11) Sign in when Git asks for authentication

When Git opens a sign-in prompt:

1. Sign in to your GitHub account in the browser window.
2. Approve the authorization request.
3. Wait for Git to finish the push.

If Git asks for a password in the terminal, use a GitHub personal access token instead of your account password.

### 12) Confirm the upload worked

1. Refresh the GitHub repository page.
2. Confirm that all files are visible.
3. Check that `README.md`, `server.js`, `views/`, and `public/` are present.
4. Confirm the latest commit appears at the top.

### 13) Push future changes

Whenever you update the project later, use:

```bash
git add .
git commit -m "Describe your changes"
git push
```

### 14) Common problems

- If push is rejected, run `git pull origin main --rebase` and push again.
- If Git says the branch does not exist, check whether your branch is `main` or `master`.
- If authentication fails, sign in again through the browser or use a personal access token.

## Customization

- Update contact information in `views/index.html`
- Modify WhatsApp number and payment details
- Add your product images through the admin dashboard or seed them in `products.json`
- Customize colors in `public/css/style.css` (CSS variables at the top)

## Admin Features

- Add new products with images
- Add multiple images per product
- Edit existing products
- Delete products
- Upload product images
- Manage categories, sizes, and colors
- Set featured products

## Notes

- Replace placeholder images with actual product photos
- Update payment information (JazzCash/EasyPaisa number)
- Customize WhatsApp number for customer support
- For production, implement proper authentication and database

## License

MIT License - Free to use for personal and commercial projects

# Deployment Guide

## Free Hosting Options

### 🚀 **Vercel (Recommended for Next.js)**

**Best for:** Next.js applications (made by Next.js creators)

**Free Tier:**
- Unlimited personal projects
- 100GB bandwidth/month
- Automatic HTTPS
- Global CDN
- Serverless functions

**Setup:**
1. Push your code to GitHub (already done ✅)
2. Go to [vercel.com](https://vercel.com)
3. Sign in with GitHub
4. Click "New Project"
5. Import your repository: `DR2929/leetcode-visualizer`
6. Add environment variable: `OPENAI_API_KEY=your_key_here`
7. Click "Deploy"

**Note:** SQLite won't work on Vercel's serverless functions. You'll need to:
- Use a serverless database (Vercel Postgres, Supabase, PlanetScale)
- Or use Railway/Render for full database support

**Deploy URL:** `https://your-app-name.vercel.app`

---

### 🚂 **Railway (Best for Database Apps)**

**Best for:** Apps with databases (SQLite, PostgreSQL, etc.)

**Free Tier:**
- $5 credit/month (enough for small apps)
- PostgreSQL included
- Easy database setup
- Automatic deployments from GitHub

**Setup:**
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variable: `OPENAI_API_KEY`
6. Add PostgreSQL database (optional, or keep SQLite)
7. Deploy!

**Database Migration:**
- Railway supports SQLite files
- Or migrate to PostgreSQL (better for production)

**Deploy URL:** `https://your-app-name.up.railway.app`

---

### 🌐 **Render**

**Best for:** Full-stack apps with databases

**Free Tier:**
- 750 hours/month (enough for 24/7)
- PostgreSQL database
- Automatic SSL
- Auto-deploy from GitHub

**Setup:**
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Add environment variable: `OPENAI_API_KEY`
8. Deploy!

**Deploy URL:** `https://your-app-name.onrender.com`

---

### 🪶 **Fly.io**

**Best for:** Apps needing global distribution

**Free Tier:**
- 3 shared-cpu VMs
- 3GB persistent storage
- 160GB outbound data transfer
- Global edge network

**Setup:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Sign up: `fly auth signup`
3. In your project: `fly launch`
4. Follow prompts
5. Deploy: `fly deploy`

---

## Database Considerations

### Option 1: Keep SQLite (Railway/Render)
- Works on Railway and Render
- Simple, no migration needed
- File-based database

### Option 2: Migrate to PostgreSQL (Recommended for Production)
- Better for concurrent users
- Works on all platforms
- Requires migration script

### Option 3: Use Serverless Database (Vercel)
- Vercel Postgres (free tier available)
- Supabase (free tier: 500MB database)
- PlanetScale (free tier available)

---

## Quick Deploy Commands

### Vercel (CLI)
```bash
npm i -g vercel
vercel
```

### Railway (CLI)
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### Render
- Use web dashboard (recommended)
- Or use Render CLI

---

## Environment Variables to Set

Make sure to set these in your hosting platform:

```
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
```

---

## Recommended: Vercel + Supabase

**Best combination for free:**
1. **Vercel** for hosting Next.js app (free, optimized for Next.js)
2. **Supabase** for database (free tier: 500MB PostgreSQL)

**Why:**
- Vercel is made for Next.js (fastest deployment)
- Supabase provides free PostgreSQL database
- Both have generous free tiers
- Easy integration

---

## Cost Comparison

| Platform | Free Tier | Database | Best For |
|----------|-----------|----------|----------|
| **Vercel** | Unlimited projects | Serverless DB needed | Next.js apps |
| **Railway** | $5/month credit | ✅ Included | Full-stack apps |
| **Render** | 750 hrs/month | ✅ PostgreSQL | Production apps |
| **Fly.io** | 3 VMs | ✅ SQLite/Postgres | Global apps |
| **Netlify** | 100GB bandwidth | Serverless DB needed | Static/Next.js |

---

## My Recommendation

**For your LeetCode Visualizer:**

1. **Start with Vercel** (easiest, made for Next.js)
   - Migrate SQLite → Supabase (free PostgreSQL)
   - Or use Vercel Postgres

2. **Or use Railway** (if you want to keep SQLite)
   - No database migration needed
   - Simple deployment

Both are free and will work great! 🚀


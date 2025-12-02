# Quick Deploy Guide

## 🚂 Railway (Recommended - Works with SQLite)

**Why Railway?**
- ✅ Supports SQLite (your current database)
- ✅ Free tier: $5/month credit
- ✅ Auto-deploy from GitHub
- ✅ No code changes needed

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `DR2929/leetcode-visualizer`
5. Add environment variable: `OPENAI_API_KEY=your_key_here`
6. Click "Deploy"
7. Done! 🎉

Your app will be live at: `https://your-app-name.up.railway.app`

---

## ⚠️ Vercel Issue

**Problem:** SQLite doesn't work on Vercel's serverless functions (causes timeouts)

**Solutions:**
1. **Switch to Railway** (easiest - no code changes)
2. **Migrate to Supabase** (free PostgreSQL) - requires code changes
3. **Use Vercel Postgres** (free tier available) - requires code changes

---

## 🔄 If You Want to Use Vercel

You'll need to migrate from SQLite to a serverless database:

1. **Use Supabase** (free PostgreSQL):
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Get connection string
   - Update `lib/db.ts` to use PostgreSQL instead of SQLite

2. **Or use Vercel Postgres**:
   - Add Vercel Postgres in your Vercel dashboard
   - Update database connection code

**But honestly, Railway is easier!** 🚂


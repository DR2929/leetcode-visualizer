# Railway Deployment Guide

## Step-by-Step Setup

### 1. Sign Up / Sign In
- Go to [railway.app](https://railway.app)
- Click "Start a New Project"
- Sign in with your GitHub account

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Find and select: `DR2929/leetcode-visualizer`
- Click "Deploy Now"

### 3. Add Environment Variables
Once deployment starts, go to your project settings:

1. Click on your project
2. Go to "Variables" tab
3. Add this environment variable:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI API key (get it from [platform.openai.com](https://platform.openai.com/api-keys))

### 4. Seed the Database (Important!)
After the first deployment:

1. Go to your project dashboard
2. Click on your service
3. Go to "Settings" → "Deploy"
4. Add a one-time command to run:
   - **Command:** `npm run db:seed`
   - Or use Railway CLI (see below)

**Alternative: Use Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run seed command
railway run npm run db:seed
```

### 5. Get Your Live URL
- Railway will automatically assign a URL
- Go to "Settings" → "Domains"
- Your app will be at: `https://your-app-name.up.railway.app`
- You can add a custom domain if you want

### 6. Monitor Deployment
- Watch the build logs in Railway dashboard
- Check for any errors
- Once "Deployed" status shows, your app is live!

---

## Troubleshooting

### Database Not Seeded?
If problems aren't showing up:
1. Check Railway logs for errors
2. Run seed command manually via Railway CLI
3. Make sure `data/` directory is writable

### Build Fails?
- Check that all dependencies are in `package.json`
- Make sure Node.js version is compatible (Railway auto-detects)
- Check build logs in Railway dashboard

### Environment Variables Not Working?
- Make sure `OPENAI_API_KEY` is set in Railway
- Redeploy after adding variables
- Check variable names match exactly

---

## Railway Features You Get

✅ **Auto-deploy from GitHub** - Every push auto-deploys  
✅ **Free SSL/HTTPS** - Automatic HTTPS  
✅ **Custom domains** - Add your own domain  
✅ **Logs & Monitoring** - View app logs in dashboard  
✅ **Environment variables** - Secure secret management  
✅ **Database support** - SQLite works perfectly  

---

## Cost

**Free Tier:**
- $5 credit/month
- Enough for small-medium apps
- Your app should fit comfortably in free tier

**If you exceed:**
- Railway will notify you
- Pay-as-you-go pricing
- Very affordable for personal projects

---

## Next Steps After Deployment

1. ✅ Test your live URL
2. ✅ Try searching for a problem
3. ✅ Generate a solution
4. ✅ Check that visualizations work
5. ✅ Share your app! 🎉

---

## Need Help?

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Check Railway dashboard logs for errors

Good luck! 🚂


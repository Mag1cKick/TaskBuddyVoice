# 🚀 Deploy Task Buddy Voice to Heroku

## ✅ What I Fixed

1. ✅ Added `start` script to `package.json`
2. ✅ Created `Procfile` for Heroku
3. ✅ Configured to use Heroku's PORT environment variable

## 📋 Deployment Steps

### Step 1: Set Environment Variables in Heroku

Before deploying, you MUST set these environment variables:

1. Go to your Heroku dashboard: https://dashboard.heroku.com/apps/task-buddy-voice-755d36cec41f/settings
2. Click **"Reveal Config Vars"**
3. Add these variables:

```
VITE_SUPABASE_URL = https://bdwttimhtpnxhhwnnjji.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkd3R0aW1odHBueGhod25uamppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MzUzMDgsImV4cCI6MjA3NTUxMTMwOH0.UmOu8PWCiqnLrwY8Aiqg_TbcZMex50Cra1LM-Tqq-RQ
```

### Step 2: Commit and Push Changes

```bash
git add .
git commit -m "Add Heroku deployment configuration"
git push heroku main
```

(Or if you're pushing from a different branch: `git push heroku your-branch:main`)

### Step 3: Check Build Logs

```bash
heroku logs --tail --app task-buddy-voice-755d36cec41f
```

You should see:
```
Building...
✓ built in XXXms
Starting server...
Server running on port 12345
```

### Step 4: Open Your App

```bash
heroku open --app task-buddy-voice-755d36cec41f
```

Or visit: https://task-buddy-voice-755d36cec41f.herokuapp.com/

---

## 🔧 Important Notes

### Build Process

Heroku will automatically:
1. Run `npm install` to install dependencies
2. Run `npm run build` to build your Vite app
3. Run `npm start` to serve the built app

### Environment Variables

**CRITICAL**: Vite environment variables must be prefixed with `VITE_` and they are baked into the build at BUILD TIME, not runtime!

This means:
- ✅ Set them in Heroku BEFORE deploying
- ✅ If you change them, you must redeploy
- ❌ They won't work if added after build

### Port Configuration

Heroku assigns a random port via the `PORT` environment variable. The app is configured to use it automatically.

---

## 🐛 Troubleshooting

### "Application Error" or H10 Error

This usually means:
1. Environment variables not set → Set them in Heroku Config Vars
2. Build failed → Check build logs: `heroku logs --tail`
3. Port not configured → Already fixed in this commit

### Build Fails

If the build fails, check:
```bash
heroku logs --tail --app task-buddy-voice-755d36cec41f
```

Common issues:
- Missing dependencies → Run `npm install` locally first
- TypeScript errors → Fix with `npm run build` locally
- Out of memory → Add buildpack: `heroku buildpacks:add --index 1 heroku/nodejs`

### App Loads but Shows Errors

If the app loads but features don't work:
- Check browser console (F12)
- Verify Supabase URL is correct
- Verify Supabase key is correct
- Make sure `.env.local` is NOT committed (it's for local dev only)

---

## 🎯 Quick Deploy Checklist

- [ ] Environment variables set in Heroku
- [ ] Latest code committed to git
- [ ] Pushed to Heroku: `git push heroku main`
- [ ] Build successful (check logs)
- [ ] App opens without errors
- [ ] Can sign up/login
- [ ] Can create tasks
- [ ] Tasks appear in list

---

## 🌐 Alternative: Deploy to Vercel (Easier!)

If Heroku continues to have issues, consider Vercel instead:

```bash
npm install -g vercel
vercel
```

Vercel automatically:
- ✅ Detects Vite
- ✅ Builds correctly
- ✅ Handles environment variables
- ✅ Provides free SSL
- ✅ Has better performance

---

## 📧 What About Edge Functions?

Edge Functions (for weekly digest emails) need to be deployed separately to Supabase, not Heroku.

Heroku deployment = Your React app only
Supabase deployment = Edge Functions for emails

See `DEPLOY_EMAIL_MANUALLY.md` for Edge Function deployment.


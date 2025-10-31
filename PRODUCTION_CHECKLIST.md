# Production Deployment Checklist

Use this checklist before deploying TaskBuddy Voice to production.

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Create `.env` file with required variables
- [ ] Set `VITE_SUPABASE_URL` (from Supabase project settings)
- [ ] Set `VITE_SUPABASE_ANON_KEY` (from Supabase project settings)
- [ ] Verify Supabase connection works locally

### 2. Sentry Setup (Recommended)
- [ ] Sign up at https://sentry.io
- [ ] Create a new React project in Sentry
- [ ] Copy your DSN
- [ ] Set `VITE_SENTRY_DSN` in environment
- [ ] Set `VITE_SENTRY_ENVIRONMENT=production`
- [ ] Test error tracking locally (set `VITE_SENTRY_DEBUG=true`)

### 3. Supabase Configuration
- [ ] Database tables created (see `SETUP_YOUR_SUPABASE.sql`)
- [ ] RLS policies enabled
- [ ] Realtime enabled (see `ENABLE_REALTIME.sql`)
- [ ] Authentication configured
- [ ] Edge Functions deployed (for weekly digest)
- [ ] Edge Function secrets set (`RESEND_API_KEY`)

### 4. Code Quality
- [ ] Run `npm run lint` - should have 0 errors
- [ ] Run `npm run build` - should build successfully
- [ ] Check bundle sizes - main bundle < 400 kB
- [ ] Test locally with production build (`npm run preview`)

### 5. Testing
- [ ] Test user registration
- [ ] Test user login
- [ ] Test voice input
- [ ] Test task creation (manual)
- [ ] Test task editing
- [ ] Test task deletion
- [ ] Test task completion
- [ ] Test weekly digest display
- [ ] Test weekly digest email (if configured)
- [ ] Test error boundary (trigger an error)
- [ ] Test on mobile devices

### 6. Deployment Platform Setup

#### For Heroku:
- [ ] Create Heroku app
- [ ] Set config vars:
  ```bash
  heroku config:set VITE_SUPABASE_URL=...
  heroku config:set VITE_SUPABASE_ANON_KEY=...
  heroku config:set VITE_SENTRY_DSN=...
  heroku config:set VITE_SENTRY_ENVIRONMENT=production
  ```
- [ ] Verify `Procfile` exists
- [ ] Verify `heroku-postbuild` script in package.json
- [ ] Deploy: `git push heroku main`

#### For Vercel/Netlify:
- [ ] Connect GitHub repository
- [ ] Set environment variables in dashboard
- [ ] Configure build command: `npm run build`
- [ ] Configure output directory: `dist`
- [ ] Deploy

### 7. Post-Deployment Verification
- [ ] App loads successfully
- [ ] No console errors
- [ ] Authentication works
- [ ] Tasks can be created
- [ ] Tasks sync in real-time
- [ ] Weekly digest displays correctly
- [ ] Check Sentry dashboard for errors
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices

### 8. Monitoring Setup
- [ ] Sentry dashboard configured
- [ ] Alert rules set up in Sentry
- [ ] Performance monitoring enabled
- [ ] Session replay enabled
- [ ] User feedback widget (optional)

### 9. Documentation
- [ ] README.md is up to date
- [ ] Environment variables documented
- [ ] Deployment instructions clear
- [ ] Contributing guidelines available

### 10. Security
- [ ] Environment variables not committed to git
- [ ] `.env` file in `.gitignore`
- [ ] Supabase RLS policies tested
- [ ] No sensitive data in client-side code
- [ ] HTTPS enabled (automatic on most platforms)

## 🚨 Common Issues & Solutions

### Issue: "Failed to load weekly digest"
**Solution:** Check Supabase connection and RLS policies

### Issue: Build fails with "Cannot find module"
**Solution:** Run `npm install` to ensure all dependencies are installed

### Issue: Sentry not receiving errors
**Solution:** 
1. Check `VITE_SENTRY_DSN` is set correctly
2. Verify Sentry is initialized (check console for "✅ Sentry initialized")
3. Set `VITE_SENTRY_DEBUG=true` to test in development

### Issue: Code splitting not working
**Solution:** Check `vite.config.ts` has `manualChunks` configuration

### Issue: Environment variables not working
**Solution:** 
1. Ensure variables start with `VITE_`
2. Restart dev server after changing `.env`
3. Check `src/config/env.ts` validation

## 📊 Performance Benchmarks

Target metrics for production:

- **Initial Load:** < 3 seconds (on 3G)
- **Time to Interactive:** < 5 seconds
- **Main Bundle:** < 400 kB (gzipped < 120 kB)
- **Lighthouse Score:** > 90

Check with:
```bash
npm run build
# Check output for bundle sizes
```

## 🔄 Continuous Monitoring

After deployment, monitor:

1. **Sentry Dashboard:**
   - Error rate
   - Performance metrics
   - User sessions

2. **Supabase Dashboard:**
   - Database usage
   - API requests
   - Authentication metrics

3. **Hosting Platform:**
   - Uptime
   - Response times
   - Bandwidth usage

## 📞 Support Contacts

- **Supabase Support:** https://supabase.com/support
- **Sentry Support:** https://sentry.io/support
- **Heroku Support:** https://help.heroku.com

## ✅ Final Check

Before going live:
- [ ] All checklist items completed
- [ ] Tested in production environment
- [ ] Monitoring is active
- [ ] Team notified of deployment
- [ ] Rollback plan ready

---

**Last Updated:** October 28, 2025
**Status:** Ready for Production 🚀


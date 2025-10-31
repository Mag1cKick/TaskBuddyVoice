# 🚀 TaskBuddy Voice - Quick Reference Guide

**Last Updated**: October 28, 2025

---

## 📦 Dependency Management Commands

### Check for Unused Dependencies
```bash
npm run deps:check
```
Scans your codebase and identifies potentially unused dependencies.

### Security Audit
```bash
npm run deps:audit
```
Checks for security vulnerabilities in your dependencies.

### Update Dependencies
```bash
npm run deps:update
```
Updates all dependencies within their semver ranges and runs a security audit.

### Manual Dependency Updates
```bash
# Check which packages are outdated
npm outdated

# Update specific package
npm update <package-name>

# Update to latest major version (breaking changes)
npm install <package-name>@latest
```

---

## 🏗️ Build & Development Commands

### Development Server
```bash
npm run dev
```
Starts the Vite development server (usually on http://localhost:5173).

### Production Build
```bash
npm run build
```
Creates an optimized production build in the `dist/` folder.

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally for testing.

### Linting
```bash
npm run lint
```
Runs ESLint to check for code quality issues.

---

## 🗄️ Supabase Commands

### Deploy Edge Function
```bash
supabase functions deploy weekly-digest
```
Deploys the weekly digest edge function to Supabase.

### View Edge Function Logs
```bash
supabase functions logs weekly-digest
```
Shows real-time logs for the weekly digest function.

### Set Supabase Secrets
```bash
supabase secrets set RESEND_API_KEY=your_api_key_here
```
Sets environment variables for edge functions.

---

## 📊 Project Status

### Current Versions
- **React**: 18.3.1
- **Vite**: 7.1.12
- **TypeScript**: 5.8.3
- **Supabase**: 2.74.0
- **Tailwind CSS**: 3.4.17

### Security Status
- ✅ **0 vulnerabilities**
- ✅ Dependabot enabled (weekly checks)
- ✅ Automated security alerts

### Dependencies
- **Total**: 62
- **Production**: 44
- **Development**: 18

---

## 🔧 Maintenance Schedule

### Weekly (Automated)
- ✅ Dependabot checks for updates (Mondays 9:00 AM)
- ✅ Automated PRs created for dependency updates

### Monthly (Manual)
- [ ] Review and merge Dependabot PRs
- [ ] Run `npm run deps:audit`
- [ ] Check for major version updates

### Quarterly (Manual)
- [ ] Run `npm run deps:check`
- [ ] Review documentation
- [ ] Performance audit

### Annual (Manual)
- [ ] Major dependency updates
- [ ] Comprehensive security audit
- [ ] Dependency tree optimization

---

## 📚 Documentation

### Main Guides
- **README.md** - Project overview and setup
- **DEPENDENCY_MANAGEMENT.md** - Comprehensive dependency strategy
- **WEEKLY_DIGEST_SETUP.md** - Weekly digest email setup guide

### Reference Documents
- **DEPENDENCY_MANAGEMENT_SUMMARY.md** - Dependency work summary
- **RECOMMENDATIONS_IMPLEMENTATION.md** - Complete implementation report
- **QUICK_REFERENCE.md** - This document

---

## 🐛 Common Issues & Solutions

### Build Fails After Dependency Update
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Security Vulnerability Found
```bash
# Try automatic fix first
npm audit fix

# If that doesn't work, try force fix (may have breaking changes)
npm audit fix --force

# Check what changed
git diff package.json
```

### Dependabot PR Conflicts
```bash
# Rebase the PR branch
git checkout dependabot/npm_and_yarn/...
git rebase main
git push --force-with-lease
```

### Edge Function Not Working
```bash
# Check logs
supabase functions logs weekly-digest

# Redeploy
supabase functions deploy weekly-digest

# Verify secrets are set
supabase secrets list
```

---

## 🔗 Useful Links

### Project Resources
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Dependency Management
- [npm Documentation](https://docs.npmjs.com/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Semantic Versioning](https://semver.org/)

### UI Components
- [Radix UI Documentation](https://www.radix-ui.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

---

## 💡 Tips & Best Practices

### Before Updating Dependencies
1. ✅ Read the changelog
2. ✅ Check for breaking changes
3. ✅ Test in development first
4. ✅ Update one major dependency at a time

### When Adding New Dependencies
1. ✅ Check bundle size impact
2. ✅ Verify it's actively maintained
3. ✅ Check for security vulnerabilities
4. ✅ Consider alternatives

### For Production Deployments
1. ✅ Run `npm run build` locally first
2. ✅ Test the production build with `npm run preview`
3. ✅ Check `npm audit` shows 0 vulnerabilities
4. ✅ Verify all tests pass (if you add tests later)

---

## 🎯 Quick Checklist

### Before Committing
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] No console errors in development
- [ ] Tested main user flows

### Before Deploying
- [ ] Production build tested locally
- [ ] `npm audit` shows 0 vulnerabilities
- [ ] All Supabase edge functions deployed
- [ ] Environment variables set correctly

### Monthly Maintenance
- [ ] Review Dependabot PRs
- [ ] Run security audit
- [ ] Check for major updates
- [ ] Review error logs (if any)

---

**Need Help?**
- Check the detailed documentation in `DEPENDENCY_MANAGEMENT.md`
- Review the implementation report in `RECOMMENDATIONS_IMPLEMENTATION.md`
- Check Supabase setup in `WEEKLY_DIGEST_SETUP.md`

**Status**: ✅ All systems operational






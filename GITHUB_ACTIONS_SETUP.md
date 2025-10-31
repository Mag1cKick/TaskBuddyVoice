# GitHub Actions CI/CD Setup Guide

## Overview

This guide will help you set up GitHub Actions for automated testing, building, and deployment.

---

## 🚀 Quick Start

### 1. Enable GitHub Actions

GitHub Actions is enabled by default for all repositories. No setup needed!

### 2. Configure Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Click "New repository secret" and add the following:

#### Required Secrets

| Secret Name | Description | Where to Get It |
|-------------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Supabase Dashboard → Settings → API |

#### Optional Secrets (for Sentry)

| Secret Name | Description | Where to Get It |
|-------------|-------------|-----------------|
| `VITE_SENTRY_DSN` | Your Sentry DSN | Sentry Dashboard → Settings → Projects → Client Keys |

#### Optional Secrets (for Heroku Deployment)

| Secret Name | Description | Where to Get It |
|-------------|-------------|-----------------|
| `HEROKU_API_KEY` | Your Heroku API key | Heroku Account Settings → API Key |
| `HEROKU_APP_NAME` | Your Heroku app name | Your app name on Heroku |
| `HEROKU_EMAIL` | Your Heroku email | Your Heroku account email |

---

## 📋 Workflow Overview

The CI/CD pipeline consists of 6 jobs:

### 1. Security Job
- Checks for exposed secrets
- Runs security audit
- Fails if secrets found

### 2. Lint Job
- Runs ESLint
- Checks TypeScript compilation
- Ensures code quality

### 3. Test Job
- Runs all tests
- Generates coverage report
- Uploads coverage to Codecov (optional)

### 4. Build Job
- Builds the application
- Checks bundle size
- Archives build artifacts

### 5. Dependencies Job
- Checks for unused dependencies
- Lists outdated packages
- Helps maintain clean dependencies

### 6. Deploy Job (optional)
- Deploys to Heroku on main branch
- Only runs after all other jobs pass
- Automatic deployment

---

## 🔧 Configuration Files

### Workflow File

**Location:** `.github/workflows/ci.yml`

This file defines the CI/CD pipeline. It's already created and ready to use!

### Dependabot File

**Location:** `.github/dependabot.yml`

Automates dependency updates:
- Weekly updates on Monday
- Groups updates by type
- Auto-creates PRs

---

## 🎯 Triggering Workflows

### Automatic Triggers

Workflows run automatically on:
- **Push to main/develop:** Full CI/CD pipeline
- **Pull requests:** Full CI/CD pipeline (no deployment)

### Manual Triggers

You can also trigger workflows manually:
1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"

---

## 📊 Viewing Results

### In GitHub

1. Go to **Actions** tab in your repository
2. Click on a workflow run
3. View job details and logs

### Status Badges

Add to your README.md:

```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI%2FCD%20Pipeline/badge.svg)
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Secrets not found"

**Problem:** Workflow fails with missing secrets

**Solution:**
- Go to Settings → Secrets
- Add required secrets
- Re-run workflow

#### 2. "Tests failing"

**Problem:** Tests pass locally but fail in CI

**Solution:**
- Check environment differences
- Ensure all dependencies in package.json
- Check for hardcoded paths

#### 3. "Build fails"

**Problem:** Build succeeds locally but fails in CI

**Solution:**
- Ensure environment variables are set
- Check Node version matches
- Review build logs

#### 4. "Heroku deployment fails"

**Problem:** Deployment step fails

**Solution:**
- Verify Heroku secrets are correct
- Check Heroku app exists
- Review Heroku logs

---

## 🔒 Security Best Practices

### 1. Never Commit Secrets

- ❌ Don't put secrets in code
- ❌ Don't put secrets in workflow files
- ✅ Use GitHub Secrets
- ✅ Use environment variables

### 2. Limit Secret Access

- Only give secrets to jobs that need them
- Use `needs` to control job dependencies
- Review secret usage regularly

### 3. Use Dependabot

- Automatically updates dependencies
- Creates PRs for security updates
- Keeps dependencies current

---

## 📈 Optimizing Workflows

### 1. Caching

The workflow uses npm caching:
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

This speeds up workflows by caching `node_modules`.

### 2. Parallel Jobs

Jobs run in parallel when possible:
- Security, Lint, Test run simultaneously
- Build waits for all to complete
- Deploy waits for Build

### 3. Conditional Jobs

Some jobs only run in certain conditions:
- Deploy only runs on main branch
- Deploy only runs on push (not PR)

---

## 🎨 Customizing Workflows

### Change Node Version

Edit `.github/workflows/ci.yml`:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change this
```

### Add More Jobs

Add a new job:

```yaml
jobs:
  my-job:
    name: My Custom Job
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Do something
        run: echo "Hello"
```

### Change Triggers

Edit the `on` section:

```yaml
on:
  push:
    branches: [main, develop, feature/*]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
```

---

## 📦 Artifacts

### Coverage Reports

Coverage reports are uploaded as artifacts:
- Retention: 30 days
- Download from workflow run page

### Build Artifacts

Build output is uploaded:
- Retention: 7 days
- Can be downloaded for debugging

---

## 🔄 Continuous Deployment

### Heroku Deployment

Automatic deployment to Heroku:
- Triggers on push to main
- Uses Heroku Deploy action
- Passes environment variables

### Other Platforms

To deploy to other platforms, modify the deploy job:

**Vercel:**
```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.ORG_ID }}
    vercel-project-id: ${{ secrets.PROJECT_ID }}
```

**Netlify:**
```yaml
- name: Deploy to Netlify
  uses: nwtgck/actions-netlify@v2
  with:
    publish-dir: './dist'
    production-deploy: true
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 📊 Codecov Integration (Optional)

### Setup

1. Sign up at https://codecov.io
2. Connect your GitHub repository
3. Get upload token
4. Add to GitHub Secrets as `CODECOV_TOKEN`

### Benefits

- Visual coverage reports
- PR comments with coverage changes
- Coverage trends over time

---

## 🎯 Best Practices

### 1. Keep Workflows Fast

- Use caching
- Run jobs in parallel
- Skip unnecessary steps

### 2. Fail Fast

- Run quick checks first (lint, security)
- Run slow checks last (build, deploy)
- Cancel on first failure

### 3. Clear Naming

- Use descriptive job names
- Use descriptive step names
- Add comments for complex logic

### 4. Monitor Workflow Usage

- Check Actions usage in Settings
- Optimize to stay within limits
- Use self-hosted runners for heavy workloads

---

## 📚 Resources

### Official Documentation

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

### Marketplace

- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- Find pre-built actions for common tasks

### Community

- [GitHub Actions Community](https://github.community/c/code-to-cloud/github-actions/41)
- Ask questions and share workflows

---

## ✅ Setup Checklist

- [ ] Workflow file created (`.github/workflows/ci.yml`)
- [ ] Dependabot configured (`.github/dependabot.yml`)
- [ ] GitHub Secrets added
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_SENTRY_DSN` (optional)
  - [ ] Heroku secrets (if deploying)
- [ ] First workflow run successful
- [ ] Status badge added to README (optional)
- [ ] Team notified about CI/CD

---

## 🎉 You're All Set!

Your CI/CD pipeline is now configured and ready to:
- ✅ Automatically test code
- ✅ Check for security issues
- ✅ Build the application
- ✅ Deploy to production
- ✅ Keep dependencies updated

**Every push and PR will now be automatically tested!** 🚀


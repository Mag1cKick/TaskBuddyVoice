# Security Improvements & Key Management

## 🚨 Security Issues Found

### 1. Exposed Credentials in Repository ❌

**File:** `HEROKU_DEPLOYMENT.md` (Line 21)
**Issue:** Contains actual Supabase URL and anon key

```
VITE_SUPABASE_URL = https://bdwttimhtpnxhhwnnjji.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Risk Level:** HIGH
- Anyone with repository access can see these credentials
- Anon key is public-facing but should still not be in version control
- Supabase URL exposes project identifier

---

## ✅ Immediate Actions (Week 1)

### Action 1: Remove Exposed Credentials

#### Step 1.1: Rotate Supabase Keys (CRITICAL)
Since the anon key is exposed in git history, it should be rotated:

1. Go to Supabase Dashboard → Settings → API
2. Click "Reset" on the anon/public key
3. Update your local `.env` file with the new key
4. Update Heroku config vars with the new key

```bash
# Update Heroku
heroku config:set VITE_SUPABASE_ANON_KEY=<new-key>
```

#### Step 1.2: Clean Git History
Remove the exposed credentials from git history:

```bash
# Install BFG Repo-Cleaner (one-time)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Or use git-filter-repo
pip install git-filter-repo

# Remove the file from history
git filter-repo --path HEROKU_DEPLOYMENT.md --invert-paths

# Force push (WARNING: Coordinate with team first!)
git push origin --force --all
```

**Alternative (Safer):** If you can't rewrite history, at minimum:
1. Rotate the keys immediately
2. Remove the file or sanitize it
3. Document that old keys are invalid

#### Step 1.3: Update Documentation Files
Replace actual credentials with placeholders in all documentation.

---

### Action 2: Implement Proper Key Management

#### 2.1: Environment Variable Best Practices

**Create `.env.example` (template):**
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Sentry (Optional)
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_SENTRY_ENVIRONMENT=development
```

**Update `.gitignore`:**
```gitignore
# Environment variables
.env
.env.local
.env.*.local
.env.production
.env.development

# Never commit these
*.pem
*.key
*.cert
*secret*
*password*
```

#### 2.2: Secrets Management for Different Environments

**Local Development:**
- Use `.env` file (gitignored)
- Validated by `src/config/env.ts`

**Heroku Production:**
```bash
# Set via Heroku CLI
heroku config:set VITE_SUPABASE_URL=<url>
heroku config:set VITE_SUPABASE_ANON_KEY=<key>
heroku config:set VITE_SENTRY_DSN=<dsn>

# Verify
heroku config
```

**Vercel/Netlify:**
- Set in dashboard under Environment Variables
- Can set different values for production/preview/development

**Supabase Edge Functions:**
```bash
# Set secrets for Edge Functions
supabase secrets set RESEND_API_KEY=<key>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<key>

# List secrets (values hidden)
supabase secrets list
```

#### 2.3: Implement Secrets Validation Script

Create `scripts/validate-secrets.js`:
```javascript
#!/usr/bin/env node

/**
 * Validates that no secrets are committed to the repository
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const PATTERNS = [
  /VITE_SUPABASE_ANON_KEY\s*=\s*['"]?eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/,
  /RESEND_API_KEY\s*=\s*['"]?re_[a-zA-Z0-9_-]+/,
  /SENTRY_DSN\s*=\s*['"]?https:\/\/[a-f0-9]+@[a-z0-9.]+\/[0-9]+/,
  /service_role.*eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/,
];

const IGNORE_DIRS = ['node_modules', 'dist', '.git', 'build'];
const IGNORE_FILES = ['.env', '.env.local', '.env.production'];

function scanDirectory(dir, errors = []) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        scanDirectory(filePath, errors);
      }
    } else if (stat.isFile()) {
      if (IGNORE_FILES.includes(file)) continue;
      
      try {
        const content = readFileSync(filePath, 'utf8');
        
        for (const pattern of PATTERNS) {
          if (pattern.test(content)) {
            errors.push({
              file: filePath,
              pattern: pattern.toString(),
            });
          }
        }
      } catch (err) {
        // Skip binary files
      }
    }
  }
  
  return errors;
}

console.log('🔍 Scanning for exposed secrets...\n');

const errors = scanDirectory('.');

if (errors.length > 0) {
  console.error('❌ Found exposed secrets:\n');
  errors.forEach(({ file, pattern }) => {
    console.error(`  ${file}`);
    console.error(`    Pattern: ${pattern}\n`);
  });
  console.error('⚠️  Please remove these secrets and use environment variables instead.\n');
  process.exit(1);
} else {
  console.log('✅ No exposed secrets found!\n');
  process.exit(0);
}
```

Add to `package.json`:
```json
{
  "scripts": {
    "security:check": "node scripts/validate-secrets.js",
    "precommit": "npm run security:check"
  }
}
```

---

### Action 3: Set Up Pre-commit Hooks

Install Husky for git hooks:

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run security:check"
```

This prevents commits with exposed secrets.

---

### Action 4: Implement Secret Rotation Policy

**Create `SECURITY_POLICY.md`:**

```markdown
# Security Policy

## Secret Rotation Schedule

| Secret | Rotation Frequency | Last Rotated | Next Rotation |
|--------|-------------------|--------------|---------------|
| Supabase Anon Key | Quarterly | TBD | TBD |
| Supabase Service Role | Quarterly | TBD | TBD |
| Resend API Key | Quarterly | TBD | TBD |
| Sentry DSN | Annually | TBD | TBD |

## Incident Response

If a secret is exposed:
1. Rotate the secret immediately
2. Update all environments
3. Review access logs
4. Document the incident
5. Review security practices

## Reporting Security Issues

Email: security@yourdomain.com
```

---

## 🔒 Additional Security Improvements

### 1. Content Security Policy (CSP)

Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://*.supabase.co https://*.sentry.io;">
```

### 2. Security Headers

For Heroku, create `static.json`:
```json
{
  "headers": {
    "/**": {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
    }
  }
}
```

### 3. Dependency Security Scanning

Add to `package.json`:
```json
{
  "scripts": {
    "security:audit": "npm audit --audit-level=moderate",
    "security:fix": "npm audit fix"
  }
}
```

Set up GitHub Dependabot (already done ✅).

### 4. Rate Limiting

Implement rate limiting for API calls in `src/utils/rateLimit.ts`:

```typescript
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

export const apiRateLimiter = new RateLimiter(10, 60000);
```

---

## 📋 Security Checklist

### Immediate (Week 1)
- [ ] Rotate exposed Supabase keys
- [ ] Remove credentials from HEROKU_DEPLOYMENT.md
- [ ] Create `.env.example` with placeholders
- [ ] Verify `.gitignore` includes `.env`
- [ ] Set up secrets validation script
- [ ] Install and configure Husky pre-commit hooks
- [ ] Audit all documentation for exposed secrets
- [ ] Update Heroku config vars with new keys

### Short Term (Weeks 2-4)
- [ ] Implement CSP headers
- [ ] Add security headers (static.json)
- [ ] Set up secret rotation schedule
- [ ] Create SECURITY_POLICY.md
- [ ] Implement rate limiting
- [ ] Review Supabase RLS policies
- [ ] Enable Supabase audit logs
- [ ] Set up security monitoring alerts

### Long Term (Ongoing)
- [ ] Quarterly secret rotation
- [ ] Monthly security audits
- [ ] Dependency updates (automated via Dependabot)
- [ ] Security training for team
- [ ] Penetration testing (if applicable)

---

## 🎯 Success Criteria

✅ No secrets in git repository
✅ All secrets in environment variables
✅ Pre-commit hooks prevent secret commits
✅ Documentation uses placeholders only
✅ Secret rotation policy in place
✅ Security headers implemented
✅ Rate limiting active

---

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

**Status:** Ready for Implementation
**Priority:** HIGH
**Effort:** 2-3 days


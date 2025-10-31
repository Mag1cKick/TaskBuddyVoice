# Supabase Production Configuration

Complete guide for configuring Supabase for production deployment.

---

## 🌐 URL Configuration

### 1. Site URL

**Location:** Authentication → URL Configuration → Site URL

**Production:**
```
https://task-buddy-voice-755d36cec41f.herokuapp.com
```

**Purpose:** This is the default URL used in authentication emails and redirects.

---

### 2. Redirect URLs

**Location:** Authentication → URL Configuration → Redirect URLs

**Add these URLs:**

```
https://task-buddy-voice-755d36cec41f.herokuapp.com/**
http://localhost:8080/**
```

**Purpose:** 
- First URL: Production redirects
- Second URL: Local development (keep this!)

**Note:** The `/**` wildcard allows all paths under the domain.

---

## 📧 Email Templates

### Confirmation Email

**Location:** Authentication → Email Templates → Confirm signup

**Default Template:**
```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

**The `{{ .ConfirmationURL }}`** automatically uses your **Site URL** setting.

### Magic Link Email

**Location:** Authentication → Email Templates → Magic Link

Similar to confirmation email, uses `{{ .MagicLinkURL }}`.

### Password Reset Email

**Location:** Authentication → Email Templates → Reset Password

Uses `{{ .ResetPasswordURL }}`.

---

## 🔐 Authentication Settings

### Recommended Settings

**Location:** Authentication → Settings

| Setting | Recommended Value | Notes |
|---------|------------------|-------|
| **Enable Email Confirmations** | ✅ Enabled | Verify email addresses |
| **Enable Email Change Confirmations** | ✅ Enabled | Security best practice |
| **Disable Signup** | ❌ Disabled | Allow new users |
| **Enable Custom SMTP** | Optional | For custom email sender |
| **Session Timeout** | 3600 (1 hour) | Or longer if needed |
| **Refresh Token Reuse Interval** | 10 seconds | Default is fine |

---

## 🚀 Edge Functions Configuration

### Weekly Digest Function

**Secrets to Set:**
```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
```

**Verify secrets:**
```bash
supabase secrets list
```

---

## 🔒 Row Level Security (RLS)

### Verify RLS Policies

1. **Go to:** Database → Policies
2. **Check `tasks` table policies:**
   - Users can only see their own tasks
   - Users can only modify their own tasks

**Test RLS:**
1. Create two test accounts
2. Add tasks in account A
3. Login to account B
4. Verify you can't see account A's tasks

---

## 📊 Database Configuration

### Tables

Ensure these tables exist:
- ✅ `tasks` - Main tasks table
- ✅ `profiles` - User profiles (optional)

### Indexes

For better performance:
```sql
-- Check existing indexes
SELECT * FROM pg_indexes WHERE tablename = 'tasks';
```

Should have indexes on:
- `user_id` (for filtering by user)
- `created_at` (for sorting)

---

## 🔄 Realtime Configuration

### Enable Realtime for Tasks

**Location:** Database → Publications → supabase_realtime

**Verify `tasks` table is included:**
1. Go to Database → Publications
2. Click `supabase_realtime`
3. Ensure `tasks` table is checked
4. Save changes

**Or use SQL:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
```

---

## 🌍 CORS Configuration (Edge Functions)

If you have CORS issues with Edge Functions:

**In your Edge Function:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://task-buddy-voice-755d36cec41f.herokuapp.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}
```

**Or allow all origins (less secure):**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  // ... rest of headers
}
```

---

## 🎯 Environment-Specific Settings

### Development

**Site URL:** `http://localhost:8080`
**Redirect URLs:** `http://localhost:8080/**`

### Production

**Site URL:** `https://task-buddy-voice-755d36cec41f.herokuapp.com`
**Redirect URLs:** 
- `https://task-buddy-voice-755d36cec41f.herokuapp.com/**`
- `http://localhost:8080/**` (keep for dev)

---

## ✅ Configuration Checklist

### Authentication
- [ ] Site URL set to production URL
- [ ] Production redirect URL added
- [ ] Local redirect URL kept for development
- [ ] Email confirmations enabled
- [ ] Email templates reviewed

### Security
- [ ] RLS policies enabled on `tasks` table
- [ ] RLS policies tested with multiple users
- [ ] Service role key kept secret
- [ ] Anon key is public-safe

### Performance
- [ ] Indexes created on `tasks` table
- [ ] Realtime enabled for `tasks`
- [ ] Edge Functions deployed

### Email
- [ ] Test confirmation email
- [ ] Test password reset email
- [ ] Verify redirect URLs work
- [ ] Check spam folder if emails not received

---

## 🐛 Troubleshooting

### Issue: Confirmation emails still redirect to localhost

**Solutions:**
1. Clear browser cache
2. Sign up with a new email (old emails use old URL)
3. Wait 5 minutes for Supabase to update
4. Check Site URL is saved correctly

### Issue: Confirmation email not received

**Check:**
1. Spam/junk folder
2. Email is valid
3. Supabase logs (Authentication → Logs)
4. Email confirmations are enabled

### Issue: CORS errors in production

**Fix:**
1. Check Edge Function CORS headers
2. Verify origin URL matches exactly
3. Redeploy Edge Function after changes

### Issue: RLS blocking legitimate requests

**Debug:**
1. Check Supabase logs
2. Verify `auth.uid()` matches user_id
3. Test policies with different users
4. Check PostgreSQL policies syntax

---

## 📞 Getting Help

### Supabase Support
- **Docs:** https://supabase.com/docs
- **Discord:** https://discord.supabase.com
- **GitHub:** https://github.com/supabase/supabase

### Common Issues
- **Email not working:** Check SMTP settings
- **RLS errors:** Review policies
- **CORS issues:** Check origins
- **Realtime not working:** Enable publication

---

## 🎉 Verification Steps

After configuration:

1. **Test Authentication Flow**
   - [ ] Sign up new user
   - [ ] Receive confirmation email
   - [ ] Click confirmation link
   - [ ] Redirects to production URL
   - [ ] Successfully logged in

2. **Test Task Operations**
   - [ ] Create task
   - [ ] Edit task
   - [ ] Delete task
   - [ ] Real-time updates work

3. **Test Multiple Users**
   - [ ] Create two accounts
   - [ ] Each sees only their tasks
   - [ ] RLS working correctly

4. **Test Edge Functions**
   - [ ] Weekly digest works
   - [ ] No CORS errors
   - [ ] Emails send successfully

---

## 🚀 Production URLs

### Your Deployment
**App:** https://task-buddy-voice-755d36cec41f.herokuapp.com

### Supabase
**Project URL:** `https://[your-project-ref].supabase.co`
**API URL:** `https://[your-project-ref].supabase.co/rest/v1`
**Auth URL:** `https://[your-project-ref].supabase.co/auth/v1`

---

**✅ Configuration Complete!**

Your Supabase project is now properly configured for production deployment with correct redirect URLs! 🎊


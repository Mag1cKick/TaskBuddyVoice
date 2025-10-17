# 📧 Testing Weekly Digest Email

This guide shows you how to test the weekly digest email functionality.

## ✅ Prerequisites

Before testing, ensure you have:

1. **Deployed the Edge Function** to Supabase
2. **Set up Resend API Key** in Supabase Edge Functions secrets
3. **Created some tasks** in your account (the email will summarize your last 7 days)

See [WEEKLY_DIGEST_SETUP.md](./WEEKLY_DIGEST_SETUP.md) for setup instructions.

## 🚀 Quick Deploy

If you haven't deployed the Edge Function yet, or need to redeploy after updates:

### **Windows:**
Double-click `deploy-edge-function.bat` in the project root, or run:
```bash
supabase functions deploy weekly-digest
```

### **Mac/Linux:**
```bash
supabase functions deploy weekly-digest
```

**Important:** You must redeploy the function after any code changes for them to take effect!

---

## 🧪 Testing Methods

### **Method 1: In-App Test Button (Easiest)** ⭐

I've added a "📧 Test Email" button to your dashboard!

1. Open your app and sign in
2. Look for the **"📧 Test Email"** button in the top-right corner (next to sign out)
3. Click it
4. Wait for the toast notification confirming the email was sent
5. Check your email inbox (the email associated with your Supabase account)

**Expected Result:**
- Toast notification: "Test email sent! Check your email inbox"
- Email arrives within 1-2 minutes

---

### **Method 2: Supabase Dashboard**

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Edge Functions** in the sidebar
4. Find the `weekly-digest` function
5. Click **"Invoke"** or **"Test"** button
6. Check your email

---

### **Method 3: cURL Command**

Perfect for CI/CD testing or automation:

```bash
curl -X POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/weekly-digest' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

**Get your credentials:**
- **Project ID**: Found in your Supabase project URL
- **Anon Key**: Project Settings → API → `anon` `public` key

**Example Response (Success):**
```json
{
  "success": true,
  "emailsSent": 1,
  "message": "Weekly digest emails sent successfully"
}
```

---

### **Method 4: Postman / Thunder Client**

1. Create a new POST request
2. URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/weekly-digest`
3. Headers:
   - `Authorization`: `Bearer YOUR_ANON_KEY`
   - `Content-Type`: `application/json`
4. Send the request
5. Check your email

---

## 📋 What to Check in the Email

The weekly digest email should contain:

### **Header**
- ✅ Subject: "Your Weekly Task Summary 📊"
- ✅ Professional HTML formatting
- ✅ Task Buddy Voice branding

### **Statistics Section**
- ✅ Total tasks created this week
- ✅ Tasks completed
- ✅ Tasks pending
- ✅ Completion rate percentage

### **Priority Breakdown**
- ✅ High priority tasks count
- ✅ Medium priority tasks count
- ✅ Low priority tasks count

### **Category Analysis**
- ✅ List of categories used
- ✅ Number of tasks per category

### **Daily Activity**
- ✅ Most active day of the week
- ✅ Daily task creation breakdown

### **Motivational Message**
- ✅ Personalized message based on your performance
- ✅ Encouraging tone

---

## 🐛 Troubleshooting

### **No Email Received?**

1. **Check Spam/Junk folder** - Resend emails might land there initially
2. **Verify Resend API Key** is set correctly:
   ```bash
   supabase secrets list
   ```
   Should show `RESEND_API_KEY`

3. **Check Edge Function logs**:
   ```bash
   supabase functions logs weekly-digest
   ```

4. **Verify your email** in Resend dashboard (for free tier, you can only send to verified emails)

### **Error: "Edge Function not found"**

Deploy the function:
```bash
supabase functions deploy weekly-digest
```

### **Error: "RESEND_API_KEY not set"**

Set the secret:
```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
```

### **Email shows "No tasks this week"**

This is correct if you haven't created any tasks in the last 7 days. Create some tasks and try again!

---

## 📊 Testing Different Scenarios

### **Scenario 1: Empty Account (No Tasks)**
- Expected: Email with motivational message to get started
- Shows 0 tasks, 0% completion rate

### **Scenario 2: Active User (5+ Tasks)**
- Expected: Full statistics with breakdown
- Shows daily activity and most active day

### **Scenario 3: High Performer (80%+ Completion)**
- Expected: Congratulatory message
- Encouraging continued success

### **Scenario 4: Low Activity (0% Completion)**
- Expected: Motivational message to keep going
- Supportive and encouraging tone

---

## 🔄 Automated Testing (Cron)

Once you're satisfied with manual testing, set up the automated weekly cron:

### **Option A: Supabase Cron Extension**

```sql
SELECT cron.schedule(
  'weekly-digest-cron',
  '0 9 * * 1',  -- Every Monday at 9 AM
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_ID.supabase.co/functions/v1/weekly-digest',
      headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) AS request_id;
  $$
);
```

### **Option B: GitHub Actions**

See [WEEKLY_DIGEST_SETUP.md](./WEEKLY_DIGEST_SETUP.md) for GitHub Actions configuration.

---

## 📝 Testing Checklist

Use this checklist to verify everything works:

- [ ] Edge Function is deployed
- [ ] Resend API key is set
- [ ] Can invoke function via in-app button
- [ ] Email arrives in inbox (not spam)
- [ ] Email formatting looks correct
- [ ] Statistics are accurate
- [ ] Links work (if any)
- [ ] Email displays correctly on mobile
- [ ] Email displays correctly in different email clients (Gmail, Outlook, etc.)
- [ ] Cron job is scheduled (if using automated sending)

---

## 🎉 Success!

If you receive a properly formatted email with your weekly statistics, congratulations! Your weekly digest email system is working perfectly.

The email will now be sent automatically every Monday at 9 AM (or whatever schedule you configured) to all users with tasks in the system.

---

## 📚 Additional Resources

- [WEEKLY_DIGEST_SETUP.md](./WEEKLY_DIGEST_SETUP.md) - Initial setup guide
- [Resend Documentation](https://resend.com/docs) - Email API docs
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions) - Edge Functions guide
- [Supabase Cron](https://supabase.com/docs/guides/database/extensions/pg_cron) - Scheduling guide


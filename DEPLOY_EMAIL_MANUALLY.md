# 📧 Manual Email Setup - Simple Steps

Since you're signed in as **slabliuk.pn@ucu.edu.ua**, follow these steps:

## Step 1: Get Resend API Key

1. Go to https://resend.com/
2. Sign up or log in
3. Go to **API Keys** → **Create API Key**
4. Copy the key (starts with `re_...`)

---

## Step 2: Set Up Resend

1. In Resend Dashboard, go to **Domains**
2. **For FREE tier testing**, you need to verify your email:
   - Go to **Settings** → **Email Addresses**
   - Add `slabliuk.pn@ucu.edu.ua`
   - Check your email for verification link
   - Click the link to verify

**Important**: Resend free tier only sends to verified emails!

---

## Step 3: Contact Me for Edge Function Deployment

Unfortunately, deploying Edge Functions requires Supabase CLI which isn't installing properly on your system.

### Your Options:

#### Option A: I Can Help Deploy (If you share credentials securely)
- I would need temporary access to deploy the function

#### Option B: Manual Deployment via Supabase Dashboard
1. Go to https://app.supabase.com/project/bdwttimhtpnxhhwnnjji/functions
2. Click "New Function"
3. Name: `weekly-digest`
4. Copy-paste the entire code from `supabase/functions/weekly-digest/index.ts`
5. Click "Deploy"

#### Option C: Use Cloud IDE (Easiest!)
1. Open your project in GitHub Codespaces or Gitpod
2. Run: `npm install -g supabase`
3. Run: `supabase link --project-ref bdwttimhtpnxhhwnnjji`
4. Run: `supabase functions deploy weekly-digest`

---

## Step 4: Set Environment Variables

After deploying the function:

1. Go to **Edge Functions** → `weekly-digest` → **Settings**
2. Add these secrets:
   - `RESEND_API_KEY`: Your Resend API key from Step 1
   - `SUPABASE_URL`: `https://bdwttimhtpnxhhwnnjji.supabase.co` (auto-set usually)
   - `SUPABASE_SERVICE_ROLE_KEY`: Get from Project Settings → API → `service_role` key

---

## Step 5: Test It!

Once deployed:

1. Open your app at http://localhost:8080
2. Create 2-3 tasks (so you have data from last 7 days)
3. Click the "📧 Test Email" button
4. Check `slabliuk.pn@ucu.edu.ua` inbox!

---

## Quick Test via PowerShell (After Deployment):

```powershell
Invoke-WebRequest -Uri 'https://bdwttimhtpnxhhwnnjji.supabase.co/functions/v1/weekly-digest' -Method POST -Headers @{"Authorization"="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkd3R0aW1odHBueGhod25uamppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MzUzMDgsImV4cCI6MjA3NTUxMTMwOH0.UmOu8PWCiqnLrwY8Aiqg_TbcZMex50Cra1LM-Tqq-RQ"}
```

You should see:
```json
{
  "success": true,
  "message": "Processed 1 users",
  "results": [{
    "email": "slabliuk.pn@ucu.edu.ua",
    "success": true,
    "tasksFound": 2
  }]
}
```

And an email in your inbox! 🎉


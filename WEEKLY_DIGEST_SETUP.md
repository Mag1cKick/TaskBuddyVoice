# Weekly Digest Cron Setup Guide

## 1. Supabase Edge Functions Setup

### Deploy the Weekly Digest Function
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (replace with your project reference)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the edge function
supabase functions deploy weekly-digest
```

### Set Environment Variables
In your Supabase dashboard, go to **Settings > Edge Functions** and add:
- `SUPABASE_URL`: Your project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (from API settings)

## 2. Cron Job Configuration Options

### Option A: Supabase Cron (Recommended)
Add this to your database via SQL Editor:

```sql
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule weekly digest to run every Monday at 9 AM UTC
SELECT cron.schedule(
    'weekly-digest',           -- job name
    '0 9 * * 1',              -- cron expression (Monday 9 AM UTC)
    $$
    SELECT
      net.http_post(
        url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/weekly-digest',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
    $$
);
```

### Option B: GitHub Actions (Alternative)
Create `.github/workflows/weekly-digest.yml`:

```yaml
name: Weekly Task Digest
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
  workflow_dispatch:     # Allow manual trigger

jobs:
  weekly-digest:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Weekly Digest
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            https://YOUR_PROJECT_REF.supabase.co/functions/v1/weekly-digest
```

### Option C: External Cron Service
Use services like:
- **Cron-job.org**: Free web-based cron service
- **EasyCron**: Reliable cron service
- **Zapier**: No-code automation platform

Configure to make HTTP POST requests to:
`https://YOUR_PROJECT_REF.supabase.co/functions/v1/weekly-digest`

## 3. Testing the Setup

### Manual Test
```bash
# Test the edge function directly
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/weekly-digest
```

### Check Cron Jobs (if using Supabase cron)
```sql
-- View scheduled jobs
SELECT * FROM cron.job;

-- View job run history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

## 4. Customization Options

### Modify Cron Schedule
- Daily: `0 9 * * *`
- Bi-weekly: `0 9 * * 1` (every other Monday, manage in function)
- Monthly: `0 9 1 * *`

### Add Email Notifications
Extend the edge function to use services like:
- Resend API
- SendGrid
- Supabase Auth (for in-app notifications)

### Add Push Notifications
Integrate with:
- Firebase Cloud Messaging
- OneSignal
- Apple Push Notification service

## 5. Current Features

✅ **Implemented:**
- Weekly task statistics calculation
- Database function for efficient queries
- Beautiful in-app weekly digest component
- Supabase Edge Function for automated generation
- Confidence scoring and task parsing
- Priority and category tracking

🔄 **Cron Automation:**
- Choose one of the options above to enable automatic weekly digests
- Function is ready and will work once scheduled

## Replace Placeholders
- `YOUR_PROJECT_REF`: Your Supabase project reference ID
- `YOUR_ANON_KEY`: Your Supabase anonymous key
- `YOUR_EMAIL`: Your email for notifications (if implementing)


# Weekly Digest with Email Setup Guide

## 1. Email Service Setup (Resend)

### Create Resend Account
1. Go to [resend.com](https://resend.com) and sign up
2. Verify your domain or use their sandbox domain for testing
3. Get your API key from the dashboard

### Configure Supabase Environment Variables
In your Supabase dashboard, go to **Settings > Edge Functions** and add:
- `SUPABASE_URL`: Your project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (from API settings)
- `RESEND_API_KEY`: Your Resend API key

## 2. Deploy Edge Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (replace with your project reference)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the updated edge function with email support
supabase functions deploy weekly-digest
```

## 3. Cron Job Configuration (Updated for Email)

### Option A: Supabase Cron (Recommended)
Add this to your database via SQL Editor:

```sql
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule weekly digest emails to run every Monday at 9 AM UTC
SELECT cron.schedule(
    'weekly-digest-emails',    -- job name
    '0 9 * * 1',              -- cron expression (Monday 9 AM UTC)
    $$
    SELECT
      net.http_post(
        url:='https://supabase.com/dashboard/project/bdwttimhtpnxhhwnnjji/functions/v1/weekly-digest',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkd3R0aW1odHBueGhod25uamppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MzUzMDgsImV4cCI6MjA3NTUxMTMwOH0.UmOu8PWCiqnLrwY8Aiqg_TbcZMex50Cra1LM-Tqq-RQ"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
    $$
);
```

### Option B: GitHub Actions (Alternative)
Create `.github/workflows/weekly-digest-emails.yml`:

```yaml
name: Weekly Task Digest Emails
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
  workflow_dispatch:     # Allow manual trigger

jobs:
  weekly-digest-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Send Weekly Digest Emails
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            https://YOUR_PROJECT_REF.supabase.co/functions/v1/weekly-digest
```

## 4. Email Features

### ✅ What's Included:
- **Beautiful HTML Email Template** with gradient design
- **Personalized Stats** for each user's weekly performance
- **Motivational Messages** based on completion rate
- **Visual Stats Grid** showing tasks, completion rate, priorities
- **Weekly Insights** including most active day and categories
- **Mobile-Responsive** design that works on all devices
- **Smart Filtering** - only sends emails to users with tasks that week

### 📧 Email Content:
- **Subject Line**: "📊 Your Weekly Task Digest - XX% Complete!"
- **Header**: Gradient purple/blue design with Task Buddy Voice branding
- **Stats Cards**: Total tasks, completed, pending, completion rate
- **Insights Section**: Most active day, daily average, top category
- **Category Tags**: Visual display of all categories used
- **Motivational Section**: Encouraging message based on performance
- **Footer**: Branding and encouragement

## 5. Testing the Email System

### Manual Test
```bash
# Test the email function directly
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/weekly-digest
```

### Check Email Delivery
- Check your email inbox for the weekly digest
- Verify in Resend dashboard for delivery status
- Check Supabase Edge Function logs for any errors

### Monitor Cron Jobs (if using Supabase cron)
```sql
-- View scheduled jobs
SELECT * FROM cron.job WHERE jobname = 'weekly-digest-emails';

-- View job run history
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'weekly-digest-emails')
ORDER BY start_time DESC LIMIT 10;
```

## 6. Customization Options

### Email Frequency
- **Weekly** (default): `0 9 * * 1` (Monday 9 AM)
- **Bi-weekly**: `0 9 1,15 * *` (1st and 15th of month)
- **Monthly**: `0 9 1 * *` (1st of each month)

### Email Branding
Update in the edge function:
- **From Address**: Change `digest@taskbuddyvoice.com` to your domain
- **Colors**: Modify gradient colors in the HTML template
- **Logo**: Add your logo URL to the email template

### Email Preferences (Future Enhancement)
Add user preferences for:
- Email frequency (daily, weekly, monthly)
- Email content (stats only, insights, motivational messages)
- Opt-out option

## 7. Domain Configuration (Production)

### For Production Use:
1. **Verify your domain** in Resend dashboard
2. **Update sender address** from sandbox to your domain
3. **Set up SPF/DKIM records** for better deliverability
4. **Test thoroughly** before going live

### Sandbox vs Production:
- **Sandbox**: Can only send to verified email addresses
- **Production**: Can send to any email address once domain is verified

## 8. Current Features Status

✅ **Implemented:**
- Automated email sending to all users
- Beautiful HTML email template
- Personalized weekly statistics
- Cron job configuration
- Error handling and logging
- Mobile-responsive design

🔄 **Ready for Deployment:**
- Set up Resend API key
- Deploy the updated edge function
- Configure cron job
- Test email delivery

## Replace Placeholders
- `YOUR_PROJECT_REF`: Your Supabase project reference ID
- `YOUR_ANON_KEY`: Your Supabase anonymous key
- `digest@taskbuddyvoice.com`: Your verified email domain

## 9. Sample Email Preview

The email includes:
- **Header**: Purple gradient with "📊 Weekly Task Digest"
- **Stats Grid**: 4 cards showing total, completed, pending, completion %
- **Insights**: Most active day, daily average, high priority count, top category
- **Categories**: Visual tags for all categories used
- **Motivation**: Emoji + encouraging message based on performance
- **Footer**: Task Buddy Voice branding and encouragement


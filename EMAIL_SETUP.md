# Email Notification Setup for Survey Responses

## Quick Setup (5 minutes)

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up (free tier: 3,000 emails/month)
2. Verify your email
3. Go to **API Keys** → **Create API Key**
4. Copy the key (starts with `re_...`)

### 2. Add Environment Variables

Add these to your Render backend environment variables:

```
RESEND_API_KEY=re_your_key_here
NOTIFICATION_EMAIL=your@email.com
```

**Important:** Replace `your@email.com` with the email where you want to receive survey notifications.

### 3. Update Email "From" Address (Optional)

By default, emails are sent from `notifications@mirifer.com`. To use your own domain:

1. In Resend dashboard, add and verify your domain
2. Update `server/emailService.js` line 17:
   ```javascript
   from: 'Mirifer <notifications@yourdomain.com>',
   ```

### 4. Test It

1. Deploy backend to Render
2. Complete all 14 days in Mirifer
3. Fill out the survey at `/survey`
4. Check your email for the notification!

## Email Format

You'll receive emails with:
- Subject: "New Mirifer Survey Response - [Access Code]"
- Key insights highlighted at the top
- Full responses organized by section
- Timestamp of submission

## Troubleshooting

**Not receiving emails?**
- Check Render logs for "Survey notification sent"
- Verify `RESEND_API_KEY` and `NOTIFICATION_EMAIL` are set
- Check spam folder
- Verify Resend account is active

**Want to disable emails temporarily?**
- Remove `RESEND_API_KEY` from environment variables
- Responses will still be saved to database

## Viewing Responses in Supabase

All survey responses are stored in the `survey_responses` table. You can:
1. Go to Supabase dashboard
2. Navigate to Table Editor → `survey_responses`
3. View all responses with timestamps
4. Export to CSV for analysis

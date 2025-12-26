# Troubleshooting Survey Email Issue

## Steps to Debug

### 1. Check Render Backend Logs

1. Go to your Render dashboard
2. Select your Mirifer backend service
3. Click "Logs" tab
4. Look for these messages after survey submission:
   - `Survey notification sent:` (success)
   - `Resend error:` (error)
   - `Email notifications not configured` (missing env vars)

### 2. Verify Environment Variables

In Render dashboard → Environment:
- ✅ `RESEND_API_KEY` = `re_eYeTUjeB_GBWAZQNo1TA9ZEir1AZjzW9L`
- ✅ `NOTIFICATION_EMAIL` = `afz.javan@gmail.com`

**Important:** After adding these, did you redeploy? Render needs to restart for env vars to take effect.

### 3. Check Resend Dashboard

1. Go to [resend.com/emails](https://resend.com/emails)
2. Check if any emails were sent
3. Look for delivery status or errors

### 4. Common Issues

**Issue: "Email notifications not configured"**
- Solution: Environment variables not set or backend not redeployed

**Issue: "Resend error: Domain not verified"**
- Solution: Use Resend's default sending domain or verify your own

**Issue: Email sent but not received**
- Check spam folder in Gmail
- Check Resend dashboard for delivery status

### 5. Test Locally

If you want to test locally:
1. Add env vars to `server/.env`:
   ```
   RESEND_API_KEY=re_eYeTUjeB_GBWAZQNo1TA9ZEir1AZjzW9L
   NOTIFICATION_EMAIL=afz.javan@gmail.com
   ```
2. Restart your local server
3. Submit survey again
4. Check terminal logs for errors

## Quick Fix

The most common issue is that environment variables weren't added to Render or the backend wasn't redeployed. 

**To fix:**
1. Go to Render → Your backend service → Environment
2. Add both environment variables
3. Click "Save Changes"
4. Wait for automatic redeploy (~2-3 minutes)
5. Submit survey again

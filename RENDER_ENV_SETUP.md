# Environment Variables for Render Backend

Add these to your Render dashboard:

1. Go to your Render backend service
2. Click "Environment" in the left sidebar
3. Add these two new variables:

```
RESEND_API_KEY=re_eYeTUjeB_GBWAZQNo1TA9ZEir1AZjzW9L
NOTIFICATION_EMAIL=afz.javan@gmail.com
```

4. Click "Save Changes"
5. Render will automatically redeploy your backend

## Testing the Survey

Once the backend redeploys (takes ~2-3 minutes):

1. Complete all 14 days in Mirifer (if not already done)
2. Navigate to `/survey` on your site
3. Fill out the reflection survey
4. Submit
5. Check `afz.javan@gmail.com` for the notification email!

The email will include:
- Subject: "New Mirifer Survey Response - [Your Access Code]"
- Key insights highlighted
- Full responses organized by section

## Troubleshooting

If you don't receive an email:
- Check Render logs for "Survey notification sent"
- Check spam folder
- Verify the environment variables are saved correctly
- Make sure backend redeployed successfully

# InstantDB Email Configuration

## Issue: Magic Code Not Arriving

If you're not receiving the magic code email, you need to configure email sending in your InstantDB dashboard.

## Steps to Configure Email:

1. **Go to InstantDB Dashboard**
   - Visit: https://instantdb.com/dashboard
   - Log in with your account

2. **Navigate to Your App**
   - Select your app: `f512d6cc-620d-41c8-82b3-9e58a194348f`
   - Or create a new app if needed

3. **Configure Email Provider**
   - Go to Settings → Email Configuration
   - Set up an email provider (SendGrid, Mailgun, etc.)
   - Or use InstantDB's default email service if available

4. **Test Email Sending**
   - Use the test email feature in the dashboard
   - Verify emails are being sent successfully

## Alternative: Development Testing

For development, you might want to:
- Check the browser console for any errors
- Check InstantDB dashboard logs for email sending status
- Use a test email service or check spam folder

## Troubleshooting

- **No email received**: Check spam folder, verify email address
- **Email service error**: Check InstantDB dashboard for configuration errors
- **Timeout**: InstantDB might have rate limits - wait a few minutes and try again

## Quick Check

1. Open browser console (F12)
2. Look for any errors when clicking "Send Magic Code"
3. Check InstantDB dashboard → Logs for email sending status


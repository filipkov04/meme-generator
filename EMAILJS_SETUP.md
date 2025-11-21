# EmailJS Setup Instructions

This app uses EmailJS to send welcome emails to users after they sign up. Follow these steps to configure it:

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (free tier includes 200 emails/month)

## Step 2: Add Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions to connect your email account
5. Note your **Service ID** (e.g., `service_xxxxxxx`)

## Step 3: Create Email Template

1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Use this template structure:

**Template Name:** Welcome Email

**Subject:** Welcome to Meme Generator!

**Content:**
```
Hello {{to_name}},

Welcome to Meme Generator! We're excited to have you on board.

Your account has been successfully created with the email: {{to_email}}

Start creating amazing memes today!

Best regards,
Meme Generator Team
```

**Template Variables:**
- `to_name` - User's name (part before @ in email)
- `to_email` - User's email address
- `from_name` - Sender name
- `subject` - Email subject
- `message` - Additional message

4. Save the template and note your **Template ID** (e.g., `template_xxxxxxx`)

## Step 4: Get Your Public Key

1. Go to **Account** → **General** in EmailJS dashboard
2. Find your **Public Key** (e.g., `xxxxxxxxxxxxx`)

## Step 5: Update Configuration

Open `auth.js` and update these values:

```javascript
const EMAILJS_CONFIG = {
    PUBLIC_KEY: 'YOUR_PUBLIC_KEY',      // Replace with your Public Key
    SERVICE_ID: 'YOUR_SERVICE_ID',     // Replace with your Service ID
    TEMPLATE_ID: 'YOUR_TEMPLATE_ID'     // Replace with your Template ID
};
```

## Testing

After configuration:
1. Sign up with a new account
2. Check your email inbox for the welcome email
3. Check the browser console for any errors

## Troubleshooting

- **Email not sending?** Check browser console for errors
- **Service ID/Template ID wrong?** Verify in EmailJS dashboard
- **Public Key invalid?** Make sure you copied the correct key
- **Rate limit?** Free tier is 200 emails/month

## Security Note

The Public Key is safe to expose in client-side code. However, for production apps, consider:
- Using a backend service for email sending
- Implementing rate limiting
- Adding email verification


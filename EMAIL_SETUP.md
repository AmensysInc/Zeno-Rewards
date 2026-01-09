# Email Service Setup Guide

The email service is now integrated into the rewards system. It sends automated emails for:
1. **Customer Registration** - Welcome email with signup bonus
2. **New Offers** - Notification when new offers are created
3. **Redemption Confirmation** - Confirmation when customers redeem offers

## Configuration

Add the following environment variables to your `.env` file:

```env
# SMTP Server Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true

# Email Sender Information
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Car Wash Rewards
```

## Gmail Setup (Example)

If using Gmail:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to Google Account → Security
   - Under "2-Step Verification", click "App passwords"
   - Generate a new app password for "Mail"
   - Use this password in `SMTP_PASSWORD`

3. **Configuration**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   SMTP_USE_TLS=true
   FROM_EMAIL=your-email@gmail.com
   FROM_NAME=Your Business Name
   ```

## Other Email Providers

### Outlook/Office 365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USE_TLS=true
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_USE_TLS=true
```

### Custom SMTP Server
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USERNAME=your-username
SMTP_PASSWORD=your-password
SMTP_USE_TLS=true
```

## Email Templates

The service includes three email templates:

1. **Welcome Email** - Sent when customer registers
   - Includes signup bonus information
   - Welcome message and program benefits

2. **Offer Notification** - Sent when new offers are created
   - Sent to all eligible customers (based on customer_type)
   - Includes offer details and reward information

3. **Redemption Confirmation** - Sent when customer redeems
   - Includes redemption code (if applicable)
   - Confirmation of reward applied

All emails are sent in both HTML and plain text formats for maximum compatibility.

## Testing

To test the email service, you can:

1. Register a new customer with an email address
2. Create a new offer (emails will be sent to eligible customers)
3. Redeem an offer (confirmation email will be sent)

## Troubleshooting

- **Emails not sending**: Check SMTP credentials and firewall settings
- **Authentication errors**: Verify username/password are correct
- **Connection timeout**: Check SMTP host and port settings
- **Check logs**: Email errors are logged but don't fail the main operations

## Notes

- Email sending is non-blocking - if email fails, the main operation (registration, offer creation, redemption) still succeeds
- Only customers with email addresses will receive emails
- For offer notifications, only customers matching the offer's `customer_type` will receive emails


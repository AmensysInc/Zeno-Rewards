import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
from datetime import datetime
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Email service for sending transactional emails"""
    
    def __init__(self):
        # SMTP Configuration - will be set from environment variables
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@example.com")
        self.from_name = os.getenv("FROM_NAME", "Car Wash Rewards")
        self.use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
        
    def _get_smtp_connection(self):
        """Create and return SMTP connection"""
        if self.use_tls:
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
        else:
            server = smtplib.SMTP_SSL(self.smtp_host, self.smtp_port)
        
        if self.smtp_username and self.smtp_password:
            server.login(self.smtp_username, self.smtp_password)
        
        return server
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None
    ) -> bool:
        """
        Send an email to the recipient
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_body: HTML content of the email
            text_body: Plain text content (optional, will be generated from HTML if not provided)
            
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            # Validate configuration
            if not self.smtp_host or not self.from_email:
                logger.error("SMTP configuration incomplete. Cannot send email.")
                return False
            
            if not to_email:
                logger.error("No recipient email provided")
                return False
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Add text and HTML parts
            if text_body:
                text_part = MIMEText(text_body, 'plain')
                msg.attach(text_part)
            
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)
            
            # Send email
            server = self._get_smtp_connection()
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {str(e)}")
            return False
    
    def send_welcome_email(self, customer_name: str, customer_email: str, signup_bonus: int = 0, password_setup_token: str | None = None) -> bool:
        """Send welcome email to newly registered customer with password setup link"""
        subject = "Welcome to Our Car Wash Rewards Program!"
        
        html_body = self._get_welcome_email_template(customer_name, signup_bonus, password_setup_token)
        text_body = self._get_welcome_email_text(customer_name, signup_bonus, password_setup_token)
        
        return self.send_email(customer_email, subject, html_body, text_body)
    
    def send_offer_notification_email(
        self,
        customer_name: str,
        customer_email: str,
        offer_name: str,
        offer_description: str,
        reward_type: str,
        reward_value: str
    ) -> bool:
        """Send email notification about a new offer"""
        subject = f"New Offer Available: {offer_name}"
        
        html_body = self._get_offer_email_template(
            customer_name, offer_name, offer_description, reward_type, reward_value
        )
        text_body = self._get_offer_email_text(
            customer_name, offer_name, offer_description, reward_type, reward_value
        )
        
        return self.send_email(customer_email, subject, html_body, text_body)
    
    def send_redemption_confirmation_email(
        self,
        customer_name: str,
        customer_email: str,
        offer_name: str,
        reward_type: str,
        reward_value: str,
        redemption_code: Optional[str] = None
    ) -> bool:
        """Send confirmation email when customer redeems an offer"""
        subject = "Redemption Confirmed - Thank You!"
        
        html_body = self._get_redemption_email_template(
            customer_name, offer_name, reward_type, reward_value, redemption_code
        )
        text_body = self._get_redemption_email_text(
            customer_name, offer_name, reward_type, reward_value, redemption_code
        )
        
        return self.send_email(customer_email, subject, html_body, text_body)
    
    # Email Templates
    
    def _get_welcome_email_template(self, customer_name: str, signup_bonus: int, password_setup_token: str | None = None) -> str:
        """Generate HTML template for welcome email"""
        name = customer_name or "Valued Customer"
        bonus_text = f"<p><strong>🎉 Welcome Bonus: {signup_bonus} points!</strong></p>" if signup_bonus > 0 else ""
        
        # Password setup section
        password_section = ""
        if password_setup_token:
            # In production, replace with actual frontend URL
            frontend_url = settings.FRONTEND_URL
            setup_url = f"{frontend_url}/customer/setup-password?token={password_setup_token}"
            password_section = f"""
            <div style="background-color: #e3f2fd; border: 2px solid #2196F3; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center;">
                <h3 style="color: #1976d2; margin-top: 0;">🔐 Set Up Your Account Password</h3>
                <p>To access your account and track your rewards, please set up your password by clicking the button below:</p>
                <a href="{setup_url}" class="button" style="display: inline-block; padding: 12px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Create Password</a>
                <p style="font-size: 12px; color: #666; margin-top: 15px;">Or copy and paste this link into your browser:<br><a href="{setup_url}" style="color: #2196F3; word-break: break-all;">{setup_url}</a></p>
            </div>
            """
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
                .button {{ display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Our Rewards Program!</h1>
                </div>
                <div class="content">
                    <h2>Hello {name}!</h2>
                    <p>Thank you for joining our car wash rewards program! We're excited to have you as part of our community.</p>
                    {bonus_text}
                    <p>Start earning points with every wash and unlock amazing rewards:</p>
                    <ul>
                        <li>🎁 Exclusive discounts on services</li>
                        <li>⭐ Free washes after multiple visits</li>
                        <li>💎 Special member-only offers</li>
                        <li>🏆 Points that never expire</li>
                    </ul>
                    {password_section}
                    <p>Visit us soon to start earning rewards!</p>
                    <p>Best regards,<br>The Car Wash Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _get_welcome_email_text(self, customer_name: str, signup_bonus: int, password_setup_token: str | None = None) -> str:
        """Generate plain text version of welcome email"""
        name = customer_name or "Valued Customer"
        bonus_text = f"\nWelcome Bonus: {signup_bonus} points!\n" if signup_bonus > 0 else ""
        
        password_text = ""
        if password_setup_token:
            frontend_url = settings.FRONTEND_URL
            setup_url = f"{frontend_url}/customer/setup-password?token={password_setup_token}"
            password_text = f"""
            
SET UP YOUR ACCOUNT PASSWORD
To access your account and track your rewards, please set up your password by visiting:
{setup_url}
"""
        
        return f"""
Hello {name}!

Thank you for joining our car wash rewards program! We're excited to have you as part of our community.
{bonus_text}
Start earning points with every wash and unlock amazing rewards:
- Exclusive discounts on services
- Free washes after multiple visits
- Special member-only offers
- Points that never expire
{password_text}
Visit us soon to start earning rewards!

Best regards,
The Car Wash Team

---
This is an automated email. Please do not reply to this message.
        """
    
    def _get_offer_email_template(
        self,
        customer_name: str,
        offer_name: str,
        offer_description: str,
        reward_type: str,
        reward_value: str
    ) -> str:
        """Generate HTML template for offer notification email"""
        name = customer_name or "Valued Customer"
        
        # Format reward description
        reward_desc = ""
        if reward_type == "POINTS":
            reward_desc = f"Earn {reward_value} points"
        elif reward_type == "DISCOUNT_PERCENT":
            reward_desc = f"Get {reward_value}% discount"
        elif reward_type == "FREE_WASH":
            reward_desc = "Get a FREE wash"
        elif reward_type == "FREE_MONTHS":
            reward_desc = f"Get {reward_value} free months"
        else:
            reward_desc = f"Special reward: {reward_value}"
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
                .offer-box {{ background-color: white; border: 2px solid #2196F3; padding: 20px; margin: 20px 0; border-radius: 5px; }}
                .button {{ display: inline-block; padding: 12px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎁 New Offer Available!</h1>
                </div>
                <div class="content">
                    <h2>Hello {name}!</h2>
                    <p>We have an exciting new offer just for you!</p>
                    <div class="offer-box">
                        <h3>{offer_name}</h3>
                        <p>{offer_description or 'Special offer available now!'}</p>
                        <p><strong>Reward: {reward_desc}</strong></p>
                    </div>
                    <p>Don't miss out on this amazing opportunity. Visit us soon to take advantage of this offer!</p>
                    <p>Best regards,<br>The Car Wash Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _get_offer_email_text(
        self,
        customer_name: str,
        offer_name: str,
        offer_description: str,
        reward_type: str,
        reward_value: str
    ) -> str:
        """Generate plain text version of offer email"""
        name = customer_name or "Valued Customer"
        
        reward_desc = ""
        if reward_type == "POINTS":
            reward_desc = f"Earn {reward_value} points"
        elif reward_type == "DISCOUNT_PERCENT":
            reward_desc = f"Get {reward_value}% discount"
        elif reward_type == "FREE_WASH":
            reward_desc = "Get a FREE wash"
        else:
            reward_desc = f"Special reward: {reward_value}"
        
        return f"""
Hello {name}!

We have an exciting new offer just for you!

OFFER: {offer_name}
{offer_description or 'Special offer available now!'}

Reward: {reward_desc}

Don't miss out on this amazing opportunity. Visit us soon to take advantage of this offer!

Best regards,
The Car Wash Team

---
This is an automated email. Please do not reply to this message.
        """
    
    def _get_redemption_email_template(
        self,
        customer_name: str,
        offer_name: str,
        reward_type: str,
        reward_value: str,
        redemption_code: Optional[str]
    ) -> str:
        """Generate HTML template for redemption confirmation email"""
        name = customer_name or "Valued Customer"
        
        # Format reward description
        reward_desc = ""
        if reward_type == "POINTS":
            reward_desc = f"{reward_value} points have been deducted"
        elif reward_type == "DISCOUNT_PERCENT":
            reward_desc = f"{reward_value}% discount will be applied"
        elif reward_type == "FREE_WASH":
            reward_desc = "Your free wash is ready!"
        else:
            reward_desc = f"Reward: {reward_value}"
        
        code_section = ""
        if redemption_code:
            code_section = f"""
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center;">
                <p><strong>Redemption Code:</strong></p>
                <p style="font-size: 24px; font-weight: bold; color: #856404;">{redemption_code}</p>
                <p style="font-size: 12px;">Please present this code when you visit us.</p>
            </div>
            """
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
                .button {{ display: inline-block; padding: 12px 30px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Redemption Confirmed!</h1>
                </div>
                <div class="content">
                    <h2>Hello {name}!</h2>
                    <p>Your redemption has been successfully processed!</p>
                    <div style="background-color: white; border: 2px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 5px;">
                        <h3>{offer_name}</h3>
                        <p><strong>{reward_desc}</strong></p>
                    </div>
                    {code_section}
                    <p>Thank you for being a valued customer. We look forward to serving you!</p>
                    <p>Best regards,<br>The Car Wash Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _get_redemption_email_text(
        self,
        customer_name: str,
        offer_name: str,
        reward_type: str,
        reward_value: str,
        redemption_code: Optional[str]
    ) -> str:
        """Generate plain text version of redemption email"""
        name = customer_name or "Valued Customer"
        
        reward_desc = ""
        if reward_type == "POINTS":
            reward_desc = f"{reward_value} points have been deducted"
        elif reward_type == "DISCOUNT_PERCENT":
            reward_desc = f"{reward_value}% discount will be applied"
        elif reward_type == "FREE_WASH":
            reward_desc = "Your free wash is ready!"
        else:
            reward_desc = f"Reward: {reward_value}"
        
        code_text = f"\nRedemption Code: {redemption_code}\nPlease present this code when you visit us.\n" if redemption_code else ""
        
        return f"""
Hello {name}!

Your redemption has been successfully processed!

OFFER: {offer_name}
{reward_desc}
{code_text}
Thank you for being a valued customer. We look forward to serving you!

Best regards,
The Car Wash Team

---
This is an automated email. Please do not reply to this message.
        """


# Global instance
email_service = EmailService()


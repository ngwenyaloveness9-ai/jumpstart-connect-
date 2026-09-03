import resend
from django.conf import settings

# Set the Resend API key
resend.api_key = settings.RESEND_API_KEY


def send_otp_email(email, first_name, otp):
    """
    Sends a branded onboarding email using the JumpStart colour palette.
    """

    try:
        html = f"""
        <div style="margin:0; padding:0; background:#f5f5f5; font-family:Arial, Helvetica, sans-serif; color:#0D0D0D;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border:1px solid #e5e5e5; border-radius:16px; overflow:hidden;">
            <div style="background:#F5C518; padding:24px 32px; text-align:center;">
              <div style="display:inline-block; background:#0D0D0D; color:#F5C518; border-radius:999px; padding:10px 18px; font-weight:700; letter-spacing:1px; font-size:12px; text-transform:uppercase;">
                Jumpstart Connect
              </div>
              <h2 style="margin:16px 0 0; font-size:28px; color:#0D0D0D;">Welcome to JumpStart!</h2>
            </div>

            <div style="padding:32px;">
              <p style="margin:0 0 16px; font-size:16px;">Hello <strong>{first_name}</strong>,</p>
              <p style="margin:0 0 18px; font-size:15px; line-height:1.7; color:#0D0D0D;">
                Your employee account has been created successfully. Use the one-time password below to complete your first sign in with your work email.
              </p>

              <div style="background:#FFF9E6; border:1px solid #F5C518; border-radius:12px; padding:20px; text-align:center; margin:24px 0;">
                <div style="font-size:12px; font-weight:700; letter-spacing:1.5px; color:#666666; text-transform:uppercase; margin-bottom:12px;">
                  Your One-Time Password
                </div>
                <div style="font-size:34px; font-weight:700; letter-spacing:8px; color:#0D0D0D;">{otp}</div>
              </div>

              <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#0D0D0D;">
                Use this password for your first sign in only. You will then be redirected to create your own password.
              </p>

              <p style="margin:0; font-size:15px; line-height:1.7; color:#0D0D0D;">
                Regards,<br>
                <strong>JumpStart Your Career</strong>
              </p>
            </div>
          </div>
        </div>
        """

        response = resend.Emails.send({
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": [email],
            "subject": "JumpStart Employee Onboarding",
            "html": html,
        })

        print("✅ Email sent successfully")
        print(response)

        return response

    except Exception as e:
        print("❌ Failed to send email")
        print(str(e))
        raise
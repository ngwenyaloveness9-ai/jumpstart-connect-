import base64
from pathlib import Path

import resend
from django.conf import settings

# Set the Resend API key when the optional Resend integration is configured.
resend.api_key = getattr(settings, "RESEND_API_KEY", "")


def get_logo_data_uri():
  logo_path = Path(settings.BASE_DIR).parent / "frontend" / "src" / "assets" / "images" / "jumpstart-logo.webp"
  logo_data = base64.b64encode(logo_path.read_bytes()).decode("ascii")
  return f"data:image/webp;base64,{logo_data}"


def send_otp_email(email, first_name, otp):
    """
    Sends a branded onboarding email using the JumpStart colour palette.
    """

    try:
        logo_data_uri = get_logo_data_uri()
        html = f"""
        <div style="margin:0; padding:32px 16px; background:#f3f4f6; font-family:Arial, Helvetica, sans-serif; color:#111827;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:20px; overflow:hidden; box-shadow:0 8px 24px rgba(17,24,39,.08);">
            <div style="background:#0D0D0D; padding:30px 32px; text-align:center;">
              <img src="{logo_data_uri}" alt="Jumpstart Connect" width="72" height="72" style="display:block; width:72px; height:72px; margin:0 auto 16px; border-radius:50%;">
              <div style="font-size:13px; font-weight:700; letter-spacing:1.8px; color:#F5C518; text-transform:uppercase;">Jumpstart Connect</div>
              <h2 style="margin:12px 0 0; font-size:27px; line-height:1.25; color:#ffffff;">Welcome to JumpStart!</h2>
              <p style="margin:10px 0 0; font-size:14px; color:#d1d5db;">Your workspace access is ready.</p>
            </div>

            <div style="padding:34px 32px 28px;">
              <p style="margin:0 0 16px; font-size:17px;">Hello <strong>{first_name}</strong>,</p>
              <p style="margin:0 0 18px; font-size:15px; line-height:1.7; color:#0D0D0D;">
                Your employee account has been created successfully. Use the one-time password below to complete your first sign in with your work email.
              </p>

              <div style="background:#fff9e6; border:1px solid #f5c518; border-radius:14px; padding:22px 20px; text-align:center; margin:26px 0;">
                <div style="font-size:11px; font-weight:700; letter-spacing:1.6px; color:#6b7280; text-transform:uppercase; margin-bottom:12px;">
                  Your One-Time Password
                </div>
                <div style="font-size:25px; font-weight:700; letter-spacing:2px; color:#0D0D0D; word-break:break-all;">{otp}</div>
              </div>

              <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#0D0D0D;">
                Use this password for your first sign in only. You will then be redirected to create your own password.
              </p>

              <p style="margin:28px 0 0; padding-top:20px; border-top:1px solid #e5e7eb; font-size:13px; line-height:1.7; color:#6b7280;">
                Regards,<br>
                <strong style="color:#111827;">JumpStart Your Career</strong>
              </p>
            </div>
            <div style="background:#f9fafb; padding:16px 32px; text-align:center; font-size:11px; color:#9ca3af;">This is an automated message. Please do not reply.</div>
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
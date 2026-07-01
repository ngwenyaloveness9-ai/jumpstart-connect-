import resend
from django.conf import settings

# Set the Resend API key
resend.api_key = settings.RESEND_API_KEY


def send_otp_email(email, first_name, otp):
    """
    Sends an onboarding OTP email using Resend.
    """

    try:
        response = resend.Emails.send({
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": [email],
            "subject": "JumpStart Employee Onboarding",
            "html": f"""
            <div style="font-family: Arial, sans-serif;">
                <h2>Welcome to JumpStart!</h2>

                <p>Hello <strong>{first_name}</strong>,</p>

                <p>You have been onboarded onto the JumpStart Employee Management System.</p>

                <p>Your One-Time Password (OTP) is:</p>

                <h1 style="letter-spacing:5px;">{otp}</h1>

                <p>This OTP will expire in <strong>10 minutes</strong>.</p>

                <p>You will use this OTP together with your work email to complete your first login and create your own password.</p>

                <br>

                <p>Regards,</p>
                <strong>JumpStart System</strong>
            </div>
            """
        })

        print("✅ Email sent successfully")
        print(response)

        return response

    except Exception as e:
        print("❌ Failed to send email")
        print(str(e))
        raise
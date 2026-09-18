import os
from celery import Celery
from email.message import EmailMessage
import asyncio
from asgiref.sync import async_to_sync
import aiosmtplib
from library.shared.config import settings

# Initialize Celery
celery_app = Celery(
    "learnflow_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

async def send_email_async(to_email: str, subject: str, content: str):
    message = EmailMessage()
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(content)

    if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            use_tls=True if settings.SMTP_PORT == 465 else False,
            start_tls=True if settings.SMTP_PORT == 587 else False,
        )
    else:
        # Mock sending if SMTP is not fully configured
        print(f"--- MOCK EMAIL ---")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Content: {content}")
        print(f"------------------")

@celery_app.task
def send_otp_email(to_email: str, otp_code: str):
    subject = "Your LearnFlow Verification Code"
    content = f"Your verification code is: {otp_code}\nThis code will expire in {settings.OTP_EXPIRE_MINUTES} minutes."
    
    # Run the async email sending inside the sync celery task
    async_to_sync(send_email_async)(to_email, subject, content)

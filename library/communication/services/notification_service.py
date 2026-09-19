from uuid import UUID
from datetime import datetime, timedelta, timezone
from library.identity.services.authentication import AuthenticationService
from library.identity.repositories.user_repository import UserRepository
from library.communication.tasks import send_otp_email
from library.shared.config import settings

class NotificationService:
    @staticmethod
    async def dispatch_verification_otp(user_id: UUID, email: str, purpose: str = 'verification'):
        # 1. Generate OTP
        otp_code = AuthenticationService.generate_otp()
        
        # 2. Hash OTP
        otp_hash = AuthenticationService.get_otp_hash(otp_code)
        
        print(f"📢 [LOCAL DEV] OTP for {email} is: {otp_code}")

        
        # 3. Store OTP in DB
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
        await UserRepository.store_otp(user_id, otp_hash, expires_at, purpose)
        
        # 4. Trigger Celery Task to send email
        send_otp_email.delay(email, otp_code)


from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from uuid import UUID
from datetime import datetime, timezone

from library.identity.domain.models import UserCreate, UserResponse, TokenResponse, OTPVerifyRequest
from library.identity.services.authentication import AuthenticationService
from library.identity.repositories.user_repository import UserRepository
from library.communication.services.notification_service import NotificationService
from library.shared.rate_limiter import RateLimiter
from library.shared.config import settings

router = APIRouter()

def get_client_ip(request: Request) -> str:
    return request.client.host if request.client else "127.0.0.1"

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, request: Request):
    ip = get_client_ip(request)
    limit_key = f"rl:register:{ip}"
    if await RateLimiter.is_rate_limited(limit_key, max_attempts=5, window_minutes=15):
        raise HTTPException(status_code=429, detail="Too many registration attempts. Try again later.")

    # Check if email exists
    existing = await UserRepository.get_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user (is_active=False by default in DB)
    hashed_password = AuthenticationService.get_password_hash(user.password)
    new_user = await UserRepository.create_user(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        phone_number=user.phone_number
    )

    # Trigger OTP
    await NotificationService.dispatch_verification_otp(new_user["id"], new_user["email"])

    return UserResponse(**new_user)

@router.post("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(req: OTPVerifyRequest):
    user = await UserRepository.get_by_email(req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user["is_active"]:
        return {"msg": "Email is already verified"}

    otp_record = await UserRepository.get_otp(user["id"], purpose="verification")
    if not otp_record:
        raise HTTPException(status_code=400, detail="No pending verification code found")

    if otp_record["expires_at"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Verification code expired")

    if not AuthenticationService.verify_otp(req.otp, otp_record["otp_hash"]):
        raise HTTPException(status_code=400, detail="Invalid verification code")

    # Activate user and delete OTP
    await UserRepository.activate_user(user["id"])
    await UserRepository.delete_otp(user["id"], purpose="verification")

    return {"msg": "Email successfully verified"}

@router.post("/token", response_model=TokenResponse)
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    ip = get_client_ip(request)
    limit_key = f"rl:login:{form_data.username}:{ip}"
    
    if await RateLimiter.is_rate_limited(limit_key, settings.LOGIN_MAX_ATTEMPTS, settings.LOGIN_BLOCK_MINUTES):
        raise HTTPException(status_code=429, detail="Too many login attempts. Try again later.")

    user = await UserRepository.get_by_email(form_data.username)
    if not user or not AuthenticationService.verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not user["is_active"]:
        raise HTTPException(status_code=400, detail="Inactive user. Please verify your email.")

    # Clear rate limit on success
    await RateLimiter.clear_limits(limit_key)

    access_token = AuthenticationService.create_access_token(data={"sub": str(user["id"])})
    refresh_token = AuthenticationService.create_refresh_token(data={"sub": str(user["id"])})

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    payload = AuthenticationService.decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token subject")

    user = await UserRepository.get_by_id(UUID(user_id))
    if not user or not user["is_active"]:
        raise HTTPException(status_code=401, detail="User inactive or not found")

    new_access_token = AuthenticationService.create_access_token(data={"sub": str(user["id"])})
    new_refresh_token = AuthenticationService.create_refresh_token(data={"sub": str(user["id"])})

    return {"access_token": new_access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}

@router.post("/send-verification-otp")
async def resend_verification_otp(email: str):
    user = await UserRepository.get_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user["is_active"]:
        return {"msg": "Email is already verified"}
        
    await NotificationService.dispatch_verification_otp(user["id"], user["email"])
    return {"msg": "Verification OTP sent"}

from api.deps import get_current_user
from library.identity.domain.models import UserResponse as UserResp

@router.get("/me")
async def get_me(current_user: UserResp = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
    }


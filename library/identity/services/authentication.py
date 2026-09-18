import secrets
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import jwt
from typing import Optional
from library.shared.config import settings

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

class AuthenticationService:
    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_token(token: str) -> dict:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except jwt.PyJWTError:
            return None

    @staticmethod
    def generate_otp() -> str:
        return "".join([str(secrets.randbelow(10)) for _ in range(6)])

    @staticmethod
    def get_otp_hash(otp: str) -> str:
        return pwd_context.hash(otp)

    @staticmethod
    def verify_otp(plain_otp: str, hashed_otp: str) -> bool:
        return pwd_context.verify(plain_otp, hashed_otp)

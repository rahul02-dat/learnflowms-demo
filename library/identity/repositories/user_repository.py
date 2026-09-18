from uuid import UUID
from typing import Optional, Dict, Any
from library.shared.database import db
from asyncpg import Record

class UserRepository:
    @staticmethod
    async def create_user(
        email: str, password_hash: str, full_name: str, phone_number: Optional[str] = None
    ) -> Record:
        query = """
            INSERT INTO users (email, password_hash, full_name, phone_number)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        """
        return await db.fetchrow(query, email, password_hash, full_name, phone_number)

    @staticmethod
    async def get_by_email(email: str) -> Optional[Record]:
        query = "SELECT * FROM users WHERE email = $1;"
        return await db.fetchrow(query, email)

    @staticmethod
    async def get_by_id(user_id: UUID) -> Optional[Record]:
        query = "SELECT * FROM users WHERE id = $1;"
        return await db.fetchrow(query, user_id)

    @staticmethod
    async def activate_user(user_id: UUID) -> Optional[Record]:
        query = "UPDATE users SET is_active = TRUE WHERE id = $1 RETURNING *;"
        return await db.fetchrow(query, user_id)

    @staticmethod
    async def store_otp(user_id: UUID, otp_hash: str, expires_at: Any, purpose: str = 'verification'):
        query = """
            INSERT INTO otp_codes (user_id, otp_hash, expires_at, purpose)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, purpose) 
            DO UPDATE SET otp_hash = EXCLUDED.otp_hash, expires_at = EXCLUDED.expires_at, created_at = CURRENT_TIMESTAMP;
        """
        await db.execute(query, user_id, otp_hash, expires_at, purpose)

    @staticmethod
    async def get_otp(user_id: UUID, purpose: str = 'verification') -> Optional[Record]:
        query = "SELECT * FROM otp_codes WHERE user_id = $1 AND purpose = $2;"
        return await db.fetchrow(query, user_id, purpose)

    @staticmethod
    async def delete_otp(user_id: UUID, purpose: str = 'verification'):
        query = "DELETE FROM otp_codes WHERE user_id = $1 AND purpose = $2;"
        await db.execute(query, user_id, purpose)

    @staticmethod
    async def update_password(user_id: UUID, new_password_hash: str):
        query = "UPDATE users SET password_hash = $1 WHERE id = $2;"
        await db.execute(query, new_password_hash, user_id)

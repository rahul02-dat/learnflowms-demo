import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@localhost:5432/learnflow')
    rows = await conn.fetch('SELECT * FROM users ORDER BY created_at DESC LIMIT 1')
    if not rows:
        print("No users found.")
        return
    user = rows[0]
    print(f"User: {user['email']} (is_active={user['is_active']})")
    otps = await conn.fetch('SELECT * FROM otp_codes WHERE user_id = $1', user['id'])
    for otp in otps:
        print(f"OTP Hash in DB: {otp['otp_hash']}")

asyncio.run(main())

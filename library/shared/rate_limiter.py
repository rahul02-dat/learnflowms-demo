import time
import redis.asyncio as redis
from typing import Optional
from library.shared.config import settings

# Initialize a global redis client
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

class RateLimiter:
    @staticmethod
    async def is_rate_limited(key: str, max_attempts: int, window_minutes: int) -> bool:
        """
        Sliding window rate limiter.
        Returns True if the request should be blocked.
        """
        current_time = int(time.time())
        window_start = current_time - (window_minutes * 60)
        
        # Remove old attempts
        await redis_client.zremrangebyscore(key, 0, window_start)
        
        # Count remaining attempts
        attempts = await redis_client.zcard(key)
        
        if attempts >= max_attempts:
            return True
            
        # Add the current attempt
        await redis_client.zadd(key, {str(current_time): current_time})
        # Set expiry on the key so it doesn't live forever
        await redis_client.expire(key, window_minutes * 60)
        
        return False

    @staticmethod
    async def clear_limits(key: str):
        """Clear rate limits (e.g., after successful login)"""
        await redis_client.delete(key)

"""
[RATE LIMITING & SOS ABUSE MITIGATION ENGINE]
Tiered in-memory sliding window rate limiter with Redis-compatible interface.
Protects sensitive and expensive endpoints while guaranteeing life-critical SOS delivery.
"""
import time
from collections import defaultdict, deque
from typing import Dict, Deque, Tuple, Optional
from fastapi import Request, HTTPException, status


class RateLimitTier:
    STRICT = (15, 60)         # 15 requests per 60 seconds (Auth & Medical Records)
    CONTROLLED = (30, 60)     # 30 requests per 60 seconds (ML inference & simulations)
    MODERATE = (120, 60)      # 120 requests per 60 seconds (General APIs)
    GENEROUS = (300, 60)      # 300 requests per 60 seconds (Public hazard alerts / disaster spikes)


class InMemoryRateLimiter:
    def __init__(self):
        # key -> deque of timestamps
        self._windows: Dict[str, Deque[float]] = defaultdict(deque)
        # SOS deduplication cache: (user_id, emergency_type) -> last_seen_time
        self._sos_dedup: Dict[Tuple[str, str], float] = {}

    def is_rate_limited(self, key: str, max_requests: int, window_seconds: int) -> bool:
        now = time.time()
        queue = self._windows[key]

        # Purge timestamps older than the window
        while queue and queue[0] <= now - window_seconds:
            queue.popleft()

        # Prevent memory leaks: delete key if queue is empty
        if not queue and key in self._windows:
            del self._windows[key]
            queue = self._windows[key]

        # Periodic cleanup if window store grows excessively
        if len(self._windows) > 25000:
            stale_keys = [k for k, q in self._windows.items() if not q or q[-1] <= now - window_seconds]
            for k in stale_keys:
                del self._windows[k]

        if len(queue) >= max_requests:
            return True

        queue.append(now)
        return False

    def check_sos_flood(self, user_id: str, emergency_type: str, min_interval_seconds: float = 3.0) -> bool:
        """
        Deduplicates rapid repeat clicks on SOS within min_interval_seconds
        WITHOUT blocking or dropping the emergency record.
        Returns True if this is a deduplicated repeat, False if it's a fresh emergency.
        """
        now = time.time()
        dedup_key = (user_id, emergency_type)
        last_time = self._sos_dedup.get(dedup_key)

        if last_time and (now - last_time) < min_interval_seconds:
            return True  # Rapid identical click detected; deduplicate

        self._sos_dedup[dedup_key] = now
        # Keep cache bounded
        if len(self._sos_dedup) > 5000:
            self._sos_dedup.clear()
        return False

    def reset(self):
        self._windows.clear()
        self._sos_dedup.clear()


# Global Singleton Rate Limiter
RATE_LIMITER = InMemoryRateLimiter()


def rate_limit(max_requests: int = 60, window_seconds: int = 60):
    """FastAPI Dependency for tiered rate limiting."""
    def dependency(request: Request):
        # Identify caller via trusted proxy header or client host
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "127.0.0.1"

        route_path = request.url.path
        key = f"{client_ip}:{route_path}"

        if RATE_LIMITER.is_rate_limited(key, max_requests, window_seconds):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please throttle your requests to ensure system availability during disaster response."
            )
    return dependency


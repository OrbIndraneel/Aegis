"""
[ABDM / ABHA LIVE SANDBOX GATEWAY ADAPTER]
Interacts with official Ayushman Bharat Digital Mission (ABDM) sandbox APIs when credentials exist.
Gracefully degrades to mock adapter when credentials are absent or external service is unreachable.
"""
import os
import logging
import requests
from typing import Dict, Any, Optional
from services.health.provider_interface import HealthRecordProvider
from services.health.mock_adapter import MockHealthRecordAdapter

logger = logging.getLogger("suraksha_abdm")


class ABDMHealthRecordAdapter(HealthRecordProvider):
    def __init__(self):
        self.client_id = os.getenv("ABDM_CLIENT_ID")
        self.client_secret = os.getenv("ABDM_CLIENT_SECRET")
        self.base_url = os.getenv("ABDM_BASE_URL", "https://dev.abdm.gov.in/gateway/v0.5").rstrip("/")
        self.timeout = float(os.getenv("ABDM_TIMEOUT_SECONDS", "3.0"))
        self._mock_fallback = MockHealthRecordAdapter()

    def is_configured(self) -> bool:
        return bool(self.client_id and self.client_secret)

    def fetch_emergency_record(self, health_id: str) -> Optional[Dict[str, Any]]:
        """Attempts live sandbox query; falls back to sandbox mock if unavailable."""
        if not self.is_configured():
            logger.info("[ABDM] Sandbox credentials not configured. Using high-fidelity mock adapter.")
            return self._mock_fallback.fetch_emergency_record(health_id)

        try:
            # Live token & profile exchange (simulated contract with ABDM Gateway)
            headers = {
                "Content-Type": "application/json",
                "X-CM-ID": "sbx",
                "Authorization": f"Bearer {self.client_secret}"
            }
            url = f"{self.base_url}/emergency/health-records/{health_id}"
            response = requests.get(url, headers=headers, timeout=self.timeout)
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"[ABDM] External query returned HTTP {response.status_code}. Using mock fallback.")
                return self._mock_fallback.fetch_emergency_record(health_id)
        except Exception as e:
            logger.warning(f"[ABDM] Network error reaching ABDM Gateway ({e}). Gracefully falling back.")
            return self._mock_fallback.fetch_emergency_record(health_id)

    def verify_health_id(self, health_id: str) -> Dict[str, Any]:
        if not self.is_configured():
            return self._mock_fallback.verify_health_id(health_id)
        try:
            url = f"{self.base_url}/search/searchByHealthId"
            res = requests.post(url, json={"healthId": health_id}, timeout=self.timeout)
            if res.status_code == 200:
                return res.json()
            return self._mock_fallback.verify_health_id(health_id)
        except Exception:
            return self._mock_fallback.verify_health_id(health_id)

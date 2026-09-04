"""
[HEALTH RECORD PROVIDER INTERFACE]
Abstract Base Interface for Emergency Health Record Retrieval (ABDM / ABHA Sandbox & Mocks).
Enforces on-demand retrieval rather than permanent local storage.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class HealthRecordProvider(ABC):
    @abstractmethod
    def fetch_emergency_record(self, health_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves citizen's emergency health record on-demand.
        Returns a dictionary containing health attributes, or None if unavailable.
        """
        pass

    @abstractmethod
    def verify_health_id(self, health_id: str) -> Dict[str, Any]:
        """Validates ABHA / Health ID against the provider registry."""
        pass

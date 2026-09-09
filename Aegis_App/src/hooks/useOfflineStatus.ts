import { useEffect } from 'react';
import { useOfflineStore } from '../store/useOfflineStore';
import { useUserStore } from '../store/useUserStore';

export function useOfflineStatus() {
  const { isOnline, lastSyncTimestamp, checkSyncStatus } = useOfflineStore();
  const { profile, toggleOfflineMode } = useUserStore();

  useEffect(() => {
    checkSyncStatus();
  }, []);

  return {
    isOnline: isOnline && !profile.offlineModeEnabled,
    lastSyncTimestamp,
    isOfflineSimulated: profile.offlineModeEnabled,
    toggleOfflineMode,
  };
}

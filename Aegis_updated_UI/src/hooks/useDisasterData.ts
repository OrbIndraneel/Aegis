import { useEffect } from 'react';
import { useDisasterStore } from '../store/useDisasterStore';
import { useUserStore } from '../store/useUserStore';

export function useDisasterData() {
  const { hazards, shelters, evacuationRoute, alerts, isLoading, selectedCity, loadDisasterData, setSelectedCity } =
    useDisasterStore();
  const { profile, updateLocation } = useUserStore();

  useEffect(() => {
    loadDisasterData(selectedCity);
    updateLocation();
  }, [selectedCity]);

  return {
    hazards,
    shelters,
    evacuationRoute,
    alerts,
    isLoading,
    selectedCity,
    userLocation: profile.currentLocation,
    setSelectedCity,
    refreshData: () => loadDisasterData(selectedCity),
  };
}

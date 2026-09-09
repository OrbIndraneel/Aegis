import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme';
import { useDisasterStore } from '../src/store/useDisasterStore';
import { useOfflineStore } from '../src/store/useOfflineStore';

import { loadSavedLanguage } from '../src/i18n';

export default function RootLayout() {
  const { loadDisasterData } = useDisasterStore();
  const { checkSyncStatus } = useOfflineStore();

  useEffect(() => {
    // Initial disaster data and saved language load
    loadDisasterData('Vadodara');
    checkSyncStatus();
    loadSavedLanguage();
  }, []);

  return (
    <SafeAreaProvider style={{ backgroundColor: colors.background.primary }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="civilian" options={{ headerShown: false }} />
        <Stack.Screen name="authority" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal/sos"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="modal/route-detail"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

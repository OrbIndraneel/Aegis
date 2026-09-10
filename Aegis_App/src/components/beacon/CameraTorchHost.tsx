import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeTorchController } from '../../services/beacon/nativeTorchController';

/**
 * CameraTorchHost Component
 * 
 * Embeds a minimal 1x1 background CameraView to bind the physical device
 * camera LED flash to the NativeTorchController for Morse SOS strobe pulses.
 */
export const CameraTorchHost: React.FC = () => {
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    // Request permission if not determined
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission().catch(() => {});
    }

    // Subscribe to pulse updates from NativeTorchController
    const unsubscribe = NativeTorchController.subscribe((state) => {
      setIsTorchOn(state);
    });

    return () => {
      unsubscribe();
    };
  }, [permission]);

  // If permission is not granted or platform is web/unsupported, skip mounting camera hardware
  if (!permission?.granted || Platform.OS === 'web') {
    return null;
  }

  return (
    <View style={styles.hiddenContainer} pointerEvents="none">
      <CameraView
        style={styles.hiddenCamera}
        facing="back"
        enableTorch={isTorchOn}
        animateShutter={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hiddenContainer: {
    width: 1,
    height: 1,
    position: 'absolute',
    bottom: -10,
    right: -10,
    opacity: 0,
    overflow: 'hidden',
  },
  hiddenCamera: {
    width: 1,
    height: 1,
  },
});

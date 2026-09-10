import React, { useState } from 'react';
import { Platform, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { HazardMap as WebMap } from './HazardMap.web';
import { HazardMap as NativeMap } from './HazardMap.native';

export const HazardMap: React.FC<any> = (props) => {
  const [useTacticalRadar, setUseTacticalRadar] = useState(false);

  if (Platform.OS === 'web' || useTacticalRadar) {
    return (
      <View style={styles.container}>
        <WebMap {...props} />
        {Platform.OS !== 'web' && (
          <TouchableOpacity
            style={styles.floatingToggle}
            onPress={() => setUseTacticalRadar(false)}
            activeOpacity={0.85}
          >
            <Text style={styles.toggleText}>🗺️ STREET TILES</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NativeMap {...props} />
      <TouchableOpacity
        style={styles.floatingToggle}
        onPress={() => setUseTacticalRadar(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.toggleText}>📡 TACTICAL RADAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  floatingToggle: {
    position: 'absolute',
    top: 90,
    right: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  toggleText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});


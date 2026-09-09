import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Target, Layers, Locate } from 'lucide-react-native';

interface Props {
  onMyLocation?: () => void;
  onToggleLayers?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRecenter?: () => void;
  onToggleEmergencyMode?: () => void;
  isEmergencyActive?: boolean;
}

export const MapFloatingControls: React.FC<Props> = ({
  onMyLocation,
  onToggleLayers,
}) => {
  return (
    <View style={styles.container}>
      {/* Target / Location Button */}
      <TouchableOpacity style={styles.circularBtn} onPress={onMyLocation} activeOpacity={0.8}>
        <Locate size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Layers Button */}
      <TouchableOpacity style={styles.circularBtn} onPress={onToggleLayers} activeOpacity={0.8}>
        <Layers size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    left: 16,
    gap: 12,
    zIndex: 20,
  },
  circularBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 38, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});


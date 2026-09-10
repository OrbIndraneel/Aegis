import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Layers, Locate, User, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';

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
  const router = useRouter();
  const { logout } = useUserStore();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const handleProfile = () => {
    router.push('/civilian/profile' as any);
  };

  return (
    <View style={styles.container}>
      {/* Target / Location Button */}
      <TouchableOpacity
        style={styles.circularBtn}
        onPress={onMyLocation}
        activeOpacity={0.8}
        accessibilityLabel="My Location"
      >
        <Locate size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Layers Button */}
      <TouchableOpacity
        style={styles.circularBtn}
        onPress={onToggleLayers}
        activeOpacity={0.8}
        accessibilityLabel="Toggle Map Layers"
      >
        <Layers size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* User Profile Button */}
      <TouchableOpacity
        style={styles.circularBtn}
        onPress={handleProfile}
        activeOpacity={0.8}
        accessibilityLabel="Emergency Profile"
      >
        <User size={18} color="#38BDF8" />
      </TouchableOpacity>

      {/* Quick Log Out / Exit Portal Button */}
      <TouchableOpacity
        style={[styles.circularBtn, styles.logoutBtn]}
        onPress={handleLogout}
        activeOpacity={0.8}
        accessibilityLabel="Log Out / Exit Portal"
      >
        <LogOut size={16} color="#F87171" />
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
  logoutBtn: {
    borderColor: 'rgba(239, 68, 68, 0.45)',
    backgroundColor: 'rgba(40, 15, 20, 0.92)',
  },
});


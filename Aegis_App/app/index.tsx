import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  UserCheck,
  Radio,
  MapPin,
  ArrowRight,
  Map,
  Navigation,
  WifiOff,
  AlertCircle,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useUserStore } from '../src/store/useUserStore';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, setRole } = useUserStore();

  const civilianScale = useRef(new Animated.Value(1));
  const authorityScale = useRef(new Animated.Value(1));

  const handlePressIn = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 0.985,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 2,
    }).start();
  };

  const handleSelectRole = (role: 'CIVILIAN' | 'AUTHORITY') => {
    setRole(role);
    if (role === 'CIVILIAN') {
      router.replace('/civilian' as any);
    } else {
      router.replace('/authority' as any);
    }
  };

  const selectedCity = profile?.selectedCity || 'Vadodara';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* BRANDING SECTION */}
        <View style={styles.brandingContainer}>
          <Text style={styles.brandTitle}>AEGIS AI</Text>
          <Text style={styles.brandSubtitle}>
            AI-Powered Disaster Management{'\n'}& Safe Evacuation Platform
          </Text>
        </View>

        {/* MAIN PORTAL SELECTION */}
        <View style={styles.portalContainer}>
          <Text style={styles.sectionLabel}>SELECT ACCESS PORTAL</Text>

          {/* PRIMARY ACTION CARD: CIVILIAN / EVACUEE */}
          <Animated.View style={{ transform: [{ scale: civilianScale.current }] }}>
            <TouchableOpacity
              style={styles.civilianCard}
              onPress={() => handleSelectRole('CIVILIAN')}
              onPressIn={() => handlePressIn(civilianScale.current)}
              onPressOut={() => handlePressOut(civilianScale.current)}
              activeOpacity={0.9}
            >
              <View style={styles.civilianTopRow}>
                <View style={styles.civilianIconBox}>
                  <UserCheck size={22} color="#EA580C" strokeWidth={2} />
                </View>

                <View style={styles.civilianTextCol}>
                  <Text style={styles.civilianCardTitle}>CIVILIAN / EVACUEE</Text>
                  <Text style={styles.civilianCardDesc}>
                    Safe evacuation routes, live hazard information, shelter availability and emergency SOS.
                  </Text>
                </View>

                <View style={styles.civilianArrowCircle}>
                  <ArrowRight size={16} color="#EA580C" strokeWidth={2.2} />
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.featureRow}>
                <View style={styles.featureTag}>
                  <Map size={12} color="#52525B" strokeWidth={2} />
                  <Text style={styles.featureTagText}>Live Map</Text>
                </View>
                <View style={styles.featureTag}>
                  <Navigation size={12} color="#52525B" strokeWidth={2} />
                  <Text style={styles.featureTagText}>Safest Route</Text>
                </View>
                <View style={styles.featureTag}>
                  <WifiOff size={12} color="#52525B" strokeWidth={2} />
                  <Text style={styles.featureTagText}>Offline Mode</Text>
                </View>
                <View style={[styles.featureTag, styles.featureTagSos]}>
                  <AlertCircle size={12} color="#DC2626" strokeWidth={2} />
                  <Text style={styles.featureTagTextSos}>EMERGENCY</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* SECONDARY ACTION: AUTHORITY ACCESS */}
          <Animated.View style={{ transform: [{ scale: authorityScale.current }] }}>
            <TouchableOpacity
              style={styles.authorityButton}
              onPress={() => handleSelectRole('AUTHORITY')}
              onPressIn={() => handlePressIn(authorityScale.current)}
              onPressOut={() => handlePressOut(authorityScale.current)}
              activeOpacity={0.8}
            >
              <Radio size={14} color="#71717A" strokeWidth={2} />
              <Text style={styles.authorityButtonText}>Authority / Control Room Access</Text>
              <ArrowRight size={13} color="#A1A1AA" strokeWidth={2} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* DEMO REGION FOOTER */}
        <View style={styles.demoRegionFooter}>
          <MapPin size={13} color="#EA580C" strokeWidth={2} />
          <Text style={styles.demoRegionText}>
            Active Demo Region:{' '}
            <Text style={styles.demoRegionBold}>{selectedCity}, Gujarat</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },

  /* BRANDING SECTION */
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandTitle: {
    color: '#18181B',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 1.8,
    textAlign: 'center',
  },
  brandSubtitle: {
    color: '#71717A',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },

  /* PORTAL AREA */
  portalContainer: {
    marginVertical: 12,
  },
  sectionLabel: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 18,
  },

  /* PRIMARY CIVILIAN CARD */
  civilianCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  civilianTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  civilianIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  civilianTextCol: {
    flex: 1,
  },
  civilianCardTitle: {
    color: '#18181B',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  civilianCardDesc: {
    color: '#71717A',
    fontSize: 13,
    lineHeight: 19,
  },
  civilianArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F4F4F5',
    marginVertical: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  featureTagText: {
    color: '#3F3F46',
    fontSize: 11.5,
    fontWeight: '600',
  },
  featureTagSos: {
    backgroundColor: 'rgba(220, 38, 38, 0.06)',
  },
  featureTagTextSos: {
    color: '#DC2626',
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* SECONDARY AUTHORITY BUTTON */
  authorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    gap: 8,
  },
  authorityButtonText: {
    color: '#52525B',
    fontSize: 13,
    fontWeight: '600',
  },

  /* DEMO REGION FOOTER */
  demoRegionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: 24,
  },
  demoRegionText: {
    color: '#71717A',
    fontSize: 12.5,
  },
  demoRegionBold: {
    color: '#18181B',
    fontWeight: '700',
  },
});

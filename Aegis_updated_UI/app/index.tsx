import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  AccessibilityInfo,
  Platform,
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
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Staggered Entrance Animated Values (instant on web for fast loading)
  const isWeb = Platform.OS === 'web';
  const brandOpacity = useRef(new Animated.Value(isWeb ? 1 : 0)).current;
  const brandTranslateY = useRef(new Animated.Value(isWeb ? 0 : 14)).current;

  const sectionOpacity = useRef(new Animated.Value(isWeb ? 1 : 0)).current;
  const sectionTranslateY = useRef(new Animated.Value(isWeb ? 0 : 10)).current;

  const civilianCardOpacity = useRef(new Animated.Value(isWeb ? 1 : 0)).current;
  const civilianCardTranslateY = useRef(new Animated.Value(isWeb ? 0 : 16)).current;

  const authorityOpacity = useRef(new Animated.Value(isWeb ? 1 : 0)).current;
  const authorityTranslateY = useRef(new Animated.Value(isWeb ? 0 : 12)).current;

  const footerOpacity = useRef(new Animated.Value(isWeb ? 1 : 0)).current;

  // Press & Micro-interaction Animated Values
  const civilianScale = useRef(new Animated.Value(1)).current;
  const civilianElevationY = useRef(new Animated.Value(0)).current;
  const civilianArrowX = useRef(new Animated.Value(0)).current;

  const authorityScale = useRef(new Animated.Value(1)).current;
  const authorityArrowX = useRef(new Animated.Value(0)).current;

  // Subtle Ambient Background Breathing Aura
  const ambientPulse = useRef(new Animated.Value(0.4)).current;
  const sosPulse = useRef(new Animated.Value(0.85)).current;

  // Check Reduced Motion Preference
  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setIsReducedMotion(enabled);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Run Staggered Entrance Sequence
  useEffect(() => {
    if (isReducedMotion || isWeb) {
      // Bypasses entrance animations for accessibility & instantaneous web rendering
      brandOpacity.setValue(1);
      brandTranslateY.setValue(0);
      sectionOpacity.setValue(1);
      sectionTranslateY.setValue(0);
      civilianCardOpacity.setValue(1);
      civilianCardTranslateY.setValue(0);
      authorityOpacity.setValue(1);
      authorityTranslateY.setValue(0);
      footerOpacity.setValue(1);
      return;
    }

    // Organic, non-simultaneous staggered entrance
    Animated.stagger(90, [
      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(brandTranslateY, {
          toValue: 0,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(sectionOpacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sectionTranslateY, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(civilianCardOpacity, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(civilianCardTranslateY, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(authorityOpacity, {
          toValue: 1,
          duration: 440,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(authorityTranslateY, {
          toValue: 0,
          duration: 440,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Very subtle, calm ambient background loop (slow 6s pulse)
    const ambientAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(ambientPulse, {
          toValue: 0.75,
          duration: 3500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ambientPulse, {
          toValue: 0.4,
          duration: 3500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle emergency accent pulse (slow 2.8s breathing)
    const sosAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sosPulse, {
          toValue: 1.0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sosPulse, {
          toValue: 0.85,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    ambientAnimation.start();
    sosAnimation.start();

    return () => {
      ambientAnimation.stop();
      sosAnimation.stop();
    };
  }, [isReducedMotion]);

  // Press Interactions for Civilian Card
  const handleCivilianPressIn = () => {
    Animated.parallel([
      Animated.spring(civilianScale, {
        toValue: 0.984,
        useNativeDriver: true,
        speed: 28,
        bounciness: 0,
      }),
      Animated.spring(civilianElevationY, {
        toValue: 2,
        useNativeDriver: true,
        speed: 28,
        bounciness: 0,
      }),
      Animated.timing(civilianArrowX, {
        toValue: 4,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCivilianPressOut = () => {
    Animated.parallel([
      Animated.spring(civilianScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 22,
        bounciness: 2,
      }),
      Animated.spring(civilianElevationY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 22,
        bounciness: 2,
      }),
      Animated.timing(civilianArrowX, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Press Interactions for Authority Access Button
  const handleAuthorityPressIn = () => {
    Animated.parallel([
      Animated.spring(authorityScale, {
        toValue: 0.985,
        useNativeDriver: true,
        speed: 28,
        bounciness: 0,
      }),
      Animated.timing(authorityArrowX, {
        toValue: 3,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAuthorityPressOut = () => {
    Animated.parallel([
      Animated.spring(authorityScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 22,
        bounciness: 2,
      }),
      Animated.timing(authorityArrowX, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSelectRole = (role: 'CIVILIAN' | 'AUTHORITY') => {
    setRole(role);
    if (role === 'CIVILIAN') {
      router.replace('/civilian' as any);
    } else {
      router.replace('/authority' as any);
    }
  };

  const selectedCity = profile?.selectedCity || 'East Sikkim';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Subtle Ambient Background Aura */}
      <Animated.View
        style={[
          styles.ambientBackgroundAura,
          { opacity: isReducedMotion ? 0.4 : ambientPulse },
        ]}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* BRANDING SECTION */}
        <Animated.View
          style={[
            styles.brandingContainer,
            {
              opacity: brandOpacity,
              transform: [{ translateY: brandTranslateY }],
            },
          ]}
        >
          <Text style={styles.brandTitle}>AEGIS</Text>
          <Text style={styles.brandSubtitle}>
            AI-Based Landslide Early Warning{'\n'}& Risk Monitoring System (NER)
          </Text>
        </Animated.View>

        {/* MAIN PORTAL SELECTION */}
        <View style={styles.portalContainer}>
          <Animated.Text
            style={[
              styles.sectionLabel,
              {
                opacity: sectionOpacity,
                transform: [{ translateY: sectionTranslateY }],
              },
            ]}
          >
            SELECT ACCESS PORTAL
          </Animated.Text>

          {/* PRIMARY ACTION CARD: CIVILIAN / EVACUEE */}
          <Animated.View
            style={{
              opacity: civilianCardOpacity,
              transform: [
                { translateY: civilianCardTranslateY },
                { translateY: civilianElevationY },
                { scale: civilianScale },
              ],
            }}
          >
            <TouchableOpacity
              style={styles.civilianCard}
              onPress={() => handleSelectRole('CIVILIAN')}
              onPressIn={handleCivilianPressIn}
              onPressOut={handleCivilianPressOut}
              activeOpacity={0.92}
            >
              <View style={styles.civilianTopRow}>
                <View style={styles.civilianIconBox}>
                  <UserCheck size={22} color="#00B8D4" strokeWidth={2} />
                </View>

                <View style={styles.civilianTextCol}>
                  <Text style={styles.civilianCardTitle}>CIVILIAN / EVACUEE</Text>
                  <Text style={styles.civilianCardDesc}>
                    Landslide early warning, slope risk explainability, safest mountain routes, field reporting and emergency SOS.
                  </Text>
                </View>

                <Animated.View
                  style={[
                    styles.civilianArrowCircle,
                    { transform: [{ translateX: civilianArrowX }] },
                  ]}
                >
                  <ArrowRight size={16} color="#00B8D4" strokeWidth={2.2} />
                </Animated.View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.featureRow}>
                <View style={styles.featureTag}>
                  <Map size={12} color="#23415F" strokeWidth={2} />
                  <Text style={styles.featureTagText}>Live GIS Map</Text>
                </View>
                <View style={styles.featureTag}>
                  <Navigation size={12} color="#23415F" strokeWidth={2} />
                  <Text style={styles.featureTagText}>Safest Route</Text>
                </View>
                <View style={styles.featureTag}>
                  <WifiOff size={12} color="#23415F" strokeWidth={2} />
                  <Text style={styles.featureTagText}>Offline Mode</Text>
                </View>

                {/* Emergency Tag with subtle calm accent animation */}
                <Animated.View
                  style={[
                    styles.featureTag,
                    styles.featureTagSos,
                    { opacity: isReducedMotion ? 1 : sosPulse },
                  ]}
                >
                  <AlertCircle size={12} color="#EF4444" strokeWidth={2} />
                  <Text style={styles.featureTagTextSos}>1-TAP SOS</Text>
                </Animated.View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* SECONDARY ACTION: AUTHORITY ACCESS */}
          <Animated.View
            style={{
              opacity: authorityOpacity,
              transform: [
                { translateY: authorityTranslateY },
                { scale: authorityScale },
              ],
            }}
          >
            <TouchableOpacity
              style={styles.authorityButton}
              onPress={() => handleSelectRole('AUTHORITY')}
              onPressIn={handleAuthorityPressIn}
              onPressOut={handleAuthorityPressOut}
              activeOpacity={0.85}
            >
              <Radio size={14} color="#23415F" strokeWidth={2} />
              <Text style={styles.authorityButtonText}>MDoNER & SDMA Control Room Command</Text>
              <Animated.View style={{ transform: [{ translateX: authorityArrowX }] }}>
                <ArrowRight size={13} color="#23415F" strokeWidth={2} />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* OPERATIONAL REGION FOOTER */}
        <Animated.View
          style={[
            styles.operationalRegionFooter,
            {
              opacity: footerOpacity,
            },
          ]}
        >
          <MapPin size={13} color="#00B8D4" strokeWidth={2} />
          <Text style={styles.operationalRegionText}>
            NER Regional Framework • Primary Corridor:{' '}
            <Text style={styles.operationalRegionBold}>East Sikkim (Gangtok & NH-10 Lifeline)</Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    position: 'relative',
  },
  ambientBackgroundAura: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0, 184, 212, 0.05)',
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
    color: '#0B1F33',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 1.8,
    textAlign: 'center',
  },
  brandSubtitle: {
    color: '#4B5E76',
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
    color: '#64748B',
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
    borderColor: '#E2E8F0',
    shadowColor: '#0B1F33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
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
    backgroundColor: 'rgba(0, 184, 212, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  civilianTextCol: {
    flex: 1,
  },
  civilianCardTitle: {
    color: '#172033',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  civilianCardDesc: {
    color: '#4B5E76',
    fontSize: 13,
    lineHeight: 19,
  },
  civilianArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 184, 212, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#EDF2F7',
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
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  featureTagText: {
    color: '#23415F',
    fontSize: 11.5,
    fontWeight: '600',
  },
  featureTagSos: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  featureTagTextSos: {
    color: '#EF4444',
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
    borderColor: '#E2E8F0',
    shadowColor: '#0B1F33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    gap: 8,
  },
  authorityButtonText: {
    color: '#23415F',
    fontSize: 13,
    fontWeight: '600',
  },

  /* OPERATIONAL REGION FOOTER */
  operationalRegionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: 24,
  },
  operationalRegionText: {
    color: '#64748B',
    fontSize: 12.5,
  },
  operationalRegionBold: {
    color: '#0B1F33',
    fontWeight: '700',
  },
});

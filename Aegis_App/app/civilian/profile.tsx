import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Header } from '../../src/components/common/Header';
import { PhoneCall, HeartPulse, WifiOff, Globe, LogOut, Zap, ShieldCheck } from 'lucide-react-native';
import { useUserStore } from '../../src/store/useUserStore';
import { useTranslation, LanguageCode } from '../../src/i18n';
import { EmergencyConsentCard } from '../../src/components/civilian/EmergencyConsentCard';
import { OfflineMedicalCardModal } from '../../src/components/civilian/OfflineMedicalCardModal';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, toggleOfflineMode, isLowBatteryModeEnabled, toggleLowBatteryMode } = useUserStore();
  const { t, language, changeLanguage } = useTranslation();
  const [showMedicalCard, setShowMedicalCard] = useState(false);

  const handleLogout = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('emergencyProfile')} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Offline Emergency Mode Switcher Card */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <View style={[styles.headerIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <WifiOff size={16} color="#DC2626" />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.cardTitle}>{t('offlineEmergencyMode')}</Text>
                <Text style={styles.cardSubtitle}>{t('offlineModeDesc')}</Text>
              </View>
            </View>
            <Switch
              value={profile.offlineModeEnabled}
              onValueChange={toggleOfflineMode}
              trackColor={{ false: '#E4E4E7', true: '#DC2626' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Crisis Low-Battery Mode Card */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <View style={[styles.headerIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                <Zap size={16} color="#16A34A" />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.cardTitle}>Crisis Low-Battery Saver</Text>
                <Text style={styles.cardSubtitle}>
                  Throttles GPS tracking interval to 20s to conserve up to 70% device battery during power blackouts.
                </Text>
              </View>
            </View>
            <Switch
              value={isLowBatteryModeEnabled}
              onValueChange={toggleLowBatteryMode}
              trackColor={{ false: '#E4E4E7', true: '#16A34A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Medical Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.headerIconBox, { backgroundColor: 'rgba(220, 38, 38, 0.1)' }]}>
              <HeartPulse size={16} color="#DC2626" />
            </View>
            <Text style={styles.cardTitle}>{t('civilianMedicalInfo')}</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>{t('bloodGroup')}</Text>
              <Text style={styles.infoValue}>{profile.bloodGroup}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>{t('medicalConditions')}</Text>
              <Text style={styles.infoValue}>{profile.medicalConditions}</Text>
            </View>
          </View>

          {/* 1-Tap Offline Health Card Button */}
          <TouchableOpacity
            style={styles.healthCardButton}
            onPress={() => setShowMedicalCard(true)}
            accessibilityRole="button"
            accessibilityLabel="Open First Responder Emergency Health Card"
          >
            <ShieldCheck size={16} color="#FFFFFF" />
            <Text style={styles.healthCardButtonText}>VIEW FIRST-RESPONDER HEALTH CARD (OFFLINE)</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Medical Consent & ABDM Access Transparency */}
        <EmergencyConsentCard civilianId={profile.id} />

        {/* Emergency Contacts List Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.headerIconBox, { backgroundColor: 'rgba(234, 88, 12, 0.1)' }]}>
              <PhoneCall size={16} color="#EA580C" />
            </View>
            <Text style={styles.cardTitle}>{t('emergencyHotlinesContacts')}</Text>
          </View>

          <View style={styles.contactsContainer}>
            {profile.emergencyContacts.map((contact, index) => (
              <View
                key={contact.id}
                style={[
                  styles.contactRow,
                  index === profile.emergencyContacts.length - 1 && styles.noBorder,
                ]}
              >
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName} numberOfLines={1}>
                    {contact.name} {contact.isPrimary ? `(${t('primarySos')})` : ''}
                  </Text>
                  <Text style={styles.contactRel}>{contact.relation}</Text>
                </View>
                <TouchableOpacity style={styles.callChip} activeOpacity={0.8}>
                  <PhoneCall size={12} color="#FFFFFF" />
                  <Text style={styles.callNumber}>{contact.phoneNumber}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Language Selection Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.headerIconBox, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
              <Globe size={16} color="#2563EB" />
            </View>
            <Text style={styles.cardTitle}>{t('preferredLanguage')}</Text>
          </View>

          <View style={styles.langRow}>
            {[
              { code: 'EN', label: 'English' },
              { code: 'HI', label: 'हिंदी (Hindi)' },
              { code: 'GU', label: 'ગુજરાતી (Gujarati)' },
            ].map((lang) => {
              const isActive = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langChip,
                    isActive ? styles.langChipActive : styles.langChipInactive,
                  ]}
                  onPress={() => changeLanguage(lang.code as LanguageCode)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${lang.label}${isActive ? ', selected' : ''}`}
                >
                  <Text style={[styles.langText, isActive ? styles.langTextActive : styles.langTextInactive]} numberOfLines={1}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Log Out / Switch Portal Card */}
        <View style={[styles.card, styles.logoutCard]}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={16} color="#DC2626" />
            <Text style={styles.logoutText}>Log Out / Switch Access Portal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 100% Offline Emergency Health Card Modal */}
      <OfflineMedicalCardModal
        visible={showMedicalCard}
        onClose={() => setShowMedicalCard(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  headerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#18181B',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    color: '#71717A',
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  flex1: {
    flex: 1,
  },
  infoGrid: {
    gap: 10,
  },
  infoBox: {
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  infoLabel: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  infoValue: {
    color: '#18181B',
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 3,
  },
  healthCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  healthCardButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  contactsContainer: {
    gap: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  contactInfo: {
    flex: 1,
    paddingRight: 10,
  },
  contactName: {
    color: '#18181B',
    fontSize: 13.5,
    fontWeight: '700',
  },
  contactRel: {
    color: '#71717A',
    fontSize: 11.5,
    marginTop: 2,
  },
  callChip: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  callNumber: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  langChipActive: {
    backgroundColor: '#18181B',
    borderColor: '#18181B',
  },
  langChipInactive: {
    backgroundColor: '#F4F4F5',
    borderColor: '#E4E4E7',
  },
  langText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  langTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  langTextInactive: {
    color: '#52525B',
  },
  logoutCard: {
    borderColor: 'rgba(220, 38, 38, 0.2)',
    backgroundColor: 'rgba(220, 38, 38, 0.04)',
    padding: 0,
    overflow: 'hidden',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 13.5,
    fontWeight: '700',
  },
});

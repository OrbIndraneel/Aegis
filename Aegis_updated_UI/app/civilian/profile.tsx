import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Header } from '../../src/components/common/Header';
import { PhoneCall, HeartPulse, WifiOff, Globe, LogOut } from 'lucide-react-native';
import { useUserStore } from '../../src/store/useUserStore';
import { useTranslation, LanguageCode } from '../../src/i18n';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, toggleOfflineMode, logout } = useUserStore();
  const { t, language, changeLanguage } = useTranslation();

  const handleLogout = () => {
    logout();
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
        </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#0B1F33',
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
    color: '#172033',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    color: '#4B5E76',
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
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  infoValue: {
    color: '#172033',
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 3,
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
    borderBottomColor: '#EDF2F7',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  contactInfo: {
    flex: 1,
    paddingRight: 10,
  },
  contactName: {
    color: '#172033',
    fontSize: 13.5,
    fontWeight: '700',
  },
  contactRel: {
    color: '#64748B',
    fontSize: 11.5,
    marginTop: 2,
  },
  callChip: {
    backgroundColor: '#00B8D4',
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
    backgroundColor: '#0B1F33',
    borderColor: '#0B1F33',
  },
  langChipInactive: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
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

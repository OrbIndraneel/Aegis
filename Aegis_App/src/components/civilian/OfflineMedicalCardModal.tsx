import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { X, HeartPulse, PhoneCall, ShieldAlert, AlertTriangle, Activity, UserCheck } from 'lucide-react-native';
import { useUserStore } from '../../store/useUserStore';

interface OfflineMedicalCardModalProps {
  visible: boolean;
  onClose: () => void;
}

export const OfflineMedicalCardModal: React.FC<OfflineMedicalCardModalProps> = ({ visible, onClose }) => {
  const { profile, offlineMedicalCard } = useUserStore();

  const handleCallEmergencyContact = () => {
    if (offlineMedicalCard.emergencyContactPhone) {
      Linking.openURL(`tel:${offlineMedicalCard.emergencyContactPhone}`).catch(() => {});
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.safeContainer}>
        {/* Modal Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarTitleRow}>
            <HeartPulse size={24} color="#DC2626" />
            <Text style={styles.topBarTitle}>EMERGENCY HEALTH CARD</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Close Health Card">
            <X size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Offline Badge */}
        <View style={styles.offlineNoticeBar}>
          <View style={styles.dot} />
          <Text style={styles.offlineNoticeText}>100% OFFLINE ENCRYPTED CACHE • FIRST RESPONDER ACCESS</Text>
        </View>

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Identity & Blood Group Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <Text style={styles.patientName}>{profile.fullName || 'Demo Citizen'}</Text>
              <Text style={styles.patientPhone}>{profile.phoneNumber || '+91 00000 00000'}</Text>
              <Text style={styles.abdmId}>ABDM: {offlineMedicalCard.abdmHealthId}</Text>
              {offlineMedicalCard.organDonor && (
                <View style={styles.donorBadge}>
                  <UserCheck size={14} color="#16A34A" />
                  <Text style={styles.donorText}>Organ Donor Registered</Text>
                </View>
              )}
            </View>

            <View style={styles.bloodBadgeContainer}>
              <Text style={styles.bloodBadgeSub}>BLOOD</Text>
              <Text style={styles.bloodBadge}>{offlineMedicalCard.bloodGroup || 'O+'}</Text>
            </View>
          </View>

          {/* Primary Emergency Contact with 1-Tap Call */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <PhoneCall size={18} color="#EA580C" />
              <Text style={styles.sectionTitle}>PRIMARY EMERGENCY CONTACT</Text>
            </View>
            <View style={styles.contactDetailsRow}>
              <View style={styles.flex1}>
                <Text style={styles.contactName}>{offlineMedicalCard.emergencyContactName}</Text>
                <Text style={styles.contactRelation}>{offlineMedicalCard.emergencyContactRelation}</Text>
                <Text style={styles.contactPhone}>{offlineMedicalCard.emergencyContactPhone}</Text>
              </View>
              <TouchableOpacity
                onPress={handleCallEmergencyContact}
                style={styles.callActionButton}
                accessibilityRole="button"
                accessibilityLabel="Call Primary Emergency Contact"
              >
                <PhoneCall size={18} color="#FFFFFF" />
                <Text style={styles.callActionText}>Call Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Known Allergies & Drug Reactions */}
          <View style={[styles.sectionCard, styles.allergyCard]}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={18} color="#DC2626" />
              <Text style={[styles.sectionTitle, { color: '#DC2626' }]}>KNOWN ALLERGIES & ADVERSE REACTIONS</Text>
            </View>
            <Text style={styles.allergyText}>{offlineMedicalCard.allergies || 'No known drug allergies reported'}</Text>
          </View>

          {/* Chronic Medical Conditions */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <ShieldAlert size={18} color="#2563EB" />
              <Text style={styles.sectionTitle}>CHRONIC CONDITIONS & IMPLANTS</Text>
            </View>
            <Text style={styles.bodyText}>{offlineMedicalCard.chronicConditions || 'None specified'}</Text>
          </View>

          {/* Critical Current Medications */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Activity size={18} color="#9333EA" />
              <Text style={styles.sectionTitle}>CRITICAL CURRENT MEDICATIONS</Text>
            </View>
            <Text style={styles.bodyText}>{offlineMedicalCard.criticalMedications || 'None specified'}</Text>
          </View>

          {/* Legal / Triage Notice */}
          <View style={styles.footerNotice}>
            <Text style={styles.footerNoticeText}>
              Authorized under National Disaster Management Act (NDMA) & Ayushman Bharat Digital Mission (ABDM) 
              for emergency resuscitation & life-safety triage without internet connectivity.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#090D16',
    paddingTop: 48,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topBarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBarTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineNoticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(22, 163, 74, 0.25)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },
  offlineNoticeText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  heroCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  heroLeft: {
    flex: 1,
  },
  patientName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  patientPhone: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  abdmId: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  donorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  donorText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '700',
  },
  bloodBadgeContainer: {
    width: 84,
    height: 84,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: '#DC2626',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  bloodBadgeSub: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bloodBadge: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  sectionCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  allergyCard: {
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderColor: 'rgba(220, 38, 38, 0.35)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  contactDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  contactRelation: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  contactPhone: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  callActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  callActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  allergyText: {
    color: '#F87171',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
  },
  bodyText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  footerNotice: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  footerNoticeText: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
  flex1: {
    flex: 1,
  },
});

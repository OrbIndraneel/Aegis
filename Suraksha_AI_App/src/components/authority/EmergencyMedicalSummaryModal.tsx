import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { HeartPulse, AlertTriangle, Phone, ShieldCheck, X } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../../theme';

interface EmergencyMedicalSummary {
  civilian_id: string;
  blood_group?: string;
  critical_allergies?: string[];
  critical_conditions?: string[];
  current_medications?: string[];
  emergency_contacts?: Array<{ name: string; relation: string; phone: string }>;
  donor_status?: string;
  disclaimer?: string;
  last_retrieved?: string;
  consent_status?: string;
}

interface Props {
  visible: boolean;
  summary: EmergencyMedicalSummary | null;
  onClose: () => void;
  civilianName?: string;
}

export const EmergencyMedicalSummaryModal: React.FC<Props> = ({
  visible,
  summary,
  onClose,
  civilianName = 'Evacuee / Patient',
}) => {
  if (!summary) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* HEADER WITH STRICT EMERGENCY DISCLAIMER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <HeartPulse size={20} color="#DC2626" />
              </View>
              <View style={styles.headerTitles}>
                <Text style={styles.title}>EMERGENCY MEDICAL SUMMARY</Text>
                <Text style={styles.subtitle}>{civilianName} • ID: {summary.civilian_id}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#71717A" />
            </TouchableOpacity>
          </View>

          {/* EMERGENCY USE ONLY NOTICE */}
          <View style={styles.emergencyBanner}>
            <AlertTriangle size={15} color="#DC2626" />
            <Text style={styles.emergencyBannerText}>
              EMERGENCY USE ONLY — ALL ACCESS LOGGED & AUDITED
            </Text>
          </View>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* BLOOD GROUP & STATUS ROW */}
            <View style={styles.gridRow}>
              <View style={[styles.cardBox, styles.flex1]}>
                <Text style={styles.cardLabel}>BLOOD GROUP</Text>
                <Text style={styles.bloodGroupVal}>{summary.blood_group || 'Unknown'}</Text>
              </View>
              <View style={[styles.cardBox, styles.flex1]}>
                <Text style={styles.cardLabel}>CONSENT STATUS</Text>
                <View style={styles.consentRow}>
                  <ShieldCheck size={14} color="#16A34A" />
                  <Text style={styles.consentVal}>{summary.consent_status || 'VERIFIED'}</Text>
                </View>
              </View>
            </View>

            {/* CRITICAL ALLERGIES */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>CRITICAL ALLERGIES</Text>
              {summary.critical_allergies && summary.critical_allergies.length > 0 ? (
                <View style={styles.tagsWrap}>
                  {summary.critical_allergies.map((allergy, idx) => (
                    <View key={idx} style={styles.allergyTag}>
                      <Text style={styles.allergyTagText}>{allergy}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noneSpecifiedText}>No Known Drug Allergies</Text>
              )}
            </View>

            {/* CRITICAL CONDITIONS */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>CRITICAL CHRONIC CONDITIONS</Text>
              {summary.critical_conditions && summary.critical_conditions.length > 0 ? (
                <View style={styles.tagsWrap}>
                  {summary.critical_conditions.map((cond, idx) => (
                    <View key={idx} style={styles.conditionTag}>
                      <Text style={styles.conditionTagText}>{cond}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noneSpecifiedText}>None Reported</Text>
              )}
            </View>

            {/* CURRENT MEDICATIONS (IF PERMITTED BY ROLE) */}
            {summary.current_medications && summary.current_medications.length > 0 && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>CRITICAL MEDICATIONS</Text>
                {summary.current_medications.map((med, idx) => (
                  <Text key={idx} style={styles.medicationText}>• {med}</Text>
                ))}
              </View>
            )}

            {/* EMERGENCY CONTACT */}
            {summary.emergency_contacts && summary.emergency_contacts.length > 0 && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>EMERGENCY CONTACTS</Text>
                {summary.emergency_contacts.map((contact, idx) => (
                  <View key={idx} style={styles.contactRow}>
                    <Phone size={14} color="#EA580C" />
                    <Text style={styles.contactName}>{contact.name} ({contact.relation}):</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* RETRIEVAL FOOTER */}
            <Text style={styles.retrievalFooter}>
              Retrieved via ABDM Sandbox • {summary.last_retrieved ? new Date(summary.last_retrieved).toLocaleTimeString() : 'Just now'}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#18181B',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11.5,
    color: '#71717A',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    gap: 7,
    marginBottom: 14,
  },
  emergencyBannerText: {
    color: '#DC2626',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  contentScroll: {
    paddingVertical: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  flex1: {
    flex: 1,
  },
  cardBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bloodGroupVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#DC2626',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  consentVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  sectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  allergyTag: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  allergyTagText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  conditionTag: {
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  conditionTagText: {
    color: '#EA580C',
    fontSize: 11,
    fontWeight: '600',
  },
  noneSpecifiedText: {
    color: '#94A3B8',
    fontSize: 12,
    fontStyle: 'italic',
  },
  medicationText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  contactName: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  contactPhone: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#18181B',
  },
  retrievalFooter: {
    textAlign: 'center',
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 12,
    marginBottom: 20,
  },
});

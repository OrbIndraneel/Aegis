import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { ShieldCheck, ShieldAlert, FileText, CheckCircle2, XCircle, Clock, Eye, AlertCircle } from 'lucide-react-native';
import { ApiClient } from '../../services/api/client';
import { colors, typography, spacing, radius } from '../../theme';

interface Props {
  civilianId?: string;
}

export const EmergencyConsentCard: React.FC<Props> = ({ civilianId = 'demo-civilian-01' }) => {
  const [consentActive, setConsentActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [fetchingLogs, setFetchingLogs] = useState(false);

  useEffect(() => {
    loadConsent();
  }, [civilianId]);

  const loadConsent = async () => {
    try {
      const data = await ApiClient.fetchConsentStatus(civilianId);
      setConsentActive(data?.status === 'ACTIVE');
    } catch (e) {
      setConsentActive(true);
    }
  };

  const handleToggleConsent = async (val: boolean) => {
    setLoading(true);
    try {
      if (val) {
        await ApiClient.updateConsent({
          civilian_id: civilianId,
          emergency_use_permitted: true,
          permitted_fields: ['blood_group', 'critical_allergies', 'critical_conditions', 'emergency_contacts'],
          apaar_id: 'APAAR-9821-4091',
          abha_id: '91-4820-1940-5819',
        });
        setConsentActive(true);
      } else {
        await ApiClient.revokeConsent(civilianId);
        setConsentActive(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenHistory = async () => {
    setHistoryModalVisible(true);
    setFetchingLogs(true);
    try {
      const data = await ApiClient.fetchMedicalAccessHistory(civilianId);
      setAccessLogs(data?.access_history || []);
    } catch (e) {
      console.warn('Failed to load history:', e);
    } finally {
      setFetchingLogs(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: consentActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
          {consentActive ? (
            <ShieldCheck size={18} color="#16A34A" />
          ) : (
            <ShieldAlert size={18} color="#DC2626" />
          )}
        </View>
        <View style={styles.flex1}>
          <Text style={styles.cardTitle}>EMERGENCY MEDICAL CONSENT (ABDM)</Text>
          <Text style={styles.cardSubtitle}>
            Ayushman Bharat & APAAR Verified Emergency Triage Sharing
          </Text>
        </View>
        <Switch
          value={consentActive}
          onValueChange={handleToggleConsent}
          disabled={loading}
          trackColor={{ false: '#E4E4E7', true: '#16A34A' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.statusBanner}>
        <View style={styles.statusIndicator}>
          {consentActive ? (
            <CheckCircle2 size={13} color="#16A34A" />
          ) : (
            <XCircle size={13} color="#DC2626" />
          )}
          <Text style={[styles.statusText, { color: consentActive ? '#16A34A' : '#DC2626' }]}>
            {consentActive ? 'Active Consent • Linked ABHA: 91-4820-XXXX' : 'Consent Revoked • Data Locked'}
          </Text>
        </View>
        <Text style={styles.privacyNote}>
          Authorities receive minimum necessary summary only (Blood group, allergies, conditions) strictly during active emergencies.
        </Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.transparencyButton}
          onPress={handleOpenHistory}
          activeOpacity={0.8}
        >
          <Eye size={13} color="#4B5563" />
          <Text style={styles.transparencyBtnText}>View Access Transparency Log</Text>
        </TouchableOpacity>

        {consentActive && (
          <TouchableOpacity
            style={styles.revokeButton}
            onPress={() => handleToggleConsent(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.revokeBtnText}>Revoke Now</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CIVILIAN TRANSPARENCY MODAL */}
      <Modal
        visible={historyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <FileText size={18} color="#2563EB" />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.modalTitle}>Medical Access Transparency Log</Text>
                <Text style={styles.modalSubtitle}>Immutable record of emergency health disclosures</Text>
              </View>
              <TouchableOpacity
                onPress={() => setHistoryModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {fetchingLogs ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={styles.loadingText}>Retrieving audit records...</Text>
              </View>
            ) : accessLogs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <AlertCircle size={28} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No Medical Disclosures Recorded</Text>
                <Text style={styles.emptyDesc}>Your health data has not been queried by emergency responders.</Text>
              </View>
            ) : (
              <ScrollView style={styles.logsList} showsVerticalScrollIndicator={false}>
                {accessLogs.map((log, index) => (
                  <View key={log.id || index} style={styles.logCard}>
                    <View style={styles.logTopRow}>
                      <Text style={styles.logRoleBadge}>{log.requesting_role || 'FIELD_OFFICER'}</Text>
                      <View style={styles.logTimeRow}>
                        <Clock size={11} color="#6B7280" />
                        <Text style={styles.logTimeText}>
                          {log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.logReasonText}>
                      <Text style={styles.logBold}>Reason: </Text>{log.access_reason}
                    </Text>
                    <View style={styles.logFieldsRow}>
                      <Text style={styles.logBold}>Fields: </Text>
                      {(log.fields_returned || ['blood_group', 'critical_allergies']).map((f: string, i: number) => (
                        <Text key={i} style={styles.fieldBadge}>{f.replace('_', ' ')}</Text>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  cardTitle: {
    color: '#18181B',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    color: '#71717A',
    fontSize: 11.5,
    marginTop: 2,
  },
  statusBanner: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  privacyNote: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  transparencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 8,
  },
  transparencyBtnText: {
    color: '#334155',
    fontSize: 11.5,
    fontWeight: '600',
  },
  revokeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  revokeBtnText: {
    color: '#DC2626',
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#64748B',
    fontSize: 11.5,
  },
  closeButton: {
    padding: 6,
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  loaderContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 12,
  },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  emptyDesc: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
  logsList: {
    paddingVertical: 6,
  },
  logCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  logRoleBadge: {
    backgroundColor: '#E0E7FF',
    color: '#3730A3',
    fontSize: 10.5,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  logTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logTimeText: {
    color: '#64748B',
    fontSize: 11,
  },
  logReasonText: {
    color: '#334155',
    fontSize: 12,
    marginBottom: 6,
  },
  logBold: {
    fontWeight: '700',
  },
  logFieldsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  fieldBadge: {
    backgroundColor: '#E2E8F0',
    color: '#334155',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

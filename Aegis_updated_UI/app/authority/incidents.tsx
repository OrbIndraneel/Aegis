import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { SeverityBadge } from '../../src/components/common/SeverityBadge';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import { MOCK_INCIDENTS } from '../../src/services/mock/mockData';
import { MockSosService } from '../../src/services/mock/mockSosService';
import { useUserStore } from '../../src/store/useUserStore';
import { useDisasterStore } from '../../src/store/useDisasterStore';
import { Incident, IncidentStatus, CivilianFieldReport, FieldReportStatus } from '../../src/types';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  Radio,
  FileText,
  Check,
  X,
  ExternalLink,
} from 'lucide-react-native';

export default function AuthorityIncidentsScreen() {
  const [activeTab, setActiveTab] = useState<'INCIDENTS' | 'FIELD_REPORTS'>('INCIDENTS');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeBeaconId, setActiveBeaconId] = useState<string | null>(null);
  const { setRescueBeaconState } = useUserStore();
  const { fieldReports, loadFieldReports, updateFieldReportStatus } = useDisasterStore();

  useEffect(() => {
    loadFieldReports();
  }, []);

  const filteredIncidents = MOCK_INCIDENTS.filter((inc) => {
    if (selectedStatus === 'ALL') return true;
    return inc.status === selectedStatus;
  });

  const handleActivateBeacon = async (incident: Incident) => {
    const record = await MockSosService.activateBeaconByAuthority(incident.id);
    if (record) {
      setActiveBeaconId(incident.id);
      setRescueBeaconState(true, record);
      Alert.alert(
        'RESCUE BEACON DISPATCHED',
        `Strobe beacon signal, emergency siren, and vibration triggered for ${record.userName} (${record.sosId})!`
      );
    }
  };

  const handleDeactivateBeacon = async () => {
    await MockSosService.deactivateBeaconByAuthority();
    setActiveBeaconId(null);
    setRescueBeaconState(false, null);
    Alert.alert('RESCUE BEACON DEACTIVATED', 'Emergency beacon signal turned off.');
  };

  const handleVerifyReport = async (reportId: string) => {
    await updateFieldReportStatus(reportId, 'VERIFIED_BY_SDRF');
    Alert.alert('Verified by SDRF', 'Field report validated and integrated into Landslide Hazard Map telemetry.');
  };

  const handleScheduleInspection = async (reportId: string) => {
    await updateFieldReportStatus(reportId, 'UNDER_REVIEW');
    Alert.alert('Inspection Scheduled', 'BRO Project Swastik road marshal team dispatched to site.');
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'Critical':
      case 'Evacuation':
        return '#DC2626';
      case 'Warning':
        return '#D97706';
      case 'Monitoring':
        return '#0284C7';
      case 'Resolved':
        return '#10B981';
      default:
        return '#64748B';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="INCIDENT MANAGEMENT"
        subtitle="SDRF Tactical Responses & Field Intelligence"
      />
      <ConnectionStatus />

      <View style={styles.content}>
        {/* Main Tab Toggle: Official Incidents vs Crowd-Sourced Field Reports */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'INCIDENTS' && styles.tabButtonActive]}
            onPress={() => setActiveTab('INCIDENTS')}
            activeOpacity={0.8}
          >
            <ShieldAlert size={15} color={activeTab === 'INCIDENTS' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'INCIDENTS' && styles.tabTextActive]}>
              Tactical Incidents ({MOCK_INCIDENTS.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'FIELD_REPORTS' && styles.tabButtonActive]}
            onPress={() => setActiveTab('FIELD_REPORTS')}
            activeOpacity={0.8}
          >
            <FileText size={15} color={activeTab === 'FIELD_REPORTS' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'FIELD_REPORTS' && styles.tabTextActive]}>
              Civilian Field Intel ({fieldReports.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'INCIDENTS' ? (
          <>
            {/* Status Filter Row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
              style={styles.filterScrollView}
            >
              {['ALL', 'Evacuation', 'Critical', 'Warning', 'Monitoring'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    selectedStatus === status && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedStatus === status && styles.filterTextActive,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Incident List */}
            <FlatList
              data={filteredIncidents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isBeaconOn = activeBeaconId === item.id;

                return (
                  <View style={styles.incidentCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.titleRow}>
                        <AlertTriangle size={18} color={getStatusColor(item.status)} />
                        <Text style={styles.incidentTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                      </View>
                    </View>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <MapPin size={12} color={colors.text.secondary} />
                        <Text style={styles.metaText}>{item.locationName}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Clock size={12} color={colors.text.secondary} />
                        <Text style={styles.metaText}>Started: {item.startTime}</Text>
                      </View>
                    </View>

                    <Text style={styles.description}>{item.description}</Text>

                    <View style={styles.metricsRow}>
                      <View style={styles.metricChip}>
                        <Users size={12} color={colors.text.secondary} />
                        <Text style={styles.metricText}>
                          Affected: {item.affectedPopulation.toLocaleString()} citizens
                        </Text>
                      </View>
                      <SeverityBadge severity={item.severity} size="sm" />
                    </View>

                    {/* Escalation Warning Callout */}
                    <View style={styles.escalationBox}>
                      <ShieldAlert size={14} color="#DC2626" />
                      <Text style={styles.escalationText}>Cascade Risk: {item.predictedEscalation}</Text>
                    </View>

                    {/* Authority Rescue Beacon Control Action */}
                    <TouchableOpacity
                      style={[styles.beaconActionBtn, isBeaconOn && styles.beaconActionBtnActive]}
                      onPress={() => (isBeaconOn ? handleDeactivateBeacon() : handleActivateBeacon(item))}
                      activeOpacity={0.85}
                    >
                      <Radio size={14} color={isBeaconOn ? '#FFF' : '#F59E0B'} />
                      <Text style={[styles.beaconActionText, isBeaconOn && styles.beaconActionTextActive]}>
                        {isBeaconOn ? 'DEACTIVATE RESCUE BEACON' : 'ACTIVATE RESCUE BEACON ON CIVILIAN DEVICE'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          /* FIELD REPORTS VERIFICATION FEED */
          <FlatList
            data={fieldReports}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.reportReviewCard}>
                <View style={styles.reportReviewHeader}>
                  <View style={styles.reportTypeBadge}>
                    <AlertTriangle size={13} color="#D97706" />
                    <Text style={styles.reportTypeBadgeText}>{(item.reportType || item.type || 'LANDSLIDE').replace('_', ' ')}</Text>
                  </View>
                  <View style={[styles.reportStatusBadge, getReportStatusBadgeStyle(item.status)]}>
                    <Text style={styles.reportStatusBadgeText}>{item.status.replace(/_/g, ' ')}</Text>
                  </View>
                </View>

                <Text style={styles.reportLocality}>{item.locationName || item.locality || 'East Sikkim Sector'}</Text>
                <Text style={styles.reportDesc}>{item.description}</Text>

                <View style={styles.reportMetaRow}>
                  <Text style={styles.reporterInfo}>
                    Reporter: {item.reportedBy || item.reporterName || 'Civilian Observer'} ({item.contactPhone || item.reporterPhone || '+91 98000 00000'})
                  </Text>
                  <Text style={styles.reporterGps}>
                    {(item.coordinate || item.coordinates)?.latitude.toFixed(4) || '27.2340'}°N,{' '}
                    {(item.coordinate || item.coordinates)?.longitude.toFixed(4) || '88.5120'}°E
                  </Text>
                </View>

                {/* Review Actions */}
                <View style={styles.reviewActionsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.verifyBtn]}
                    onPress={() => handleVerifyReport(item.id)}
                    activeOpacity={0.8}
                  >
                    <Check size={13} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>Verify (SDRF)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.inspectBtn]}
                    onPress={() => handleScheduleInspection(item.id)}
                    activeOpacity={0.8}
                  >
                    <Clock size={13} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>BRO Inspection</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const getReportStatusBadgeStyle = (status: FieldReportStatus) => {
  switch (status) {
    case 'VERIFIED_BY_SDRF':
      return { backgroundColor: '#ECFDF5', borderColor: '#86EFAC' };
    case 'UNDER_REVIEW':
      return { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' };
    default:
      return { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: radius.lg,
    padding: 3,
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  tabButtonActive: {
    backgroundColor: '#0F172A',
    ...shadows.sm,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterScrollView: {
    marginBottom: spacing.md,
    maxHeight: 36,
  },
  filterScrollContent: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 110,
  },
  incidentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  incidentTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#64748B',
    fontSize: 11,
  },
  description: {
    color: '#334155',
    fontSize: 12.5,
    lineHeight: 18,
    marginVertical: spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    color: '#64748B',
    fontSize: 11,
  },
  escalationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#FEF2F2',
    padding: spacing.xs,
    borderRadius: radius.xs,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  escalationText: {
    color: '#991B1B',
    fontSize: 11,
    fontWeight: '600',
  },
  beaconActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingVertical: 10,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  beaconActionBtnActive: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',
  },
  beaconActionText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  beaconActionTextActive: {
    color: '#FFFFFF',
  },
  reportReviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  reportReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reportTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reportTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  reportStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  reportStatusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  reportLocality: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  reportDesc: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 8,
  },
  reportMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 10,
  },
  reporterInfo: {
    fontSize: 10.5,
    color: '#64748B',
  },
  reporterGps: {
    fontSize: 10.5,
    color: '#0284C7',
    fontWeight: '500',
  },
  reviewActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  verifyBtn: {
    backgroundColor: '#059669',
  },
  inspectBtn: {
    backgroundColor: '#0284C7',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

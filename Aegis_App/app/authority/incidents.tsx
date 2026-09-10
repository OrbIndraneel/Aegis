import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { SeverityBadge } from '../../src/components/common/SeverityBadge';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import { MOCK_INCIDENTS } from '../../src/services/mock/mockData';
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
} from 'lucide-react-native';

export default function AuthorityIncidentsScreen() {
  const [activeTab, setActiveTab] = useState<'INCIDENTS' | 'FIELD_REPORTS'>('INCIDENTS');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const { fieldReports, loadFieldReports, updateFieldReportStatus } = useDisasterStore();

  useEffect(() => {
    loadFieldReports();
  }, []);

  const filteredIncidents = MOCK_INCIDENTS.filter((inc) => {
    if (selectedStatus === 'ALL') return true;
    return inc.status === selectedStatus;
  });

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
        return colors.severity.CRITICAL.main;
      case 'Warning':
        return colors.severity.MODERATE.main;
      case 'Monitoring':
        return colors.primary.main;
      case 'Resolved':
        return colors.status.success;
      default:
        return colors.text.secondary;
    }
  };

  const getReportStatusBadgeStyle = (status: FieldReportStatus) => {
    switch (status) {
      case 'VERIFIED_BY_SDRF':
        return { backgroundColor: '#ECFDF5', borderColor: '#86EFAC', text: '#065F46' };
      case 'UNDER_REVIEW':
        return { backgroundColor: '#FFFBEB', borderColor: '#FCD34D', text: '#B45309' };
      default:
        return { backgroundColor: '#EFF6FF', borderColor: '#93C5FD', text: '#1D4ED8' };
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
              renderItem={({ item }: { item: Incident }) => (
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
                      <Text style={styles.metricText}>Affected: {item.affectedPopulation} civilians</Text>
                    </View>
                    <SeverityBadge severity={item.severity} size="sm" />
                  </View>

                  {/* Escalation Warning Callout */}
                  <View style={styles.escalationBox}>
                    <ShieldAlert size={14} color={colors.severity.CRITICAL.main} />
                    <Text style={styles.escalationText}>Escalation Risk: {item.predictedEscalation}</Text>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          /* FIELD REPORTS VERIFICATION FEED */
          <FlatList
            data={fieldReports}
            keyExtractor={(item) => item.id}
            renderItem={({ item }: { item: CivilianFieldReport }) => {
              const badgeStyle = getReportStatusBadgeStyle(item.status);
              return (
                <View style={styles.reportReviewCard}>
                  <View style={styles.reportReviewHeader}>
                    <View style={styles.reportTypeBadge}>
                      <AlertTriangle size={13} color="#D97706" />
                      <Text style={styles.reportTypeBadgeText}>{(item.reportType || item.type || 'LANDSLIDE').replace(/_/g, ' ')}</Text>
                    </View>
                    <View style={[styles.reportStatusBadge, { backgroundColor: badgeStyle.backgroundColor, borderColor: badgeStyle.borderColor }]}>
                      <Text style={[styles.reportStatusBadgeText, { color: badgeStyle.text }]}>{item.status.replace(/_/g, ' ')}</Text>
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
              );
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  filterChipActive: {
    backgroundColor: colors.safety.main,
    borderColor: colors.safety.light,
  },
  filterText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: typography.fontWeight.bold,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  incidentCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.strong,
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
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  description: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    marginVertical: spacing.xs,
    lineHeight: 18,
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
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
  },
  escalationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: spacing.xs,
    borderRadius: radius.sm,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  escalationText: {
    color: colors.severity.CRITICAL.text,
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },

  /* FIELD REPORTS STYLES */
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
    gap: 4,
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
  },
  reportLocality: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  reportDesc: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
    marginBottom: 8,
  },
  reportMetaRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
    marginBottom: 8,
  },
  reporterInfo: {
    fontSize: 10.5,
    color: '#64748B',
  },
  reporterGps: {
    fontSize: 10,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 2,
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
    paddingVertical: 8,
    borderRadius: radius.md,
    gap: 4,
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

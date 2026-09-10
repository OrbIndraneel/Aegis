import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  ShieldAlert,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Wifi,
  WifiOff,
  User,
  PlusCircle,
  Eye,
} from 'lucide-react-native';
import { Header } from '../../src/components/common/Header';
import { FieldReportForm } from '../../src/components/civilian/FieldReportForm';
import { useDisasterStore } from '../../src/store/useDisasterStore';
import { useOfflineStore } from '../../src/store/useOfflineStore';
import { colors, radius, spacing, typography, shadows } from '../../src/theme';
import { CivilianFieldReport, FieldReportStatus } from '../../src/types';

export default function CivilianReportScreen() {
  const { fieldReports, loadFieldReports } = useDisasterStore();
  const { isOnline, queuedReports, syncQueuedReports } = useOfflineStore();
  const [activeTab, setActiveTab] = useState<'NEW' | 'HISTORY'>('NEW');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFieldReports();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (isOnline) {
      await syncQueuedReports();
    }
    await loadFieldReports();
    setRefreshing(false);
  };

  const getStatusBadge = (status: FieldReportStatus) => {
    switch (status) {
      case 'VERIFIED_BY_SDRF':
        return {
          label: 'Verified by SDRF',
          bg: '#ECFDF5',
          text: '#065F46',
          icon: CheckCircle2,
        };
      case 'UNDER_REVIEW':
        return {
          label: 'BRO Inspection Scheduled',
          bg: '#FFFBEB',
          text: '#B45309',
          icon: Clock,
        };
      case 'REJECTED':
        return {
          label: 'Resolved / Inactive',
          bg: '#F1F5F9',
          text: '#64748B',
          icon: AlertTriangle,
        };
      case 'SUBMITTED':
      default:
        return {
          label: 'Submitted to Dispatch',
          bg: '#EFF6FF',
          text: '#1D4ED8',
          icon: FileText,
        };
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="FIELD INTEL REPORT"
        subtitle="MDoNER Crowd-Sourced Landslide Monitoring"
        showBack={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0284C7" />
        }
      >
        {/* Offline Queue Notice Banner */}
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <WifiOff size={16} color="#DC2626" />
            <View style={styles.offlineBannerText}>
              <Text style={styles.offlineTitle}>Mountain Offline Resilient Mode Active</Text>
              <Text style={styles.offlineSubtitle}>
                {queuedReports.length > 0
                  ? `${queuedReports.length} report(s) cached in encrypted storage. Transmitting when cellular or mesh link reconnects.`
                  : 'Cellular link down. Reports are saved locally and synced automatically.'}
              </Text>
            </View>
          </View>
        )}

        {/* Tab Toggle */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'NEW' && styles.tabButtonActive]}
            onPress={() => setActiveTab('NEW')}
            activeOpacity={0.8}
          >
            <PlusCircle size={15} color={activeTab === 'NEW' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'NEW' && styles.tabTextActive]}>
              Submit Intel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'HISTORY' && styles.tabButtonActive]}
            onPress={() => setActiveTab('HISTORY')}
            activeOpacity={0.8}
          >
            <Eye size={15} color={activeTab === 'HISTORY' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.tabTextActive]}>
              Sector Feed ({fieldReports.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'NEW' ? (
          <FieldReportForm onSuccess={() => setActiveTab('HISTORY')} />
        ) : (
          <View style={styles.historyContainer}>
            <Text style={styles.feedHeading}>EAST SIKKIM SECTOR FIELD REPORTS</Text>
            <Text style={styles.feedSubheading}>
              Ground telemetry reported by local observers, BRO road marshals, and civilian scouts.
            </Text>

            {fieldReports.map((report) => {
              const badge = getStatusBadge(report.status);
              const BadgeIcon = badge.icon;

              return (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.typeBadge}>
                      <AlertTriangle size={13} color="#D97706" />
                      <Text style={styles.typeBadgeText}>{(report.reportType || report.type || 'LANDSLIDE').replace('_', ' ')}</Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <BadgeIcon size={12} color={badge.text} />
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.reportDesc}>{report.description}</Text>

                  <View style={styles.metaFooter}>
                    <View style={styles.metaItem}>
                      <MapPin size={12} color="#64748B" />
                      <Text style={styles.metaText}>{report.locationName || report.locality || 'East Sikkim'}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Clock size={12} color="#64748B" />
                      <Text style={styles.metaText}>
                        {report.formattedTime ||
                          (report.createdAt
                            ? new Date(report.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : report.timestamp
                              ? new Date(report.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Just now')}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 90,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: spacing.md,
  },
  offlineBannerText: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
  },
  offlineSubtitle: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 2,
    lineHeight: 15,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  historyContainer: {
    gap: 12,
  },
  feedHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#64748B',
    marginBottom: 2,
  },
  feedSubheading: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 8,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  reportDesc: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
    marginBottom: 10,
  },
  metaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
  },
});

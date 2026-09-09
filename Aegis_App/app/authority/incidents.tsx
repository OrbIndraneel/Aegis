import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { SeverityBadge } from '../../src/components/common/SeverityBadge';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import { MOCK_INCIDENTS } from '../../src/services/mock/mockData';
import { Incident, IncidentStatus } from '../../src/types';
import { AlertTriangle, Clock, MapPin, Users, ShieldAlert, PhoneCall, CheckCircle2 } from 'lucide-react-native';

export default function AuthorityIncidentsScreen() {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredIncidents = MOCK_INCIDENTS.filter((inc) => {
    if (selectedStatus === 'ALL') return true;
    return inc.status === selectedStatus;
  });

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

  return (
    <SafeAreaView style={styles.container}>
      <Header title="INCIDENT MANAGEMENT" />
      <ConnectionStatus />

      <View style={styles.content}>
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
});

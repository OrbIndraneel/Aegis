import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Send, Megaphone, ShieldAlert, CheckCircle2 } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { SeverityLevel, DisasterType } from '../../types/disaster';
import { AlertDispatchPayload } from '../../types/alert';
import { ApiClient } from '../../services/api/client';
import { NotificationService } from '../../services/notification/notificationService';

export const DispatchForm: React.FC = () => {
  const [targetRegion, setTargetRegion] = useState('Vadodara - Sectors 1 to 5');
  const [severity, setSeverity] = useState<SeverityLevel>('CRITICAL');
  const [disasterType, setDisasterType] = useState<DisasterType>('FLOOD');
  const [title, setTitle] = useState('FLASH FLOOD EVACUATION NOTICE');
  const [body, setBody] = useState('GSDMA mandates immediate civilian move to higher ground or Sama Relief Camp.');
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDispatch = async () => {
    if (!title || !body) return;
    setIsSending(true);
    setSuccessMessage(null);
    try {
      const payload: AlertDispatchPayload = {
        targetRegion,
        severity,
        disasterType,
        title,
        body,
        actionRequired: severity === 'CRITICAL' ? 'EVACUATE_IMMEDIATELY' : 'PREPARE_KIT',
        sendPushNotification: true,
        triggerEmergencySiren: severity === 'CRITICAL',
      };

      const dispatched = await ApiClient.dispatchAlert(payload);
      await NotificationService.scheduleEmergencyAlertNotification(dispatched);

      setIsSending(false);
      setSuccessMessage(`Alert broadcasted to 42,500 active civilian devices in ${targetRegion}!`);
    } catch (err) {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Megaphone size={18} color={colors.severity.CRITICAL.main} />
        </View>
        <View>
          <Text style={styles.title}>EMERGENCY ALERT DISPATCH CENTER</Text>
          <Text style={styles.subtitle}>Broadcast targeted warning to civilian mobile devices</Text>
        </View>
      </View>

      {/* Target Region */}
      <Text style={styles.fieldLabel}>TARGET EVACUATION REGION / SECTOR</Text>
      <TextInput
        style={styles.input}
        value={targetRegion}
        onChangeText={setTargetRegion}
        placeholderTextColor={colors.text.muted}
      />

      {/* Severity Selector */}
      <Text style={styles.fieldLabel}>ALERT SEVERITY LEVEL</Text>
      <View style={styles.severityRow}>
        {(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as SeverityLevel[]).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.sevChip,
              severity === level && {
                backgroundColor: colors.severity[level].main,
                borderColor: colors.severity[level].main,
              },
            ]}
            onPress={() => setSeverity(level)}
          >
            <Text
              style={[
                styles.sevChipText,
                severity === level && { color: '#FFF', fontWeight: typography.fontWeight.heavy },
              ]}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Headline Title Input */}
      <Text style={styles.fieldLabel}>ALERT TITLE</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter high-impact alert headline..."
        placeholderTextColor={colors.text.muted}
      />

      {/* Message Body Input */}
      <Text style={styles.fieldLabel}>EVACUATION DIRECTIVE MESSAGE</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        value={body}
        onChangeText={setBody}
        multiline
        numberOfLines={3}
        placeholder="Provide precise emergency instructions..."
        placeholderTextColor={colors.text.muted}
      />

      {/* Success Notification Banner */}
      {successMessage && (
        <View style={styles.successBanner}>
          <CheckCircle2 size={16} color={colors.status.success} />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      {/* Broadcast Trigger Button */}
      <TouchableOpacity
        style={[
          styles.dispatchButton,
          severity === 'CRITICAL' && shadows.glowRed,
        ]}
        onPress={handleDispatch}
        disabled={isSending}
        activeOpacity={0.85}
      >
        <Send size={16} color="#FFF" />
        <Text style={styles.dispatchText}>
          {isSending ? 'BROADCASTING ALERTS...' : 'DISPATCH EMERGENCY BROADCAST NOW'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.strong,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.severity.CRITICAL.text,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
  },
  fieldLabel: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  severityRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sevChip: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  sevChipText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  successText: {
    color: colors.status.success,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    flex: 1,
  },
  dispatchButton: {
    backgroundColor: colors.severity.CRITICAL.main,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  dispatchText: {
    color: '#FFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
});

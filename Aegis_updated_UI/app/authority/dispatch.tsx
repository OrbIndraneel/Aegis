import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { AlertCard } from '../../src/components/civilian/AlertCard';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import { HazardSeverity, HazardType } from '../../src/types';
import { AlertDispatchPayload, AlertMessage } from '../../src/types/alert';
import { ApiClient } from '../../src/services/api/client';
import { NotificationService } from '../../src/services/notification/notificationService';
import { Megaphone, Send, Save, CheckCircle2, Eye, ShieldAlert } from 'lucide-react-native';

export default function AuthorityDispatchScreen() {
  const [targetRegion, setTargetRegion] = useState('East Sikkim - NH-10 Corridor & Singtam');
  const [severity, setSeverity] = useState<HazardSeverity>('CRITICAL');
  const [disasterType, setDisasterType] = useState<HazardType>('LANDSLIDE');
  const [title, setTitle] = useState('LANDSLIDE IMMINENT WARNING — NH-10 MILE 20');
  const [body, setBody] = useState('MDoNER & Sikkim SDMA mandate immediate evacuation along NH-10 20th Mile corridor. Proceed to Singtam Staging Complex via Upper Ridge Bypass.');
  const [actionRequired, setActionRequired] = useState<'EVACUATE_IMMEDIATELY' | 'SEEK_HIGH_GROUND' | 'STAY_INDOORS' | 'PREPARE_KIT'>('EVACUATE_IMMEDIATELY');

  const [isSending, setIsSending] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const previewAlert: AlertMessage = {
    id: 'preview-01',
    title: title || 'ALERT HEADLINE PREVIEW',
    body: body || 'Directive message details will render here.',
    severity,
    disasterType,
    targetRegion,
    issuedBy: 'MDoNER Disaster Early Warning System (AEGIS)',
    issuedAt: 'Just now',
    actionRequired,
    affectedPopulationEstimate: 24800,
  };

  const handleSaveDraft = () => {
    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 3000);
  };

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
        actionRequired,
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
    <SafeAreaView style={styles.container}>
      <Header title="ALERT DISPATCH CENTER" />
      <ConnectionStatus />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Megaphone size={18} color={colors.severity.CRITICAL.main} />
            </View>
            <View>
              <Text style={styles.title}>EMERGENCY ALERT COMPOSER</Text>
              <Text style={styles.subtitle}>Broadcast targeted warning to civilian mobile devices</Text>
            </View>
          </View>

          {/* Target Region */}
          <Text style={styles.fieldLabel}>TARGET EVACUATION REGION / SECTOR</Text>
          <TextInput
            style={styles.input}
            value={targetRegion}
            onChangeText={setTargetRegion}
          />

          {/* Severity Selector */}
          <Text style={styles.fieldLabel}>ALERT SEVERITY LEVEL</Text>
          <View style={styles.presetRow}>
            {(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as HazardSeverity[]).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.presetChip,
                  severity === level && {
                    backgroundColor: colors.severity[level].main,
                    borderColor: colors.severity[level].main,
                  },
                ]}
                onPress={() => setSeverity(level)}
              >
                <Text
                  style={[
                    styles.presetText,
                    severity === level && { color: '#FFF', fontWeight: typography.fontWeight.heavy },
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Required Selector */}
          <Text style={styles.fieldLabel}>RECOMMENDED CIVILIAN ACTION</Text>
          <View style={styles.presetRow}>
            {[
              { key: 'EVACUATE_IMMEDIATELY', label: 'Evacuate' },
              { key: 'SEEK_HIGH_GROUND', label: 'High Ground' },
              { key: 'STAY_INDOORS', label: 'Stay Indoors' },
              { key: 'PREPARE_KIT', label: 'Prepare Kit' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.presetChip,
                  actionRequired === item.key && styles.presetActive,
                ]}
                onPress={() => setActionRequired(item.key as any)}
              >
                <Text
                  style={[
                    styles.presetText,
                    actionRequired === item.key && styles.presetTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title Input */}
          <Text style={styles.fieldLabel}>ALERT HEADLINE</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter high-impact alert title..."
            placeholderTextColor={colors.text.muted}
          />

          {/* Message Body Input */}
          <Text style={styles.fieldLabel}>DIRECTIVE MESSAGE BODY</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={3}
            placeholder="Provide precise emergency instructions..."
            placeholderTextColor={colors.text.muted}
          />

          {/* LIVE PREVIEW SECTION */}
          <Text style={styles.fieldLabel}>LIVE CIVILIAN CARD PREVIEW</Text>
          <AlertCard alert={previewAlert} />

          {/* Notification Banners */}
          {savedDraft && (
            <View style={styles.successBanner}>
              <CheckCircle2 size={16} color={colors.status.success} />
              <Text style={styles.successText}>Alert draft saved to Control Room dispatch queue.</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successBanner}>
              <CheckCircle2 size={16} color={colors.status.success} />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Action Buttons Row */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.draftButton}
              onPress={handleSaveDraft}
              activeOpacity={0.8}
            >
              <Save size={14} color={colors.text.primary} />
              <Text style={styles.draftText}>SAVE DRAFT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dispatchButton,
                severity === 'CRITICAL' && shadows.glowRed,
              ]}
              onPress={handleDispatch}
              disabled={isSending}
              activeOpacity={0.85}
            >
              <Send size={14} color="#FFF" />
              <Text style={styles.dispatchText}>
                {isSending ? 'DISPATCHING...' : 'DISPATCH ALERT'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.strong,
    marginBottom: spacing.xxl,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
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
    fontSize: typography.fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  multilineInput: {
    minHeight: 65,
    textAlignVertical: 'top',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 4,
  },
  presetChip: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    paddingVertical: 4,
    borderRadius: radius.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  presetActive: {
    backgroundColor: colors.safety.main,
    borderColor: colors.safety.light,
  },
  presetText: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
  },
  presetTextActive: {
    color: '#FFF',
    fontWeight: typography.fontWeight.bold,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  successText: {
    color: colors.status.success,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    flex: 1,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  draftButton: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  draftText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  dispatchButton: {
    flex: 1.5,
    backgroundColor: colors.severity.CRITICAL.main,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dispatchText: {
    color: '#FFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
});

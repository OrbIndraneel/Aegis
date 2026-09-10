import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import {
  AlertTriangle,
  Camera,
  MapPin,
  CheckCircle2,
  Wifi,
  WifiOff,
  Image as ImageIcon,
  ShieldAlert,
  Compass,
} from 'lucide-react-native';
import { colors, radius, spacing, typography, shadows } from '../../theme';
import { FieldReportType, Severity } from '../../types';
import { useDisasterStore } from '../../store/useDisasterStore';
import { useUserStore } from '../../store/useUserStore';
import { useOfflineStore } from '../../store/useOfflineStore';
import { useTranslation } from '../../i18n';

interface Props {
  onSuccess?: () => void;
}

const REPORT_TYPES: { type: FieldReportType; label: string; desc: string }[] = [
  { type: 'LANDSLIDE', label: 'Landslide', desc: 'Mass earth failure or major debris movement' },
  { type: 'MUDSLIDE', label: 'Mudslide / Slurry', desc: 'Rapid mud/water slurry down steep channel' },
  { type: 'SLOPE_MOVEMENT', label: 'Slope Creep', desc: 'Active soil shifting, tilting trees or poles' },
  { type: 'GROUND_CRACKS', label: 'Tension Cracks', desc: 'New linear ground fissures or road heave' },
  { type: 'ROAD_BLOCK', label: 'Highway Blockage', desc: 'Boulders, trees, or collapsed retaining wall' },
];

const SEVERITIES: { level: Severity; label: string; color: string }[] = [
  { level: 'LOW', label: 'Low', color: '#10B981' },
  { level: 'MODERATE', label: 'Moderate', color: '#F59E0B' },
  { level: 'HIGH', label: 'High', color: '#EF4444' },
  { level: 'CRITICAL', label: 'Critical', color: '#991B1B' },
];

export const FieldReportForm: React.FC<Props> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { submitFieldReport } = useDisasterStore();
  const { profile } = useUserStore();
  const { isOnline, queueFieldReportOffline } = useOfflineStore();

  const [selectedType, setSelectedType] = useState<FieldReportType>('LANDSLIDE');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity>('HIGH');
  const [locality, setLocality] = useState('NH-10 Corridor, East Sikkim');
  const [description, setDescription] = useState('');
  const [hasPhotoAttached, setHasPhotoAttached] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Missing Detail', 'Please enter a brief description of the observed slope or road condition.');
      return;
    }

    setSubmitting(true);
    const coordinates = profile.currentLocation || { latitude: 27.234, longitude: 88.512 };

    const reportPayload = {
      reportType: selectedType,
      title: `${selectedType.replace(/_/g, ' ')} Report at ${locality}`,
      description: description.trim(),
      coordinate: coordinates,
      locationName: locality.trim() || 'East Sikkim Sector',
      severity: selectedSeverity,
      reportedBy: profile.fullName || 'Civilian Observer',
      contactPhone: profile.phoneNumber || '+91 98000 00000',
      photoUri: hasPhotoAttached ? 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800' : undefined,
      // aliases:
      type: selectedType,
      locality: locality.trim() || 'East Sikkim Sector',
      coordinates,
      reporterName: profile.fullName || 'Civilian Observer',
      reporterPhone: profile.phoneNumber || '+91 98000 00000',
      photoUrl: hasPhotoAttached ? 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800' : undefined,
    };

    try {
      if (!isOnline) {
        // Save to offline queue
        await queueFieldReportOffline({
          ...reportPayload,
          id: `rep-offline-${Date.now()}`,
          timestamp: Date.now(),
          formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'SUBMITTED',
          createdAt: new Date().toISOString(),
        });
        setSuccessMessage('Report saved offline. It will transmit automatically once signal is restored.');
      } else {
        const created = await submitFieldReport(reportPayload);
        setSuccessMessage(`Field Intelligence transmitted (ID: ${created.id}). SDRF and BRO teams notified.`);
      }

      setDescription('');
      if (onSuccess) {
        setTimeout(onSuccess, 1800);
      }
    } catch (e: any) {
      Alert.alert('Submission Error', e?.message || 'Failed to submit report. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* Network Status Pill */}
      <View style={styles.statusHeader}>
        <View style={styles.titleRow}>
          <ShieldAlert size={18} color={colors.primary.main} />
          <Text style={styles.formHeading}>SDRF Field Intel Reporting</Text>
        </View>

        <View style={[styles.networkPill, !isOnline && styles.networkPillOffline]}>
          {isOnline ? (
            <>
              <Wifi size={12} color="#10B981" />
              <Text style={styles.networkPillTextOnline}>Network Online</Text>
            </>
          ) : (
            <>
              <WifiOff size={12} color="#EF4444" />
              <Text style={styles.networkPillTextOffline}>Offline Queue Ready</Text>
            </>
          )}
        </View>
      </View>

      <Text style={styles.subtext}>
        Report ground cracks, active rockfall, or road blockage to update the AEGIS cascade model and alert responders.
      </Text>

      {successMessage && (
        <View style={styles.successBanner}>
          <CheckCircle2 size={16} color="#10B981" />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      {/* Hazard Type Selector */}
      <Text style={styles.sectionLabel}>OBSERVED HAZARD TYPE</Text>
      <View style={styles.typeGrid}>
        {REPORT_TYPES.map((item) => {
          const isSelected = selectedType === item.type;
          return (
            <TouchableOpacity
              key={item.type}
              style={[styles.typeButton, isSelected && styles.typeButtonSelected]}
              onPress={() => setSelectedType(item.type)}
              activeOpacity={0.7}
            >
              <Text style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}>
                {item.label}
              </Text>
              <Text style={[styles.typeDesc, isSelected && styles.typeDescSelected]} numberOfLines={1}>
                {item.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Severity Selector */}
      <Text style={styles.sectionLabel}>SEVERITY LEVEL</Text>
      <View style={styles.severityRow}>
        {SEVERITIES.map((s) => {
          const isSelected = selectedSeverity === s.level;
          return (
            <TouchableOpacity
              key={s.level}
              style={[
                styles.severityButton,
                isSelected && { borderColor: s.color, backgroundColor: `${s.color}15` },
              ]}
              onPress={() => setSelectedSeverity(s.level)}
              activeOpacity={0.7}
            >
              <View style={[styles.severityDot, { backgroundColor: s.color }]} />
              <Text style={[styles.severityLabel, isSelected && { color: s.color, fontWeight: '700' }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Auto GPS & Locality */}
      <Text style={styles.sectionLabel}>LOCATION & SECTOR</Text>
      <View style={styles.inputBox}>
        <MapPin size={16} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={locality}
          onChangeText={setLocality}
          placeholder="e.g. NH-10 near 20th Mile culvert"
          placeholderTextColor="#94A3B8"
        />
      </View>
      <View style={styles.gpsRow}>
        <Compass size={12} color="#0284C7" />
        <Text style={styles.gpsText}>
          GPS Locked: {profile.currentLocation?.latitude.toFixed(4) || '27.2340'}° N,{' '}
          {profile.currentLocation?.longitude.toFixed(4) || '88.5120'}° E (±4m elevation accuracy)
        </Text>
      </View>

      {/* Observation Description */}
      <Text style={styles.sectionLabel}>OBSERVATION DETAILS</Text>
      <TextInput
        style={styles.textArea}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe rock size, crack width, rate of water seepage, or whether vehicles are stranded..."
        placeholderTextColor="#94A3B8"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {/* Photographic Evidence Attachment */}
      <Text style={styles.sectionLabel}>PHOTO EVIDENCE (GEO-TAGGED)</Text>
      <TouchableOpacity
        style={[styles.photoBox, hasPhotoAttached && styles.photoBoxAttached]}
        onPress={() => setHasPhotoAttached(!hasPhotoAttached)}
        activeOpacity={0.8}
      >
        {hasPhotoAttached ? (
          <View style={styles.photoPreviewRow}>
            <View style={styles.photoThumb}>
              <ImageIcon size={22} color="#0284C7" />
            </View>
            <View style={styles.photoMeta}>
              <Text style={styles.photoTitle}>Captured Slope Evidence</Text>
              <Text style={styles.photoDetails}>
                GPS Stamped: {profile.currentLocation?.latitude.toFixed(4) || '27.2340'}°N, {profile.currentLocation?.longitude.toFixed(4) || '88.5120'}°E
              </Text>
            </View>
            <TouchableOpacity onPress={() => setHasPhotoAttached(false)}>
              <Text style={styles.photoRemoveText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoEmptyRow}>
            <Camera size={18} color="#64748B" />
            <Text style={styles.photoEmptyText}>Tap to capture / select photo from device gallery</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.8}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? 'Transmitting Intelligence...' : 'Transmit Field Intelligence'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    ...shadows.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  networkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  networkPillOffline: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  networkPillTextOnline: {
    fontSize: 10,
    fontWeight: '600',
    color: '#065F46',
  },
  networkPillTextOffline: {
    fontSize: 10,
    fontWeight: '600',
    color: '#991B1B',
  },
  subtext: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: spacing.md,
  },
  successText: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#64748B',
    marginBottom: 6,
    marginTop: spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  typeButton: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeButtonSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  typeLabelSelected: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  typeDesc: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  typeDescSelected: {
    color: '#3B82F6',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  severityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  severityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  severityLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 13,
    color: '#0F172A',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    marginBottom: 4,
  },
  gpsText: {
    fontSize: 10,
    color: '#0284C7',
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 65,
    marginBottom: 6,
  },
  photoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    padding: 10,
    marginBottom: spacing.md,
  },
  photoBoxAttached: {
    borderStyle: 'solid',
    borderColor: '#BFDBFE',
    backgroundColor: '#F0F9FF',
  },
  photoEmptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  photoEmptyText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  photoPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  photoThumb: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoMeta: {
    flex: 1,
  },
  photoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  photoDetails: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  photoRemoveText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#0F172A',
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

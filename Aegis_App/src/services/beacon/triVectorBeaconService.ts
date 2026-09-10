import AsyncStorage from '@react-native-async-storage/async-storage';
import { RescueBeacon, TriVectorBeaconState, BeaconTriageLevel, Coordinate } from '../../types';
import { NativeTorchController } from './nativeTorchController';
import { NativeAudioBeacon } from './nativeAudioBeacon';
import { TelemetryService } from '../telemetry/telemetryService';

const STORAGE_KEY = '@aegis_active_rescue_beacon';

type BeaconStateListener = (state: TriVectorBeaconState) => void;

/**
 * Tri-Vector Rescue Beacon Coordinator
 * 
 * Unifies:
 * - Optical Vector: Camera LED Flashlight Morse SOS Strobe
 * - Acoustic Vector: Loudspeaker Emergency Siren + Spoken Distress Announcement
 * - Radio Vector: Zero-Internet Proximity Beacon Payload + WebSocket Telemetry
 */
export class TriVectorBeaconService {
  private static currentState: TriVectorBeaconState = {
    isActive: false,
    isTorchActive: true,
    isSirenActive: true,
    isVoiceActive: true,
    isMuted: false,
    operatingMode: 'TURBO_CRITICAL',
    beaconId: 'BCN-CIV-INIT',
    triagePriority: 'CRITICAL_RED',
    broadcastIntervalMs: 8000,
    activeSeconds: 0,
  };

  private static secondTimer: any = null;
  private static telemetryTimer: any = null;
  private static listeners: Set<BeaconStateListener> = new Set();
  private static lastKnownBeacon: RescueBeacon | null = null;

  public static subscribe(listener: BeaconStateListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.currentState });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify(): void {
    const copy = { ...this.currentState };
    this.listeners.forEach((fn) => {
      try {
        fn(copy);
      } catch (e) {
        console.warn('[TriVectorBeaconService] Listener error:', e);
      }
    });
  }

  /**
   * Activates all three vectors of the rescue beacon
   */
  public static async activateBeacon(params: {
    userId?: string;
    fullName?: string;
    bloodGroup?: string;
    sosReason?: string;
    medicalNotes?: string;
    coordinate?: Coordinate;
    batteryLevel?: number;
    triagePriority?: BeaconTriageLevel;
    language?: 'EN' | 'HI' | 'GU';
    mode?: 'TURBO_CRITICAL' | 'ENDURANCE_SAVER';
  }): Promise<RescueBeacon> {
    const beaconId = `BCN-${Date.now().toString().slice(-6)}`;
    const operatingMode = params.mode || 'TURBO_CRITICAL';
    const intervalMs = operatingMode === 'TURBO_CRITICAL' ? 8000 : 16000;

    this.currentState = {
      isActive: true,
      isTorchActive: true,
      isSirenActive: true,
      isVoiceActive: true,
      isMuted: false,
      operatingMode,
      beaconId,
      triagePriority: params.triagePriority || 'CRITICAL_RED',
      broadcastIntervalMs: intervalMs,
      activeSeconds: 0,
    };

    const beaconRecord: RescueBeacon = {
      beaconId,
      userId: params.userId || 'usr_local_citizen',
      fullName: params.fullName || 'Disaster Evacuee',
      bloodGroup: params.bloodGroup || 'Unknown',
      triagePriority: params.triagePriority || 'CRITICAL_RED',
      sosReason: params.sosReason || 'Trapped Civilian Distress',
      medicalNotes: params.medicalNotes,
      coordinate: params.coordinate || { latitude: 22.3072, longitude: 73.1812 },
      batteryLevel: params.batteryLevel ?? 85,
      signalStrengthDbm: -45, // Initial immediate transmission power
      estimatedDistanceMeters: 1.5,
      proximityZone: 'IMMEDIATE',
      isActive: true,
      isTorchActive: true,
      isSirenActive: true,
      lastBroadcastTimestamp: Date.now(),
    };

    this.lastKnownBeacon = beaconRecord;

    // 1. Vector 1: Optical Hardware Camera Torch
    NativeTorchController.startMorseSos();

    // 2. Vector 2: Acoustic Loudspeaker Siren & Voice
    NativeAudioBeacon.startAudioBeacon({
      fullName: params.fullName,
      bloodGroup: params.bloodGroup,
      sosReason: params.sosReason,
      language: params.language || 'EN',
      cycleIntervalMs: intervalMs,
    });

    // 3. Vector 3: Radio Payload persistence in AsyncStorage
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(beaconRecord));
    } catch (e) {
      console.warn('[TriVectorBeaconService] Local cache notice:', e);
    }

    // 4. Send initial telemetry beacon packet via WebSocket
    this.broadcastRadioFrame(beaconRecord);

    // 5. Start elapsed timer
    if (this.secondTimer) clearInterval(this.secondTimer);
    this.secondTimer = setInterval(() => {
      this.currentState.activeSeconds += 1;
      this.notify();
    }, 1000);

    // 6. Periodic telemetry sync
    if (this.telemetryTimer) clearInterval(this.telemetryTimer);
    this.telemetryTimer = setInterval(() => {
      if (this.lastKnownBeacon && this.currentState.isActive) {
        this.broadcastRadioFrame(this.lastKnownBeacon);
      }
    }, intervalMs);

    this.notify();
    return beaconRecord;
  }

  /**
   * Broadcasts radio beacon frame via TelemetryService WebSocket
   */
  private static broadcastRadioFrame(beacon: RescueBeacon): void {
    try {
      TelemetryService.broadcastPosition({
        unitId: beacon.beaconId,
        name: `Rescue Beacon (${beacon.fullName})`,
        role: 'CIVILIAN',
        coordinate: beacon.coordinate,
        status: 'EVACUATING',
        targetCivilianId: beacon.userId,
      });
    } catch {}
  }

  /**
   * Toggles Camera Torch on/off
   */
  public static toggleTorch(): boolean {
    const nextState = !this.currentState.isTorchActive;
    this.currentState.isTorchActive = nextState;
    if (nextState) {
      if (this.currentState.operatingMode === 'TURBO_CRITICAL') {
        NativeTorchController.startRapidStrobe();
      } else {
        NativeTorchController.startMorseSos();
      }
    } else {
      NativeTorchController.stopTorch();
    }
    this.notify();
    return nextState;
  }

  /**
   * Toggles Master Audio Mute (silences both siren & speech instantly)
   */
  public static toggleMute(): boolean {
    const nextMute = !this.currentState.isMuted;
    this.currentState.isMuted = nextMute;
    NativeAudioBeacon.setMuted(nextMute);
    this.notify();
    return nextMute;
  }

  /**
   * Switches operating mode (Turbo vs Endurance)
   */
  public static setOperatingMode(mode: 'TURBO_CRITICAL' | 'ENDURANCE_SAVER'): void {
    this.currentState.operatingMode = mode;
    this.currentState.broadcastIntervalMs = mode === 'TURBO_CRITICAL' ? 8000 : 16000;

    if (this.currentState.isActive && this.currentState.isTorchActive) {
      if (mode === 'TURBO_CRITICAL') {
        NativeTorchController.startRapidStrobe();
      } else {
        NativeTorchController.startMorseSos();
      }
    }
    this.notify();
  }

  /**
   * Completely deactivates the Tri-Vector Beacon
   */
  public static async deactivateBeacon(): Promise<void> {
    this.currentState.isActive = false;
    this.currentState.isTorchActive = false;
    this.currentState.isSirenActive = false;
    this.currentState.activeSeconds = 0;

    // Stop hardware torch
    NativeTorchController.stopTorch();

    // Stop audio siren & speech
    NativeAudioBeacon.stopAudioBeacon();

    if (this.secondTimer) {
      clearInterval(this.secondTimer);
      this.secondTimer = null;
    }
    if (this.telemetryTimer) {
      clearInterval(this.telemetryTimer);
      this.telemetryTimer = null;
    }

    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {}

    this.notify();
  }

  public static getState(): TriVectorBeaconState {
    return { ...this.currentState };
  }

  public static getLastBeacon(): RescueBeacon | null {
    return this.lastKnownBeacon;
  }
}

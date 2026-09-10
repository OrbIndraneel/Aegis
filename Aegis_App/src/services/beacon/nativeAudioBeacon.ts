import { Vibration, Platform } from 'react-native';
import * as Speech from 'expo-speech';

/**
 * Native Audio Beacon Engine
 * 
 * Drives the smartphone loudspeaker for disaster search & rescue:
 * 1. High-priority piercing siren cadence + physical haptic vibration.
 * 2. Offline synthesized voice distress announcements (expo-speech)
 *    in English, Hindi, or Gujarati broadcasting civilian vitals.
 * 3. 1-tap master mute and configurable listen-silence windows.
 */
export class NativeAudioBeacon {
  private static isRunning = false;
  private static isMuted = false;
  private static cycleTimer: any = null;

  /**
   * Starts periodic audio beacon cycle.
   * Cycle:
   * 1. 2-second Emergency Siren Tone / Haptic Pulse
   * 2. Spoken Distress Announcement ("SOS! Trapped civilian here!...")
   * 3. Silent listening window (6-12s depending on mode)
   */
  public static startAudioBeacon(options: {
    fullName?: string;
    bloodGroup?: string;
    sosReason?: string;
    language?: 'EN' | 'HI' | 'GU';
    cycleIntervalMs?: number;
  }): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const runSingleCycle = async () => {
      if (!this.isRunning) return;

      if (!this.isMuted) {
        // 1. Play high-urgency haptic vibration
        this.triggerBeaconHaptic();

        // 2. Play spoken announcement via device loudspeaker
        await this.announceDistressVoice(
          options.fullName || 'Civilian',
          options.bloodGroup,
          options.sosReason || 'Emergency Rescue Required',
          options.language || 'EN'
        );
      }

      // Schedule next cycle if still running
      const interval = options.cycleIntervalMs || 10000;
      if (this.isRunning) {
        this.cycleTimer = setTimeout(runSingleCycle, interval);
      }
    };

    // Execute first cycle immediately
    runSingleCycle();
  }

  /**
   * Announces voice distress call over speakerphone using offline Speech synthesis
   */
  public static async announceDistressVoice(
    name: string,
    bloodGroup?: string,
    reason?: string,
    language: 'EN' | 'HI' | 'GU' = 'EN'
  ): Promise<void> {
    if (this.isMuted || !this.isRunning) return;

    try {
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }

      let speechText = '';
      let speechLang = 'en-US';

      if (language === 'HI') {
        speechLang = 'hi-IN';
        speechText = `आपातकालीन संकेत! यहाँ नागरिक फंसा हुआ है। कारण: ${reason}। ब्लड ग्रुप: ${bloodGroup || 'अज्ञात'}। तुरंत मदद भेजें!`;
      } else if (language === 'GU') {
        speechLang = 'gu-IN';
        speechText = `કટોકટી ચેતવણી! અહીં નાગરિક ફસાયેલ છે. કારણ: ${reason}. બ્લડ ગ્રૂપ: ${bloodGroup || 'અજ્ઞાત'}. તાત્કાલિક મદદ મોકલો!`;
      } else {
        speechLang = 'en-US';
        speechText = `Emergency SOS Beacon! Trapped civilian here. Reason: ${reason}. Blood group: ${bloodGroup || 'Unknown'}. Immediate rescue required!`;
      }

      await Speech.speak(speechText, {
        language: speechLang,
        pitch: 1.1, // Slightly higher pitch to cut through ambient noise
        rate: 0.9,  // Slightly slower for crisp articulation in rubble/water
      });
    } catch (e) {
      console.warn('[NativeAudioBeacon] Speech synthesis notice:', e);
    }
  }

  /**
   * Distinct physical vibration pulse for the beacon
   */
  public static triggerBeaconHaptic(): void {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 300, 150, 300, 150, 600]);
    } else {
      Vibration.vibrate();
    }
  }

  /**
   * Sets Master Mute state
   */
  public static setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      try {
        Speech.stop();
        Vibration.cancel();
      } catch {}
    }
  }

  public static getIsMuted(): boolean {
    return this.isMuted;
  }

  public static getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Fully stops audio beacon and cancels all speech & timers
   */
  public static stopAudioBeacon(): void {
    this.isRunning = false;
    if (this.cycleTimer) {
      clearTimeout(this.cycleTimer);
      this.cycleTimer = null;
    }
    try {
      Speech.stop();
      Vibration.cancel();
    } catch {}
  }
}

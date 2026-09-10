import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

/**
 * Voice Guidance Service
 * 
 * Provides offline turn-by-turn spoken navigation guidance during active evacuations.
 * Uses native expo-speech on iOS and Android devices, with Web Speech API fallback on web browsers.
 */
export class VoiceGuidanceService {
  private static isEnabled = false;

  static setVoiceGuidanceEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopSpeaking();
    }
  }

  static isVoiceGuidanceEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Speaks turn-by-turn evacuation instructions over device loudspeaker
   */
  static async speakInstruction(text: string): Promise<void> {
    if (!this.isEnabled || !text) return;

    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.95;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } else {
        // Native Android & iOS using expo-speech
        const isSpeaking = await Speech.isSpeakingAsync();
        if (isSpeaking) {
          await Speech.stop();
        }
        await Speech.speak(text, {
          rate: 0.92,
          pitch: 1.05,
          language: 'en-US',
        });
      }
    } catch (err) {
      console.warn('[VoiceGuidanceService] Speech error:', err);
    }
  }

  static stopSpeaking(): void {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } else {
        Speech.stop();
      }
    } catch (err) {}
  }
}

import { Platform } from 'react-native';

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
   * Speaks turn-by-turn instruction when Voice Guidance is enabled by the user.
   */
  static speakInstruction(text: string): void {
    if (!this.isEnabled || !text) return;

    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // cancel any previous turn phrase
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95; // Clear, deliberate speed for stress situations
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('Voice guidance speech synthesis error:', err);
    }
  }

  static stopSpeaking(): void {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (err) {
      // ignore
    }
  }
}

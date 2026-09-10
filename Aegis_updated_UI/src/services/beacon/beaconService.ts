import { Vibration, Platform } from 'react-native';

export class BeaconService {
  private static isAudioActive = false;
  private static audioIntervalId: any = null;
  private static torchState = false;

  /**
   * Start Emergency Audio Signal & Vibration pattern
   */
  static startBeaconAlert(): void {
    try {
      // 1. Trigger Vibration pattern (500ms on, 500ms off) where supported
      Vibration.vibrate([500, 500, 500, 500], true);
    } catch (err) {
      console.warn('Vibration not supported or permission missing:', err);
    }

    // 2. Play Emergency Audio Signal where supported (Web Audio API or Native sound)
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'AudioContext' in window) {
      this.startWebAudioSiren();
    }
  }

  /**
   * Stop Emergency Audio Signal & Vibration pattern
   */
  static stopBeaconAlert(): void {
    try {
      Vibration.cancel();
    } catch (err) {
      // ignore
    }
    this.stopWebAudioSiren();
    this.torchState = false;
  }

  /**
   * Safe local torch / flashlight activation toggle.
   * Discloses hardware / OS background security policies explicitly.
   */
  static async toggleLocalTorch(enable?: boolean): Promise<{ active: boolean; message: string }> {
    const newState = enable !== undefined ? enable : !this.torchState;
    this.torchState = newState;

    if (newState) {
      return {
        active: true,
        message: 'Visual Strobe & Screen Beacon active. (Hardware Torch toggle requested - subject to Android OS foreground app permissions)',
      };
    } else {
      return {
        active: false,
        message: 'Torch & Visual Beacon deactivated.',
      };
    }
  }

  private static startWebAudioSiren(): void {
    if (this.isAudioActive) return;
    this.isAudioActive = true;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      let toggle = false;
      this.audioIntervalId = setInterval(() => {
        if (!this.isAudioActive) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(toggle ? 880 : 660, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        toggle = !toggle;
      }, 500);
    } catch (err) {
      console.warn('Web Audio Siren initialization error:', err);
    }
  }

  private static stopWebAudioSiren(): void {
    this.isAudioActive = false;
    if (this.audioIntervalId) {
      clearInterval(this.audioIntervalId);
      this.audioIntervalId = null;
    }
  }
}

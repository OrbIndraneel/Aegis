import { Vibration, Platform } from 'react-native';

/**
 * Emergency Alert Audio & Haptic Siren Engine
 * 
 * Provides life-critical multi-burst haptic vibration patterns on native devices
 * and standard Web Audio API oscillator modulation for web browsers.
 * Safe across all platforms with zero crashing.
 */
class EmergencyAlertEngine {
  private static isSirenActive = false;
  private static webAudioCtx: any = null;
  private static webOscillator: any = null;

  /**
   * Triggers high-priority emergency pulse cadence:
   * Pattern: SOS Morse Code / Critical Warning rhythm
   */
  public static triggerCriticalHapticPulse(): void {
    if (Platform.OS === 'android') {
      // 0ms delay, 600ms vibe, 200ms pause, 600ms vibe, 200ms pause, 1200ms vibe
      Vibration.vibrate([0, 600, 200, 600, 200, 1200]);
    } else if (Platform.OS === 'ios') {
      // iOS triggers 1-second pulse
      Vibration.vibrate();
    }
  }

  /**
   * Starts synthesized emergency siren tone.
   * On Web: Uses Web Audio oscillator alternating 880Hz / 660Hz warble.
   * On Native: Triggers repeated emergency vibration cadence.
   */
  public static startEmergencySiren(): void {
    if (this.isSirenActive) return;
    this.isSirenActive = true;

    // 1. Native Vibration
    this.triggerCriticalHapticPulse();

    // 2. Web Audio Synthesizer
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.webAudioCtx = new AudioCtx();
          const osc = this.webAudioCtx.createOscillator();
          const gain = this.webAudioCtx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, this.webAudioCtx.currentTime);

          // Warble effect between 880Hz and 660Hz every 300ms
          let high = true;
          const interval = setInterval(() => {
            if (!this.isSirenActive || !this.webAudioCtx) {
              clearInterval(interval);
              return;
            }
            try {
              osc.frequency.setValueAtTime(high ? 660 : 880, this.webAudioCtx.currentTime);
              high = !high;
            } catch {}
          }, 300);

          gain.gain.setValueAtTime(0.15, this.webAudioCtx.currentTime); // Safe pleasant demo volume
          osc.connect(gain);
          gain.connect(this.webAudioCtx.destination);
          osc.start();
          this.webOscillator = osc;
        }
      } catch (e) {
        console.warn('[EmergencyAlertEngine] Web audio initialization skipped:', e);
      }
    }
  }

  /**
   * Stops active siren and vibration.
   */
  public static stopEmergencySiren(): void {
    this.isSirenActive = false;
    Vibration.cancel();

    if (this.webOscillator) {
      try {
        this.webOscillator.stop();
        this.webOscillator.disconnect();
      } catch {}
      this.webOscillator = null;
    }

    if (this.webAudioCtx) {
      try {
        this.webAudioCtx.close();
      } catch {}
      this.webAudioCtx = null;
    }
  }
}

export const triggerCriticalHapticPulse = () => EmergencyAlertEngine.triggerCriticalHapticPulse();
export const startEmergencySiren = () => EmergencyAlertEngine.startEmergencySiren();
export const stopEmergencySiren = () => EmergencyAlertEngine.stopEmergencySiren();

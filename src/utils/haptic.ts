import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Trigger haptic feedback using Capacitor Haptics API.
 * Falls back to navigator.vibrate on unsupported platforms.
 */
export async function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  const styleMap: Record<string, ImpactStyle> = {
    light: ImpactStyle.Light,
    medium: ImpactStyle.Medium,
    heavy: ImpactStyle.Heavy,
  };

  try {
    await Haptics.impact({ style: styleMap[style] });
  } catch {
    // Fallback for web
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const patterns: Record<string, number[]> = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30],
      };
      navigator.vibrate(patterns[style] || [10]);
    }
  }
}

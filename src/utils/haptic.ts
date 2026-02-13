/**
 * Trigger haptic feedback on mobile devices.
 * Falls back silently on unsupported devices.
 */
export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  const patterns: Record<string, number[]> = {
    light: [10],
    medium: [20],
    heavy: [30, 10, 30],
  };
  navigator.vibrate(patterns[style] || [10]);
}

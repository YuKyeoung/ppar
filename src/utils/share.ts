/**
 * Share game results using the Web Share API.
 * Falls back to clipboard copy on unsupported browsers.
 */
export async function shareResult(data: {
  gameName: string;
  rankings: { name: string; score: number; emoji: string }[];
  loserName: string;
}): Promise<'shared' | 'copied' | 'failed'> {
  const lines = [
    `☕ Coffee Derby — ${data.gameName}`,
    '',
    ...data.rankings.map(
      (r, i) => `${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} ${r.emoji} ${r.name}: ${r.score}점`
    ),
    '',
    `💬 ${data.loserName}, 커피 사세요! ☕`,
  ];
  const text = lines.join('\n');

  // Try Web Share API first (mobile browsers)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: 'Coffee Derby 결과', text });
      return 'shared';
    } catch {
      // User cancelled or error — fall through to clipboard
    }
  }

  // Fallback: copy to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return 'copied';
    } catch {
      return 'failed';
    }
  }

  return 'failed';
}

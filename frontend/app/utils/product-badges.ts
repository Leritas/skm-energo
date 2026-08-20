const MARKETING_BADGE_SET = new Set<string>(['new', 'onRequest']);

export function derivePublicProductBadges(
  storedBadges: readonly string[],
  hasDocuments: boolean,
): string[] {
  const marketing = storedBadges.filter((badge) =>
    MARKETING_BADGE_SET.has(badge),
  );
  return hasDocuments ? [...marketing, 'pdf'] : marketing;
}

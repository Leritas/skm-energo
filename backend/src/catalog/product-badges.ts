import {
  PRODUCT_MARKETING_BADGES,
} from '../media/media.constants';

const MARKETING_BADGE_SET = new Set<string>(PRODUCT_MARKETING_BADGES);

export function stripDerivedPdfBadge(badges: readonly string[]): string[] {
  return badges.filter((badge) => badge !== 'pdf');
}

export function derivePublicProductBadges(
  storedBadges: readonly string[],
  hasDocuments: boolean,
): string[] {
  const marketing = stripDerivedPdfBadge(storedBadges).filter((badge) =>
    MARKETING_BADGE_SET.has(badge),
  );
  return hasDocuments ? [...marketing, 'pdf'] : marketing;
}

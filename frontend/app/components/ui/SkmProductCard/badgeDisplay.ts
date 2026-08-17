import type { SkmBadgeTone } from '../SkmBadge/types';
import type { SkmProductCardBadge } from './types';

export function toProductCardBadges(
  badges: string[] | undefined,
): SkmProductCardBadge[] {
  if (!badges?.length) {
    return [];
  }
  return badges.filter(
    (badge): badge is SkmProductCardBadge =>
      badge === 'pdf' || badge === 'new' || badge === 'onRequest',
  );
}

export function productBadgeLabel(badge: SkmProductCardBadge): string {
  switch (badge) {
    case 'pdf':
      return 'PDF';
    case 'onRequest':
      return 'Под заказ';
    case 'new':
      return 'Новинка';
    default: {
      const _exhaustive: never = badge;
      return _exhaustive;
    }
  }
}

export function productBadgeTone(badge: SkmProductCardBadge): SkmBadgeTone {
  switch (badge) {
    case 'pdf':
      return 'neutral';
    case 'onRequest':
      return 'warning';
    case 'new':
      return 'accent';
    default: {
      const _exhaustive: never = badge;
      return _exhaustive;
    }
  }
}

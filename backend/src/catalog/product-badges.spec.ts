import {
  derivePublicProductBadges,
  stripDerivedPdfBadge,
} from './product-badges';

describe('product-badges', () => {
  describe('stripDerivedPdfBadge', () => {
    it('removes pdf from stored badges', () => {
      expect(stripDerivedPdfBadge(['new', 'pdf', 'onRequest'])).toEqual([
        'new',
        'onRequest',
      ]);
    });
  });

  describe('derivePublicProductBadges', () => {
    it('adds pdf when documents exist', () => {
      expect(derivePublicProductBadges(['new'], true)).toEqual(['new', 'pdf']);
    });

    it('omits pdf when there are no documents', () => {
      expect(derivePublicProductBadges(['new'], false)).toEqual(['new']);
    });

    it('ignores stored pdf and unknown badges on read', () => {
      expect(derivePublicProductBadges(['pdf', 'new', 'sale'], true)).toEqual([
        'new',
        'pdf',
      ]);
    });
  });
});

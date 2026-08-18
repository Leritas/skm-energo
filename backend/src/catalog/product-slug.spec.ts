import { nextUniqueProductSlug, slugifyProductTitle } from './product-slug';

describe('slugifyProductTitle', () => {
  it('transliterates a Russian title into a kebab slug', () => {
    expect(slugifyProductTitle('Предохранитель NH00 160A')).toBe(
      'predohranitel-nh00-160a',
    );
  });

  it('falls back to product when the title has no usable characters', () => {
    expect(slugifyProductTitle('!!!')).toBe('product');
  });
});

describe('nextUniqueProductSlug', () => {
  it('keeps the base slug when it is free', () => {
    expect(nextUniqueProductSlug('nh00-160a', new Set(['other']))).toBe(
      'nh00-160a',
    );
  });

  it('appends an increment when the base slug is taken', () => {
    expect(
      nextUniqueProductSlug(
        'nh00-160a',
        new Set(['nh00-160a', 'nh00-160a-2']),
      ),
    ).toBe('nh00-160a-3');
  });
});

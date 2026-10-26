import { expect, it } from 'vitest';
import { filterByCategory } from './category-filter';
it('combines category and trimmed case-insensitive search without changing source selection', () => {
  const items = [
    { name: 'Ivory', groups: ['warm', 'soft'], selected: true },
    { name: 'Black', groups: ['neutral'], selected: false },
  ];
  const filter = (category: string, query = '') =>
    filterByCategory(
      items,
      category,
      (i) => i.groups,
      query,
      (i) => i.name,
    );
  expect(filter('all')).toEqual(items);
  expect(filter('soft', ' IV ')).toEqual([items[0]]);
  expect(filter('neutral', 'iv')).toEqual([]);
  expect(filter('warm')).toEqual([items[0]]);
  expect(items[0]!.selected).toBe(true);
});

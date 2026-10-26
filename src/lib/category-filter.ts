/** Category and text predicates are independent of selector state and presentation. */
export function filterByCategory<T>(
  items: readonly T[],
  category: string,
  categories: (item: T) => readonly string[],
  query = '',
  searchableText: (item: T) => string = () => '',
): T[] {
  const text = query.trim().toLocaleLowerCase();
  return items.filter(
    (item) =>
      (category === 'all' || categories(item).includes(category)) &&
      searchableText(item).toLocaleLowerCase().includes(text),
  );
}

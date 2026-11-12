export function formatBigIntResults<T extends Record<string, unknown>>(
  results: T[] | null | undefined
): Record<string, unknown>[] {
  if (!Array.isArray(results)) return [];

  return results.map((item) => {
    if (!item) return item;

    const formattedItem: Record<string, unknown> = {};
    Object.keys(item).forEach((key) => {
      const value = item[key];
      if (typeof value === "bigint") {
        formattedItem[key] = Number(value);
      } else {
        formattedItem[key] = value;
      }
    });
    return formattedItem;
  });
}

/** Parse a route segment containing a positive, safe integer page number. */
export function parsePositivePageNumber(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;

  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : null;
}

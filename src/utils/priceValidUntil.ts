export function getPriceValidUntil(days = 2): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

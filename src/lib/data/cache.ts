import { unstable_cache } from "next/cache";

export interface CachedQueryOptions {
  revalidate: number;
  tags: string[];
}

/**
 * Wraps a Prisma-backed async query in Next.js `unstable_cache`.
 *
 * - `name` must be unique per data function; it becomes part of the cache key.
 * - Runtime arguments are automatically serialized into the cache key, so a
 *   single cached function may serve many distinct inputs.
 * - The wrapped function throws on DB error (it is never swallowed here);
 *   pages keep their own try/catch / `notFound()` semantics.
 */
export function cachedQuery<Args extends unknown[], T>(
  name: string,
  query: (...args: Args) => Promise<T>,
  opts: CachedQueryOptions
): (...args: Args) => Promise<T> {
  const cached = unstable_cache(query, [name], opts);
  return (...args: Args): Promise<T> => cached(...args);
}

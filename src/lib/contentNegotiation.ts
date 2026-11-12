export interface AcceptEntry {
  type: string;
  subtype: string;
  q: number;
  specificity: number;
}

// Ordered by default preference: wildcard-only requests resolve to HTML.
const TYPES_WE_CAN_PRODUCE = ["text/html", "text/markdown"] as const;

export function parseAccept(header: string | null | undefined): AcceptEntry[] {
  if (!header) return [];

  return header
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [typeRange, ...params] = part.split(";");
      const [type, subtype] = typeRange.trim().toLowerCase().split("/");
      let q = 1;

      for (const param of params) {
        const [key, value] = param.split("=").map((s) => s.trim());
        if (key === "q") {
          const parsed = Number.parseFloat(value);
          if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
        }
      }

      const isWildcardType = type === "*";
      const specificity = (isWildcardType ? 0 : 2) + (!isWildcardType && subtype === "*" ? -1 : 0);

      return { type, subtype, q, specificity };
    });
}

function matchScore(entry: AcceptEntry, producible: string): number {
  const [pType, pSubtype] = producible.split("/");
  if (entry.type !== "*" && entry.type !== pType) return -1;
  if (entry.subtype !== "*" && entry.subtype !== pSubtype) return -1;
  // More specific entries match more strongly; prefer exact > subtype wildcard > full wildcard
  if (entry.type === pType && entry.subtype === pSubtype) return 3;
  if (entry.type === "*" && entry.subtype === "*") return 1;
  return 2;
}

/**
 * Decide which representation to serve based on an Accept header,
 * following RFC 9110 server-driven negotiation:
 * rank by q-value, break ties by specificity.
 * Returns the producible media type to serve, or null when nothing matches
 * (caller should respond 406 Not Acceptable).
 */
export function negotiate(
  header: string | null | undefined,
  producibleTypes: readonly string[] = TYPES_WE_CAN_PRODUCE
): string | null {
  const entries = parseAccept(header).filter((e) => e.q > 0);
  if (!header || !header.trim() || parseAccept(header).length === 0) {
    // No usable Accept info: default representation
    return "text/html";
  }
  if (entries.length === 0) {
    // Client explicitly rejected everything we can produce
    return null;
  }

  let best: { type: string; q: number; score: number } | null = null;

  for (const entry of entries) {
    for (const producible of producibleTypes) {
      const score = matchScore(entry, producible);
      if (score < 0) continue;
      if (!best || entry.q > best.q || (entry.q === best.q && score > best.score)) {
        best = { type: producible, q: entry.q, score };
      }
    }
  }

  return best ? best.type : null;
}

/** True when the client explicitly prefers markdown over HTML. */
export function prefersMarkdown(header: string | null | undefined): boolean {
  return negotiate(header) === "text/markdown";
}

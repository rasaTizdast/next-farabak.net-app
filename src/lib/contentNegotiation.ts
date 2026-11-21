export interface AcceptEntry {
  type: string;
  subtype: string;
  q: number;
  specificity: number;
  parameters: Record<string, string>;
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
      const parameters: Record<string, string> = {};
      let beforeQuality = true;

      for (const param of params) {
        const [key, value] = param.split("=").map((s) => s.trim());
        if (key.toLowerCase() === "q") {
          beforeQuality = false;
          const parsed = Number.parseFloat(value);
          if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
        } else if (beforeQuality && key) {
          parameters[key.toLowerCase()] = value?.replace(/^"|"$/g, "").toLowerCase() ?? "";
        }
      }

      const isWildcardType = type === "*";
      const specificity = (isWildcardType ? 0 : 2) + (!isWildcardType && subtype === "*" ? -1 : 0);

      return { type, subtype, q, specificity, parameters };
    });
}

function matches(entry: AcceptEntry, producible: string): boolean {
  const [pType, pSubtype] = producible.split("/");
  if (
    Object.entries(entry.parameters).some(([key, value]) => key !== "charset" || value !== "utf-8")
  ) {
    return false;
  }
  if (entry.type === "*") return entry.subtype === "*";
  return entry.type === pType && (entry.subtype === "*" || entry.subtype === pSubtype);
}

/**
 * Decide which representation to serve based on an Accept header,
 * following RFC 9110 server-driven negotiation:
 * Each available type inherits the quality of its most specific matching range.
 * Returns the producible media type to serve, or null when nothing matches
 * (caller should respond 406 Not Acceptable).
 */
export function negotiate(
  header: string | null | undefined,
  producibleTypes: readonly string[] = TYPES_WE_CAN_PRODUCE
): string | null {
  const entries = parseAccept(header);
  if (entries.length === 0) return producibleTypes[0] ?? null;

  const matchingRanges = entries
    .map((entry, index) => ({ ...entry, index }))
    .sort((a, b) => b.specificity - a.specificity || b.q - a.q || a.index - b.index);

  const choices = producibleTypes.flatMap((type) => {
    const range = matchingRanges.find((entry) => matches(entry, type));
    return range && range.q > 0 ? [{ ...range, type }] : [];
  });
  choices.sort((a, b) => b.q - a.q || b.specificity - a.specificity || a.index - b.index);

  return choices[0]?.type ?? null;
}

/** True when the client explicitly prefers markdown over HTML. */
export function prefersMarkdown(header: string | null | undefined): boolean {
  return negotiate(header) === "text/markdown";
}

import type { AdvisorSpecNormalizer, NormalizedAdvisorSpec } from "./types";

function normalizeLabel(value: string) {
  return value.trim().toLocaleLowerCase("fa-IR").replace(/\s+/g, " ");
}

export function normalizeAdvisorSpecs(
  rows: readonly { Name: string | null; Title: string | null; Description: string | null }[],
  normalizers: readonly AdvisorSpecNormalizer[]
): NormalizedAdvisorSpec[] {
  return normalizers.flatMap((normalizer) => {
    const match = rows.find((row) => {
      const label = normalizeLabel(row.Name ?? row.Title ?? "");
      return normalizer.sourceLabels.some((sourceLabel) =>
        label.includes(normalizeLabel(sourceLabel))
      );
    });

    const value = match?.Description?.trim();
    if (!match || !value) return [];

    return [
      {
        key: normalizer.key,
        label: normalizer.label,
        value,
        sourceLabel: match.Name ?? match.Title ?? normalizer.label,
      },
    ];
  });
}

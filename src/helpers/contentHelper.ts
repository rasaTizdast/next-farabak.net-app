export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingIssue {
  level: HeadingLevel;
  text: string;
  message: string;
}

export interface HeadingValidationResult {
  isValid: boolean;
  issues: HeadingIssue[];
}

/**
 * Validates heading hierarchy for a page:
 * - Exactly one H1
 * - No skipped heading levels (e.g. H2 -> H4)
 */
export function validateHeadingHierarchy(
  headings: Array<{ level: HeadingLevel; text: string }>
): HeadingValidationResult {
  const issues: HeadingIssue[] = [];

  const h1Count = headings.filter((h) => h.level === 1).length;
  if (h1Count === 0) {
    issues.push({ level: 1, text: "", message: "صفحه هیچ تگ h1 ندارد" });
  } else if (h1Count > 1) {
    issues.push({
      level: 1,
      text: "",
      message: `صفحه بیش از یک تگ h1 دارد (${h1Count} عدد)`,
    });
  }

  let previousLevel: HeadingLevel | null = null;
  for (const { level, text } of headings) {
    if (previousLevel !== null && level > previousLevel + 1) {
      issues.push({
        level,
        text,
        message: `سطح هدینگ از h${previousLevel} به h${level} جهش داشته است`,
      });
    }
    previousLevel = level;
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

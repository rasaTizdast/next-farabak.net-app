export function formatTitle(baseTitle: string, maxLimit: number = 60): string {
  const suffix = " | فرابک";
  const maxTitleLength = maxLimit - suffix.length;

  // Truncate the title if necessary
  const truncatedTitle =
    baseTitle.length > maxTitleLength
      ? baseTitle.substring(0, maxTitleLength - 3) + "..." // Add ellipsis if truncated
      : baseTitle;

  return truncatedTitle + suffix;
}

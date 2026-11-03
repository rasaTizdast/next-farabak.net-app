import { briefFields, projectCategories, type ProjectBriefInput } from "./types";

const preliminaryNote =
  "این شرح پروژه برای گفت‌وگوی اولیه تهیه شده است و مشخصات نهایی، تعهد عملکرد یا تأییدیه انطباق محسوب نمی‌شود. انتخاب تجهیزات و طراحی نهایی به بررسی شرایط واقعی پروژه نیاز دارد.";

export function buildProjectBrief(input: ProjectBriefInput): string {
  const categoryLabel = projectCategories.find((item) => item.value === input.category)?.label;
  const lines = ["شرح اولیه پروژه", ""];

  if (categoryLabel) lines.push(`دسته پروژه: ${categoryLabel}`);
  if (input.needDescription.trim()) lines.push(`شرح نیاز: ${input.needDescription.trim()}`);

  for (const field of briefFields) {
    if (field.category && field.category !== input.category) continue;
    const value = input[field.key].trim();
    if (value) lines.push(`${field.label}: ${value}`);
  }

  lines.push("", preliminaryNote);
  return lines.join("\n");
}

export { preliminaryNote };

import { advisorCategoryDefinitions } from "./category-definitions";
import type { AdvisorAnswer } from "./types";

export function summarizeAdvisorAnswers(categorySlug: string, answers: readonly AdvisorAnswer[]) {
  const definition = advisorCategoryDefinitions[categorySlug];
  if (!definition) return [];

  return definition.questions.flatMap((question) => {
    const answer = answers.find((item) => item.questionId === question.id);
    if (!answer) return [];
    const selectedValues = Array.isArray(answer.value) ? answer.value : [answer.value];
    const labels = selectedValues.map((value) => {
      if (value === "unknown") return "نمی‌دانم";
      return question.options.find((option) => option.id === value)?.label ?? "ثبت نشده";
    });

    return [{ question: question.label, answer: labels.join("، ") }];
  });
}

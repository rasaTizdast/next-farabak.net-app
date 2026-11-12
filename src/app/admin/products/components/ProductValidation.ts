import { Product } from "../types";

export type FAQItem = {
  question: string;
  answer: string;
};

export type ValidationRule = {
  required: boolean;
  maxLength?: number;
  regex?: RegExp | null;
  errorMsg: {
    required: string;
    maxLength?: string;
    regex?: string;
  };
};

export const validationRules: Record<string, ValidationRule> = {
  Name: {
    required: true,
    maxLength: 1000,
    regex: null,
    errorMsg: {
      required: "نام الزامی است",
      maxLength: "نام محصول نمیتواند بیشتر از ۱۰۰۰ کارکتر باشد.",
    },
  },
  productSlug: {
    required: true,
    maxLength: 1200,
    regex: /^[a-zA-Z0-9_-]+$/,
    errorMsg: {
      required: "شناسه محصول الزامی است",
      maxLength: "شناسه محصول نمیتواند بیشتر از ۱۲۰۰ کارکتر باشد.",
      regex: "شناسه محصول فقط می‌تواند شامل حروف انگلیسی، اعداد، خط فاصله و زیرخط باشد.",
    },
  },
  Description: {
    required: true,
    maxLength: 1000,
    regex: null,
    errorMsg: {
      required: "توضیح کوتاه الزامی است",
      maxLength: "توضیح کوتاه نمیتواند بیشتر از ۱۰۰۰ کارکتر باشد.",
    },
  },
  SEO_Title: {
    required: true,
    maxLength: 60,
    regex: null,
    errorMsg: {
      required: "تیتر سئو الزامی است",
      maxLength: "تیتر سئو نباید بیشتر از ۶۰ کارکتر باشد.",
    },
  },
  SEO_Description: {
    required: true,
    maxLength: 4000,
    regex: null,
    errorMsg: {
      required: "توضیحات سئو الزامی است",
      maxLength: "توضیحات سئو نباید بیشتر از ۴۰۰۰ کارکتر باشد.",
    },
  },
  Price: {
    required: false,
    regex: /^\d+(\.\d{1,2})?$/,
    errorMsg: {
      required: "قیمت الزامی است",
      regex: "قیمت باید یک عدد معتبر باشد (حداکثر ۲ رقم اعشار).",
    },
  },
  Discount: {
    required: false,
    regex: /^\d+(\.\d{1,2})?$/,
    errorMsg: {
      required: "",
      regex: "تخفیف باید یک عدد معتبر باشد (حداکثر ۲ رقم اعشار).",
    },
  },
};

export function validateField(fieldName: string, value: unknown): string | null {
  const rule = validationRules[fieldName];
  if (!rule) return null;

  if (typeof value === "object" || Array.isArray(value) || typeof value === "boolean") {
    return null;
  }

  if (rule.required && (!value || value.toString().trim() === "")) {
    return rule.errorMsg.required;
  }

  if (value) {
    const stringValue = value.toString();

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return rule.errorMsg.maxLength || null;
    }

    if (rule.regex && !rule.regex.test(stringValue)) {
      return rule.errorMsg.regex || null;
    }
  }

  return null;
}

export function deriveFaqErrors(faqs: FAQItem[]): { [key: string]: string } {
  if (faqs.length === 0) return {};
  const errors: { [key: string]: string } = {};
  faqs.forEach((faq, index) => {
    if (!faq.question.trim()) {
      errors[`question-${index}`] = "سوال نمی‌تواند خالی باشد.";
    } else if (faq.question.length > 1000) {
      errors[`question-${index}`] = "سوال نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد.";
    }
    if (!faq.answer.trim()) {
      errors[`answer-${index}`] = "پاسخ نمی‌تواند خالی باشد.";
    } else if (faq.answer.length > 3000) {
      errors[`answer-${index}`] = "پاسخ نمی‌تواند بیشتر از ۳۰۰۰ کاراکتر باشد.";
    }
  });
  return errors;
}

export function validateProductForm(formState: Product | null): string | null {
  if (!formState) return "فرم خالی است";

  for (const [fieldName] of Object.entries(validationRules)) {
    const value = formState[fieldName as keyof Product];
    const error = validateField(fieldName, value);
    if (error) return error;
  }

  if (+formState.Price < +formState.Discount) {
    return "مقدار تخفیف نباید بیشتر از قیمت محصول باشد.";
  }

  if (formState.CategoryContentIds.length === 0) {
    return "محصول باید حداقل یک زیر دسته‌بندی داشته باشد.";
  }

  const isValidSubcategories = formState.CategoryContentIds.every(
    (subcategory) => subcategory.CategoryContentId !== 0
  );
  if (!isValidSubcategories) {
    return "یک یا چند زیر دسته‌بندی معتبر انتخاب نشده است.";
  }

  return null;
}

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

export function validateField(fieldName: string, value: any): string | null {
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
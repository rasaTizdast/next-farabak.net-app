"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  ReactNode,
} from "react";

// ============================================
// Types
// ============================================

export type Category = {
  CategoryID: number;
  Name: string;
  Available: boolean;
  Subcategories: { CategoryContentId: number; Name: string }[];
};

export type OverviewDetail = {
  ProductOverviewDetailsId: number;
  Title: string;
  Img: string;
  Description: string;
  selected: boolean;
};

export type Spec = {
  title: string;
  description: string;
};

export type FAQ = {
  question: string;
  answer: string;
};

export type WizardState = {
  // Base Details
  name: string;
  slug: string;
  categoryID: number | null;
  subCategoryID: string;
  available: boolean;
  price: number;
  discount: number;
  smallDesc: string;
  bannerImage: File | null;
  transparentImage: File | null;
  SEO_Title: string;
  SEO_Description: string;
  keywords: string;

  // Product Overview
  features: string[];

  // Overview Details
  overviewDetails: OverviewDetail[];

  // Product Blog
  productBlog: string;

  // Specs
  specs: Spec[];

  // FAQs
  faqs: FAQ[];
};

export type WizardErrors = {
  [key: string]: string;
};

export type TouchedFields = {
  [key: string]: boolean;
};

export type OpenSections = {
  baseDetails: boolean;
  productOverview: boolean;
  overviewDetails: boolean;
  productBlog: boolean;
  specs: boolean;
  faq: boolean;
  preview: boolean;
};

export type WizardActions = {
  // Field updates
  setField: <K extends keyof WizardState>(field: K, value: WizardState[K]) => void;
  setFeatures: (features: string[]) => void;
  setOverviewDetails: (details: OverviewDetail[]) => void;
  setProductBlog: (blog: string) => void;
  setSpecs: (specs: Spec[]) => void;
  setFaqs: (faqs: FAQ[]) => void;

  // Validation
  validateField: <K extends keyof WizardState>(field: K, value: WizardState[K]) => string;
  validateAllFields: () => WizardErrors;
  setTouchedField: (field: string, touched: boolean) => void;
  setErrors: (errors: WizardErrors | ((prev: WizardErrors) => WizardErrors)) => void;

  // Section management
  toggleSection: (section: keyof OpenSections) => void;
  setOpenSections: (sections: Partial<OpenSections>) => void;

  // Submission
  submitForm: () => Promise<void>;
  setHasSubmitted: (submitted: boolean) => void;

  // Progress modal
  setProgress: (progress: number) => void;
  setCurrentStep: (step: number) => void;
  setModalVisible: (visible: boolean) => void;

  // Overview details modal
  setShowOverviewDetailsModal: (visible: boolean) => void;
};

export type WizardMeta = {
  categories: Category[];
  refetchProducts: () => void;
  setShowNewProductModal: (visible: boolean) => void;
};

export type WizardContextValue = {
  state: WizardState;
  errors: WizardErrors;
  touchedFields: TouchedFields;
  openSections: OpenSections;
  hasSubmitted: boolean;
  progress: number;
  currentStep: number;
  isModalVisible: boolean;
  showOverviewDetailsModal: boolean;
  actions: WizardActions;
  meta: WizardMeta;
};

// ============================================
// Initial State
// ============================================

const initialState: WizardState = {
  name: "",
  slug: "",
  categoryID: null,
  subCategoryID: "",
  available: true,
  price: 0,
  discount: 0,
  smallDesc: "",
  bannerImage: null,
  transparentImage: null,
  SEO_Title: "",
  SEO_Description: "",
  keywords: "",
  features: [],
  overviewDetails: [],
  productBlog: "",
  specs: [],
  faqs: [],
};

const initialOpenSections: OpenSections = {
  baseDetails: true,
  productOverview: false,
  overviewDetails: false,
  productBlog: false,
  specs: false,
  faq: false,
  preview: false,
};

// ============================================
// Validation Rules
// ============================================

type ValidationRule = {
  required: boolean;
  maxLength?: number;
  regex?: RegExp | null;
  errorMsg: {
    required: string;
    maxLength?: string;
    regex?: string;
  };
};

const validationRules: Record<string, ValidationRule> = {
  name: {
    required: true,
    maxLength: 1000,
    regex: null,
    errorMsg: {
      required: "نام الزامی است",
      maxLength: "نام محصول نمیتواند بیشتر از ۱۰۰۰ کارکتر باشد.",
      regex: "",
    },
  },
  slug: {
    required: true,
    maxLength: 1200,
    regex: /^[a-zA-Z0-9_-]+$/,
    errorMsg: {
      required: "شناسه محصول الزامی است",
      maxLength: "شناسه محصول نمیتواند بیشتر از ۱۲۰۰ کارکتر باشد.",
      regex: "شناسه محصول فقط می‌تواند شامل حروف انگلیسی، اعداد، خط فاصله و زیرخط باشد.",
    },
  },
  smallDesc: {
    required: true,
    maxLength: 1000,
    regex: null,
    errorMsg: {
      required: "توضیح کوتاه الزامی است",
      maxLength: "توضیح کوتاه نمیتواند بیشتر از ۱۰۰۰ کارکتر باشد.",
      regex: "",
    },
  },
  SEO_Title: {
    required: true,
    maxLength: 60,
    regex: null,
    errorMsg: {
      required: "تیتر سئو الزامی است",
      maxLength: "تیتر سئو نباید بیشتر از ۶۰ کارکتر باشد.",
      regex: "",
    },
  },
  SEO_Description: {
    required: true,
    maxLength: 4000,
    regex: null,
    errorMsg: {
      required: "توضیحات سئو الزامی است",
      maxLength: "توضیحات سئو نباید بیشتر از ۴۰۰۰ کارکتر باشد.",
      regex: "",
    },
  },
  keywords: {
    required: true,
    maxLength: 2000,
    regex: null,
    errorMsg: {
      required: "کلمات کلیدی الزامی است",
      maxLength: "کلمات کلیدی نمی‌توانند بیشتر از ۲۰۰۰ کارکتر باشند.",
      regex: "",
    },
  },
  price: {
    required: false,
    maxLength: 20,
    regex: /^\d+(\.\d{1,2})?$/,
    errorMsg: {
      required: "قیمت الزامی است",
      maxLength: "قیمت نمیتواند بیشتر از ۲۰ کارکتر باشد.",
      regex: "قیمت باید یک عدد معتبر باشد (حداکثر ۲ رقم اعشار).",
    },
  },
  discount: {
    required: false,
    maxLength: 20,
    regex: /^\d+(\.\d{1,2})?$/,
    errorMsg: {
      required: "",
      maxLength: "تخفیف نمیتواند بیشتر از ۲۰ کارکتر باشد.",
      regex: "تخفیف باید یک عدد معتبر باشد (حداکثر ۲ رقم اعشار).",
    },
  },
  categoryID: {
    required: true,
    errorMsg: {
      required: "دسته‌بندی الزامی است",
    },
  },
  subCategoryID: {
    required: true,
    errorMsg: {
      required: "زیر دسته‌بندی الزامی است",
    },
  },
  bannerImage: {
    required: true,
    errorMsg: {
      required: "تصویر بنر الزامی است",
    },
  },
  transparentImage: {
    required: true,
    errorMsg: {
      required: "تصویر بدون پسزمینه الزامی است",
    },
  },
  features: {
    required: true,
    errorMsg: {
      required: "حداقل یک ویژگی الزامی است",
    },
  },
  productBlog: {
    required: false,
    errorMsg: {
      required: "",
    },
  },
};

function validateFieldValue<K extends keyof WizardState>(field: K, value: WizardState[K]): string {
  const rules = validationRules[field];
  if (!rules) return "";

  if (
    rules.required &&
    (!value ||
      (typeof value === "string" && !value.trim()) ||
      (Array.isArray(value) && value.length === 0))
  ) {
    return rules.errorMsg.required;
  }

  if (typeof value === "string" && value) {
    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.errorMsg.maxLength || "";
    }
    if (rules.regex && !rules.regex.test(value)) {
      return rules.errorMsg.regex || "";
    }
  }

  if (field === "price" || field === "discount") {
    if (value === "" || value === null || typeof value === "undefined") {
      return "";
    }
    const stringValue = value?.toString?.() ?? "";
    if (stringValue === "") return "";
    if (isNaN(parseFloat(stringValue)) || (rules.regex && !rules.regex.test(stringValue))) {
      return rules.errorMsg.regex || "";
    }
  }

  if (Array.isArray(value)) {
    if (field === "features" && rules.required && value.length === 0) {
      return rules.errorMsg.required;
    }
  }

  return "";
}

function validateAllFields(state: WizardState): WizardErrors {
  const errors: WizardErrors = {};

  Object.entries(state).forEach(([field, value]) => {
    const error = validateFieldValue(field as keyof WizardState, value);
    if (error) errors[field] = error;
  });

  if (parseFloat(state.price.toString()) < parseFloat(state.discount.toString())) {
    errors.discount = "تخفیف نمیتواند بیشتر از قیمت باشد.";
  }

  return errors;
}

// ============================================
// Reducer
// ============================================

export type WizardAction =
  | { type: "SET_FIELD"; field: keyof WizardState; value: WizardState[keyof WizardState] }
  | { type: "SET_FEATURES"; features: string[] }
  | { type: "SET_OVERVIEW_DETAILS"; details: OverviewDetail[] }
  | { type: "SET_PRODUCT_BLOG"; blog: string }
  | { type: "SET_SPECS"; specs: Spec[] }
  | { type: "SET_FAQS"; faqs: FAQ[] }
  | { type: "SET_ERRORS"; errors: WizardErrors | ((prev: WizardErrors) => WizardErrors) }
  | { type: "SET_TOUCHED_FIELD"; field: string; touched: boolean }
  | { type: "SET_HAS_SUBMITTED"; submitted: boolean }
  | { type: "TOGGLE_SECTION"; section: keyof OpenSections }
  | { type: "SET_OPEN_SECTIONS"; sections: Partial<OpenSections> }
  | { type: "SET_PROGRESS"; progress: number }
  | { type: "SET_CURRENT_STEP"; step: number }
  | { type: "SET_MODAL_VISIBLE"; visible: boolean }
  | { type: "SET_OVERVIEW_DETAILS_MODAL"; visible: boolean };

function wizardReducer(state: WizardContextValue, action: WizardAction): WizardContextValue {
  switch (action.type) {
    case "SET_FIELD": {
      const newState = { ...state.state, [action.field]: action.value };
      return {
        ...state,
        state: newState,
        errors: {
          ...state.errors,
          [action.field]: validateFieldValue(action.field, action.value),
        },
        touchedFields: {
          ...state.touchedFields,
          [action.field]: true,
        },
      };
    }
    case "SET_FEATURES":
      return { ...state, state: { ...state.state, features: action.features } };
    case "SET_OVERVIEW_DETAILS":
      return { ...state, state: { ...state.state, overviewDetails: action.details } };
    case "SET_PRODUCT_BLOG":
      return { ...state, state: { ...state.state, productBlog: action.blog } };
    case "SET_SPECS":
      return { ...state, state: { ...state.state, specs: action.specs } };
    case "SET_FAQS":
      return { ...state, state: { ...state.state, faqs: action.faqs } };
    case "SET_ERRORS": {
      const newErrors =
        typeof action.errors === "function" ? action.errors(state.errors) : action.errors;
      return { ...state, errors: newErrors };
    }
    case "SET_TOUCHED_FIELD":
      return {
        ...state,
        touchedFields: { ...state.touchedFields, [action.field]: action.touched },
      };
    case "SET_HAS_SUBMITTED":
      return { ...state, hasSubmitted: action.submitted };
    case "TOGGLE_SECTION":
      return {
        ...state,
        openSections: {
          ...state.openSections,
          [action.section]: !state.openSections[action.section],
        },
      };
    case "SET_OPEN_SECTIONS":
      return { ...state, openSections: { ...state.openSections, ...action.sections } };
    case "SET_PROGRESS":
      return { ...state, progress: action.progress };
    case "SET_CURRENT_STEP":
      return { ...state, currentStep: action.step };
    case "SET_MODAL_VISIBLE":
      return { ...state, isModalVisible: action.visible };
    case "SET_OVERVIEW_DETAILS_MODAL":
      return { ...state, showOverviewDetailsModal: action.visible };
    default:
      return state;
  }
}

// ============================================
// Context & Provider
// ============================================

const WizardContext = createContext<WizardContextValue | null>(null);

export function NewProductWizardProvider({
  children,
  categories,
  refetchProducts,
  setShowNewProductModal,
}: {
  children: ReactNode;
  categories: Category[];
  refetchProducts: () => void;
  setShowNewProductModal: (visible: boolean) => void;
}) {
  const [state, dispatch] = useReducer(wizardReducer, {
    state: initialState,
    errors: {},
    touchedFields: {},
    openSections: initialOpenSections,
    hasSubmitted: false,
    progress: 0,
    currentStep: 1,
    isModalVisible: false,
    showOverviewDetailsModal: false,
    actions: {} as WizardActions,
    meta: { categories, refetchProducts, setShowNewProductModal },
  });

  // Keep a ref to the latest state so stable memoized actions can read current values.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Define actions that can be used by child components.
  // Memoized on `dispatch` only so that effects depending on `actions` do not
  // re-run on every render (which previously caused infinite dispatch loops).
  const actions: WizardActions = useMemo(
    () => ({
      setField: (field, value) => dispatch({ type: "SET_FIELD", field, value }),
      setFeatures: (features) => dispatch({ type: "SET_FEATURES", features }),
      setOverviewDetails: (details) => dispatch({ type: "SET_OVERVIEW_DETAILS", details }),
      setProductBlog: (blog) => dispatch({ type: "SET_PRODUCT_BLOG", blog }),
      setSpecs: (specs) => dispatch({ type: "SET_SPECS", specs }),
      setFaqs: (faqs) => dispatch({ type: "SET_FAQS", faqs }),
      validateField: validateFieldValue,
      validateAllFields: () => validateAllFields(stateRef.current.state),
      setTouchedField: (field, touched) => dispatch({ type: "SET_TOUCHED_FIELD", field, touched }),
      setErrors: (errors) => dispatch({ type: "SET_ERRORS", errors }),
      toggleSection: (section) => dispatch({ type: "TOGGLE_SECTION", section }),
      setOpenSections: (sections) => dispatch({ type: "SET_OPEN_SECTIONS", sections }),
      submitForm: async () => {
        dispatch({ type: "SET_HAS_SUBMITTED", submitted: true });
        const errors = validateAllFields(stateRef.current.state);
        dispatch({ type: "SET_ERRORS", errors });

        if (Object.keys(errors).length > 0) {
          // Find first section with errors and open it
          const sectionsWithErrors = findSectionsWithErrors(errors);
          if (sectionsWithErrors.length > 0) {
            dispatch({ type: "SET_OPEN_SECTIONS", sections: { [sectionsWithErrors[0]]: true } });
          }
          return;
        }

        // Submit logic would go here - delegated to the submit handler in the main component
        // This will be overridden by the provider's submit handler
      },
      setHasSubmitted: (submitted) => dispatch({ type: "SET_HAS_SUBMITTED", submitted }),
      setProgress: (progress) => dispatch({ type: "SET_PROGRESS", progress }),
      setCurrentStep: (step) => dispatch({ type: "SET_CURRENT_STEP", step }),
      setModalVisible: (visible) => dispatch({ type: "SET_MODAL_VISIBLE", visible }),
      setShowOverviewDetailsModal: (visible) =>
        dispatch({ type: "SET_OVERVIEW_DETAILS_MODAL", visible }),
    }),
    [dispatch]
  );

  const meta: WizardMeta = useMemo(
    () => ({ categories, refetchProducts, setShowNewProductModal }),
    [categories, refetchProducts, setShowNewProductModal]
  );

  const contextValue: WizardContextValue = useMemo(
    () => ({
      ...state,
      actions,
      meta,
    }),
    [state, actions, meta]
  );

  return <WizardContext.Provider value={contextValue}>{children}</WizardContext.Provider>;
}

export function useNewProductWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useNewProductWizard must be used within a NewProductWizardProvider");
  }
  return context;
}

// ============================================
// Helper Functions
// ============================================

function findSectionsWithErrors(errors: WizardErrors): (keyof OpenSections)[] {
  const sections: (keyof OpenSections)[] = [];

  const baseDetailFields = [
    "name",
    "slug",
    "categoryID",
    "subCategoryID",
    "price",
    "discount",
    "smallDesc",
    "bannerImage",
    "transparentImage",
    "SEO_Title",
    "SEO_Description",
    "keywords",
  ];
  if (baseDetailFields.some((field) => errors[field])) {
    sections.push("baseDetails");
  }

  if (errors.features || Object.keys(errors).some((key) => key.startsWith("features-"))) {
    sections.push("productOverview");
  }

  if (Object.keys(errors).some((key) => key.startsWith("overviewDetails-"))) {
    sections.push("overviewDetails");
  }

  if (errors.productBlog) {
    sections.push("productBlog");
  }

  if (Object.keys(errors).some((key) => key.startsWith("specs-"))) {
    sections.push("specs");
  }

  if (
    Object.keys(errors).some(
      (key) => key.startsWith("faq-") || key.includes("-question-") || key.includes("-answer-")
    )
  ) {
    sections.push("faq");
  }

  return sections;
}

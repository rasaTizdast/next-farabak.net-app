import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CgSpinnerTwo } from "react-icons/cg";

import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";

import { Overview, OverviewDetail, Product, Specs } from "../types";
import EditModalFAQ from "./EditModalFAQ";
import EditModalOverview from "./EditModalOverview";
import EditModalOverviewDetails from "./EditModalOverviewDetails";
import EditModalProductBlog from "./EditModalProductBlog";
import EditModalSpecs from "./EditModalSpecs";
import ImageInput from "./ImageInput";
import NewOverviewDetailsModal from "./NewOverviewDetailsModal";

type Category = {
  CategoryID: number;
  Name: string;
  Subcategories: {
    CategoryContentId: number;
    Name: string;
  }[];
};

type ProductEditModalProps = {
  product: Product | null;
  onClose: () => void;
  refetchProducts: () => void;
  setIsEditModalOpen: (arg0: boolean) => void;
};

// Add a new type for FAQs
type FAQItem = {
  question: string;
  answer: string;
};

// Validation types and rules
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

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  onClose,
  refetchProducts,
  setIsEditModalOpen,
}) => {
  const [formState, setFormState] = useState<Product | null>(() => product);
  const [newImg1, setNewImg1] = useState<File | null>(null);
  const [newImg2, setNewImg2] = useState<File | null>(null);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [showNewOverviewDetailsModal, setShowNewOverviewDetailsModal] = useState(false);

  const [overviews, setOverviews] = useState<Overview | null>(null);
  const [overviewDetails, setOverviewDetails] = useState<OverviewDetail[] | null>(null);
  const [specs, setSpecs] = useState<Specs | null>(null);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [faqErrors, setFaqErrors] = useState<{ [key: string]: string }>({});

  const { data: categoriesData, error: categoriesError } = useApiFetch("/api/categories/getAll");
  const patchProduct = useApiMutation("patch");
  const postMutation = useApiMutation("post");
  const putMutation = useApiMutation("put");
  const deleteMutation = useApiMutation("delete");

  const categories = categoriesData || [];

  // eslint-disable-next-line react-compiler/set-state-in-effect
  useEffect(() => {
    if (categoriesError)
      toast.error("در دریافت دسته بندی ها مشکلی به وجود آمده است، دوباره تلاش کنید");
  }, [categoriesError]);

  // Validate FAQs whenever they change
  // eslint-disable-next-line react-compiler/set-state-in-effect
  useEffect(() => {
    // Only validate if we have FAQs
    if (faqs.length > 0) {
      validateFaqs();
    } else {
      // Clear error state if there are no FAQs
      setFaqErrors({});
    }
  }, [faqs]);

  async function doUploadImage(
    image: File | null,
    productName: string,
    imageType: "banner" | "mini",
    postMutation: { mutate: (url: string, body: any) => Promise<any> }
  ) {
    if (!image || !productName) {
      return null;
    }

    const response = await postMutation.mutate("/api/s3/upload", {
      type: "productImage",
      folderName: productName,
      contentType: image.type,
      imageType,
    });

    if (!response) return null;

    const { uploadUrl, key } = response;

    try {
      await axios.put(uploadUrl, image, {
        headers: {
          "Content-Type": image.type,
        },
      });
    } catch (error) {
      console.error(error);
      return null;
    }

    return key;
  }

  const imageUploader = async (
    image: File | null,
    productName: string,
    imageType: "banner" | "mini"
  ) => {
    return doUploadImage(image, productName, imageType, postMutation);
  };

  const handleImageUpdate = async (productId: number, productName: string) => {
    const payload: { img1?: string; img2?: string } = {};

    if (newImg1) {
      const delete1Res = await deleteMutation.mutate("/api/s3/delete", {
        productId,
        type: "productImages",
        productImageType: "mini",
      });
      if (delete1Res !== null) {
        const img1Key = await imageUploader(newImg1, productName, "mini");
        if (!img1Key) {
          console.error("Failed to upload img1");
        } else {
          payload.img1 = img1Key;
          toast.success("تصویر بدون پس‌زمینه با موفقیت آپدیت شد!");
        }
      } else {
        toast.error("آپلود تصویر بدون پس‌زمینه با شکست مواجه شد، مجددا تلاش کنید");
      }
    }

    if (newImg2) {
      const delete2Res = await deleteMutation.mutate("/api/s3/delete", {
        productId,
        type: "productImages",
        productImageType: "banner",
      });
      if (delete2Res !== null) {
        const img2Key = await imageUploader(newImg2, productName, "banner");
        if (!img2Key) {
          console.error("Failed to upload img2");
        } else {
          payload.img2 = img2Key;
          toast.success("تصویر بنر با موفقیت آپدیت شد!");
        }
      } else {
        toast.error("آپدیت تصویر بنر با شکست مواجه شد، مجددا تلاش کنید");
      }
    }

    return payload;
  };

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;

    // For price and discount fields, limit to 2 decimal places and validate
    if (name === "Price" || name === "Discount") {
      // Check if the value is a valid number format
      if (value && !validationRules[name].regex?.test(value)) {
        toast.error(validationRules[name].errorMsg.regex || "فرمت عددی نامعتبر است.");
        return;
      }

      // Check if the value has more than 2 decimal places
      const parts = value.toString().split(".");
      if (parts.length > 1 && parts[1].length > 2) {
        // Truncate to 2 decimal places
        const truncated = parseFloat(parseFloat(value).toFixed(2));
        setFormState((prevState) => (prevState ? { ...prevState, [name]: truncated } : null));
        return;
      }
    }

    // For productSlug, validate against regex and show error if invalid
    if (name === "productSlug") {
      const sanitizedValue = value.replace(/\s+/g, "-");
      if (!validationRules.productSlug.regex?.test(sanitizedValue)) {
        toast.error(validationRules.productSlug.errorMsg.regex || "فرمت شناسه محصول نامعتبر است.");
      }

      setFormState((prevState) => (prevState ? { ...prevState, [name]: sanitizedValue } : null));
      return;
    }

    // For fields with maxLength, show warning when approaching limit
    const rule = validationRules[name];
    if (rule?.maxLength && value.length > rule.maxLength * 0.9) {
      toast.error(`نزدیک به حد مجاز هستید (${value.length}/${rule.maxLength} کارکتر)`);
    }

    setFormState((prevState) =>
      prevState
        ? {
            ...prevState,
            [name]: value,
          }
        : null
    );
  };

  const handleBlogSave = (blog: string) => {
    setFormState((prevState) => (prevState ? { ...prevState, productBlog: blog } : null));
  };

  const handleKeywordsChange = (name: string, value: string) => {
    // Directly create an object mimicking the event's target structure
    const customEvent = { target: { name, value } };
    handleInputChange(customEvent); // Directly pass the custom object to handleInputChange
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = Number(e.target.value);
    const selectedCategory = categories.find((category) => category.CategoryID === categoryId);

    if (selectedCategory) {
      setFormState((prevState) =>
        prevState
          ? {
              ...prevState,
              categoryName: selectedCategory.Name,
              CategoryId: selectedCategory.CategoryID,
              subCategoryName: "",
              CategoryContentIds: [],
            }
          : null
      );
    }
  };

  const handleAvailableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormState((prevState) =>
      prevState
        ? {
            ...prevState,
            Available: value === "true",
          }
        : null
    );
  };

  // Helper to check if there are any FAQ validation errors
  const hasFaqErrors = () => {
    return Object.keys(faqErrors).length > 0;
  };

  const validateField = (fieldName: string, value: any): string | null => {
    const rule = validationRules[fieldName];
    if (!rule) return null;

    // Skip validation for non-string/number values or arrays/objects
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
  };

  const validateForm = (): string | null => {
    if (!formState) return "فرم خالی است";

    // Validate required fields first
    for (const [fieldName] of Object.entries(validationRules)) {
      const value = formState[fieldName as keyof Product];
      const error = validateField(fieldName, value);
      if (error) return error;
    }

    // Additional business logic validations
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
  };

  // Method to check if a FAQ has errors (content length validation)
  const validateFaqs = () => {
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

    setFaqErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState) return;

    // Validate form
    const formError = validateForm();
    if (formError) {
      toast.error(formError);
      return;
    }

    // Validate FAQs
    if (!validateFaqs()) {
      toast.error("لطفاً تمام سوالات و پاسخ‌ها را تکمیل کنید و طول مجاز را رعایت نمایید.");
      return;
    }

    // Convert CategoryContentIds to a string format for CategoryContentId
    const formattedCategoryContentId = formState.CategoryContentIds.map(
      (subcategory) => subcategory.CategoryContentId
    ).join(",");

    const updatedFormState = {
      ...formState,
      CategoryContentId: formattedCategoryContentId, // Update the singular field
    };

    setIsloading(true);

    const mainRes = await patchProduct.mutate(
      `/api/admin/products/${+updatedFormState.ProductId}`,
      {
        Name: updatedFormState.Name || "",
        Type: updatedFormState.Type || "",
        Price: updatedFormState.Price?.toString() || "0",
        Discount: updatedFormState.Discount?.toString() || "0",
        CategoryContentId: updatedFormState.CategoryContentId || "",
        Available: updatedFormState.Available ?? false,
        Description: updatedFormState.Description || "",
        CategoryId: updatedFormState.CategoryId || 0,
        img1: updatedFormState.img1,
        img2: updatedFormState.img2,
        Slug: updatedFormState.productSlug || "",
        SEO_Title: updatedFormState.SEO_Title || "",
        SEO_Description: updatedFormState.SEO_Description || "",
        productBlog: updatedFormState.productBlog || "",
      }
    );

    if (!mainRes) {
      toast.error("آپدیت ثبت محصول مورد نظر با شکست مواجه شد، مجدد تلاش کنید");
      setIsEditModalOpen(false);
      setIsloading(false);
      return;
    }

    const { img1, img2 } = await handleImageUpdate(formState.ProductId, formState.productSlug);

    if (img1 || img2) {
      const imgRes = await patchProduct.mutate(
        `/api/admin/products/${updatedFormState.ProductId}/updateImages`,
        {
          img1,
          img2,
        }
      );
      if (!imgRes) {
        toast.error("آپدیت ثبت محصول مورد نظر با شکست مواجه شد، مجدد تلاش کنید");
        setIsEditModalOpen(false);
        setIsloading(false);
        return;
      }
    }

    if (overviews?.isChanged) {
      const overviewRes = await postMutation.mutate("/api/productOverview", {
        ProductId: formState.ProductId,
        ProductName: formState.Name,
        Features: [
          overviews.Property1,
          overviews.Property2,
          overviews.Property3,
          overviews.Property4,
        ],
      });
      if (!overviewRes) {
        toast.error("آپدیت ثبت محصول مورد نظر با شکست مواجه شد، مجدد تلاش کنید");
        setIsEditModalOpen(false);
        setIsloading(false);
        return;
      }
    }

    if (specs?.data) {
      const specsRes = await postMutation.mutate("/api/specs/update", {
        productId: formState.ProductId,
        specs: specs.data,
      });
      if (!specsRes) {
        toast.error("اپدیت بررسی ها به مشکل  برخورد، مجددا تلاش کنید");
      }
    }

    const detailsRes = await putMutation.mutate("/api/productOverviewDetails/update", {
      productId: updatedFormState.ProductId,
      ProductName: updatedFormState.Type,
      selectedDetails: overviewDetails,
    });
    if (!detailsRes) {
      toast.error("آپدیت جزئیات بررسی به مشکل خورده است.");
    }

    const faqsRes = await putMutation.mutate(`/api/faqs/product/${formState.ProductId}`, faqs);
    if (!faqsRes) {
      toast.error("ذخیره سوالات متداول با مشکل روبرو شد.");
    }

    toast.success("محصول مورد نظر با موفقیت آپدیت شد!");
    refetchProducts();
    setIsEditModalOpen(false);
    setIsloading(false);
  };

  if (!formState) return null;

  const selectedCategory = categories.find((category) => category.Name === formState.categoryName);

  return (
    <>
      {showNewOverviewDetailsModal && (
        <NewOverviewDetailsModal onClose={() => setShowNewOverviewDetailsModal(false)} />
      )}
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 shadow-lg backdrop-blur-sm">
        <div className="max-h-[95dvh] w-full max-w-6xl overflow-auto rounded-lg bg-gray-800 p-6 text-white shadow-lg">
          <h2 className="mb-10 text-center text-xl font-bold">ویرایش محصول</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="نام محصول"
              name="Type"
              value={formState.Type}
              onChange={handleInputChange}
            />
            <InputField
              label="توضیح محصول"
              name="Name"
              value={formState.Name}
              onChange={handleInputChange}
            />
            <div className="col-span-1 block sm:col-span-2">
              <div className="flex items-center gap-2">
                <span>Slug</span>
                <div className="group relative">
                  <span className="cursor-pointer text-gray-500 hover:text-blue-500">ℹ️</span>
                  <div className="absolute right-0 top-full z-40 mt-1 hidden w-64 rounded bg-gray-700 p-3 text-justify text-sm text-white shadow-2xl group-hover:block">
                    شناسه محصول (Slug) قابل ویرایش نیست.
                  </div>
                </div>
              </div>
              <InputField
                label=""
                name="productSlug"
                value={formState.productSlug}
                onChange={handleInputChange}
                disabled={true}
              />
            </div>
            <div className="col-span-1 mt-4 block border-t-4 pt-6 sm:col-span-2">
              <SelectField
                label="دسته‌بندی"
                name="categoryName"
                value={formState.CategoryId?.toString() || ""}
                onChange={handleCategoryChange}
                options={categories.map((category) => ({
                  value: category.CategoryID.toString(),
                  label: category.Name,
                }))}
              />
            </div>
            <div className="col-span-1 mb-4 block border-b-4 pb-6 sm:col-span-2">
              <div className="rounded border border-gray-700 p-4 shadow-lg">
                <h3 className="mb-2 flex gap-2 font-bold">
                  زیر دسته‌بندی‌ها
                  <div className="group relative">
                    <span className="cursor-pointer text-gray-500 hover:text-blue-500">ℹ️</span>
                    <div className="absolute right-0 top-full z-40 mt-1 hidden w-64 rounded bg-gray-700 p-3 text-justify text-sm text-white shadow-2xl group-hover:block">
                      شما می‌توانید چندین زیر دسته‌بندی را انتخاب کنید. اولین زیر دسته‌بندی که
                      انتخاب می‌شود به عنوان زیر دسته‌بندی اصلی محصول نشان داده می‌شود.
                    </div>
                  </div>
                </h3>

                {formState.CategoryId ? (
                  <div className="rounded bg-gray-700 p-2 text-white">
                    {/* CSS Grid for layout */}
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                      }}
                    >
                      {selectedCategory?.Subcategories.map((subCategory) => {
                        // Parse selected IDs from formState
                        const selectedIds = formState.CategoryContentIds.map(
                          (item) => item.CategoryContentId
                        );
                        const isSelected = selectedIds.includes(subCategory.CategoryContentId);
                        const isFirstSelected =
                          isSelected && selectedIds[0] === subCategory.CategoryContentId;

                        return (
                          <SubCategoryButton
                            key={subCategory.CategoryContentId}
                            subCategory={subCategory}
                            isSelected={isSelected}
                            isFirstSelected={isFirstSelected}
                            onClick={() => {
                              let updatedIds: number[];

                              if (isSelected) {
                                // Remove the subcategory if already selected
                                updatedIds = selectedIds.filter(
                                  (id) => id !== subCategory.CategoryContentId
                                );
                              } else {
                                // Add the subcategory if not selected
                                updatedIds = [...selectedIds, subCategory.CategoryContentId];
                              }

                              setFormState((prevState) => {
                                if (!prevState) {
                                  // Handle the case where prevState is null
                                  return null;
                                }

                                // Map updatedIds to include both CategoryContentId and Name
                                const updatedCategoryContentIds = updatedIds.map((id) => {
                                  const subCategory = selectedCategory?.Subcategories.find(
                                    (sub) => sub.CategoryContentId === id
                                  );

                                  return {
                                    CategoryContentId: id,
                                    Name: subCategory?.Name || "Unknown", // Fallback to "Unknown" if Name is unavailable
                                  };
                                });

                                return {
                                  ...prevState,
                                  CategoryContentIds: updatedCategoryContentIds,
                                };
                              });
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <select
                    id="subCategory"
                    disabled
                    className="w-full rounded bg-gray-700 p-2 text-white"
                  >
                    <option value="">انتخاب زیر دسته‌بندی</option>
                  </select>
                )}
              </div>
            </div>

            {/* image */}
            <ImageInput
              label="تصویر بدون پس‌زمینه"
              imageUrl={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/productImages/${formState.img1}`}
              onChange={setNewImg1}
            />

            <ImageInput
              label="تصویر بنر"
              imageUrl={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/productImages/${formState.img2}`}
              onChange={setNewImg2}
            />

            <EditModalOverview
              ProductId={formState.ProductId}
              overviews={overviews}
              SetOverviews={setOverviews}
            />
            <div className="col-span-1 sm:col-span-2">
              <EditModalProductBlog
                blog={formState.productBlog}
                onSave={handleBlogSave}
                slug={formState.productSlug}
              />
            </div>

            <EditModalOverviewDetails
              productId={formState.ProductId}
              setProductOverviewDetails={setOverviewDetails}
            />
            <div className="col-span-1 border-b-4 border-b-gray-200 pb-2 sm:col-span-2">
              <button
                type="button"
                onClick={() => setShowNewOverviewDetailsModal(true)}
                className="mb-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                ایجاد توضیحات محصول جدید
              </button>
            </div>

            <InputField
              label="قیمت (دلار)"
              name="Price"
              value={formState.Price}
              onChange={handleInputChange}
              type="number"
              step="0.01"
            />
            <InputField
              label="تخفیف (دلار)"
              name="Discount"
              value={formState.Discount}
              onChange={handleInputChange}
              type="number"
              step="0.01"
            />
            <div className="col-span-1 block sm:col-span-2">
              <SelectField
                label="وضعیت موجودی"
                name="Available"
                value={formState.Available ? "true" : "false"}
                onChange={handleAvailableChange}
                options={[
                  { value: "true", label: "موجود" },
                  { value: "false", label: "ناموجود" },
                ]}
              />
            </div>

            {/* Keywords */}
            <div className="col-span-1 mb-4 block w-full sm:col-span-2">
              <label htmlFor="Description" className="mb-2 block">
                کلمات کلیدی
              </label>
              <input
                id="Description"
                type="text"
                onKeyDown={(e) => {
                  const input = e.target as HTMLInputElement; // Type assertion
                  if (e.key === "Enter" && input.value.trim()) {
                    e.preventDefault();

                    const newKeyword = input.value.trim();
                    const updatedKeywords = formState.Description
                      ? `${formState.Description} ${newKeyword}`
                      : newKeyword;

                    handleKeywordsChange("Description", updatedKeywords);
                    input.value = ""; // Clear input field
                  }
                }}
                className="w-full rounded bg-gray-700 p-2 text-white"
                placeholder="کلمات کلیدی را تایپ کنید و Enter را فشار دهید"
              />

              {/* Display Keywords Below the Input */}
              <div className="mt-2 flex flex-wrap gap-2">
                {formState.Description &&
                  formState.Description.split(" ").map((keyword: string, index: number) => (
                    <button
                      type="button"
                      key={index}
                      className="flex animate-fade-in items-center gap-2 rounded-lg bg-green-700 px-4 py-1 transition-all hover:bg-red-700 hover:text-white"
                      onClick={() => {
                        const updatedKeywords = formState.Description.split(" ")
                          .filter((_: string, i: number) => i !== index)
                          .join(" ");

                        handleKeywordsChange("Description", updatedKeywords);
                      }}
                    >
                      {keyword}
                    </button>
                  ))}
              </div>
            </div>

            <div className="col-span-1 block sm:col-span-2">
              <InputField
                label="عنوان SEO"
                name="SEO_Title"
                value={formState.SEO_Title}
                onChange={handleInputChange}
              />
            </div>
            <TextAreaField
              label="توضیحات SEO"
              name="SEO_Description"
              value={formState.SEO_Description}
              onChange={handleInputChange}
            />

            <EditModalSpecs
              productId={formState.ProductId}
              productName={formState.Name}
              specs={specs}
              setSpecs={setSpecs}
            />

            <EditModalFAQ productId={formState.ProductId} setFaqs={setFaqs} />

            {/* Display FAQ errors if any */}
            {Object.keys(faqErrors).length > 0 && (
              <div className="col-span-1 mb-4 mt-2 rounded-md bg-red-500 p-3 text-center sm:col-span-2">
                <p className="font-bold">خطاهای سوالات متداول:</p>
                <ul className="list-inside list-disc">
                  {Object.entries(faqErrors).map(([key, error], index) => (
                    <li key={index}>
                      {key.includes("question") ? "سوال" : "پاسخ"} {parseInt(key.split("-")[1]) + 1}
                      : {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="col-span-1 flex justify-end gap-6 sm:col-span-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded bg-gray-500 px-4 py-2 transition-all hover:bg-gray-600"
              >
                لغو
              </button>
              <button
                type="submit"
                className={`${
                  hasFaqErrors()
                    ? "cursor-not-allowed bg-gray-500"
                    : "bg-blue-500 hover:bg-blue-600"
                } rounded px-4 py-2 text-white transition-all`}
                disabled={hasFaqErrors()}
                onClick={(e) => {
                  if (hasFaqErrors()) {
                    e.preventDefault();
                    toast.error("لطفاً خطاهای سوالات متداول را برطرف کنید.");
                  }
                }}
              >
                ذخیره
              </button>
            </div>
          </form>
        </div>
      </div>
      {isLoading && <Loading />}
    </>
  );
};

// Helper components for the form fields
type InputFieldProps = {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  disabled?: boolean;
  step?: string;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
  step,
}) => (
  <label className="block">
    {label}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      step={step}
      className={`mt-2 w-full rounded border border-gray-800 p-2 ${
        disabled ? "cursor-not-allowed bg-gray-600 text-gray-400 opacity-75" : "bg-gray-700"
      }`}
      placeholder={`${label} را وارد کنید`}
      disabled={disabled}
    />
  </label>
);

type TextAreaFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, name, value, onChange }) => (
  <label className="col-span-1 block sm:col-span-2">
    {label}
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className="mt-2 w-full rounded border border-gray-800 bg-gray-700 p-2"
      placeholder={`${label} را وارد کنید`}
    />
  </label>
);

type SelectFieldProps = {
  label: string;
  name: string;
  value: string | string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
};

const SelectField: React.FC<SelectFieldProps> = ({ label, name, value, onChange, options }) => (
  <label className="block">
    {label}
    <select
      name={name}
      value={Array.isArray(value) ? value[0] : value}
      onChange={onChange}
      className="mt-2 w-full rounded border border-gray-800 bg-gray-700 p-2"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 rounded-lg bg-gray-800 p-6 text-white shadow-lg">
        <div className="text-xl font-semibold">در حال آپدیت محصول، لطفا منتظر بمانید</div>
        <CgSpinnerTwo className="animate-spin" size={80} />
      </div>
    </div>
  );
};

export default ProductEditModal;

// SubCategoryButton.tsx
interface SubCategoryButtonProps {
  subCategory: { CategoryContentId: number; Name: string };
  isSelected: boolean;
  isFirstSelected: boolean;
  onClick: () => void;
}

const SubCategoryButton: React.FC<SubCategoryButtonProps> = ({
  subCategory,
  isSelected,
  isFirstSelected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border px-3 py-1 text-center ${
        isSelected
          ? isFirstSelected
            ? "border-green-600 bg-green-600 text-white" // Special style for the first selected
            : "border-blue-600 bg-blue-600 text-white" // Style for other selected
          : "border-gray-500 bg-gray-600 text-gray-200 hover:bg-gray-500"
      }`}
    >
      {subCategory.Name}
    </button>
  );
};

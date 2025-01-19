import { useEffect, useState } from "react";
import { Product } from "../types";
import axios from "axios";
import toast from "react-hot-toast";
import ImageInput from "./ImageInput";
import { CgSpinnerTwo } from "react-icons/cg";

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

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  onClose,
  refetchProducts,
  setIsEditModalOpen,
}) => {
  const [formState, setFormState] = useState<Product | null>(product);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newImg1, setNewImg1] = useState<File | null>(null);
  const [newImg2, setNewImg2] = useState<File | null>(null);
  const [isLoading, setIsloading] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get("/api/categories/getAll")
      .then((response) => setCategories(response.data))
      .catch((error) =>
        toast.error(
          "در دریافت دسته بندی ها مشکلی به وجود آمده است، دوباره تلاش کنید"
        )
      );
    console.log("product: ", product);
    setFormState(product);
  }, []);

  // Function to handle uploading images to S3
  const ImageUploader = async (
    image: File | null,
    productName: string,
    imageType: "banner" | "mini"
  ) => {
    // Ensure that required data is available
    if (!image || !productName) {
      return;
    }

    try {
      // Request a presigned URL for image upload
      const response = await axios.post("/api/s3/upload", {
        type: "productImage",
        folderName: productName,
        contentType: image.type,
        imageType,
      });

      const { uploadUrl, key } = response.data;

      // Upload the image to the presigned URL
      await axios.put(uploadUrl, image, {
        headers: {
          "Content-Type": image.type,
        },
      });

      return key; // Return the image key for further use
    } catch (error) {
      throw new Error("Error uploading the image");
    }
  };

  const handleImageUpdate = async (productId: number, productName: string) => {
    const payload: { img1?: string; img2?: string } = {};

    // Update newImg1 if it exists
    if (newImg1) {
      try {
        await axios.delete("/api/s3/delete", {
          data: {
            productId,
            type: "productImages",
            productImageType: "mini", // Mini for img1
          },
        });
        const img1Key = await ImageUploader(newImg1, productName, "mini");
        payload.img1 = img1Key;
        toast.success("تصویر بدون پس‌زمینه با موفقیت آپدیت شد!");
      } catch (error) {
        toast.error(
          "آپلود تصویر بدون پس‌زمینه با شکست مواجه شد، مجددا تلاش کنید"
        );
      }
    }

    // Update newImg2 if it exists
    if (newImg2) {
      try {
        await axios.delete("/api/s3/delete", {
          data: {
            productId,
            type: "productImages",
            productImageType: "banner", // Banner for img2
          },
        });
        const img2Key = await ImageUploader(newImg2, productName, "banner");
        payload.img2 = img2Key;

        toast.success("تصویر بنر با موفقیت آپدیت شد!");
      } catch (error) {
        toast.error("آپدیت تصویر بنر با شکست مواجه شد، مجددا تلاش کنید");
      }
    }

    return payload;
  };

  const handleInputChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) =>
      prevState
        ? {
            ...prevState,
            [name]: name === "productSlug" ? value.replace(/\s+/g, "-") : value,
          }
        : null
    );
  };

  const handleKeywordsChange = (name: string, value: string) => {
    // Directly create an object mimicking the event's target structure
    const customEvent = { target: { name, value } };
    handleInputChange(customEvent); // Directly pass the custom object to handleInputChange
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = Number(e.target.value);
    const selectedCategory = categories.find(
      (category) => category.CategoryID === categoryId
    );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState) return;

    if (formState.CategoryContentIds.length === 0) {
      toast.error("محصول باید حداقل یک زیر دسته‌بندی داشته باشد.");
      return;
    }

    const isValidSubcategories = formState.CategoryContentIds.every(
      (subcategory) => subcategory.CategoryContentId !== 0
    );

    if (+formState.Price < +formState.Discount) {
      toast.error("مقدار تخفیف نباید بیشتر از قیمت محصول باشد.");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(formState.productSlug)) {
      toast.error("شناسه محصول باید انگلیسی و بدون فاصله باشد.");
      return;
    }

    if (formState.Name.length > 1000) {
      toast.error("نام محصول نباید بیشتر از ۱۰۰۰ کارکتر باشد.");
      return;
    }

    if (formState.Description.length > 1000) {
      toast.error("توضیح مصحول نباید بیشتر از ۱۰۰۰ کارکتر باشد.");
      return;
    }

    if (formState.SEO_Title.length > 60) {
      toast.error("تیتر سئو نباید بیشتر از ۶۰ کارکتر باشد.");
      return;
    }

    if (formState.SEO_Description.length > 4000) {
      toast.error("توضیحات سئو نباید بیشتر از ۴۰۰۰ کارکتر باشد.");
      return;
    }

    if (!isValidSubcategories) {
      toast.error("یک یا چند زیر دسته‌بندی معتبر انتخاب نشده است.");
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

    try {
      setIsloading(true);
      await axios.patch(`/api/admin/products/${+updatedFormState.ProductId}`, {
        Name: updatedFormState.Name || "", // Fallback to empty string if null/undefined
        Type: updatedFormState.Type || "",
        Price: updatedFormState.Price?.toString() || "0", // Fallback to "0" if null/undefined
        Discount: updatedFormState.Discount?.toString() || "0",
        CategoryContentId: updatedFormState.CategoryContentId || "",
        Available: updatedFormState.Available ?? false, // Use nullish coalescing for boolean
        Description: updatedFormState.Description || "",
        CategoryId: updatedFormState.CategoryId || 0, // Fallback to 0 for number fields
        img1: updatedFormState.img1,
        img2: updatedFormState.img2,
        Slug: updatedFormState.productSlug || "",
        SEO_Title: updatedFormState.SEO_Title || "",
        SEO_Description: updatedFormState.SEO_Description || "",
      });

      const { img1, img2 } = await handleImageUpdate(
        formState.ProductId,
        formState.productSlug
      );

      if (img1 || img2) {
        await axios.patch(
          `/api/admin/products/${updatedFormState.ProductId}/updateImages`,
          {
            img1,
            img2,
          }
        );
      }

      toast.success("محصول مورد نظر با موفقیت آپدیت شد!");
      refetchProducts();
    } catch (error) {
      toast.error("آپدیت ثبت محصول مورد نظر با شکست مواجه شد، مجدد تلاش کنید");
    } finally {
      setIsEditModalOpen(false);
      setIsloading(false);
    }
  };

  if (!formState) return null;

  const selectedCategory = categories.find(
    (category) => category.Name === formState.categoryName
  );

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm shadow-lg">
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[95dvh] overflow-auto">
          <h2 className="text-xl font-bold mb-10 text-center">ویرایش محصول</h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
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
            <div className="block col-span-1 sm:col-span-2">
              <InputField
                label="Slug"
                name="productSlug"
                value={formState.productSlug}
                onChange={handleInputChange}
              />
            </div>
            <div className="block col-span-1 sm:col-span-2 border-t-4 pt-6 mt-4">
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
            <div className="block col-span-1 sm:col-span-2 border-b-4 pb-6 mb-4">
              <div className="border border-gray-700 rounded p-4 shadow-lg">
                <h3 className="font-bold mb-2 flex gap-2">
                  زیر دسته‌بندی‌ها
                  <div className="relative group">
                    <span className="text-gray-500 hover:text-blue-500 cursor-pointer">
                      ℹ️
                    </span>
                    <div className="absolute top-full right-0 w-64 mt-1 text-justify hidden group-hover:block bg-gray-700 text-white text-sm p-3 rounded shadow-2xl z-40">
                      شما می‌توانید چندین زیر دسته‌بندی را انتخاب کنید. اولین
                      زیر دسته‌بندی که انتخاب می‌شود به عنوان زیر دسته‌بندی اصلی
                      محصول نشان داده می‌شود.
                    </div>
                  </div>
                </h3>

                {formState.CategoryId ? (
                  <div className="p-2 rounded bg-gray-700 text-white">
                    {/* CSS Grid for layout */}
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(250px, 1fr))",
                      }}
                    >
                      {selectedCategory?.Subcategories.map((subCategory) => {
                        // Parse selected IDs from formState
                        const selectedIds = formState.CategoryContentIds.map(
                          (item) => item.CategoryContentId
                        );
                        const isSelected = selectedIds.includes(
                          subCategory.CategoryContentId
                        );
                        const isFirstSelected =
                          isSelected &&
                          selectedIds[0] === subCategory.CategoryContentId;

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
                                updatedIds = [
                                  ...selectedIds,
                                  subCategory.CategoryContentId,
                                ];
                              }

                              setFormState((prevState) => {
                                if (!prevState) {
                                  // Handle the case where prevState is null
                                  return null;
                                }

                                // Map updatedIds to include both CategoryContentId and Name
                                const updatedCategoryContentIds =
                                  updatedIds.map((id) => {
                                    const subCategory =
                                      selectedCategory?.Subcategories.find(
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
                    className="w-full p-2 rounded bg-gray-700 text-white"
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

            <InputField
              label="قیمت (ریال)"
              name="Price"
              value={formState.Price}
              onChange={handleInputChange}
              type="number"
            />
            <InputField
              label="تخفیف (ریال)"
              name="Discount"
              value={formState.Discount}
              onChange={handleInputChange}
              type="number"
            />
            <div className="block col-span-1 sm:col-span-2">
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
            <div className="mb-4 block w-full col-span-1 sm:col-span-2">
              <label htmlFor="Description" className="block mb-2">
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
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="کلمات کلیدی را تایپ کنید و Enter را فشار دهید"
              />

              {/* Display Keywords Below the Input */}
              <div className="mt-2 flex flex-wrap gap-2">
                {formState.Description &&
                  formState.Description.split(" ").map(
                    (keyword: string, index: number) => (
                      <button
                        type="button"
                        key={index}
                        className="bg-green-700 px-4 py-1 rounded-lg flex items-center gap-2 hover:bg-red-700 hover:text-white animate-fade-in transition-all"
                        onClick={() => {
                          const updatedKeywords = formState.Description.split(
                            " "
                          )
                            .filter((_: string, i: number) => i !== index)
                            .join(" ");

                          handleKeywordsChange("Description", updatedKeywords);
                        }}
                      >
                        {keyword}
                      </button>
                    )
                  )}
              </div>
            </div>

            <div className="block col-span-1 sm:col-span-2">
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
            <div className="col-span-1 sm:col-span-2 flex justify-end gap-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 transition-all px-4 py-2 rounded"
              >
                لغو
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 transition-all text-white px-4 py-2 rounded"
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
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  type?: string;
  disabled?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
}) => (
  <label className="block">
    {label}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="bg-gray-700 border border-gray-800 rounded w-full p-2 mt-2"
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

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  name,
  value,
  onChange,
}) => (
  <label className="block col-span-1 sm:col-span-2">
    {label}
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className="bg-gray-700 border border-gray-800 rounded w-full p-2 mt-2"
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

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
}) => (
  <label className="block">
    {label}
    <select
      name={name}
      value={Array.isArray(value) ? value[0] : value}
      onChange={onChange}
      className="bg-gray-700 border border-gray-800 rounded w-full p-2 mt-2"
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm shadow-lg">
      <div className="flex flex-col gap-6 items-center bg-gray-800 text-white p-6 rounded-lg shadow-lg">
        <div className="font-semibold text-xl">
          در حال آپدیت محصول، لطفا منتظر بمانید
        </div>
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
      className={`px-3 py-1 rounded border text-center ${
        isSelected
          ? isFirstSelected
            ? "bg-green-600 text-white border-green-600" // Special style for the first selected
            : "bg-blue-600 text-white border-blue-600" // Style for other selected
          : "bg-gray-600 text-gray-200 border-gray-500 hover:bg-gray-500"
      }`}
    >
      {subCategory.Name}
    </button>
  );
};

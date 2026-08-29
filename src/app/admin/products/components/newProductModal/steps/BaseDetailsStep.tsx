"use client";

import React from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import { useNewProductForm } from "../hooks/useNewProductForm";
import { useNewProductImages } from "../hooks/useNewProductImages";
import { useNewProductWizard } from "../NewProductWizardContext";

type SectionProps = {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
};

function CollapsibleSection({
  isOpen,
  onToggle,
  title,
  children,
}: SectionProps & { children: React.ReactNode }) {
  return (
    <div className="mb-4 overflow-hidden rounded-md bg-gray-900">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-950"
      >
        <span className="text-lg font-semibold">{title}</span>
        {isOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </button>
      <div className={isOpen ? "block" : "hidden"}>{children}</div>
    </div>
  );
}

function FieldError({ error }: { error: string }) {
  return error ? <p className="mt-1 text-red-500">{error}</p> : null;
}

function InputField({
  label,
  error,
  children,
  helpText,
  id,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  helpText?: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-2 block">
        {label}
      </label>
      {id && React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ id?: string }>, { id })
        : children}
      {error && <FieldError error={error} />}
      {helpText && <div className="mt-1 text-sm text-gray-400">{helpText}</div>}
    </div>
  );
}

function FileInputField({
  label,
  error,
  hasFile,
  preview,
  onChange,
  onClear,
  id,
}: {
  label: string;
  error?: string;
  hasFile: boolean;
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  id?: string;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-2 block">
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="w-full rounded bg-gray-700 p-2 text-white"
        disabled={hasFile}
      />
      {hasFile && preview && (
        <div className="mt-2 flex items-center gap-2">
          <img src={preview} alt="Preview" className="size-16 rounded object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-red-400 hover:text-red-300"
          >
            حذف
          </button>
        </div>
      )}
      {error && <FieldError error={error} />}
    </div>
  );
}

function CategorySelect({
  label,
  value,
  onChange,
  options,
  disabled,
  placeholder,
  id,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  options: { CategoryID: number; Name: string }[];
  disabled?: boolean;
  placeholder: string;
  id?: string;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-2 block">
        {label}
      </label>
      <select
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value) || null)}
        disabled={disabled}
        className="w-full rounded bg-gray-700 p-2 text-white"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.CategoryID} value={opt.CategoryID}>
            {opt.Name}
          </option>
        ))}
      </select>
    </div>
  );
}

function SubCategoryGrid({
  subCategories,
  selectedIds,
  onToggle,
}: {
  subCategories: { CategoryContentId: number; Name: string }[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div className="rounded bg-gray-700 p-2 text-white">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}
      >
        {subCategories.map((sub) => {
          const isSelected = selectedIds.includes(sub.CategoryContentId);
          const isFirstSelected = isSelected && selectedIds[0] === sub.CategoryContentId;
          return (
            <button
              key={sub.CategoryContentId}
              type="button"
              onClick={() => onToggle(sub.CategoryContentId)}
              className={`rounded border px-3 py-1 text-center ${
                isSelected
                  ? isFirstSelected
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-500 bg-gray-600 text-gray-200 hover:bg-gray-500"
              }`}
            >
              {sub.Name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function KeywordsInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (keywords: string) => void;
  error?: string;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (e.key === "Enter" && input.value.trim()) {
      e.preventDefault();
      const newKeyword = input.value.trim();
      const updatedKeywords = value ? `${value} ${newKeyword}` : newKeyword;
      if (updatedKeywords.length > 2000) return;
      onChange(updatedKeywords);
      input.value = "";
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    const updatedKeywords = value
      .split(" ")
      .filter((k) => k !== keywordToRemove)
      .join(" ");
    onChange(updatedKeywords);
  };

  return (
    <div className="mb-4">
      <label htmlFor="product-keywords" className="mb-2 block">
        کلمات کلیدی
      </label>
      <input
        id="product-keywords"
        type="text"
        onKeyDown={handleKeyDown}
        className={`w-full rounded bg-gray-700 p-2 text-white ${error ? "border border-red-500" : ""}`}
        placeholder="کلمات کلیدی را تایپ کنید و Enter را فشار دهید"
        maxLength={100}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {value.split(" ").map(
          (keyword) =>
            keyword && (
              <button
                key={keyword}
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="animate-fade-in flex items-center gap-2 rounded-lg bg-green-700 px-4 py-1 transition-colors hover:bg-red-700 hover:text-white"
              >
                {keyword}
              </button>
            )
        )}
      </div>
      <div className="mt-1 text-sm text-gray-400">{value.length}/2000</div>
      {error && <FieldError error={error} />}
    </div>
  );
}

export function BaseDetailsStep() {
  const { state, handleChange, getFieldError, getFieldProps, getSelectProps } = useNewProductForm();
  const { hasBannerImage, hasTransparentImage, bannerImagePreview, transparentImagePreview } =
    useNewProductImages();
  const { openSections, actions, meta } = useNewProductWizard();

  const selectedSubCategoryIds = state.subCategoryID
    ? state.subCategoryID.split(",").map(Number)
    : [];
  const selectedCategory = meta.categories.find((c) => c.CategoryID === state.categoryID);

  const handleSubCategoryToggle = (id: number) => {
    let updatedIds: number[];
    if (selectedSubCategoryIds.includes(id)) {
      updatedIds = selectedSubCategoryIds.filter((subId) => subId !== id);
    } else {
      updatedIds = [...selectedSubCategoryIds, id];
    }
    handleChange("subCategoryID", updatedIds.join(","));
  };

  return (
    <CollapsibleSection
      isOpen={openSections.baseDetails}
      onToggle={() => actions.toggleSection("baseDetails")}
      title="جزئیات پایه"
    >
      <div className="mb-6 p-4">
        <InputField
          label="نام محصول"
          error={getFieldError("name")}
          helpText={state.name && `${state.name.length}/1000`}
          id="product-name"
        >
          <input
            {...getFieldProps("name")}
            data-testid="product-name"
            placeholder="نام محصول را وارد کنید"
            maxLength={1000}
          />
        </InputField>

        <InputField
          label="شناسه محصول"
          error={getFieldError("slug")}
          helpText={state.slug && `${state.slug.length}/1200`}
          id="product-slug"
        >
          <input
            {...getFieldProps("slug")}
            data-testid="product-slug"
            placeholder="شناسه محصول را وارد کنید"
            maxLength={1200}
          />
        </InputField>

        <CategorySelect
          label="دسته بندی"
          value={state.categoryID}
          onChange={(value) => {
            handleChange("categoryID", value);
            handleChange("subCategoryID", "");
          }}
          options={meta.categories}
          placeholder="انتخاب دسته بندی"
          id="product-category"
        />

        <div className="mb-4">
          <label htmlFor="product-subcategory" className="mb-2 flex items-center gap-3">
            زیر دسته بندی
            <div className="group relative">
              <span className="cursor-pointer text-gray-500 hover:text-blue-500">ℹ️</span>
              <div className="absolute top-full right-0 z-40 mt-1 hidden w-64 rounded bg-gray-700 p-3 text-justify text-sm text-white shadow-2xl group-hover:block">
                شما می‌توانید چندین زیر دسته‌بندی را انتخاب کنید. اولین زیر دسته‌بندی که انتخاب
                می‌شود به عنوان زیر دسته‌بندی اصلی محصول نشان داده می‌شود.
              </div>
            </div>
          </label>
          {state.categoryID && selectedCategory ? (
            <SubCategoryGrid
              subCategories={selectedCategory.Subcategories}
              selectedIds={selectedSubCategoryIds}
              onToggle={handleSubCategoryToggle}
            />
          ) : (
            <select
              id="product-subcategory"
              disabled
              className="w-full rounded bg-gray-700 p-2 text-white"
            >
              <option value="">انتخاب زیر دسته بندی</option>
            </select>
          )}
        </div>

        <InputField label="قیمت محصول به دلار" error={getFieldError("price")} id="product-price">
          <input
            {...getFieldProps("price")}
            data-testid="product-price"
            type="number"
            step="0.01"
            placeholder="قیمت محصول را به دلار وارد کنید."
            min="0"
            max="99999999"
          />
        </InputField>

        <InputField label="تخفیف" error={getFieldError("discount")} id="product-discount">
          <input
            {...getFieldProps("discount")}
            data-testid="product-discount"
            type="number"
            step="0.01"
            placeholder="تخفیف محصول را به دلار وارد کنید."
            min="0"
            max={state.price}
          />
        </InputField>

        <InputField
          label="توضیحات کوتاه"
          error={getFieldError("smallDesc")}
          helpText={state.smallDesc && `${state.smallDesc.length}/1000`}
          id="product-small-desc"
        >
          <input
            {...getFieldProps("smallDesc")}
            data-testid="product-small-desc"
            type="text"
            placeholder="توضیحات کوتاه برای محصول را وارد کنید"
            maxLength={1000}
          />
        </InputField>

        <InputField
          label="تیتر سئو"
          error={getFieldError("SEO_Title")}
          helpText={`${state.SEO_Title.length}/60`}
          id="product-seo-title"
        >
          <input
            {...getFieldProps("SEO_Title")}
            data-testid="product-seo-title"
            type="text"
            placeholder="تیتر سئو محصول را وارد کنید"
            maxLength={60}
          />
        </InputField>

        <InputField
          label="توضیحات سئو"
          error={getFieldError("SEO_Description")}
          helpText={`${state.SEO_Description.length}/4000`}
          id="product-seo-desc"
        >
          <textarea
            {...getFieldProps("SEO_Description")}
            data-testid="product-seo-desc"
            placeholder="توضیحات سئو محصول را وارد کنید"
            maxLength={4000}
            rows={4}
          />
        </InputField>

        <KeywordsInput
          value={state.keywords}
          onChange={(v) => handleChange("keywords", v)}
          error={getFieldError("keywords")}
        />

        <FileInputField
          label="تصویر بنر"
          error={getFieldError("bannerImage")}
          hasFile={hasBannerImage}
          preview={bannerImagePreview}
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            handleChange("bannerImage", file);
          }}
          onClear={() => handleChange("bannerImage", null)}
          id="product-banner-image"
        />

        <FileInputField
          label="تصویر بدون پس‌زمینه"
          error={getFieldError("transparentImage")}
          hasFile={hasTransparentImage}
          preview={transparentImagePreview}
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            handleChange("transparentImage", file);
          }}
          onClear={() => handleChange("transparentImage", null)}
          id="product-transparent-image"
        />

        <InputField label="وضعیت" error="" id="product-available">
          <select
            {...getSelectProps("categoryID" as any)}
            value={state.available ? "true" : "false"}
            onChange={(e) => handleChange("available", e.target.value === "true")}
            className="w-full rounded bg-gray-700 p-2 text-white"
          >
            <option value="true">فعال</option>
            <option value="false">غیرفعال</option>
          </select>
        </InputField>
      </div>
    </CollapsibleSection>
  );
}

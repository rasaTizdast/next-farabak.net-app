"use client";

import React from "react";

import { CollapsibleSection } from "../components/CollapsibleSection";
import { useNewProductForm } from "../hooks/useNewProductForm";
import { useNewProductImages } from "../hooks/useNewProductImages";
import { useNewProductWizard } from "../NewProductWizardContext";

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
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-100">
        {label}
      </label>
      {id && React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<{
              id?: string;
              className?: string;
              "aria-invalid"?: boolean;
              "aria-describedby"?: string;
            }>,
            {
              id,
              className: `min-h-11 w-full rounded-lg border bg-slate-700 px-3 py-2.5 text-base text-white placeholder:text-slate-300 transition-colors focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none ${error ? "border-red-400" : "border-slate-500 hover:border-slate-300"} ${(children.props as { className?: string }).className ?? ""}`,
              "aria-invalid": Boolean(error),
              "aria-describedby": error ? `${id}-error` : undefined,
            }
          )
        : children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-300">
          {error}
        </p>
      )}
      {helpText && <div className="mt-1 text-sm text-slate-300">{helpText}</div>}
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
  testId,
}: {
  label: string;
  error?: string;
  hasFile: boolean;
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  id?: string;
  testId?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onClear();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-2 block">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        data-testid={testId}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="min-h-11 w-full rounded-lg border border-slate-500 bg-slate-700 px-3 py-2 text-white file:me-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-white hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
        disabled={hasFile}
      />
      {hasFile && preview && (
        <div className="mt-2 flex items-center gap-2">
          <img src={preview} alt="Preview" className="size-16 rounded object-cover" />
          <button
            type="button"
            onClick={handleClear}
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
  testId,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  options: { CategoryID: number; Name: string }[];
  disabled?: boolean;
  placeholder: string;
  id?: string;
  testId?: string;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-2 block">
        {label}
      </label>
      <select
        id={id}
        data-testid={testId}
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value) || null)}
        disabled={disabled}
        className="min-h-11 w-full rounded-lg border border-slate-500 bg-slate-700 px-3 py-2 text-white hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none disabled:opacity-60"
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
    <div
      role="group"
      aria-label="زیردسته‌بندی‌ها"
      className="rounded-lg border border-slate-500 bg-slate-700 p-2 text-white"
    >
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
              data-testid={`subcategory-button-${sub.CategoryContentId}`}
              onClick={() => onToggle(sub.CategoryContentId)}
              aria-pressed={isSelected}
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

  const removeKeyword = (indexToRemove: number) => {
    const updatedKeywords = value
      .split(" ")
      .filter((_, index) => index !== indexToRemove)
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
        data-testid="product-keywords"
        type="text"
        onKeyDown={handleKeyDown}
        className={`min-h-11 w-full rounded-lg border bg-slate-700 px-3 py-2.5 text-white placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none ${error ? "border-red-400" : "border-slate-500"}`}
        placeholder="کلمات کلیدی را تایپ کنید و Enter را فشار دهید"
        maxLength={100}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {value.split(" ").map(
          (keyword, index) =>
            keyword && (
              <button
                key={`${index}-${keyword}`}
                type="button"
                onClick={() => removeKeyword(index)}
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
  const { state, handleChange, getFieldError, getFieldProps } = useNewProductForm();
  const {
    hasBannerImage,
    hasTransparentImage,
    bannerImagePreview,
    transparentImagePreview,
    handleBannerImageChange,
    handleTransparentImageChange,
    clearBannerImage,
    clearTransparentImage,
  } = useNewProductImages();
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
      sectionId="baseDetails"
      title="جزئیات پایه"
      titleTestId="basic-details"
    >
      <div className="mx-auto mb-6 w-full max-w-3xl px-1 py-4 sm:px-4">
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
            // Resetting is not a user error — don't mark the field as touched.
            actions.setTouchedField("subCategoryID", false);
          }}
          options={meta.categories}
          placeholder="انتخاب دسته بندی"
          id="product-category"
          testId="product-category"
        />

        <div className="mb-4">
          <p className="mb-1 text-sm font-semibold text-slate-100">زیر دسته بندی</p>
          <p className="mb-2 text-sm text-slate-300">
            می‌توانید چند زیر دسته‌بندی انتخاب کنید. اولین انتخاب، زیر دسته‌بندی اصلی است.
          </p>
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
              className="min-h-11 w-full rounded-lg border border-slate-500 bg-slate-700 px-3 py-2 text-white opacity-60"
            >
              <option value="">انتخاب زیر دسته بندی</option>
            </select>
          )}
          {getFieldError("subCategoryID") && <FieldError error={getFieldError("subCategoryID")} />}
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
            max={state.price || undefined}
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
          onChange={(e) => handleBannerImageChange(e.target.files?.[0] ?? null)}
          onClear={clearBannerImage}
          id="product-banner-image"
          testId="product-banner-image"
        />

        <FileInputField
          label="تصویر بدون پس‌زمینه"
          error={getFieldError("transparentImage")}
          hasFile={hasTransparentImage}
          preview={transparentImagePreview}
          onChange={(e) => handleTransparentImageChange(e.target.files?.[0] ?? null)}
          onClear={clearTransparentImage}
          id="product-transparent-image"
          testId="product-transparent-image"
        />

        <InputField label="وضعیت" id="product-available">
          <select
            data-testid="product-available"
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

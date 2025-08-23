import { useState } from "react";

const CategoryFields = ({
  name,
  slug,
  available,
  setName,
  setSlug,
  setAvailable,
  editable = true,
}: {
  name: string;
  slug: string;
  available: boolean;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setSlug: React.Dispatch<React.SetStateAction<string>>;
  setAvailable: React.Dispatch<React.SetStateAction<boolean>>;
  editable?: boolean;
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Regex patterns
  const regexPatterns = {
    Name: /^[a-zA-Z0-9-\u0600-\u06FF\s_\u200C\u002D\u2013\u2014]{0,1000}$/, // Persian, English, numbers, up to 1000 characters
    Slug: /^[a-z0-9-]{0,200}$/, // Lowercase English, numbers, and dashes only, up to 200 characters
  };

  const errorMessages = {
    Name: "نام باید حروف فارسی یا انگلیسی و حداکثر ۱۰۰۰ کاراکتر باشد.",
    Slug: "شناسه فقط باید حروف انگلیسی کوچک، اعداد و خط تیره باشد و حداکثر ۲۰۰ کاراکتر باشد.",
  };

  // Handle input change with validation
  const handleInputChange = (field: string, value: string) => {
    const pattern = regexPatterns[field as keyof typeof regexPatterns];
    if (pattern && !pattern.test(value)) {
      setErrors((prev) => ({
        ...prev,
        [field]: errorMessages[field as keyof typeof errorMessages] || "خطای نامشخص",
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "Name") {
      setName(value);
    } else if (field === "Slug") {
      setSlug(value);
    }
  };

  // Handle slug input: convert spaces to dashes
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\s+/g, "-").toLowerCase(); // Replace spaces with dashes
    setSlug(value);
  };

  return (
    <div>
      {/* Category Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium">نام دسته‌بندی</label>
        <input
          type="text"
          value={name}
          onChange={(e) => handleInputChange("Name", e.target.value)}
          disabled={!editable}
          className="mt-2 w-full rounded-md border bg-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500"
          placeholder="نام دسته‌بندی را وارد کنید"
        />
        {errors.Name && <p className="text-sm text-red-500">{errors.Name}</p>}
      </div>

      {/* Slug */}
      <div className="mb-4">
        <label className="block text-sm font-medium">شناسه (Slug)</label>
        <input
          type="text"
          value={slug}
          onChange={handleSlugChange} // Use the space-to-dash handler
          disabled={!editable}
          className="mt-2 w-full rounded-md border bg-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500"
          placeholder="شناسه دسته‌بندی"
        />
        {errors.Slug && <p className="text-sm text-red-500">{errors.Slug}</p>}
      </div>

      {/* Availability */}
      <div className="mb-4">
        <label className="block text-sm font-medium">فعال (قابل نمایش)</label>
        <select
          value={available ? "true" : "false"}
          onChange={(e) => setAvailable(e.target.value === "true")}
          disabled={!editable}
          className="mt-2 w-full rounded-md border bg-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:text-slate-300"
        >
          <option value="true">بله</option>
          <option value="false">خیر</option>
        </select>
      </div>
    </div>
  );
};

export default CategoryFields;

// Reusable Category/Subcategory Form Fields
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
  parentCategoryId: number | undefined;
  editable?: boolean;
}) => (
  <div>
    <div className="mb-4">
      <label className="block text-sm font-medium">نام دسته‌بندی</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={!editable}
        className="w-full p-3 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="نام دسته‌بندی را وارد کنید"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium">شناسه (Slug)</label>
      <input
        type="text"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        disabled={!editable}
        className="w-full p-3 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="شناسه دسته‌بندی"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium">فعال (قابل نمایش)</label>
      <select
        value={available ? "true" : "false"}
        onChange={(e) => setAvailable(e.target.value === "true")}
        disabled={!editable}
        className="w-full p-3 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="true">بله</option>
        <option value="false">خیر</option>
      </select>
    </div>
  </div>
);

export default CategoryFields;

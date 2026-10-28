import { useState } from "react";
import toast from "react-hot-toast";

import { useApiMutation } from "@/hooks/useApiMutation";
import { useModalA11y } from "@/hooks/useModalA11y";

type NewMemberModalProps = {
  onClose: () => void;
};

const NewMemberModal: React.FC<NewMemberModalProps> = ({ onClose }) => {
  const panelRef = useModalA11y<HTMLDivElement>({
    onClose,
    shouldCloseOnEscape: () => !document.activeElement?.closest("input, textarea, select"),
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    desc: "",
    phone: "",
    slug: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { mutate: createMemberMutate } = useApiMutation("post");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFileName = `${formData.slug}.${file.name.split(".").pop()}`;
      const renamedFile = new File([file], newFileName, { type: file.type });
      setImageFile(renamedFile);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "نام الزامی است.";
    if (!formData.role.trim()) newErrors.role = "نقش الزامی است.";
    if (!formData.desc.trim()) newErrors.desc = "توضیحات الزامی است.";
    if (formData.desc.trim().length > 4000) newErrors.desc = "توضیحات باید زیر ۴۰۰۰ کاراکتر باشد";
    if (!formData.phone.trim()) newErrors.phone = "شماره تماس الزامی است.";
    if (!formData.slug.trim()) newErrors.slug = "شناسه الزامی است.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("role", formData.role);
    formDataToSend.append("desc", formData.desc);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("slug", formData.slug);
    if (imageFile) {
      formDataToSend.append("file", imageFile);
    }

    setLoading(true);
    try {
      const res = await createMemberMutate("/api/members/create", formDataToSend);

      if (res) {
        toast.success("کاربر جدید با موفقیت ساحته شد");
        onClose();
      } else {
        console.error("Error creating member");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-[2px]">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-member-title"
        tabIndex={-1}
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-7xl overflow-auto overscroll-contain rounded-xl border border-slate-500 bg-gray-700 p-4 text-gray-100 shadow-2xl sm:p-6"
        dir="rtl"
      >
        <div className="sticky top-0 z-10 mb-4 flex items-center justify-between gap-3 border-b border-slate-500 bg-gray-700 py-2">
          <h2 id="new-member-title" className="text-xl font-bold sm:text-2xl">
            ایجاد عضو جدید
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن فرم ایجاد عضو"
            className="min-h-10 rounded-lg border border-slate-400 px-3 text-slate-100 hover:bg-slate-600"
          >
            بستن
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="new-member-name" className="mb-2 block">
                نام:
              </label>
              <input
                id="new-member-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                aria-label="نام عضو"
                className={`w-full rounded-lg bg-gray-600 p-2 ${
                  errors.name ? "border border-red-500" : ""
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="new-member-role" className="mb-2 block">
                نقش:
              </label>
              <input
                id="new-member-role"
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                aria-label="نقش عضو"
                className={`w-full rounded-lg bg-gray-600 p-2 ${
                  errors.role ? "border border-red-500" : ""
                }`}
              />
              {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
            </div>
            <div className="col-span-2">
              <label htmlFor="new-member-desc" className="mb-2 block">
                توضیحات:
              </label>
              <textarea
                id="new-member-desc"
                name="desc"
                value={formData.desc}
                onChange={handleInputChange}
                aria-label="توضیحات عضو"
                className={`w-full rounded-lg bg-gray-600 p-2 ${
                  errors.desc ? "border border-red-500" : ""
                }`}
                rows={5}
              />
              {errors.desc && <p className="mt-1 text-sm text-red-500">{errors.desc}</p>}
            </div>
            <div>
              <label htmlFor="new-member-phone" className="mb-2 block">
                شماره تماس:
              </label>
              <input
                id="new-member-phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                aria-label="شماره تماس عضو"
                className={`w-full rounded-lg bg-gray-600 p-2 ${
                  errors.phone ? "border border-red-500" : ""
                }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="new-member-slug" className="mb-2 block">
                شناسه:
              </label>
              <input
                id="new-member-slug"
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                aria-label="شناسه عضو"
                className={`w-full rounded-lg bg-gray-600 p-2 ${
                  errors.slug ? "border border-red-500" : ""
                }`}
              />
              {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug}</p>}
            </div>
            <div className="col-span-2">
              <label htmlFor="new-member-image" className="mb-2 block">
                تصویر پروفایل:
              </label>
              <input
                id="new-member-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                aria-label="تصویر پروفایل عضو"
                className="w-full rounded-lg bg-gray-600 p-2"
              />
              {imageFile && (
                <p className="mt-2 text-sm text-gray-400">تصویر انتخاب شده: {imageFile.name}</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-red-600 px-4 py-2 transition-colors hover:bg-red-700"
            >
              بستن
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 ${
                loading ? "cursor-not-allowed bg-green-700" : "bg-green-600 hover:bg-green-700"
              } rounded-lg text-gray-100 transition-colors`}
            >
              {loading ? "در حال ایجاد..." : "ایجاد عضو"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMemberModal;

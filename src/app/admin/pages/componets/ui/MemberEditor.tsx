import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useModalA11y } from "@/hooks/useModalA11y";

type MemberEditModalProps = {
  id: number | null;
  onClose: () => void;
};

type Member = {
  Membersid: number;
  main_pic: string;
  Name: string;
  Role: string;
  main_description: string;
  Slug: string;
  phonenumber: string | null;
};

const MemberEditor: React.FC<MemberEditModalProps> = ({ id, onClose }) => {
  const panelRef = useModalA11y<HTMLDivElement>({
    onClose,
    shouldCloseOnEscape: () => !document.activeElement?.closest("input, textarea, select"),
  });
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    desc: "",
    phone: "",
    slug: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { data: memberData } = useApiFetch<Member>(id ? `/api/members/${id}` : null);
  const { mutate: updateMemberMutate } = useApiMutation("put");
  const initializedRef = useRef(false);

  useEffect(() => {
    panelRef.current?.focus();
  }, [loading, error, member, panelRef]);

  useEffect(() => {
    if (memberData && !initializedRef.current) {
      initializedRef.current = true;

      setMember(memberData);
      setFormData({
        name: memberData.Name,
        role: memberData.Role,
        desc: memberData.main_description,
        phone: memberData.phonenumber || "",
        slug: memberData.Slug,
      });
      setLoading(false);
    }
  }, [memberData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when the user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Rename the file to the member's slug
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
    if (!formData.slug.trim()) newErrors.slug = "اسلاگ الزامی است.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Create a FormData object to send the data
    const formDataToSend = new FormData();
    formDataToSend.append("id", id?.toString() || "");
    formDataToSend.append("name", formData.name);
    formDataToSend.append("role", formData.role);
    formDataToSend.append("desc", formData.desc);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("slug", formData.slug);
    if (imageFile) {
      formDataToSend.append("file", imageFile);
    }

    setSaving(true);
    try {
      const res = await updateMemberMutate("/api/members/update", formDataToSend);

      if (res) {
        toast.success("عضو با موفقیت آپدیت شد");
        onClose();
      } else {
        toast.error("خطا در به‌روزرسانی عضو، مجددا تلاش کنید");
        setError("خطا در به‌روزرسانی عضو، مجددا تلاش کنید");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading && id) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-[2px]">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="در حال بارگذاری ویرایش عضو"
          tabIndex={-1}
          className="max-h-[calc(100dvh-1.5rem)] w-full max-w-7xl overflow-auto rounded-xl border border-slate-500 bg-gray-700 p-4 text-gray-200 shadow-lg sm:p-6"
          dir="rtl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="mb-4 text-2xl font-bold" aria-hidden="true">
            <div className="h-8 w-1/3 animate-pulse rounded bg-gray-600"></div>
          </h2>
          <span className="sr-only">در حال بارگذاری اطلاعات عضو</span>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[...Array(2)].map((_, index) => (
              <div key={index}>
                <div className="mb-2 h-6 w-1/4 animate-pulse rounded bg-gray-600"></div>
                <div className="h-10 w-full animate-pulse rounded bg-gray-600"></div>
              </div>
            ))}
            <div className="col-span-2">
              <div className="mb-2 h-6 w-1/4 animate-pulse rounded bg-gray-600"></div>
              <div className="h-32 w-full animate-pulse rounded bg-gray-600"></div>
            </div>
            <div className="col-span-2">
              <div className="mb-2 h-6 w-1/4 animate-pulse rounded bg-gray-600"></div>
              <div className="h-48 w-full animate-pulse rounded bg-gray-600"></div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <div className="h-10 w-24 animate-pulse rounded bg-gray-600"></div>
            <div className="h-10 w-24 animate-pulse rounded bg-gray-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-[2px]">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="خطا در ویرایش عضو"
          tabIndex={-1}
          className="w-full max-w-md rounded-xl border border-slate-500 bg-gray-700 p-6 text-gray-200 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <p>{error}</p>
          <button type="button" onClick={onClose} className="mt-4 rounded-lg bg-red-600 px-4 py-2">
            بستن
          </button>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-[2px]">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="عضو یافت نشد"
          tabIndex={-1}
          className="w-full max-w-md rounded-xl border border-slate-500 bg-gray-700 p-6 text-gray-200 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <p>عضو یافت نشد.</p>
          <button type="button" onClick={onClose} className="mt-4 rounded-lg bg-red-600 px-4 py-2">
            بستن
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-[2px]">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-editor-title"
        tabIndex={-1}
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-7xl overflow-auto overscroll-contain rounded-xl border border-slate-500 bg-gray-700 p-4 text-gray-100 shadow-2xl sm:p-6"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 mb-4 flex items-center justify-between gap-3 border-b border-slate-500 bg-gray-700 py-2">
          <h2 id="member-editor-title" className="text-xl font-bold sm:text-2xl">
            ویرایش عضو {member.Name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن ویرایش عضو"
            className="min-h-10 rounded-lg border border-slate-400 px-3 text-slate-100 hover:bg-slate-600"
          >
            بستن
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="member-name" className="mb-2 block">
                نام:
              </label>
              <input
                id="member-name"
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
              <label htmlFor="member-role" className="mb-2 block">
                نقش:
              </label>
              <input
                id="member-role"
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
              <label htmlFor="member-desc" className="mb-2 block">
                توضیحات:
              </label>
              <textarea
                id="member-desc"
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
              <label htmlFor="member-phone" className="mb-2 block">
                شماره تماس:
              </label>
              <input
                id="member-phone"
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
              <label htmlFor="member-slug" className="mb-2 block">
                اسلاگ:
              </label>
              <input
                id="member-slug"
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                aria-label="اسلاگ عضو"
                className={`w-full rounded-lg bg-gray-600 p-2 ${
                  errors.slug ? "border border-red-500" : ""
                }`}
              />
              {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug}</p>}
            </div>
            <div className="col-span-2">
              <label htmlFor="member-image" className="mb-2 block">
                تصویر پروفایل:
              </label>
              {member.main_pic && (
                <div className="mb-4">
                  <Image
                    width={480}
                    height={480}
                    quality={100}
                    src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/member-images/${member.main_pic}`}
                    alt="پروفایل فعلی"
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
              <input
                id="member-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                aria-label="تصویر پروفایل عضو"
                className="w-full rounded-lg bg-gray-600 p-2"
              />
              {imageFile && (
                <p className="mt-2 text-sm text-gray-400">
                  تصویر جدید انتخاب شده: {imageFile.name}
                </p>
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
              disabled={saving}
              className={`px-4 py-2 ${
                saving ? "cursor-not-allowed bg-green-700" : "bg-green-600 hover:bg-green-700"
              } rounded-lg text-gray-100 transition-colors`}
            >
              {saving ? "در حال ذخیره کردن" : "ذخیره تغییرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberEditor;

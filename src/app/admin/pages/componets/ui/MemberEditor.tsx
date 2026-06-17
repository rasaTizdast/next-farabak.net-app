import Image from "next/image";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";

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

  useEffect(() => {
    if (memberData) {
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

    const res = await updateMemberMutate("/api/members/update", formDataToSend);

    if (res) {
      toast.success("عضو با موفقیت آپدیت شد");
      onClose();
    } else {
      toast.error("خطا در به‌روزرسانی عضو، مجددا تلاش کنید");
      setError("خطا در به‌روزرسانی عضو، مجددا تلاش کنید");
    }

    setSaving(false);
  };

  if (loading && id) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div
          className="max-h-[95dvh] w-full max-w-7xl overflow-auto rounded-lg bg-gray-700 p-6 text-gray-200 shadow-lg"
          dir="rtl"
        >
          <h2 className="mb-4 text-2xl font-bold">
            <div className="h-8 w-1/3 animate-pulse rounded bg-gray-600"></div>
          </h2>
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
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="rounded-lg bg-gray-700 p-6 text-gray-200 shadow-lg">
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
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="rounded-lg bg-gray-700 p-6 text-gray-200 shadow-lg">
          <p>عضو یافت نشد.</p>
          <button type="button" onClick={onClose} className="mt-4 rounded-lg bg-red-600 px-4 py-2">
            بستن
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        className="max-h-[95dvh] w-full max-w-7xl overflow-auto rounded-lg bg-gray-700 p-6 text-gray-200 shadow-lg"
        dir="rtl"
      >
        <h2 className="mb-4 text-2xl font-bold">ویرایش عضو {member.Name}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block">نام:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full rounded-lg bg-gray-600 p-2 ${
                  errors.name ? "border border-red-500" : ""
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-2 block">نقش:</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full rounded-lg bg-gray-600 p-2 ${
                  errors.role ? "border border-red-500" : ""
                }`}
              />
              {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
            </div>
            <div className="col-span-2">
              <label className="mb-2 block">توضیحات:</label>
              <textarea
                name="desc"
                value={formData.desc}
                onChange={handleInputChange}
                className={`w-full rounded-lg bg-gray-600 p-2 ${
                  errors.desc ? "border border-red-500" : ""
                }`}
                rows={5}
              />
              {errors.desc && <p className="mt-1 text-sm text-red-500">{errors.desc}</p>}
            </div>
            <div>
              <label className="mb-2 block">شماره تماس:</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full rounded-lg bg-gray-600 p-2 ${
                  errors.phone ? "border border-red-500" : ""
                }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <label className="mb-2 block">اسلاگ:</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className={`w-full rounded-lg bg-gray-600 p-2 ${
                  errors.slug ? "border border-red-500" : ""
                }`}
              />
              {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug}</p>}
            </div>
            <div className="col-span-2">
              <label className="mb-2 block">تصویر پروفایل:</label>
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
                type="file"
                accept="image/*"
                onChange={handleImageChange}
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
              className="rounded-lg bg-red-600 px-4 py-2 transition-all hover:bg-red-700"
            >
              بستن
            </button>
            <button
              type="submit"
          disabled={saving}
          className={`px-4 py-2 ${
            saving ? "cursor-not-allowed bg-green-700" : "bg-green-600 hover:bg-green-700"
          } rounded-lg text-gray-100 transition-all`}
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

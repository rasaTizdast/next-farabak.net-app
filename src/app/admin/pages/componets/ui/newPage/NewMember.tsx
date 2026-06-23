import { useState } from "react";
import toast from "react-hot-toast";

import { useApiMutation } from "@/hooks/useApiMutation";

type NewMemberModalProps = {
  onClose: () => void;
};

const NewMemberModal: React.FC<NewMemberModalProps> = ({ onClose }) => {
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

    const res = await createMemberMutate("/api/members/create", formDataToSend);

    if (res) {
      toast.success("کاربر جدید با موفقیت ساحته شد");
      onClose();
    } else {
      console.error("Error creating member");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        className="max-h-[95dvh] w-full max-w-7xl overflow-auto rounded-lg bg-gray-700 p-6 text-gray-200 shadow-lg"
        dir="rtl"
      >
        <h2 className="mb-4 text-2xl font-bold">ایجاد عضو جدید</h2>
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
              <label className="mb-2 block">شناسه:</label>
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
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
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
              className="rounded-lg bg-red-600 px-4 py-2 transition-all hover:bg-red-700"
            >
              بستن
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 ${
                loading ? "cursor-not-allowed bg-green-700" : "bg-green-600 hover:bg-green-700"
              } rounded-lg text-gray-100 transition-all`}
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

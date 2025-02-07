import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";

type NewMemberModalProps = {
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
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
    if (formData.desc.trim().length > 4000)
      newErrors.desc = "توضیحات باید زیر ۴۰۰۰ کاراکتر باشد";
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
      const response = await fetch("/api/members/create", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to create member");
      }

      toast.success("کاربر جدید با موفقیت ساحته شد");
      onClose();
    } catch (error) {
      console.error("Error creating member:", error);
      setError("خطا در ایجاد عضو، مجددا تلاش کنید");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        className="bg-gray-700 text-gray-200 p-6 rounded-lg shadow-lg w-full max-w-7xl max-h-[95dvh] overflow-auto"
        dir="rtl"
      >
        <h2 className="text-2xl font-bold mb-4">ایجاد عضو جدید</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">نام:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full p-2 bg-gray-600 rounded-lg ${
                  errors.name ? "border border-red-500" : ""
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block mb-2">نقش:</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full p-2 bg-gray-600 rounded-lg ${
                  errors.role ? "border border-red-500" : ""
                }`}
              />
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role}</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block mb-2">توضیحات:</label>
              <textarea
                name="desc"
                value={formData.desc}
                onChange={handleInputChange}
                className={`w-full p-2 bg-gray-600 rounded-lg ${
                  errors.desc ? "border border-red-500" : ""
                }`}
                rows={5}
              />
              {errors.desc && (
                <p className="text-red-500 text-sm mt-1">{errors.desc}</p>
              )}
            </div>
            <div>
              <label className="block mb-2">شماره تماس:</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full p-2 bg-gray-600 rounded-lg ${
                  errors.phone ? "border border-red-500" : ""
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="block mb-2">شناسه:</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className={`w-full p-2 bg-gray-600 rounded-lg ${
                  errors.slug ? "border border-red-500" : ""
                }`}
              />
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block mb-2">تصویر پروفایل:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 bg-gray-600 rounded-lg"
              />
              {imageFile && (
                <p className="text-sm text-gray-400 mt-2">
                  تصویر انتخاب شده: {imageFile.name}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 transition-all rounded-lg"
            >
              بستن
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 ${
                loading
                  ? "bg-green-700 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } transition-all text-gray-100 rounded-lg`}
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

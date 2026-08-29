import Image from "next/image";
import { useEffect, useState } from "react";

interface ImageInputProps {
  label: string;
  imageUrl: string;
  onChange: (file: File) => void;
}

const ImageInput: React.FC<ImageInputProps> = ({ label, imageUrl, onChange }) => {
  const [preview, setPreview] = useState(() => imageUrl);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file)); // Preview the new image
      onChange(file); // Call the onChange callback
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div>{label}</div>
      <div className="relative h-64 w-full">
        {/* Image */}
        <Image
          width={1920}
          height={1080}
          quality={100}
          src={preview}
          alt="آپلود تصویر"
          className="size-full rounded-lg bg-gray-900 object-contain transition-colors"
        />

        {/* Hover overlay */}
        <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-lg bg-black opacity-0 transition-opacity duration-300 hover:opacity-100">
          <label className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            آپلود عکس
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      </div>
    </div>
  );
};

export default ImageInput;

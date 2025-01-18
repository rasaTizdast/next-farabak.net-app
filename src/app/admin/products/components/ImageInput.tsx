import Image from "next/image";
import { useState } from "react";

interface ImageInputProps {
  label: string;
  imageUrl: string;
  onChange: (file: File) => void;
}

const ImageInput: React.FC<ImageInputProps> = ({
  label,
  imageUrl,
  onChange,
}) => {
  const [preview, setPreview] = useState(imageUrl);

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
      <div className="relative w-full h-64">
        {/* Image */}
        <Image
          width={1920}
          height={1080}
          quality={100}
          src={preview}
          alt="Upload"
          className="w-full h-full object-contain rounded-lg bg-gray-900 transition-all"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 rounded-lg">
          <label className="cursor-pointer text-white px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-all">
            آپلود عکس
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default ImageInput;

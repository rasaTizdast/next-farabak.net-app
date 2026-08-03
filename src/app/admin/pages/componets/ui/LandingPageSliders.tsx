import Image from "next/image";
import { FiPlus, FiTrash2, FiZoomIn } from "react-icons/fi";

export type Slider = {
  id: number;
  image_URL: string;
  image_alt?: string;
  link: string;
};

const SliderItem = ({
  slider,
  onPreview,
  onDelete,
  isDeleting,
}: {
  slider: Slider;
  onPreview: (url: string) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) => (
  <div className="relative flex items-center justify-between rounded-lg bg-gray-800 p-4 shadow-md transition-all hover:shadow-lg">
    <div className="flex flex-1 items-center gap-4 space-x-4">
      <div className="relative">
        <Image
          width={120}
          height={80}
          quality={100}
          src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/slider-imgs/${slider.image_URL}`}
          alt={slider.image_alt || "اسلایدر"}
          className="h-20 w-32 cursor-zoom-in rounded-lg object-cover"
          onClick={() =>
            onPreview(`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/slider-imgs/${slider.image_URL}`)
          }
        />
        <FiZoomIn size={20} className="absolute left-1 top-1 rounded bg-black/50 p-1 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-gray-300">{slider.link}</p>
        {slider.image_alt && <p className="mt-1 text-xs text-gray-400">{slider.image_alt}</p>}
      </div>
    </div>
    <button
      type="button"
      onClick={() => onDelete(slider.id)}
      className="rounded-lg p-2 transition-colors hover:bg-gray-700"
      disabled={isDeleting}
      aria-label="حذف اسلایدر"
    >
      {isDeleting ? (
        <span className="loading-dots">حذف</span>
      ) : (
        <FiTrash2 className="h-5 w-5 text-red-500" />
      )}
    </button>
  </div>
);

const NewSliderForm = ({
  isUploading,
  onFileChange,
  newSlider,
  onFieldChange,
  onSubmit,
}: {
  isUploading: boolean;
  onFileChange: (file: File | null) => void;
  newSlider: Partial<Slider>;
  onFieldChange: (field: string, value: string) => void;
  onSubmit: () => void;
}) => (
  <div className="mt-4 rounded-lg bg-gray-800 p-5">
    <h4 className="mb-4 font-medium">اسلایدر جدید</h4>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <label className="space-y-1">
        <span className="text-sm text-gray-300">تصویر</span>
        <input
          type="file"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          aria-label="انتخاب تصویر اسلایدر"
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 file:mr-2 file:border-0 file:bg-gray-600 file:px-3 file:py-1 file:text-gray-300"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm text-gray-300">لینک</span>
        <input
          type="text"
          placeholder="https://example.com"
          value={newSlider.link || ""}
          onChange={(e) => onFieldChange("link", e.target.value)}
          aria-label="لینک اسلایدر"
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2"
        />
      </label>
      <label className="space-y-1 md:col-span-2">
        <span className="text-sm text-gray-300">متن جایگزین (اختیاری)</span>
        <input
          type="text"
          placeholder="توضیح تصویر"
          value={newSlider.image_alt || ""}
          onChange={(e) => onFieldChange("image_alt", e.target.value)}
          aria-label="متن جایگزین اسلایدر"
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2"
        />
      </label>
    </div>
    <button
      type="button"
      onClick={onSubmit}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
      disabled={isUploading}
    >
      {isUploading ? (
        <span className="loading-dots">در حال آپلود</span>
      ) : (
        <>
          <FiPlus className="h-5 w-5" />
          افزودن اسلایدر
        </>
      )}
    </button>
  </div>
);

export const SliderSection = ({
  sliders,
  onPreview,
  onConfirmDelete,
  isDeletingSlider,
  newSlider,
  setNewSlider,
  sliderFile,
  setSliderFile,
  isUploadingSlider,
  handleAddSlider,
}: {
  sliders: Slider[];
  onPreview: (url: string) => void;
  onConfirmDelete: (type: "slider" | "product", id: number) => void;
  isDeletingSlider: number | null;
  newSlider: Partial<Slider>;
  setNewSlider: React.Dispatch<React.SetStateAction<Partial<Slider>>>;
  sliderFile: File | null;
  setSliderFile: React.Dispatch<React.SetStateAction<File | null>>;
  isUploadingSlider: boolean;
  handleAddSlider: () => Promise<void>;
}) => (
  <section className="mb-8">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-xl font-semibold">اسلایدرها</h3>
      <span className="text-sm text-gray-400">{sliders.length} آیتم</span>
    </div>

    <div className="mb-6 space-y-3">
      {sliders.map((slider) => (
        <SliderItem
          key={slider.id}
          slider={slider}
          onPreview={onPreview}
          onDelete={(id) => onConfirmDelete("slider", id)}
          isDeleting={isDeletingSlider === slider.id}
        />
      ))}
    </div>

    <NewSliderForm
      isUploading={isUploadingSlider}
      onFileChange={setSliderFile}
      newSlider={newSlider}
      onFieldChange={(field, value) => setNewSlider((prev) => ({ ...prev, [field]: value }))}
      onSubmit={handleAddSlider}
    />
  </section>
);
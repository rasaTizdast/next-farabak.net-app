import { X, Upload } from "lucide-react";
import React, { useState, useRef } from "react";

interface VideoUploadModalProps {
  onClose: () => void;
  onVideoUpload: (file: File) => Promise<void>;
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({ onClose, onVideoUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File | null) => {
    setError(null);

    if (!file) {
      return;
    }

    // Check if it's a video
    if (!file.type.startsWith("video/")) {
      setError("لطفا فقط فایل ویدیویی انتخاب کنید");
      return;
    }

    // Check file size (1.5GB max)
    const maxSize = 1.5 * 1024 * 1024 * 1024; // 1.5GB in bytes
    if (file.size > maxSize) {
      setError("حجم فایل نباید بیشتر از 1.5 گیگابایت باشد");
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      await onVideoUpload(selectedFile);
      onClose();
    } catch {
      setError("آپلود ویدیو با خطا مواجه شد");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-gray-900 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">آپلود ویدیو</h2>
          <button type="button" onClick={onClose} className="text-gray-300 hover:text-white" disabled={uploading} aria-label="بستن">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-gray-300">حداکثر حجم مجاز برای آپلود ویدیو: 1.5 گیگابایت</p>
          <p className="mb-4 text-sm text-gray-400">فرمت‌های مجاز: MP4, WebM, MOV</p>
        </div>

        <div
          className={`mb-4 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center ${
            isDragging ? "border-blue-500 bg-blue-100 bg-opacity-10" : "border-gray-600"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="video/*"
            disabled={uploading}
          />
          <Upload size={40} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-300">
            فایل ویدیویی را اینجا رها کنید یا برای انتخاب فایل کلیک کنید
          </p>
        </div>

        {selectedFile && (
          <div className="mb-4 flex items-center justify-between rounded bg-gray-800 p-3">
            <div className="truncate">
              <p className="font-medium text-white">{selectedFile.name}</p>
              <p className="text-sm text-gray-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button type="button"
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-white"
              disabled={uploading}
              aria-label="حذف فایل انتخاب شده"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-900 bg-opacity-40 p-2 text-red-300">{error}</div>
        )}

        <div className="flex justify-end gap-3">
          <button type="button"
            onClick={onClose}
            className="rounded-md bg-gray-700 px-4 py-2 text-white transition hover:bg-gray-600"
            disabled={uploading}
          >
            انصراف
          </button>
          <button type="button"
            onClick={handleUpload}
            className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-500"
            disabled={!selectedFile || uploading}
          >
            {uploading ? "در حال آپلود..." : "آپلود ویدیو"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;

import React, { useState, useRef } from "react";
import { X, Upload } from "lucide-react";

interface VideoUploadModalProps {
  onClose: () => void;
  onVideoUpload: (file: File) => Promise<void>;
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  onClose,
  onVideoUpload,
}) => {
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
    } catch (error) {
      console.error("Upload failed:", error);
      setError("آپلود ویدیو با خطا مواجه شد");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-lg p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">آپلود ویدیو</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white"
            disabled={uploading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 mb-2">
            حداکثر حجم مجاز برای آپلود ویدیو: 1.5 گیگابایت
          </p>
          <p className="text-gray-400 text-sm mb-4">
            فرمت‌های مجاز: MP4, WebM, MOV
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 cursor-pointer ${
            isDragging
              ? "border-blue-500 bg-blue-100 bg-opacity-10"
              : "border-gray-600"
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
          <div className="mb-4 p-3 bg-gray-800 rounded flex justify-between items-center">
            <div className="truncate">
              <p className="font-medium text-white">{selectedFile.name}</p>
              <p className="text-sm text-gray-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-white"
              disabled={uploading}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-2 bg-red-900 bg-opacity-40 text-red-300 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
            disabled={uploading}
          >
            انصراف
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition flex items-center"
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

// "use client";

// import { useRef, useEffect, useState } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import EditorJS from "@editorjs/editorjs";
// import Header from "@editorjs/header";
// import ImageTool from "@editorjs/image";

// const EditorPage = () => {
//   const editorInstanceRef = useRef<EditorJS | null>(null);
//   const [imageFiles, setImageFiles] = useState<File[]>([]);

//   // Initialize Editor.js
//   useEffect(() => {
//     const editor = new EditorJS({
//       holder: "editorjs",
//       tools: {
//         heading: Header,
//         image: {
//           class: ImageTool,
//           config: {
//             uploader: {
//               uploadByFile: async (file: File) => {
//                 // Temporarily store the image locally
//                 setImageFiles((prev) => [...prev, file]);

//                 // Return a placeholder image for now
//                 return {
//                   success: 1,
//                   file: {
//                     url: URL.createObjectURL(file), // Temporary local URL for preview
//                   },
//                 };
//               },
//             },
//           },
//         },
//       },
//       placeholder: "شروع به تایپ کنید...",
//       autofocus: true,
//       i18n: {
//         direction: "rtl", // Right-to-left language support
//       },
//     });

//     editorInstanceRef.current = editor;

//     return () => {
//       if (editorInstanceRef.current) {
//         editorInstanceRef.current.destroy();
//         editorInstanceRef.current = null;
//       }
//     };
//   }, []);

//   // Handle Copy Result
//   const handleCopyResult = async () => {
//     try {
//       if (!editorInstanceRef.current) {
//         toast.error("Editor not initialized");
//         return;
//       }

//       // Upload images first
//       const uploadedImages = await Promise.all(
//         imageFiles.map(async (file) => {
//           const formData = new FormData();
//           formData.append("image", file);

//           const response = await fetch("/api/uploads", {
//             method: "POST",
//             body: formData,
//           });

//           const data = await response.json();
//           if (!data.success) throw new Error("Image upload failed");
//           return { original: file.name, url: data.file.url };
//         })
//       );

//       // Replace temporary URLs in the editor content
//       const outputData = await editorInstanceRef.current.save();
//       const updatedBlocks = outputData.blocks.map((block) => {
//         if (block.type === "image") {
//           const uploadedImage = uploadedImages.find((img) =>
//             block.data.file.url.includes(img.original)
//           );
//           if (uploadedImage) {
//             block.data.file.url = uploadedImage.url;
//           }
//         }
//         return block;
//       });

//       // Copy the updated content to the clipboard
//       navigator.clipboard.writeText(
//         JSON.stringify({ ...outputData, blocks: updatedBlocks }, null, 2)
//       );

//       toast.success("Copied to clipboard!");
//     } catch (error) {
//       console.error("Error saving editor content:", error);
//       toast.error("Failed to copy content.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-2xl font-bold mb-6 text-gray-800">
//           Create Blog Post
//         </h1>

//         {/* Editor Container */}
//         <div
//           id="editorjs"
//           className="border border-gray-300 rounded-md bg-white p-4 shadow-sm"
//         ></div>

//         {/* Copy Button */}
//         <div className="mt-6 text-right">
//           <button
//             onClick={handleCopyResult}
//             className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
//           >
//             Copy Result
//           </button>
//         </div>
//       </div>

//       {/* Toast Notifications */}
//       <Toaster position="top-right" />
//     </div>
//   );
// };

// export default EditorPage;

import React from "react";

const EditorPage = () => {
  return <div>EditorPage</div>;
};

export default EditorPage;

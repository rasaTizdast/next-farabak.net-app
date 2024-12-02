// import Breadcrumb from "@/app/_components/ui/Breadcrumb";
// import Image from "next/image";
// import React from "react";

// // Mock blog data (replace with API data or props in the future)
// const blog = {
//   title: "آموزش کامل React.js",
//   date: "2024-11-01",
//   thumbnail: "/blogs/react.js/test-1.png",
//   content: [
//     { type: "h1", text: "مقدمه" },
//     { type: "paragraph", text: "ری‌اکت یک کتابخانه جاوااسکریپت است که..." },
//     { type: "h2", text: "چرا ری‌اکت؟" },
//     {
//       type: "list",
//       items: ["پرفرمنس بالا", "انعطاف‌پذیری", "کامپوننت محور"],
//     },
//     {
//       type: "image",
//       src: "/blogs/react.js/test-1.png",
//     },
//     { type: "paragraph", text: "یکی از بزرگ‌ترین مزایای ری‌اکت، پشتیبانی..." },
//   ],
// };

// // Components for rendering different content types
// const Heading = ({ level, text }: { level: number; text: string }) => {
//   const Tag = `h${level}` as keyof JSX.IntrinsicElements;
//   return (
//     <Tag className={`text-${4 - level}xl font-bold my-4 text-gray-700`}>
//       {text}
//     </Tag>
//   );
// };

// const Paragraph = ({ text }: { text: string }) => (
//   <p className="text-md sm:text-lg leading-relaxed my-4 text-gray-600">{text}</p>
// );

// const List = ({ items }: { items: string[] }) => (
//   <ul className="list-disc list-inside my-4 text-gray-600 pl-4">
//     {items.map((item, index) => (
//       <li key={index} className="text-lg">
//         {item}
//       </li>
//     ))}
//   </ul>
// );

// const BlogImage = ({ src, alt }: { src: string; alt: string }) => (
//   <div className="my-8 flex justify-center">
//     <Image
//       src={src}
//       alt={alt}
//       width={800}
//       height={450}
//       className="rounded-lg shadow-lg object-cover hover:scale-[1.02] transition-transform"
//     />
//     <p className="text-center text-sm text-gray-500 mt-2">{alt}</p>
//   </div>
// );

// // Calculate ETA (Estimated Reading Time)
// const calculateReadTime = (content: (typeof blog)["content"]): string => {
//   const wordsPerMinute = 200; // Average reading speed for Persian text
//   const totalWords = content.reduce((count, block) => {
//     if (block.type === "paragraph") count += block.text.split(" ").length;
//     if (block.type === "list")
//       count += block.items.reduce(
//         (acc, item) => acc + item.split(" ").length,
//         0
//       );
//     return count;
//   }, 0);
//   const minutes = Math.ceil(totalWords / wordsPerMinute);
//   return `${minutes} دقیقه خواندن`;
// };

// const BlogContent = () => {
//   return (
//     <div className="mt-8">
//       {blog.content.map((block, index) => {
//         switch (block.type) {
//           case "h1":
//           case "h2":
//           case "h3":
//           case "h4":
//           case "h5":
//           case "h6":
//             return (
//               <Heading
//                 key={index}
//                 level={parseInt(block.type[1])}
//                 text={block.text}
//               />
//             );
//           case "paragraph":
//             return <Paragraph key={index} text={block.text} />;
//           case "list":
//             return <List key={index} items={block.items} />;
//           case "image":
//             return <BlogImage key={index} src={block.src} alt={block.alt} />;
//           default:
//             return null;
//         }
//       })}
//     </div>
//   );
// };

// const breadcrumbs = [
//   { path: "/", href: "/" },
//   { path: "/support", href: "/support" },
//   { path: "/support/blog", href: "/support/blog" },
// ];

// const BlogPage = () => {
//   return (
//     <>
//       {/* Breadcrumb */}
//       <Breadcrumb breadcrumbs={breadcrumbs} />

//       {/* Blog Container */}
//       <div className="w-full p-4 sm:p-10 bg-white shadow-lg rounded-lg md:mt-6 mt-3">
//         {/* Blog Details */}
//         <div className="text-right">
//           <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-800">
//             {blog.title}
//           </h1>

//           <div className="flex items-center flex-col sm:flex-row gap-4 mt-5 sm:mt-8 text-xs sm:text-sm text-gray-500">
//             <p className="bg-gray-200 rounded-md px-3 py-2 w-full sm:w-auto text-center">
//               تاریخ: {new Date(blog.date).toLocaleDateString("fa-IR")}
//             </p>
//             <p className="bg-gray-200 rounded-md text-xs sm:text-sm px-3 py-2 w-full sm:w-auto text-center">
//               {calculateReadTime(blog.content)}
//             </p>
//           </div>
//           <div className="w-full h-[1px] bg-slate-400 my-8" />
//         </div>

//         {/* Blog Thumbnail */}
//         <div className="my-8 flex justify-center">
//           <Image
//             src={blog.thumbnail}
//             alt={blog.title}
//             width={1100}
//             height={1080}
//             quality={100}
//             className="rounded-lg shadow-xl object-cover"
//           />
//         </div>

//         {/* Blog Content */}
//         <BlogContent />
//       </div>
//     </>
//   );
// };

// export default BlogPage;

import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page
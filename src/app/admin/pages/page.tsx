"use client";

import React, { useEffect, useState } from "react";
import { HiArrowTurnLeftDown } from "react-icons/hi2";
import { FaLink } from "react-icons/fa6";
import Link from "next/link";
import LandingPageEditor from "./componets/ui/LandingPage";
import BlogEditModal from "./componets/ui/BlogEditModal";
import MemberEditor from "./componets/ui/MemberEditor";
import ProjectEditor from "./componets/ui/ProjectEditor";
import ActivityEditor from "./componets/ui/ActivityEditor";
import ContactUsEditor from "./componets/ui/ContactUsEditor";
import { FaEdit } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import NewMember from "./componets/ui/newPage/NewMember";
import NewBlog from "./componets/ui/newPage/NewBlog";
import NewProject from "./componets/ui/newPage/NewProject";
import { MdDeleteForever } from "react-icons/md";
import { IoQrCode } from "react-icons/io5";
import BlogQrCodeModal from "./componets/ui/QrCodeModal";

type PageRow = {
  name: string;
  pages: number;
  link: string;
  multiPage?: boolean;
  editorType: string;
  newType?: string | null;
};

type SubPage = {
  id: number;
  name: string;
  link: string;
  QrCode_key?: string;
  QrCode_expiryDays?: string;
};

const AdminPageManager: React.FC = () => {
  const [rowNames, setRowNames] = useState<PageRow[]>([]);
  const [subPages, setSubPages] = useState<Record<string, SubPage[]>>({});
  const [loading, setLoading] = useState(true); // Loading state

  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false);
  const [qrCodeBlog, setQrCodeBlog] = useState<{
    id: number;
    link: string;
    QrCode_key?: string;
    QrCode_expiryDays?: string;
  } | null>(null);

  const fetchPageData = () => {
    fetch("/api/admin/pages")
      .then((res) => res.json())
      .then((data) => {
        setRowNames(data.rowNames);
        setSubPages(data.subPages);
        setLoading(false); // Data fetched, stop loading
      })
      .catch(() => {
        setLoading(false); // Handle error and stop loading
      });
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [editorConfig, setEditorConfig] = useState<{
    type: string;
    id: number | null;
  } | null>(null);

  const [newPageConfig, setNewPageConfig] = useState<{
    type: string;
  } | null>(null);

  const toggleExpand = (link: string) => {
    setExpanded(expanded === link ? null : link);
  };

  const openEditor = (type: string, id: number | null = null) => {
    setEditorConfig({ type, id });
  };

  const closeEditor = () => {
    setEditorConfig(null);
    fetchPageData();
  };

  const openNewPageBuilder = (type: string | null | undefined) => {
    if (type) {
      setNewPageConfig({ type });
    }
  };

  const closeNewPageBuilder = () => {
    setNewPageConfig(null);
    fetchPageData();
  };

  const renderEditor = () => {
    switch (editorConfig?.type) {
      case "landingPage":
        return <LandingPageEditor onClose={closeEditor} />;
      case "blog":
        return <BlogEditModal id={editorConfig.id} onClose={closeEditor} />;
      case "member":
        return <MemberEditor id={editorConfig.id} onClose={closeEditor} />;
      case "project":
        return <ProjectEditor id={editorConfig.id} onClose={closeEditor} />;
      case "activity":
        return <ActivityEditor onClose={closeEditor} />;
      case "contact":
        return <ContactUsEditor onClose={closeEditor} />;
      default:
        return null;
    }
  };

  const renderNewPageBuilder = () => {
    switch (newPageConfig?.type) {
      case "newBlog":
        return <NewBlog onClose={closeNewPageBuilder} />;
      case "newMember":
        return <NewMember onClose={closeNewPageBuilder} />;
      case "newProject":
        return <NewProject onClose={closeNewPageBuilder} />;
      default:
        return null;
    }
  };

  const deleteItem = async (type: string, id: number) => {
    try {
      let endpoint = "";

      // Determine endpoint based on type
      switch (type) {
        case "member":
          endpoint = `/api/members/${id}`;
          break;
        case "blog":
          endpoint = `/api/blogs/delete/${id}`;
          break;
        case "project":
          endpoint = `/api/projects/${id}`;
          break;

        // Add more cases as needed
        default:
          throw new Error("Invalid delete type");
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("عملیات حذف با موفقیت انجام شد");
        fetchPageData();
      } else {
        const errorData = await response.json();
        toast.error(`خطا در حذف: ${errorData.error || "خطای ناشناخته"}`);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("خطا در ارتباط با سرور");
    }
  };

  // In AdminPageManager or wherever the modal is opened
  const handleQrCodeModal = (blog: {
    id: number;
    link: string;
    QrCode_key?: string;
    QrCode_expiryDays?: string;
  }) => {
    setIsQrCodeModalOpen(true);
    setQrCodeBlog(blog); // Ensure this contains QrCode_key and QrCode_expiryDays
  };

  // Skeleton Loading Component
  const renderSkeleton = () => {
    return (
      <div className="flex flex-col items-center w-full max-w-[1800px] overflow-auto">
        <div className="h-8 w-48 bg-gray-700 rounded mb-6 animate-pulse" />{" "}
        {/* Title skeleton */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-gray-800 rounded-lg shadow-lg p-6">
              {/* Title */}
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-4 animate-pulse" />

              {/* Page count */}
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2 animate-pulse" />

              {/* Type */}
              <div className="h-4 bg-gray-700 rounded w-2/3 mb-4 animate-pulse" />

              {/* Action buttons */}
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-gray-700 rounded animate-pulse" />
                <div className="h-8 w-20 bg-gray-700 rounded animate-pulse" />
                <div className="h-8 w-24 bg-gray-700 rounded animate-pulse" />
              </div>

              {/* Expanded content skeleton (show in some cards) */}
              {index % 2 === 0 && (
                <div className="mt-4">
                  {Array.from({ length: 2 }).map((_, subIndex) => (
                    <div
                      key={subIndex}
                      className="bg-gray-700 rounded-lg p-4 mt-2"
                    >
                      <div className="h-4 bg-gray-600 rounded w-2/3 mb-2 animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-8 w-20 bg-gray-600 rounded animate-pulse" />
                        <div className="h-8 w-20 bg-gray-600 rounded animate-pulse" />
                        <div className="h-8 w-20 bg-gray-600 rounded animate-pulse" />
                        <div className="h-8 w-20 bg-gray-600 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Toaster position="bottom-center" />
      {loading ? (
        renderSkeleton()
      ) : (
        <div className="flex flex-col items-center w-full max-w-[1800px] overflow-auto">
          <h1 className="text-2xl font-bold text-gray-200 mb-6">
            مدیریت صفحات
          </h1>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rowNames.map((row, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-200 mb-4">
                  {row.name}
                </h2>
                <p className="text-gray-400 mb-2">تعداد صفحات: {row.pages}</p>
                <p className="text-gray-400 mb-4">
                  نوع: {row.multiPage ? "چند صفحه‌ای" : "تک صفحه‌ای"}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={row.link}
                    target="_blank"
                    className="py-1 px-3 rounded bg-yellow-200 text-gray-800 hover:bg-yellow-300 transition"
                  >
                    <FaLink className="inline-block" /> مشاهده
                  </Link>
                  {!row.multiPage && (
                    <button
                      className="py-1 px-3 rounded bg-blue-200 text-gray-800 hover:bg-blue-300 transition"
                      onClick={() => openEditor(row.editorType)}
                    >
                      <FaEdit className="inline-block" /> ویرایش
                    </button>
                  )}
                  {row.multiPage && (
                    <button
                      className="py-1 px-3 rounded bg-green-200 text-gray-800 hover:bg-green-300 transition"
                      onClick={() => openNewPageBuilder(row.newType)}
                    >
                      افزودن صفحه جدید
                    </button>
                  )}
                  {row.multiPage && row.pages > 0 && (
                    <button
                      onClick={() => toggleExpand(row.link)}
                      className="py-1 px-3 rounded bg-blue-200 text-gray-800 hover:bg-blue-300 transition"
                    >
                      <HiArrowTurnLeftDown className="inline-block" /> صفحات
                      فرعی
                    </button>
                  )}
                </div>
                {row.multiPage && expanded === row.link && (
                  <div className="mt-4">
                    {subPages[row.link]?.map((subPage) => (
                      <div
                        key={subPage.id}
                        className="bg-gray-700 rounded-lg p-4 mt-2"
                      >
                        <h3 className="text-gray-200">{subPage.name}</h3>
                        <div className="flex gap-2 mt-2">
                          <Link
                            href={subPage.link}
                            target="_blank"
                            className="py-1 px-3 rounded bg-yellow-200 text-gray-800 hover:bg-yellow-300 transition"
                          >
                            <FaLink className="inline-block" /> مشاهده
                          </Link>
                          <button
                            className="py-1 px-3 rounded bg-blue-200 text-gray-800 hover:bg-blue-300 transition"
                            onClick={() =>
                              openEditor(row.editorType, subPage.id)
                            }
                          >
                            <FaEdit className="inline-block" /> ویرایش
                          </button>
                          <button
                            className="py-1 px-3 rounded bg-red-200 text-gray-800 hover:bg-red-300 transition"
                            onClick={() =>
                              deleteItem(row.editorType, subPage.id)
                            }
                          >
                            <MdDeleteForever
                              className="inline-block"
                              size={20}
                            />
                            حذف
                          </button>
                          {/* Add condition to check if editorType is "blog" */}
                          {row.editorType === "blog" && (
                            <button
                              className={`py-1 px-3 rounded ${
                                subPage.QrCode_key
                                  ? "bg-violet-400 hover:bg-violet-500"
                                  : "bg-violet-200 hover:bg-violet-300"
                              } text-gray-800  transition`}
                              onClick={() =>
                                handleQrCodeModal({
                                  id: subPage.id,
                                  link: subPage.link,
                                  QrCode_key: subPage.QrCode_key,
                                  QrCode_expiryDays: subPage.QrCode_expiryDays,
                                })
                              }
                            >
                              <IoQrCode className="inline-block" /> QR Code
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {isQrCodeModalOpen && (
        <BlogQrCodeModal
          onClose={setIsQrCodeModalOpen}
          blog={qrCodeBlog}
          refetchBlogs={fetchPageData}
        />
      )}
      {renderEditor()}
      {renderNewPageBuilder()}
    </>
  );
};

export default AdminPageManager;

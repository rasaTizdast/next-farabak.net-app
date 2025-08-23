"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaEdit } from "react-icons/fa";
import { FaLink } from "react-icons/fa6";
import { HiArrowTurnLeftDown } from "react-icons/hi2";
import { IoQrCode } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";

import ActivityEditor from "./componets/ui/ActivityEditor";
import BlogEditModal from "./componets/ui/BlogEditModal";
import ContactUsEditor from "./componets/ui/ContactUsEditor";
import FaqEditor from "./componets/ui/FaqEditor";
import LandingPageEditor from "./componets/ui/LandingPage";
import MemberEditor from "./componets/ui/MemberEditor";
import NewBlog from "./componets/ui/newPage/NewBlog";
import NewMember from "./componets/ui/newPage/NewMember";
import NewProject from "./componets/ui/newPage/NewProject";
import ProjectEditor from "./componets/ui/ProjectEditor";
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
      case "faq":
        return <FaqEditor onClose={closeEditor} />;
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
        case "faq":
          endpoint = `/api/admin/faqs/${id}`;
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
      <div className="flex w-full max-w-[1800px] flex-col items-center overflow-auto">
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-gray-700" /> {/* Title skeleton */}
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-lg bg-gray-800 p-6 shadow-lg">
              {/* Title */}
              <div className="mb-4 h-6 w-3/4 animate-pulse rounded bg-gray-700" />

              {/* Page count */}
              <div className="mb-2 h-4 w-1/2 animate-pulse rounded bg-gray-700" />

              {/* Type */}
              <div className="mb-4 h-4 w-2/3 animate-pulse rounded bg-gray-700" />

              {/* Action buttons */}
              <div className="flex gap-2">
                <div className="h-8 w-20 animate-pulse rounded bg-gray-700" />
                <div className="h-8 w-20 animate-pulse rounded bg-gray-700" />
                <div className="h-8 w-24 animate-pulse rounded bg-gray-700" />
              </div>

              {/* Expanded content skeleton (show in some cards) */}
              {index % 2 === 0 && (
                <div className="mt-4">
                  {Array.from({ length: 2 }).map((_, subIndex) => (
                    <div key={subIndex} className="mt-2 rounded-lg bg-gray-700 p-4">
                      <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-gray-600" />
                      <div className="flex gap-2">
                        <div className="h-8 w-20 animate-pulse rounded bg-gray-600" />
                        <div className="h-8 w-20 animate-pulse rounded bg-gray-600" />
                        <div className="h-8 w-20 animate-pulse rounded bg-gray-600" />
                        <div className="h-8 w-20 animate-pulse rounded bg-gray-600" />
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
        <div className="flex w-full max-w-[1800px] flex-col items-center overflow-auto">
          <h1 className="mb-6 text-2xl font-bold text-gray-200">مدیریت صفحات</h1>
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rowNames.map((row, index) => (
              <div
                key={index}
                className="rounded-lg bg-gray-800 p-6 shadow-lg transition-shadow hover:shadow-xl"
              >
                <h2 className="mb-4 text-xl font-semibold text-gray-200">{row.name}</h2>
                <p className="mb-2 text-gray-400">تعداد صفحات: {row.pages}</p>
                <p className="mb-4 text-gray-400">
                  نوع: {row.multiPage ? "چند صفحه‌ای" : "تک صفحه‌ای"}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={row.link}
                    target="_blank"
                    className="rounded bg-yellow-200 px-3 py-1 text-gray-800 transition hover:bg-yellow-300"
                  >
                    <FaLink className="inline-block" /> مشاهده
                  </Link>
                  {!row.multiPage && (
                    <button
                      className="rounded bg-blue-200 px-3 py-1 text-gray-800 transition hover:bg-blue-300"
                      onClick={() => openEditor(row.editorType)}
                    >
                      <FaEdit className="inline-block" /> ویرایش
                    </button>
                  )}
                  {row.multiPage && (
                    <button
                      className="rounded bg-green-200 px-3 py-1 text-gray-800 transition hover:bg-green-300"
                      onClick={() => openNewPageBuilder(row.newType)}
                    >
                      افزودن صفحه جدید
                    </button>
                  )}
                  {row.multiPage && row.pages > 0 && (
                    <button
                      onClick={() => toggleExpand(row.link)}
                      className="rounded bg-blue-200 px-3 py-1 text-gray-800 transition hover:bg-blue-300"
                    >
                      <HiArrowTurnLeftDown className="inline-block" /> صفحات فرعی
                    </button>
                  )}
                </div>
                {row.multiPage && expanded === row.link && (
                  <div className="mt-4">
                    {subPages[row.link]?.map((subPage) => (
                      <div key={subPage.id} className="mt-2 rounded-lg bg-gray-700 p-4">
                        <h3 className="text-gray-200">{subPage.name}</h3>
                        <div className="mt-2 flex gap-2">
                          <Link
                            href={subPage.link}
                            target="_blank"
                            className="rounded bg-yellow-200 px-3 py-1 text-gray-800 transition hover:bg-yellow-300"
                          >
                            <FaLink className="inline-block" /> مشاهده
                          </Link>
                          <button
                            className="rounded bg-blue-200 px-3 py-1 text-gray-800 transition hover:bg-blue-300"
                            onClick={() => openEditor(row.editorType, subPage.id)}
                          >
                            <FaEdit className="inline-block" /> ویرایش
                          </button>
                          <button
                            className="rounded bg-red-200 px-3 py-1 text-gray-800 transition hover:bg-red-300"
                            onClick={() => deleteItem(row.editorType, subPage.id)}
                          >
                            <MdDeleteForever className="inline-block" size={20} />
                            حذف
                          </button>
                          {/* Add condition to check if editorType is "blog" */}
                          {row.editorType === "blog" && (
                            <button
                              className={`rounded px-3 py-1 ${
                                subPage.QrCode_key
                                  ? "bg-violet-400 hover:bg-violet-500"
                                  : "bg-violet-200 hover:bg-violet-300"
                              } text-gray-800 transition`}
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

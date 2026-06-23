"use client";

export const dynamic = "force-dynamic";

import { ChevronDown, ChevronUp, Plus, Eye, FileText } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaEdit } from "react-icons/fa";
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

async function doDeleteItem(type: string, id: number, fetchPageData: () => void) {
  try {
    let endpoint = "";

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
      default:
        toast.error("نوع آیتم نامعتبر است");
        return;
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
}

const AdminPageManager: React.FC = () => {
  const [rowNames, setRowNames] = useState<PageRow[]>([]);
  const [subPages, setSubPages] = useState<Record<string, SubPage[]>>({});
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
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
    await doDeleteItem(type, id, fetchPageData);
  };

  const handleQrCodeModal = (blog: {
    id: number;
    link: string;
    QrCode_key?: string;
    QrCode_expiryDays?: string;
  }) => {
    setIsQrCodeModalOpen(true);
    setQrCodeBlog(blog);
  };

  // Skeleton Loading Component
  const renderSkeleton = () => {
    return (
      <div className="mx-auto w-full px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
        <div className="mb-6 h-8 w-40 animate-pulse rounded-lg bg-gray-700 sm:mb-8 sm:h-10 sm:w-48" />

        <div className="space-y-2 sm:space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-700 bg-gray-800 sm:rounded-xl"
            >
              {/* Main Row */}
              <div className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:gap-4">
                    <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-lg bg-gray-700 sm:h-12 sm:w-12 lg:h-14 lg:w-14" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 h-4 w-32 animate-pulse rounded bg-gray-700 sm:mb-2 sm:h-5 sm:w-48" />
                      <div className="h-3 w-24 animate-pulse rounded bg-gray-700 sm:w-32" />
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
                    <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-700 sm:h-10 sm:w-20 lg:w-24" />
                    <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-700 sm:h-10 sm:w-20 lg:w-24" />
                    <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-700 sm:h-10" />
                  </div>
                </div>
              </div>

              {/* Expanded Content (show on some) */}
              {index % 3 === 0 && (
                <div className="border-t border-gray-700 bg-gray-800/50 p-2 sm:p-3 lg:p-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    {Array.from({ length: 2 }).map((_, subIndex) => (
                      <div
                        key={subIndex}
                        className="flex items-center justify-between rounded-lg bg-gray-700/50 p-2.5 sm:p-3 lg:p-4"
                      >
                        <div className="h-3.5 w-28 animate-pulse rounded bg-gray-600 sm:h-4 sm:w-40" />
                        <div className="flex gap-1.5 sm:gap-2">
                          <div className="h-8 w-8 animate-pulse rounded bg-gray-600 sm:h-9 sm:w-9" />
                          <div className="h-8 w-8 animate-pulse rounded bg-gray-600 sm:h-9 sm:w-9" />
                          <div className="h-8 w-8 animate-pulse rounded bg-gray-600 sm:h-9 sm:w-9" />
                        </div>
                      </div>
                    ))}
                  </div>
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
        <div className="mx-auto w-full px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="mb-1 text-2xl font-bold text-white sm:mb-2 sm:text-3xl lg:text-4xl">
              مدیریت صفحات
            </h1>
            <p className="text-sm text-gray-400 sm:text-base">مدیریت و ویرایش صفحات وب‌سایت</p>
          </div>

          {/* Empty State */}
          {rowNames.length === 0 && (
            <div className="py-12 text-center sm:py-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 sm:h-20 sm:w-20">
                <FileText className="h-8 w-8 text-gray-600 sm:h-10 sm:w-10" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-300 sm:text-xl">
                هیچ صفحه‌ای یافت نشد
              </h3>
              <p className="text-sm text-gray-500 sm:text-base">
                صفحات شما در اینجا نمایش داده می‌شوند
              </p>
            </div>
          )}

          {/* Page Rows */}
          <div className="space-y-2 sm:space-y-3">
            {rowNames.map((row, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 transition-all duration-200 hover:border-gray-600 hover:shadow-lg sm:rounded-xl"
              >
                {/* Main Row */}
                <div className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between gap-2 sm:gap-4">
                    {/* Left Section - Info */}
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:gap-4">
                      {/* Icon */}
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-sky-800 shadow-md sm:h-12 sm:w-12 lg:h-14 lg:w-14">
                        <FileText className="h-5 w-5 text-white sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                      </div>

                      {/* Page Info */}
                      <div className="min-w-0 flex-1">
                        <h2 className="mb-0.5 truncate text-base font-semibold text-white sm:mb-1 sm:text-lg lg:text-xl">
                          {row.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 sm:gap-3 sm:text-sm">
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 sm:h-2 sm:w-2" />
                            {row.pages} صفحه
                          </span>
                          <span className="xs:inline hidden text-gray-600">•</span>
                          <span className="whitespace-nowrap">
                            {row.multiPage ? "چند صفحه‌ای" : "تک صفحه‌ای"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
                      {/* View Button */}
                      <Link
                        href={row.link}
                        target="_blank"
                        className="inline-flex min-w-[36px] items-center justify-center gap-1.5 rounded-lg bg-gray-700 px-2.5 py-2 text-xs font-medium text-gray-200 shadow-sm transition-all hover:bg-gray-600 hover:shadow-md active:bg-gray-500 sm:min-w-[40px] sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm lg:px-4"
                      >
                        <Eye className="sm:w-4.5 sm:h-4.5 h-4 w-4 flex-shrink-0 lg:h-5 lg:w-5" />
                        <span className="hidden md:inline">مشاهده</span>
                      </Link>

                      {/* Edit Button (Single Page) */}
                      {!row.multiPage && (
                        <button
                          type="button"
                          className="inline-flex min-w-[36px] items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:bg-blue-800 sm:min-w-[40px] sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm lg:px-4"
                          onClick={() => openEditor(row.editorType)}
                        >
                          <FaEdit className="sm:w-4.5 sm:h-4.5 h-4 w-4 flex-shrink-0 lg:h-5 lg:w-5" />
                          <span className="hidden md:inline">ویرایش</span>
                        </button>
                      )}

                      {/* Add New Button (Multi Page) */}
                      {row.multiPage && (
                        <button
                          type="button"
                          className="inline-flex min-w-[36px] items-center justify-center gap-1.5 rounded-lg bg-green-600 px-2.5 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:bg-green-800 sm:min-w-[40px] sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm lg:px-4"
                          onClick={() => openNewPageBuilder(row.newType)}
                        >
                          <Plus className="sm:w-4.5 sm:h-4.5 h-4 w-4 flex-shrink-0 lg:h-5 lg:w-5" />
                          <span className="hidden md:inline">افزودن</span>
                        </button>
                      )}

                      {/* Expand Button (Multi Page with items) */}
                      {row.multiPage && row.pages > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(row.link)}
                          className={`flex min-w-[36px] items-center justify-center rounded-lg p-2 shadow-sm transition-all hover:shadow-md sm:min-w-[40px] sm:p-2.5 ${
                            expanded === row.link
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-200 hover:bg-gray-600 active:bg-gray-500"
                          }`}
                          aria-label={expanded === row.link ? "بستن" : "باز کردن"}
                        >
                          {expanded === row.link ? (
                            <ChevronUp className="w-4.5 h-4.5 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                          ) : (
                            <ChevronDown className="w-4.5 h-4.5 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded SubPages */}
                {row.multiPage && expanded === row.link && (
                  <div className="animate-in slide-in-from-top-2 border-t border-gray-700 bg-gray-800/50 duration-200">
                    <div className="space-y-1.5 p-2 sm:space-y-2 sm:p-3 lg:p-4">
                      {subPages[row.link]?.length === 0 ? (
                        <div className="py-6 text-center sm:py-8">
                          <p className="text-sm text-gray-500">هیچ صفحه فرعی وجود ندارد</p>
                        </div>
                      ) : (
                        subPages[row.link]?.map((subPage) => (
                          <div
                            key={subPage.id}
                            className="group flex items-center justify-between rounded-lg bg-gray-700/50 p-2.5 transition-all hover:bg-gray-700 active:bg-gray-600 sm:p-3 lg:p-4"
                          >
                            {/* SubPage Name */}
                            <div className="flex min-w-0 flex-1 items-center gap-2 pr-2 sm:gap-3">
                              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 sm:h-2 sm:w-2" />
                              <h3 className="truncate text-sm font-medium text-gray-200 sm:text-base">
                                {subPage.name}
                              </h3>
                            </div>

                            {/* SubPage Actions */}
                            <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
                              {/* View */}
                              <Link
                                href={subPage.link}
                                target="_blank"
                                className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg bg-gray-600 p-2 text-gray-200 shadow-sm transition-all hover:bg-gray-500 hover:shadow active:bg-gray-400 sm:min-h-[40px] sm:min-w-[40px] sm:p-2.5"
                                title="مشاهده"
                                aria-label="مشاهده صفحه"
                              >
                                <Eye className="sm:w-4.5 sm:h-4.5 h-4 w-4 lg:h-5 lg:w-5" />
                              </Link>

                              {/* Edit */}
                              <button
                                type="button"
                                className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg bg-blue-600 p-2 text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow active:bg-blue-800 sm:min-h-[40px] sm:min-w-[40px] sm:p-2.5"
                                onClick={() => openEditor(row.editorType, subPage.id)}
                                title="ویرایش"
                                aria-label="ویرایش صفحه"
                              >
                                <FaEdit className="sm:w-4.5 sm:h-4.5 h-4 w-4 lg:h-5 lg:w-5" />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg bg-red-600 p-2 text-white shadow-sm transition-all hover:bg-red-700 hover:shadow active:bg-red-800 sm:min-h-[40px] sm:min-w-[40px] sm:p-2.5"
                                onClick={() => deleteItem(row.editorType, subPage.id)}
                                title="حذف"
                                aria-label="حذف صفحه"
                              >
                                <MdDeleteForever className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5 sm:h-5 sm:w-5" />
                              </button>

                              {/* QR Code (Blog only) */}
                              {row.editorType === "blog" && (
                                <button
                                  type="button"
                                  className={`flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg p-2 shadow-sm transition-all hover:shadow sm:min-h-[40px] sm:min-w-[40px] sm:p-2.5 ${
                                    subPage.QrCode_key
                                      ? "bg-violet-600 hover:bg-violet-700 active:bg-violet-800"
                                      : "bg-violet-500 hover:bg-violet-600 active:bg-violet-700"
                                  } text-white`}
                                  onClick={() =>
                                    handleQrCodeModal({
                                      id: subPage.id,
                                      link: subPage.link,
                                      QrCode_key: subPage.QrCode_key,
                                      QrCode_expiryDays: subPage.QrCode_expiryDays,
                                    })
                                  }
                                  title="QR Code"
                                  aria-label="مدیریت QR Code"
                                >
                                  <IoQrCode className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5 sm:h-5 sm:w-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
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

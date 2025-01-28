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
};

const AdminPageManager: React.FC = () => {
  const [rowNames, setRowNames] = useState<PageRow[]>([]);
  const [subPages, setSubPages] = useState<Record<string, SubPage[]>>({});
  const [loading, setLoading] = useState(true); // Loading state

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

  // const deleteItem = async (type: string, id: number) => {
  //   try {
  //     const response = await fetch(`/api/admin/${type}/${id}`, {
  //       method: "DELETE",
  //     });

  //     if (response.ok) {
  //       // Refresh the data after deletion
  //       toast.success("عملیات حذف با موفقیت انجام شد");
  //       fetchPageData();
  //     } else {
  //       console.error("Failed to delete item");
  //     }
  //   } catch (error) {
  //     console.error("Error deleting item:", error);
  //   }
  // };

  // Skeleton Loading Component
  const renderSkeleton = () => {
    return (
      <div className="flex flex-col items-center w-full max-w-[1800px] overflow-auto">
        <h1 className="text-2xl font-bold text-gray-200 mb-6">مدیریت صفحات</h1>
        <table className="w-full text-gray-200 text-sm border-collapse">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3 border border-gray-700">نام صفحه</th>
              <th className="p-3 border border-gray-700">تعداد صفحات</th>
              <th className="p-3 border border-gray-700">نوع</th>
              <th className="p-3 border border-gray-700">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, index) => (
              <React.Fragment key={index}>
                {/* Main Row Skeleton */}
                <tr className="bg-gray-800 hover:bg-gray-900">
                  <td className="p-3 border border-gray-700">
                    <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  </td>
                  <td className="p-3 border border-gray-700">
                    <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                  </td>
                  <td className="p-3 border border-gray-700 text-center">
                    <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                  </td>
                  <td className="p-3 border border-gray-700 flex gap-2">
                    <div className="h-8 bg-gray-700 rounded w-20 animate-pulse"></div>
                    <div className="h-8 bg-gray-700 rounded w-20 animate-pulse"></div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
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
          <table className="w-full text-gray-200 text-sm border-collapse">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-3 border border-gray-700">نام صفحه</th>
                <th className="p-3 border border-gray-700">تعداد صفحات</th>
                <th className="p-3 border border-gray-700">نوع</th>
                <th className="p-3 border border-gray-700">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rowNames.map((row, index) => (
                <React.Fragment key={index}>
                  {/* Main Row */}
                  <tr className="bg-gray-800 hover:bg-gray-900">
                    <td className="p-3 border border-gray-700">{row.name}</td>
                    <td className="p-3 border border-gray-700">{row.pages}</td>
                    <td className="p-3 border border-gray-700 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-center ${
                          row.multiPage
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {row.multiPage ? "چند صفحه‌ای" : "تک صفحه‌ای"}
                      </span>
                    </td>
                    <td className="p-3 border border-gray-700 flex gap-2">
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
                      {row.multiPage && (
                        <button
                          onClick={() => toggleExpand(row.link)}
                          className="py-1 px-3 rounded bg-blue-200 text-gray-800 hover:bg-blue-300 transition"
                        >
                          <HiArrowTurnLeftDown className="inline-block" /> صفحات
                          فرعی
                        </button>
                      )}
                    </td>
                  </tr>
                  {/* Subpages */}
                  {row.multiPage &&
                    expanded === row.link &&
                    subPages[row.link]?.map((subPage) => (
                      <tr
                        key={subPage.id}
                        className="odd:bg-gray-600 hover:bg-gray-900 even:bg-gray-700"
                      >
                        <td className="p-3 border border-gray-700 pl-12">
                          {subPage.name}
                        </td>
                        <td className="p-3 border border-gray-700">-</td>
                        <td className="p-3 border border-gray-700 text-center">
                          زیر صفحه
                        </td>
                        <td className="p-3 border border-gray-700 flex gap-2">
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
                          {/* <button
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
                          </button> */}
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {renderEditor()}
      {renderNewPageBuilder()}
    </>
  );
};

export default AdminPageManager;

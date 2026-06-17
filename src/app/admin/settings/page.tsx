"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import { useUser } from "@/context/UserContext";
import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";

export const dynamic = "force-dynamic";

type Client = {
  UserID: number;
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  Role: string;
};

const SettingsPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedUser, setSelectedUser] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const { logout } = useUser();

  const { data: adminsData, refetch: refetchAdmins } = useApiFetch<Client[]>("/api/admin/users/admins");
  const admins = adminsData || [];

  const { mutate: searchUsersMutate } = useApiMutation("post");
  const { mutate: makeAdminMutate } = useApiMutation("post");
  const { mutate: demoteAdminMutate } = useApiMutation("post");
  const { mutate: changePasswordMutate } = useApiMutation("patch");

  const handlePasswordChange = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("لطفاً تمام فیلدها را پر کنید.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("رمز عبور جدید و تکرار آن مطابقت ندارند.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("رمز عبور جدید باید حداقل ۶ کاراکتر باشد.");
      return;
    }

    setChangingPassword(true);

    const data = await changePasswordMutate("/api/auth/change-password", {
      currentPassword,
      newPassword,
    });

    if (data) {
      toast.success("رمز عبور با موفقیت تغییر کرد.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      logout();
    } else {
      toast.error("خطا در تغییر رمز عبور.");
    }

    setChangingPassword(false);
  };

  const handleSearch = async () => {
    if (!phoneNumber) {
      toast.error("لطفاً شماره تلفن را وارد کنید.");
      return;
    }

    setLoading(true);

    const data = await searchUsersMutate("/api/admin/users", { phoneNumber });

    if (data) {
      if (data.length === 0) {
        toast.error("کاربری با این شماره تلفن یافت نشد.");
      } else {
        setSearchResults(data);
      }
    } else {
      toast.error("خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
    }

    setLoading(false);
  };

  const handleMakeAdmin = async () => {
    if (selectedUser) {
      setLoading(true);

      const data = await makeAdminMutate("/api/admin/users", { userId: selectedUser.UserID });

      if (data?.UserID) {
        toast.success("کاربر با موفقیت ادمین شد!");
        setSearchResults([]);
        setSelectedUser(null);
        setPhoneNumber("");
        refetchAdmins();
      } else {
        toast.error("خطا در بروزرسانی نقش کاربر.");
      }

      setLoading(false);
    }
  };

  const handleDemoteAdmin = async (userId: number) => {
    setLoading(true);

    const data = await demoteAdminMutate("/api/admin/users/admins", { userId });

    if (data?.UserID) {
      toast.success("کاربر با موفقیت به کاربر عادی تبدیل شد!");
      refetchAdmins();
    } else {
      toast.error("خطا در بروزرسانی نقش کاربر.");
    }

    setLoading(false);
  };

  return (
    <>
      <Toaster position="bottom-center" />
      <div className="flex w-full max-w-[1800px] flex-col items-center overflow-auto rounded-lg bg-gray-800 p-6 text-gray-100">
        <h1 className="mb-6 text-2xl font-bold">تنظیمات</h1>

        {/* Main Grid Layout */}
        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* Password Change Section */}
          <div className="rounded-lg bg-gray-700 p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold">تغییر رمز عبور</h2>
            <div className="flex flex-col space-y-4">
              <input
                type="password"
                placeholder="رمز عبور فعلی"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg bg-gray-600 p-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="رمز عبور جدید"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg bg-gray-600 p-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="تکرار رمز عبور جدید"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg bg-gray-600 p-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="button"
                onClick={handlePasswordChange}
                disabled={changingPassword}
                className="rounded-lg bg-green-500 p-2 text-white transition-colors hover:bg-green-600 disabled:bg-green-300"
              >
                {changingPassword ? "در حال تغییر رمز عبور..." : "تغییر رمز عبور"}
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div className="rounded-lg bg-gray-700 p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold">مدیریت کاربران</h2>

            {/* Phone Number Input */}
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="شماره تلفن کاربر را وارد کنید"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-lg bg-gray-600 p-2 outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Search Button */}
              <button type="button"
                onClick={handleSearch}
                disabled={loading}
                className="rounded-lg bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600 disabled:bg-blue-300"
              >
                {loading ? "در حال جستجو..." : "جستجو"}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md mb-2 font-semibold">نتایج جستجو:</h3>
                <ul className="space-y-2">
                  {searchResults.map((user) => (
                    <li
                      key={user.UserID}
                      className="flex items-center justify-between rounded-lg bg-gray-600 p-2"
                    >
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="selectedUser"
                          value={user.UserID}
                          onChange={() => setSelectedUser(user)}
                          className="ml-2"
                        />
                        <span>
                          {user.FirstName} {user.LastName} ({user.PhoneNumber})
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>

                {/* Make Admin Button */}
                {selectedUser && (
                  <button type="button"
                    onClick={handleMakeAdmin}
                    disabled={loading}
                    className="mt-4 w-full rounded-lg bg-green-500 p-2 text-white transition-colors hover:bg-green-600 disabled:bg-green-300"
                  >
                    {loading ? "در حال پردازش..." : "تبدیل به ادمین"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Admins Section */}
          <div className="rounded-lg bg-gray-700 p-6 shadow-md md:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">لیست ادمین‌ها</h2>

            {admins.length === 0 ? (
              <p className="text-right text-gray-400">هیچ ادمینی یافت نشد.</p>
            ) : (
              <ul className="space-y-2">
                {admins.map((admin) => (
                  <li
                    key={admin.UserID}
                    className="flex items-center justify-between rounded-lg bg-gray-600 p-2"
                  >
                    <div className="text-right">
                      <p>
                        {admin.FirstName} {admin.LastName}
                      </p>
                      <p className="text-sm text-gray-400">{admin.PhoneNumber}</p>
                    </div>
                    <button type="button"
                      onClick={() => handleDemoteAdmin(admin.UserID)}
                      disabled={loading}
                      className="rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600 disabled:bg-red-300"
                    >
                      {loading ? "در حال پردازش..." : "تبدیل به کاربر عادی"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;

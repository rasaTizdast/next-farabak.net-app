"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser } from "@/context/UserContext";
import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";

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
  const [adminToDemote, setAdminToDemote] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const { logout, user } = useUser();

  const { data: adminsData, refetch: refetchAdmins } =
    useApiFetch<Client[]>("/api/admin/users/admins");
  const admins = adminsData || [];

  const { mutate: searchUsersMutate } = useApiMutation<{ phoneNumber: string }, Client[]>("post");
  const { mutate: makeAdminMutate } = useApiMutation<Record<string, unknown>, { UserID: number }>(
    "post"
  );
  const { mutate: demoteAdminMutate } = useApiMutation<Record<string, unknown>, { UserID: number }>(
    "post"
  );
  const { mutate: changePasswordMutate } = useApiMutation<Record<string, unknown>>("patch");

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
    const normalizedPhoneNumber = phoneNumber.trim();
    setSearchResults([]);
    setSelectedUser(null);
    if (!normalizedPhoneNumber) {
      toast.error("لطفاً شماره تلفن را وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const data = await searchUsersMutate("/api/admin/users", {
        phoneNumber: normalizedPhoneNumber,
      });

      if (data) {
        if (data.length === 0) {
          toast.error("کاربری با این شماره تلفن یافت نشد.");
        } else {
          setSearchResults(data);
        }
      } else {
        toast.error("خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async () => {
    if (selectedUser) {
      setLoading(true);
      try {
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
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDemoteAdmin = async (userId: number) => {
    if (Number(user?.userId) === userId) {
      toast.error("نقش حساب فعلی را نمی‌توانید تغییر دهید.");
      setAdminToDemote(null);
      return;
    }
    setLoading(true);
    try {
      const data = await demoteAdminMutate("/api/admin/users/admins", { userId });

      if (data?.UserID) {
        toast.success("کاربر با موفقیت به کاربر عادی تبدیل شد!");
        setAdminToDemote(null);
        refetchAdmins();
      } else {
        toast.error("خطا در بروزرسانی نقش کاربر.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Toaster position="bottom-center" />
      <div className="flex w-full flex-col overflow-auto rounded-lg bg-gray-800 p-4 text-gray-100 sm:p-6">
        <div className="w-full">
          <h1 className="mb-6 text-2xl font-bold">تنظیمات</h1>

          {/* Main Grid Layout */}
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            {/* Password Change Section */}
            <div className="rounded-lg bg-gray-700 p-6 shadow-md">
              <h2 className="mb-4 text-lg font-semibold">تغییر رمز عبور</h2>
              <form
                className="flex flex-col space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handlePasswordChange();
                }}
              >
                <label className="flex flex-col gap-2">
                  رمز عبور فعلی
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg bg-gray-600 p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  رمز عبور جدید
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg bg-gray-600 p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  تکرار رمز عبور جدید
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg bg-gray-600 p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-lg bg-green-600 p-2 text-white transition-colors hover:bg-green-700 disabled:bg-green-800 disabled:text-gray-300"
                >
                  {changingPassword ? "در حال تغییر رمز عبور..." : "تغییر رمز عبور"}
                </button>
              </form>
            </div>

            {/* Search Section */}
            <div className="rounded-lg bg-gray-700 p-6 shadow-md">
              <h2 className="mb-4 text-lg font-semibold">مدیریت کاربران</h2>

              {/* Phone Number Input */}
              <form
                className="flex flex-col space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSearch();
                }}
              >
                <label className="flex flex-col gap-2">
                  شماره تلفن کاربر
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-lg bg-gray-600 p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                {/* Search Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-300"
                >
                  {loading ? "در حال جستجو..." : "جستجو"}
                </button>
              </form>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-2 text-base font-semibold">نتایج جستجو:</h3>
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
                    <button
                      type="button"
                      onClick={handleMakeAdmin}
                      disabled={loading}
                      className="mt-4 w-full rounded-lg bg-green-600 p-2 text-white transition-colors hover:bg-green-700 disabled:bg-green-800 disabled:text-gray-300"
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
                <p className="text-right text-gray-300">هیچ ادمینی یافت نشد.</p>
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
                        <p className="text-sm text-gray-300">{admin.PhoneNumber}</p>
                      </div>
                      {Number(user?.userId) === admin.UserID ? (
                        <span className="rounded-lg bg-gray-500 px-3 py-2 text-sm text-gray-100">
                          حساب فعلی
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAdminToDemote(admin.UserID)}
                          disabled={loading}
                          className="rounded-lg bg-red-600 p-2 text-white transition-colors hover:bg-red-700 disabled:bg-red-800 disabled:text-gray-300"
                        >
                          {loading ? "در حال پردازش..." : "تبدیل به کاربر عادی"}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      {adminToDemote !== null && (
        <AlertDialog open onOpenChange={(open) => !open && !loading && setAdminToDemote(null)}>
          <AlertDialogContent className="border-0 bg-gray-800 text-gray-100">
            <AlertDialogTitle className="mb-3 text-start">تبدیل نقش ادمین</AlertDialogTitle>
            <AlertDialogDescription className="mb-6 text-start text-gray-300">
              این کار دسترسی مدیریتی این کاربر را حذف می‌کند. ادامه می‌دهید؟
            </AlertDialogDescription>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setAdminToDemote(null)}
                disabled={loading}
                className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-500 disabled:opacity-60"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => void handleDemoteAdmin(adminToDemote)}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "در حال پردازش..." : "تأیید و ادامه"}
              </button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default SettingsPage;

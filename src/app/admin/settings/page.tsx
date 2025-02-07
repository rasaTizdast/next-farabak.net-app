"use client";

import { useUser } from "@/context/UserContext";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

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
  const [admins, setAdmins] = useState<Client[]>([]);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const { logout } = useUser();

  // Fetch all admins on component mount
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch("/api/admin/users/admins");
        const data = await response.json();
        setAdmins(data);
      } catch (err) {
        toast.error("خطا در دریافت اطلاعات ادمین‌ها.");
      }
    };
    fetchAdmins();
  }, []);

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

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("رمز عبور با موفقیت تغییر کرد.");
        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        logout();
      } else {
        toast.error(data.message || "خطا در تغییر رمز عبور.");
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSearch = async () => {
    if (!phoneNumber) {
      toast.error("لطفاً شماره تلفن را وارد کنید.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();

      if (data.length === 0) {
        toast.error("کاربری با این شماره تلفن یافت نشد.");
      } else {
        setSearchResults(data);
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async () => {
    if (selectedUser) {
      setLoading(true);

      try {
        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: selectedUser.UserID }),
        });
        const data = await response.json();

        if (data.UserID) {
          toast.success("کاربر با موفقیت ادمین شد!");
          setSearchResults([]);
          setSelectedUser(null);
          setPhoneNumber("");
          // Refresh the admin list
          const adminsResponse = await fetch("/api/admin/users/admins");
          const adminsData = await adminsResponse.json();
          setAdmins(adminsData);
        }
      } catch (err) {
        toast.error("خطا در بروزرسانی نقش کاربر.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDemoteAdmin = async (userId: number) => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/users/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();

      if (data.UserID) {
        toast.success("کاربر با موفقیت به کاربر عادی تبدیل شد!");
        // Refresh the admin list
        const adminsResponse = await fetch("/api/admin/users/admins");
        const adminsData = await adminsResponse.json();
        setAdmins(adminsData);
      }
    } catch (err) {
      toast.error("خطا در بروزرسانی نقش کاربر.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="bottom-center" />
      <div className="flex flex-col items-center w-full max-w-[1800px] overflow-auto p-6 rounded-lg bg-gray-800 text-gray-100">
        <h1 className="text-2xl font-bold mb-6">تنظیمات</h1>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* Password Change Section */}
          <div className="bg-gray-700 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">تغییر رمز عبور</h2>
            <div className="flex flex-col space-y-4">
              <input
                type="password"
                placeholder="رمز عبور فعلی"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 bg-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="password"
                placeholder="رمز عبور جدید"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 bg-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="password"
                placeholder="تکرار رمز عبور جدید"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 bg-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handlePasswordChange}
                disabled={changingPassword}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300"
              >
                {changingPassword
                  ? "در حال تغییر رمز عبور..."
                  : "تغییر رمز عبور"}
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-gray-700 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">مدیریت کاربران</h2>

            {/* Phone Number Input */}
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="شماره تلفن کاربر را وارد کنید"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 bg-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={loading}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              >
                {loading ? "در حال جستجو..." : "جستجو"}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-2">نتایج جستجو:</h3>
                <ul className="space-y-2">
                  {searchResults.map((user) => (
                    <li
                      key={user.UserID}
                      className="flex items-center justify-between p-2 bg-gray-600 rounded-lg"
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
                    onClick={handleMakeAdmin}
                    disabled={loading}
                    className="mt-4 p-2 bg-green-500 text-white rounded-lg w-full hover:bg-green-600 transition-colors disabled:bg-green-300"
                  >
                    {loading ? "در حال پردازش..." : "تبدیل به ادمین"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Admins Section */}
          <div className="bg-gray-700 p-6 rounded-lg shadow-md md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">لیست ادمین‌ها</h2>

            {admins.length === 0 ? (
              <p className="text-gray-400 text-right">هیچ ادمینی یافت نشد.</p>
            ) : (
              <ul className="space-y-2">
                {admins.map((admin) => (
                  <li
                    key={admin.UserID}
                    className="flex items-center justify-between p-2 bg-gray-600 rounded-lg"
                  >
                    <div className="text-right">
                      <p>
                        {admin.FirstName} {admin.LastName}
                      </p>
                      <p className="text-sm text-gray-400">
                        {admin.PhoneNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDemoteAdmin(admin.UserID)}
                      disabled={loading}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300"
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

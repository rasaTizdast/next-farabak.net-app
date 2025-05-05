import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

type ContactUsEditModalProps = {
  onClose: () => void;
};

const ContactUsEditor: React.FC<ContactUsEditModalProps> = ({ onClose }) => {
  const [address, setAddress] = useState({
    id: 0,
    address: "",
    postal_code: 0,
    alt_text: "",
  });
  const [emails, setEmails] = useState<
    Array<{ id: number; title: string; address: string }>
  >([]);
  const [phoneNumbers, setPhoneNumbers] = useState<
    Array<{ id: number; number: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/contact-us").then((response) => {
      const { address, emails, phone_numbers } = response.data;
      setAddress(address);
      setEmails(emails);
      setPhoneNumbers(phone_numbers);
      setLoading(false);
    });
  }, []);

  const handleSave = () => {
    axios
      .put("/api/contact-us", { address, emails, phone_numbers: phoneNumbers })
      .then(() => {
        toast.success("اطلاعات با موفقیت ذخیره شد.");
        onClose();
      })
      .catch((error) => {
        console.error(error);
        toast.error("خطا در ذخیره اطلاعات.");
      });
  };

  // Move email up in order
  const moveEmailUp = (index: number) => {
    if (index === 0) return;
    const newEmails = [...emails];
    const temp = newEmails[index];
    newEmails[index] = newEmails[index - 1];
    newEmails[index - 1] = temp;
    setEmails(newEmails);
  };

  // Move email down in order
  const moveEmailDown = (index: number) => {
    if (index === emails.length - 1) return;
    const newEmails = [...emails];
    const temp = newEmails[index];
    newEmails[index] = newEmails[index + 1];
    newEmails[index + 1] = temp;
    setEmails(newEmails);
  };

  // Move phone number up in order
  const movePhoneUp = (index: number) => {
    if (index === 0) return;
    const newPhones = [...phoneNumbers];
    const temp = newPhones[index];
    newPhones[index] = newPhones[index - 1];
    newPhones[index - 1] = temp;
    setPhoneNumbers(newPhones);
  };

  // Move phone number down in order
  const movePhoneDown = (index: number) => {
    if (index === phoneNumbers.length - 1) return;
    const newPhones = [...phoneNumbers];
    const temp = newPhones[index];
    newPhones[index] = newPhones[index + 1];
    newPhones[index + 1] = temp;
    setPhoneNumbers(newPhones);
  };

  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="bg-gray-600 rounded-lg p-3 mb-6">
        <div className="h-6 bg-gray-500 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-500 rounded w-3/4"></div>
          <div className="h-4 bg-gray-500 rounded w-1/2"></div>
          <div className="h-4 bg-gray-500 rounded w-2/3"></div>
        </div>
      </div>
      <div className="bg-gray-600 rounded-lg p-3 mb-6">
        <div className="h-6 bg-gray-500 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2].map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 bg-gray-500 rounded w-3/4"></div>
              <div className="h-4 bg-gray-500 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gray-600 rounded-lg p-3 mb-6">
        <div className="h-6 bg-gray-500 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1].map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 bg-gray-500 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm shadow-lg">
      <div
        className="bg-gray-700 text-gray-200 p-6 rounded-lg shadow-lg w-full max-w-7xl max-h-[95dvh] overflow-auto"
        dir="rtl"
      >
        <h2 className="text-xl font-bold mb-4">ویرایش اطلاعات تماس</h2>

        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Address Form */}
            <div className="mb-6 p-3 bg-gray-600 rounded-lg">
              <h3 className="text-lg font-semibold">آدرس</h3>
              <hr className="mb-4 mt-2" />
              <label className="block mb-2">
                آدرس:
                <input
                  type="text"
                  value={address.address}
                  onChange={(e) =>
                    setAddress({ ...address, address: e.target.value })
                  }
                  className="w-full bg-gray-800 p-2 rounded mt-1"
                />
              </label>
              <label className="block mb-2">
                کد پستی:
                <input
                  type="text"
                  value={address.postal_code}
                  onChange={(e) =>
                    setAddress({ ...address, postal_code: +e.target.value })
                  }
                  className="w-full bg-gray-800 p-2 rounded mt-1"
                />
              </label>
              <label className="block mb-2">
                متن جایگزین:
                <input
                  type="text"
                  value={address.alt_text}
                  onChange={(e) =>
                    setAddress({ ...address, alt_text: e.target.value })
                  }
                  className="w-full bg-gray-800 p-2 rounded mt-1"
                />
              </label>
            </div>

            {/* Emails Form */}
            <div className="mb-6 p-3 bg-gray-600 rounded-lg">
              <h3 className="text-lg font-semibold">ایمیل‌ها</h3>
              <hr className="mb-4 mt-2" />
              {emails.map((email, index) => (
                <div key={email.id} className="mb-4 bg-gray-700 p-3 rounded">
                  <div className="flex items-center mb-3">
                    <div className="flex-grow">
                      <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-md text-sm">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => moveEmailUp(index)}
                        disabled={index === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-50 transition-all duration-200"
                        title="انتقال به بالا"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveEmailDown(index)}
                        disabled={index === emails.length - 1}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-50 transition-all duration-200"
                        title="انتقال به پایین"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <label className="block mb-2">
                    عنوان:
                    <input
                      type="text"
                      value={email.title}
                      onChange={(e) => {
                        const updatedEmails = [...emails];
                        updatedEmails[index].title = e.target.value;
                        setEmails(updatedEmails);
                      }}
                      className="w-full bg-gray-800 p-2 rounded mt-1"
                    />
                  </label>
                  <label className="block mb-2">
                    آدرس ایمیل:
                    <input
                      type="text"
                      value={email.address}
                      onChange={(e) => {
                        const updatedEmails = [...emails];
                        updatedEmails[index].address = e.target.value;
                        setEmails(updatedEmails);
                      }}
                      className="w-full bg-gray-800 p-2 rounded mt-1"
                    />
                  </label>
                </div>
              ))}
            </div>

            {/* Phone Numbers Form */}
            <div className="mb-6 p-3 bg-gray-600 rounded-lg">
              <h3 className="text-lg font-semibold">شماره تلفن‌ها</h3>
              <hr className="mb-4 mt-2" />
              {phoneNumbers.map((phone, index) => (
                <div key={phone.id} className="mb-4 bg-gray-700 p-3 rounded">
                  <div className="flex items-center mb-3">
                    <div className="flex-grow">
                      <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-md text-sm">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => movePhoneUp(index)}
                        disabled={index === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-50 transition-all duration-200"
                        title="انتقال به بالا"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => movePhoneDown(index)}
                        disabled={index === phoneNumbers.length - 1}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-50 transition-all duration-200"
                        title="انتقال به پایین"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <label className="block mb-2">
                    شماره تلفن:
                    <input
                      type="text"
                      value={phone.number}
                      onChange={(e) => {
                        const updatedPhones = [...phoneNumbers];
                        updatedPhones[index].number = e.target.value;
                        setPhoneNumbers(updatedPhones);
                      }}
                      className="w-full bg-gray-800 p-2 rounded mt-1"
                    />
                  </label>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            بستن
          </button>
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactUsEditor;

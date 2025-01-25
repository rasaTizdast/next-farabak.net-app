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

  useEffect(() => {
    // Fetch data from the endpoint
    axios.get("/api/contact-us").then((response) => {
      const { address, emails, phone_numbers } = response.data;
      setAddress(address);
      setEmails(emails);
      setPhoneNumbers(phone_numbers);
    });
  }, []);

  const handleSave = () => {
    // Send updated data to the endpoint
    axios
      .put("/api/contact-us", { address, emails, phoneNumbers })
      .then(() => {
        toast.success("اطلاعات با موفقیت ذخیره شد.");
        onClose();
      })
      .catch((error) => {
        console.error(error);
        toast.error("خطا در ذخیره اطلاعات.");
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm shadow-lg">
      <div
        className="bg-gray-700 text-gray-200 p-6 rounded-lg shadow-lg w-full max-w-7xl max-h-[95dvh] overflow-auto"
        dir="rtl"
      >
        <h2 className="text-xl font-bold mb-4">ویرایش اطلاعات تماس</h2>

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
            <div key={email.id} className="mb-4">
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
            <div key={phone.id} className="mb-4">
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

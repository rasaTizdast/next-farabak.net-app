import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";

type ContactUsEditModalProps = {
  onClose: () => void;
};

const SkeletonLoader = () => (
  <div className="animate-pulse" role="status" aria-label="در حال بارگذاری">
    <div className="mb-6 rounded-lg bg-gray-600 p-3">
      <div className="mb-4 h-6 w-1/4 rounded bg-gray-500"></div>
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-500"></div>
        <div className="h-4 w-1/2 rounded bg-gray-500"></div>
        <div className="h-4 w-2/3 rounded bg-gray-500"></div>
      </div>
    </div>
    <div className="mb-6 rounded-lg bg-gray-600 p-3">
      <div className="mb-4 h-6 w-1/4 rounded bg-gray-500"></div>
      <div className="space-y-3">
        {[1, 2].map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-500"></div>
            <div className="h-4 w-1/2 rounded bg-gray-500"></div>
          </div>
        ))}
      </div>
    </div>
    <div className="mb-6 rounded-lg bg-gray-600 p-3">
      <div className="mb-4 h-6 w-1/4 rounded bg-gray-500"></div>
      <div className="space-y-3">
        {[1].map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-500"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ContactUsEditor: React.FC<ContactUsEditModalProps> = ({ onClose }) => {
  const [address, setAddress] = useState({
    id: 0,
    address: "",
    postal_code: 0,
    alt_text: "",
  });
  const [emails, setEmails] = useState<Array<{ id: number; title: string; address: string }>>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<Array<{ id: number; number: string }>>([]);
  const { data: contactData } = useApiFetch<{
    address: { id: number; address: string; postal_code: number; alt_text: string } | null;
    emails: Array<{ id: number; title: string; address: string }>;
    phone_numbers: Array<{ id: number; number: string }>;
  }>("/api/contact-us");
  const { mutate: saveContact, loading: saving } = useApiMutation<Record<string, unknown>>("put");
  const initializedRef = useRef(false);

  const loading = !contactData;

  useEffect(() => {
    if (contactData && !initializedRef.current) {
      initializedRef.current = true;
      const { address: a, emails: e, phone_numbers: p } = contactData;
      setAddress(a ?? { id: 0, address: "", postal_code: 0, alt_text: "" });
      setEmails(e);
      setPhoneNumbers(p);
    }
  }, [contactData]);

  const handleSave = async () => {
    const res = await saveContact("/api/contact-us", {
      address,
      emails,
      phone_numbers: phoneNumbers,
    });
    if (res) {
      toast.success("اطلاعات با موفقیت ذخیره شد.");
      onClose();
    } else {
      toast.error("خطا در ذخیره اطلاعات.");
    }
  };

  const moveEmailUp = (index: number) => {
    if (index === 0) return;
    const newEmails = [...emails];
    const temp = newEmails[index];
    newEmails[index] = newEmails[index - 1];
    newEmails[index - 1] = temp;
    setEmails(newEmails);
  };

  const moveEmailDown = (index: number) => {
    if (index === emails.length - 1) return;
    const newEmails = [...emails];
    const temp = newEmails[index];
    newEmails[index] = newEmails[index + 1];
    newEmails[index + 1] = temp;
    setEmails(newEmails);
  };

  const movePhoneUp = (index: number) => {
    if (index === 0) return;
    const newPhones = [...phoneNumbers];
    const temp = newPhones[index];
    newPhones[index] = newPhones[index - 1];
    newPhones[index - 1] = temp;
    setPhoneNumbers(newPhones);
  };

  const movePhoneDown = (index: number) => {
    if (index === phoneNumbers.length - 1) return;
    const newPhones = [...phoneNumbers];
    const temp = newPhones[index];
    newPhones[index] = newPhones[index + 1];
    newPhones[index + 1] = temp;
    setPhoneNumbers(newPhones);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 shadow-lg backdrop-blur-sm">
      <div
        className="max-h-[95dvh] w-full max-w-7xl overflow-auto rounded-lg bg-gray-700 p-6 text-gray-200 shadow-lg"
        dir="rtl"
      >
        <h2 className="mb-4 text-xl font-bold">ویرایش اطلاعات تماس</h2>

        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            <div className="mb-6 rounded-lg bg-gray-600 p-3">
              <h3 className="text-lg font-semibold">آدرس</h3>
              <hr className="mb-4 mt-2" />
              <label htmlFor="contact-address" className="mb-2 block">
                آدرس:
                <input
                  id="contact-address"
                  type="text"
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  aria-label="آدرس"
                  className="mt-1 w-full rounded bg-gray-800 p-2"
                />
              </label>
              <label htmlFor="contact-postal" className="mb-2 block">
                کد پستی:
                <input
                  id="contact-postal"
                  type="text"
                  value={address.postal_code}
                  onChange={(e) => setAddress({ ...address, postal_code: +e.target.value })}
                  aria-label="کد پستی"
                  className="mt-1 w-full rounded bg-gray-800 p-2"
                />
              </label>
              <label htmlFor="contact-alt" className="mb-2 block">
                متن جایگزین:
                <input
                  id="contact-alt"
                  type="text"
                  value={address.alt_text}
                  onChange={(e) => setAddress({ ...address, alt_text: e.target.value })}
                  aria-label="متن جایگزین"
                  className="mt-1 w-full rounded bg-gray-800 p-2"
                />
              </label>
            </div>

            <div className="mb-6 rounded-lg bg-gray-600 p-3">
              <h3 className="text-lg font-semibold">ایمیل‌ها</h3>
              <hr className="mb-4 mt-2" />
              {emails.map((email, index) => (
                <div key={email.id} className="mb-4 rounded bg-gray-700 p-3">
                  <div className="mb-3 flex items-center">
                    <div className="flex-grow">
                      <span className="rounded-md bg-gray-800 px-2 py-1 text-sm text-gray-300">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => moveEmailUp(index)}
                        disabled={index === 0}
                        className="rounded bg-blue-600 p-2 text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-50"
                        title="انتقال به بالا"
                        aria-label="انتقال ایمیل به بالا"
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
                        type="button"
                        onClick={() => moveEmailDown(index)}
                        disabled={index === emails.length - 1}
                        className="rounded bg-blue-600 p-2 text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-50"
                        title="انتقال به پایین"
                        aria-label="انتقال ایمیل به پایین"
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
                  <label htmlFor={`email-title-${index}`} className="mb-2 block">
                    عنوان:
                    <input
                      id={`email-title-${index}`}
                      type="text"
                      value={email.title}
                      onChange={(e) => {
                        const updatedEmails = [...emails];
                        updatedEmails[index].title = e.target.value;
                        setEmails(updatedEmails);
                      }}
                      aria-label={`عنوان ایمیل ${index + 1}`}
                      className="mt-1 w-full rounded bg-gray-800 p-2"
                    />
                  </label>
                  <label htmlFor={`email-addr-${index}`} className="mb-2 block">
                    آدرس ایمیل:
                    <input
                      id={`email-addr-${index}`}
                      type="text"
                      value={email.address}
                      onChange={(e) => {
                        const updatedEmails = [...emails];
                        updatedEmails[index].address = e.target.value;
                        setEmails(updatedEmails);
                      }}
                      aria-label={`آدرس ایمیل ${index + 1}`}
                      className="mt-1 w-full rounded bg-gray-800 p-2"
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="mb-6 rounded-lg bg-gray-600 p-3">
              <h3 className="text-lg font-semibold">شماره تلفن‌ها</h3>
              <hr className="mb-4 mt-2" />
              {phoneNumbers.map((phone, index) => (
                <div key={phone.id} className="mb-4 rounded bg-gray-700 p-3">
                  <div className="mb-3 flex items-center">
                    <div className="flex-grow">
                      <span className="rounded-md bg-gray-800 px-2 py-1 text-sm text-gray-300">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => movePhoneUp(index)}
                        disabled={index === 0}
                        className="rounded bg-blue-600 p-2 text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-50"
                        title="انتقال به بالا"
                        aria-label="انتقال شماره به بالا"
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
                        type="button"
                        onClick={() => movePhoneDown(index)}
                        disabled={index === phoneNumbers.length - 1}
                        className="rounded bg-blue-600 p-2 text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-50"
                        title="انتقال به پایین"
                        aria-label="انتقال شماره به پایین"
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
                  <label htmlFor={`phone-number-${index}`} className="mb-2 block">
                    شماره تلفن:
                    <input
                      id={`phone-number-${index}`}
                      type="text"
                      value={phone.number}
                      onChange={(e) => {
                        const updatedPhones = [...phoneNumbers];
                        updatedPhones[index].number = e.target.value;
                        setPhoneNumbers(updatedPhones);
                      }}
                      aria-label={`شماره تلفن ${index + 1}`}
                      className="mt-1 w-full rounded bg-gray-800 p-2"
                    />
                  </label>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            بستن
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactUsEditor;

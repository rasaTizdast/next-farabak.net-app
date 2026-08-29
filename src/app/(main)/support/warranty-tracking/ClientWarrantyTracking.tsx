"use client";

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  Phone,
  Tag,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";

const faDateFormatter = new Intl.DateTimeFormat("fa-IR");

type WarrantyResult = {
  status: "success" | "expired" | "already_requested";
  data?: {
    productType?: string;
    startDate: string;
    expiryDate: string;
    status: "Active" | "Expired" | "Requested";
    customerPhone?: string;
  };
  error?: string;
};

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return faDateFormatter.format(date);
  } catch (error) {
    console.error(error);
    return dateString;
  }
}

async function searchWarranty(
  warrantyCode: string,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string>>,
  setResult: React.Dispatch<React.SetStateAction<WarrantyResult | null>>,
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>,
  e: React.FormEvent
) {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const response = await fetch("/api/public/warranty-check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ warrantycode: warrantyCode, checkOnly: true }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "خطا در بررسی گارانتی");
    }

    setResult(data);
    setCurrentStep(1);
  } catch {
    setError("خطا در بررسی گارانتی");
  } finally {
    setLoading(false);
  }
}

async function confirmWarrantyRequest(
  warrantyCode: string,
  setConfirmLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string>>,
  setResult: React.Dispatch<React.SetStateAction<WarrantyResult | null>>,
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
) {
  setConfirmLoading(true);

  try {
    const response = await fetch("/api/public/warranty-check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ warrantycode: warrantyCode, confirm: true }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "خطا در ثبت درخواست گارانتی");
    }

    setResult(data);
    setCurrentStep(2);
  } catch {
    setError("خطا در ثبت درخواست گارانتی");
  } finally {
    setConfirmLoading(false);
  }
}

const primaryButtonClass =
  "inline-flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#00bfff] px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-[#318ce7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00bfff]/50 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "inline-flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300";

const StepIndicator = ({
  steps,
  current,
}: {
  steps: { title: string; description: string }[];
  current: number;
}) => (
  <div className="mb-8 flex items-start justify-between max-[576px]:[&_.step-description]:hidden">
    {steps.map((step, index) => (
      <div key={step.title} className="flex flex-1 flex-col items-center text-center">
        <div className="flex w-full items-center">
          {index > 0 && (
            <div className={`h-0.5 flex-1 ${index <= current ? "bg-[#00bfff]" : "bg-gray-200"}`} />
          )}
          <div
            className={`mx-1 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              index < current
                ? "bg-[#00bfff] text-white"
                : index === current
                  ? "border-2 border-[#00bfff] text-[#00bfff]"
                  : "border-2 border-gray-200 text-gray-400"
            }`}
          >
            {index < current ? (
              <CheckCircle2 className="size-5" />
            ) : (
              new Intl.NumberFormat("fa-IR").format(index + 1)
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`h-0.5 flex-1 ${index < current ? "bg-[#00bfff]" : "bg-gray-200"}`} />
          )}
        </div>
        <div className="mt-2 font-medium text-gray-800">{step.title}</div>
        <div className="step-description mt-0.5 text-xs text-gray-500">{step.description}</div>
      </div>
    ))}
  </div>
);

const WarrantyTrackingPage = () => {
  const [warrantyCode, setWarrantyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [result, setResult] = useState<WarrantyResult | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleSearchWarranty = async (e: React.FormEvent) => {
    await searchWarranty(warrantyCode, setLoading, setError, setResult, setCurrentStep, e);
  };

  const handleConfirmRequest = async () => {
    await confirmWarrantyRequest(
      warrantyCode,
      setConfirmLoading,
      setError,
      setResult,
      setCurrentStep
    );
  };

  const handleCancel = () => {
    // Reset and go back to first step
    setCurrentStep(0);
    setResult(null);
  };

  // Determine which steps to show based on result status
  const getStepsConfig = () => {
    if (!result) {
      return [
        { title: "استعلام", description: "وارد کردن کد گارانتی" },
        { title: "تایید", description: "تایید اطلاعات گارانتی" },
        { title: "نتیجه", description: "دریافت نتیجه" },
      ];
    }

    if (result.status === "expired") {
      return [
        { title: "استعلام", description: "وارد کردن کد گارانتی" },
        { title: "نتیجه", description: "گارانتی منقضی شده" },
      ];
    }

    return [
      { title: "استعلام", description: "وارد کردن کد گارانتی" },
      { title: "تایید", description: "تایید اطلاعات گارانتی" },
      { title: "نتیجه", description: "درخواست ثبت شده" },
    ];
  };

  const stepsConfig = getStepsConfig();

  return (
    <div dir="rtl" className="warranty-page w-full">
      {loading ? (
        // Loading skeleton
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex justify-center">
            <div className="w-full md:w-2/3 lg:w-1/2 xl:w-2/5">
              <div className="mx-auto mb-2 h-8 w-3/4 animate-pulse rounded-md bg-gray-200"></div>
              <div className="mx-auto mb-10 h-4 w-4/5 animate-pulse rounded-md bg-gray-100"></div>

              <div className="mb-8 flex justify-between">
                <div className="h-16 w-1/3 animate-pulse rounded-full bg-blue-100"></div>
                <div className="h-16 w-1/3 animate-pulse rounded-full bg-gray-100"></div>
                <div className="h-16 w-1/3 animate-pulse rounded-full bg-gray-100"></div>
              </div>
            </div>
          </div>

          <div className="animate-pulse overflow-hidden rounded-lg border-0 bg-white shadow-lg">
            <div className="p-8">
              <div className="mb-4 h-6 w-1/3 rounded-md bg-gray-200"></div>
              <div className="mb-6 h-4 w-2/3 rounded-md bg-gray-100"></div>

              <div className="mb-6 flex gap-3">
                <div className="h-12 w-full rounded-md bg-gray-100"></div>
                <div className="h-12 w-24 rounded-md bg-blue-100"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto mb-8 max-w-xl md:max-w-2xl lg:max-w-3xl">
            <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 md:text-3xl">
              سامانه استعلام گارانتی محصولات
            </h2>
            <p className="mb-10 text-center text-gray-500">
              با وارد کردن کد گارانتی محصول، از وضعیت و اعتبار گارانتی خود مطلع شوید
            </p>

            <StepIndicator steps={stepsConfig} current={currentStep} />
          </div>

          <div className="overflow-hidden rounded-lg bg-white p-6 shadow-lg md:p-8">
            {currentStep === 0 && (
              <div className="mb-8">
                <h4 className="mb-4 text-lg font-semibold text-gray-900">بررسی وضعیت گارانتی</h4>
                <p className="text-gray-500">لطفا کد گارانتی محصول خود را در کادر زیر وارد کنید</p>

                <form onSubmit={handleSearchWarranty} className="mb-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="کد گارانتی را وارد کنید"
                      value={warrantyCode}
                      onChange={(e) => setWarrantyCode(e.target.value)}
                      dir="ltr"
                      disabled={loading}
                      className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-left text-base transition-colors focus:border-[#00bfff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00bfff]/30 disabled:bg-gray-50"
                    />
                    <button
                      type="submit"
                      disabled={loading || !warrantyCode}
                      className={primaryButtonClass}
                    >
                      {loading ? <Loader2 className="size-5 animate-spin" /> : "بررسی"}
                    </button>
                  </div>
                </form>

                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                    <XCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
                    <div>
                      <div className="font-medium text-red-700">خطا در بررسی گارانتی</div>
                      <div className="text-sm text-red-600">{error}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 1 && result && (
              <div className="mb-8">
                <h4 className="mb-4 text-lg font-semibold text-gray-900">تایید اطلاعات گارانتی</h4>
                <p className="mb-6 text-gray-500">
                  لطفا اطلاعات گارانتی خود را بررسی کرده و در صورت صحت، درخواست بررسی را تایید کنید
                </p>

                {result.data && (
                  <div className="mb-6 rounded-lg border-t border-gray-200 p-4 pt-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {result.data.productType && (
                        <div className="sm:col-span-2">
                          <div className="flex items-center">
                            <Tag className="ml-2 size-4 text-indigo-500" />
                            <div>
                              <div className="text-sm text-gray-500">نام محصول:</div>
                              <div className="font-medium">{result.data.productType}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center">
                          <Calendar className="ml-2 size-4 text-blue-500" />
                          <div>
                            <div className="text-sm text-gray-500">تاریخ شروع:</div>
                            <div className="font-medium">{formatDate(result.data.startDate)}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center">
                          <Calendar className="ml-2 size-4 text-purple-500" />
                          <div>
                            <div className="text-sm text-gray-500">تاریخ انقضا:</div>
                            <div className="font-medium">{formatDate(result.data.expiryDate)}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500">کد گارانتی:</div>
                        <div className="font-medium text-gray-800">{warrantyCode}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500">وضعیت:</div>
                        <div className="font-medium">
                          {result.data.status === "Active" && (
                            <span className="flex items-center text-green-600">
                              <CheckCircle2 className="ml-1 size-4" /> فعال
                            </span>
                          )}
                          {result.data.status === "Expired" && (
                            <span className="flex items-center text-red-500">
                              <XCircle className="ml-1 size-4" /> منقضی شده
                            </span>
                          )}
                          {result.data.status === "Requested" && (
                            <span className="flex items-center text-amber-500">
                              <Clock className="ml-1 size-4" /> درخواست بررسی
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <button type="button" onClick={handleCancel} className={secondaryButtonClass}>
                    <ArrowRight className="size-4" />
                    بازگشت
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmRequest}
                    disabled={confirmLoading}
                    className={`${primaryButtonClass} min-w-[180px]`}
                  >
                    {confirmLoading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <ArrowLeft className="size-4" />
                    )}
                    تایید و ثبت درخواست
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && result && (
              <div className="mt-6">
                {result.status === "success" && (
                  <div className="py-6 text-center">
                    <CheckCircle2 className="mx-auto mb-4 size-14 text-green-500" />
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      درخواست بررسی گارانتی با موفقیت ثبت شد
                    </h3>
                    <div className="mt-4">
                      <p className="text-lg text-gray-500">
                        اطلاعات گارانتی شما ثبت شده و کارشناسان ما در اسرع وقت با شماره{" "}
                        {result.data?.customerPhone || "شما"} تماس خواهند گرفت.
                      </p>

                      <div className="mt-8 flex flex-col items-center justify-center gap-2 rounded-lg bg-blue-100 p-4 md:flex-row md:gap-8">
                        <div className="flex items-center">
                          <Phone className="ml-2 size-4 text-blue-500" />
                          <span>در انتظار تماس کارشناسان</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="ml-2 size-4 text-green-500" />
                          <span>زمان پاسخگویی: حداکثر 48 ساعت کاری</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {result.status === "expired" && (
                  <div className="py-6 text-center">
                    <XCircle className="mx-auto mb-4 size-14 text-red-500" />
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      گارانتی منقضی شده است
                    </h3>
                    <div className="mt-2">
                      <p className="text-gray-500">
                        متأسفانه مدت زمان گارانتی محصول شما به پایان رسیده است.
                      </p>
                    </div>
                  </div>
                )}

                {result.status === "already_requested" && (
                  <div className="py-6 text-center">
                    <Info className="mx-auto mb-4 size-14 text-blue-500" />
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      درخواست قبلاً ثبت شده است
                    </h3>
                    <div className="mt-4">
                      <p className="text-gray-500">
                        درخواست بررسی گارانتی این محصول قبلاً ثبت شده است. کارشناسان ما به زودی با
                        شما تماس خواهند گرفت.
                      </p>

                      <div className="mt-8 flex flex-col items-center justify-center gap-2 rounded-lg bg-blue-100 p-4 md:flex-row md:gap-8">
                        <div className="flex items-center">
                          <Phone className="ml-2 size-4 text-blue-500" />
                          <span>در انتظار تماس کارشناسان</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="ml-2 size-4 text-green-500" />
                          <span>زمان پاسخگویی: حداکثر 48 ساعت کاری</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(0);
                      setWarrantyCode("");
                      setResult(null);
                    }}
                    className={`${secondaryButtonClass} mt-6`}
                  >
                    بررسی گارانتی دیگر
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 text-center text-gray-500">
            <p>
              جهت اطلاعات بیشتر با شماره{" "}
              <span className="contact-number inline-block cursor-pointer font-bold text-blue-500 [direction:ltr] [unicode-bidi:plaintext]">
                021-77500008
              </span>{" "}
              تماس بگیرید
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarrantyTrackingPage;

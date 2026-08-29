const steps = [
  "ساخت محصول",
  "آپلود تصاویر محصول",
  "ارسال ویژگی‌ها",
  "ارسال جزئیات بررسی",
  "ارسال مشخصات",
  "ارسال سوالات متداول",
  "تکمیل فرآیند",
];

const ProgressModal = ({ progress, currentStep }: { progress: number; currentStep: number }) => {
  return (
    <div className="bg-opacity-60 fixed inset-0 z-55 flex items-center justify-center bg-black backdrop-blur-sm">
      <div className="animate-fade-in w-full max-w-md rounded-xl bg-gray-800 p-8 text-white shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">در حال ایجاد محصول</h2>
          <span className="text-sm font-medium">
            مرحله {currentStep} از {steps.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-700">
          <div
            className={`h-2 bg-blue-500 transition-[width] duration-700 ease-in-out`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Current Step Description */}
        <p className="text-center font-medium text-gray-300">{steps[currentStep - 1]}</p>

        {/* Steps List */}
        <div className="mt-8">
          <ul className="space-y-2">
            {steps.map((step, index) => (
              <li
                key={step}
                className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                  index + 1 <= currentStep ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300 ${
                    index + 1 <= currentStep
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;

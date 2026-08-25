import React from "react";
import { CgSpinnerTwo } from "react-icons/cg";

type InputFieldProps = {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  disabled?: boolean;
  step?: string;
};

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
  step,
}) => (
  <label className="block">
    {label}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      step={step}
      className={`mt-2 w-full rounded border border-gray-800 p-2 ${
        disabled ? "cursor-not-allowed bg-gray-600 text-gray-400 opacity-75" : "bg-gray-700"
      }`}
      placeholder={`${label} را وارد کنید`}
      disabled={disabled}
    />
  </label>
);

type TextAreaFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, name, value, onChange }) => (
  <label className="col-span-1 block sm:col-span-2">
    {label}
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className="mt-2 w-full rounded border border-gray-800 bg-gray-700 p-2"
      placeholder={`${label} را وارد کنید`}
    />
  </label>
);

type SelectFieldProps = {
  label: string;
  name: string;
  value: string | string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
};

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
}) => (
  <label className="block">
    {label}
    <select
      name={name}
      value={Array.isArray(value) ? value[0] : value}
      onChange={onChange}
      className="mt-2 w-full rounded border border-gray-800 bg-gray-700 p-2"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

export const Loading = () => {
  return (
    <div className="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black shadow-lg backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 rounded-lg bg-gray-800 p-6 text-white shadow-lg">
        <div className="text-xl font-semibold">در حال آپدیت محصول، لطفا منتظر بمانید</div>
        <CgSpinnerTwo className="animate-spin" size={80} />
      </div>
    </div>
  );
};

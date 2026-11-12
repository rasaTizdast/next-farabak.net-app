"use client";

import { useState } from "react";
import { Control, FieldValues, useController, FieldErrors, Path } from "react-hook-form";

import { cities } from "@/helpers/validationSchema";

type Props<T extends FieldValues = FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  errors: FieldErrors<T>;
};

const CitySelector = <T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  errors,
}: Props<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const {
    field: { onChange, onBlur, value },
  } = useController({
    name,
    control,
  });

  // Filter cities based on the search term
  const filteredCities = cities.filter((city) => city.includes(searchTerm));

  // Handle input change and pass it to the form controller
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setActiveIndex(-1);
    onChange(e.target.value);
  };

  // Handle city selection
  const handleCityClick = (city: string) => {
    onChange(city);
    setSearchTerm(city);
    setActiveIndex(-1);
    setIsOpen(false);
  };

  // Close dropdown on blur
  const handleBlur = () => {
    setIsOpen(false);
    setActiveIndex(-1);
    onBlur();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (event.key === "ArrowDown" && filteredCities.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % filteredCities.length);
    } else if (event.key === "ArrowUp" && filteredCities.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? filteredCities.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      handleCityClick(filteredCities[activeIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  // Check if the selected city is valid
  const isValid = cities.includes(value);
  const inputClass = !value
    ? ""
    : isValid
      ? "border-[#2ecc71] text-[#03af4b]"
      : "border-[#e74c3c] text-[#e74c3c]";

  return (
    <div className="z-1 flex w-full flex-col gap-2">
      <label htmlFor={name} className="text-base font-bold">
        {label}
      </label>
      <div className={`relative flex w-full flex-col items-center ${isOpen ? "focus" : ""}`}>
        <input
          id={name}
          type="text"
          name={name}
          value={value ?? ""}
          onChange={handleInputChange}
          onFocus={() => {
            setSearchTerm("");
            setIsOpen(true);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${name}-options`}
          aria-activedescendant={activeIndex >= 0 ? `${name}-option-${activeIndex}` : undefined}
          aria-invalid={!!errors[name]}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-[#c7c7c7] bg-white p-[14px] text-[14px] font-medium transition-[border-radius] duration-100 focus:rounded-b-none ${inputClass}`}
          autoComplete="off"
        />
        {isOpen && (
          <ul
            id={`${name}-options`}
            role="listbox"
            className="ltr absolute inset-s-0 top-full max-h-[250px] w-full list-none overflow-y-auto rounded-b-[4px] border border-t-0 border-[#ccc] bg-white p-0 text-start shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-colors duration-300"
          >
            {filteredCities.map((city, index) => (
              <li
                key={city}
                id={`${name}-option-${index}`}
                role="option"
                aria-selected={activeIndex === index}
                onMouseDown={() => handleCityClick(city)}
                className={`mobile:px-[16px] mobile:py-[5px] cursor-pointer px-[16px] py-[8px] text-[0.9rem] hover:bg-gray-100 ${activeIndex === index ? "bg-blue-100" : ""}`}
              >
                {city}
              </li>
            ))}
          </ul>
        )}
      </div>
      {errors[name]?.message && (
        <span className="mt-1 text-[0.875rem] text-[#e74c3c]">
          {typeof errors[name]?.message === "string"
            ? errors[name]?.message
            : "Invalid error message"}
        </span>
      )}
    </div>
  );
};

export default CitySelector;

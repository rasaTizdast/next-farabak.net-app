/* eslint-disable */

import { useState } from "react";
import {
  Control,
  FieldValues,
  useController,
  FieldErrors,
} from "react-hook-form";

import styles from "./CitySelector.module.css";
import { cities } from "@/helpers/validationSchema";

type Props = {
  control: any ;
  name: string;
  label: string;
  placeholder: string;
  errors: FieldErrors; // Use FieldErrors from react-hook-form for errors 
};

const CitySelector = ({ control, name, label, placeholder, errors }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    onChange(e.target.value);
  };

  // Handle city selection
  const handleCityClick = (city: string) => {
    onChange(city);
    setSearchTerm(city);
    setIsOpen(false);
  };

  // Close dropdown on blur
  const handleBlur = () => {
    setIsOpen(false);
    onBlur();
  };

  // Check if the selected city is valid
  const isValid = cities.includes(value);
  const inputClass = !value ? "" : isValid ? styles.valid : styles.invalid;

  return (
    <div className={styles.form_group}>
      <label htmlFor={name}>{label}</label>
      <div className={`${styles.custom_select} ${isOpen ? styles.focus : ""}`}>
        <input
          type="text"
          name={name}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`${styles.select_input} ${inputClass}`}
          autoComplete="off"
        />
        {isOpen && (
          <ul className={styles.select_options}>
            {filteredCities.map((city) => (
              <li key={city} onMouseDown={() => handleCityClick(city)}>
                {city}
              </li>
            ))}
          </ul>
        )}
      </div>
      {errors[name]?.message && (
        <span className={styles.error}>
          {typeof errors[name]?.message === "string"
            ? errors[name]?.message
            : "Invalid error message"}
        </span>
      )}
    </div>
  );
};

export default CitySelector;

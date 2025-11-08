import React from "react";
import { cn } from "@/src/lib/utils";

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options = [],
  placeholder,
  className,
  onChange,
  value,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  // Ensure options is always an array
  const optionsArray = Array.isArray(options) ? options : [];

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={handleChange}
        className={cn(
          "w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition-colors bg-white text-gray-900",
          error
            ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500"
            : "border-gray-300 focus:border-[#8B1C3B] focus:ring-2 focus:ring-[#8B1C3B]",
          "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500",
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {optionsArray.map((option) => {
          if (!option || option.value === undefined || option.value === null) {
            return null;
          }
          return (
            <option
              key={String(option.value)}
              value={String(option.value)}
              disabled={option.disabled}
            >
              {option.label || String(option.value)}
            </option>
          );
        })}
      </select>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default Select;


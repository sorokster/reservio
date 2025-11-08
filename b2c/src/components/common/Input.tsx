import React from "react";
import { cn } from "@/src/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-500",
          error
            ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500"
            : "border-gray-300 focus:border-[#8B1C3B] focus:ring-2 focus:ring-[#8B1C3B]",
          "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;


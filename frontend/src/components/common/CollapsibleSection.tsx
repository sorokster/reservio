import React, { useState } from "react";
import { cn } from "@/src/lib/utils";
import { SectionTitle } from "./SectionTitle";

export interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = true,
  className,
  headerClassName,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("bg-white rounded-2xl shadow-lg overflow-hidden", className)}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-8 hover:bg-gray-50 transition-colors",
          headerClassName
        )}
      >
        <SectionTitle>{title}</SectionTitle>
        <svg
          className={cn(
            "w-6 h-6 text-gray-600 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "max-h-[10000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-8 pt-0">{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleSection;


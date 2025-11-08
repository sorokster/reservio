import React from "react";
import { SectionTitle } from "@/src/components/common/SectionTitle";

export interface TopRestaurantsHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export const TopRestaurantsHeader: React.FC<TopRestaurantsHeaderProps> = ({
  title,
  description,
  className,
}) => {
  return (
    <div className={`text-center mb-16 ${className}`}>
      <div className="inline-flex items-center justify-center mb-6">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#8B1C3B]"></div>
        <div className="mx-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg className="w-6 h-6 text-yellow-500 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            <SectionTitle>{title}</SectionTitle>
            <svg className="w-6 h-6 text-yellow-500 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          </div>
        </div>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#8B1C3B]"></div>
      </div>
      {description && (
        <p className="text-gray-600 max-w-2xl mx-auto text-sm leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default TopRestaurantsHeader;


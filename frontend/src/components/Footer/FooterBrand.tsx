import React from "react";
import { APP_NAME } from "@/src/lib/constants";

export const FooterBrand: React.FC = () => {
  return (
    <div className="lg:col-span-1">
      <div className="mb-4">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">{APP_NAME}</span>
        </a>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Seamless table booking for fine-dining restaurants. Discover, reserve, and enjoy the best dining experiences.
      </p>
    </div>
  );
};


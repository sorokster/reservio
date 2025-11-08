import React from "react";
import { NAVIGATION } from "@/src/lib/constants";
import { APP_NAME } from "@/src/lib/constants";

export const FooterCopyright: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="border-t border-gray-200 pt-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-600 text-center md:text-left">
          Copyright © {currentYear}{" "}
          <a
            href="/"
            className="text-[#8B1C3B] hover:text-[#6E152F] transition-colors duration-200"
          >
            {APP_NAME}
          </a>
          . All rights reserved.
        </p>

        <div className="flex items-center gap-6 flex-wrap justify-center">
          {NAVIGATION.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-gray-600 hover:text-[#8B1C3B] transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};


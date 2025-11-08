"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";

export interface RestaurantTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const TABS = [
  { id: "schedule", label: "Opening Hours" },
  { id: "reviews", label: "Reviews" },
  { id: "menu", label: "Menu" },
];

export const RestaurantTabs: React.FC<RestaurantTabsProps> = ({
  activeTab,
  onTabChange,
  className,
}) => {
  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    const element = document.getElementById(`section-${tabId}`);
    if (element) {
      const offset = 100; // Offset for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className={cn(
        "sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2",
                  activeTab === tab.id
                    ? "border-[#8B1C3B] text-[#8B1C3B]"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantTabs;


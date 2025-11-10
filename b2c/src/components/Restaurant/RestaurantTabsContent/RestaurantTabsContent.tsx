"use client";

import React, { useState } from "react";
import type { Schedule } from "@/src/types/schedule";
import type { Restaurant } from "@/src/types/restaurant";
import { RestaurantSchedule } from "@/src/components/Restaurant/Schedule";
import { RestaurantReviews } from "@/src/components/Restaurant/Reviews";
import { RestaurantMap } from "@/src/components/Restaurant/Map";
import { CollapsibleSection } from "@/src/components/common/CollapsibleSection";
import { cn } from "@/src/lib/utils";

export interface RestaurantTabsContentProps {
  schedules: Schedule[];
  restaurantId: number;
  restaurant?: Restaurant;
  onReviewAdded?: () => void;
  className?: string;
}

const TABS = [
  { id: "schedule", label: "Opening Hours" },
  { id: "reviews", label: "Reviews" },
  { id: "map", label: "Map" },
];

export const RestaurantTabsContent: React.FC<RestaurantTabsContentProps> = ({
  schedules,
  restaurantId,
  restaurant,
  onReviewAdded,
  className,
}) => {
  const [activeTab, setActiveTab] = useState("schedule");


  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className={className}>
      <CollapsibleSection title="Restaurant Information" defaultOpen={true}>
        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap border-b-2",
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

        {/* Tab Content */}
        <div className="relative">
          {activeTab === "schedule" && (
            <div
              id="tab-schedule"
                data-tab-id="schedule"
              >
                <RestaurantSchedule schedules={schedules} />
              </div>
          )}

          {activeTab === "reviews" && (
            <div
              id="tab-reviews"
              data-tab-id="reviews"
            >
              <RestaurantReviews
                restaurantId={restaurantId}
                restaurant={restaurant}
                onReviewAdded={onReviewAdded}
              />
            </div>
          )}

          {activeTab === "map" && (
            <div
              id="tab-map"
              data-tab-id="map"
            >
              <RestaurantMap
                locations={restaurant?.locations}
                address={restaurant?.address}
                restaurantName={restaurant?.name}
                className="w-full"
              />
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default RestaurantTabsContent;


"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { restaurantsService } from "@/src/services/restaurants.service";
import { schedulesService } from "@/src/services/schedules.service";
import { menusService } from "@/src/services/menus.service";
import type { Restaurant } from "@/src/types/restaurant";
import type { Schedule } from "@/src/types/schedule";
import type { Menu } from "@/src/types/menu";
import { RestaurantHero } from "@/src/components/Restaurant/Hero";
import { RestaurantMenu } from "@/src/components/Restaurant/Menu";
import { ReservationBlock } from "@/src/components/Restaurant/ReservationBlock";
import { RestaurantTabsContent } from "@/src/components/Restaurant/RestaurantTabsContent";
import { Spinner } from "@/src/components/common/Spinner";

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params?.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) return;

      try {
        setLoading(true);
        setError(null);

        const [restaurantData, schedulesData, menusData] = await Promise.all([
          restaurantsService.getRestaurant(restaurantId),
          schedulesService.getScheduleByRestaurant(restaurantId),
          menusService.getMenusByRestaurant(restaurantId),
        ]);

        setRestaurant(restaurantData);
        setSchedules(schedulesData);
        setMenus(menusData);
      } catch (err) {
        console.error("Error fetching restaurant data:", err);
        setError(err instanceof Error ? err.message : "Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  const handleReviewAdded = () => {
    // Reviews component will handle refreshing itself
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The restaurant you're looking for doesn't exist."}</p>
          <button
            onClick={() => router.push("/restaurants")}
            className="px-6 py-3 bg-[#8B1C3B] text-white rounded-xl font-medium hover:bg-[#6E152F] transition-colors"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Reservation Form */}
      <RestaurantHero restaurant={restaurant} schedules={schedules} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Content blocks */}
            <div className="lg:col-span-2 space-y-8">
              {/* Combined Section with Tabs: Opening Hours + Reviews + Map */}
              <RestaurantTabsContent
                schedules={schedules}
                restaurantId={restaurant.id}
                restaurant={restaurant}
                onReviewAdded={handleReviewAdded}
              />

              {/* Menu Section */}
              <RestaurantMenu menus={menus} />
            </div>

            {/* Right Column - Sticky Reservation Block */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <ReservationBlock restaurantId={restaurant.id} schedules={schedules} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


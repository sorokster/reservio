"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { restaurantsService } from "@/src/services/restaurants.service";
import { reservationsService } from "@/src/services/reservations.service";
import type { Restaurant } from "@/src/types/restaurant";
import { RestaurantScheme } from "@/src/components/RestaurantScheme";
import { Spinner } from "@/src/components/common/Spinner";
import { getTodayDateString } from "@/src/utils/date";

export default function RestaurantSchemePage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params?.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [bookedTableIds, setBookedTableIds] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    getTodayDateString()
  );

  useEffect(() => {
    if (!restaurantId) return;

    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        setError(null);
        const restaurantData = await restaurantsService.getRestaurant(restaurantId);
        setRestaurant(restaurantData);
      } catch (err) {
        console.error("Error fetching restaurant:", err);
        setError("Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  // Fetch booked tables for selected date
  useEffect(() => {
    if (!restaurantId || !selectedDate) return;

    const fetchBookedTables = async () => {
      try {
        const reservations = await reservationsService.getReservationsByDate(
          restaurantId,
          selectedDate
        );
        const bookedIds = reservations.map((r) => r.table_id);
        setBookedTableIds(bookedIds);
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setBookedTableIds([]);
      }
    };

    fetchBookedTables();
  }, [restaurantId, selectedDate]);

  const handleTableClick = (table: any) => {
    setSelectedTableId(table.id);
    // You can add additional logic here, like showing table details
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push(`/restaurants/${restaurantId}`)}
              className="text-[#8B1C3B] hover:text-[#6E152F] mb-4 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Restaurant
            </button>
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold text-gray-900">{restaurant.name} - Layout</h1>
              
              {/* Date selector */}
              <div className="flex items-center gap-4">
                <label htmlFor="scheme-date" className="text-sm font-medium text-gray-700">
                  Check availability for:
                </label>
                <input
                  id="scheme-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Scheme */}
          <RestaurantScheme
            restaurantId={restaurant.id}
            selectedTableId={selectedTableId}
            onTableClick={handleTableClick}
            bookedTableIds={bookedTableIds}
            date={selectedDate}
          />
        </div>
      </div>
    </div>
  );
}


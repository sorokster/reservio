"use client";

import React, { useState, useEffect } from "react";
import type { Restaurant } from "@/src/types/restaurant";
import type { Schedule } from "@/src/types/schedule";
import { cn, getImageUrl } from "@/src/lib/utils";
import { ReservationModal } from "@/src/components/Restaurant/ReservationModal/ReservationModal";
import { useAuth } from "@/src/hooks/useAuth";
import { schedulesService } from "@/src/services/schedules.service";
import { getTodayDateString } from "@/src/utils/date";

export interface TopRestaurantCardProps {
  restaurant: Restaurant;
  isTop?: boolean;
  className?: string;
  // Optional: pre-loaded favourite data to avoid API call
  initialFavouriteId?: number | null;
  initialIsFavourited?: boolean;
  skipInitialCheck?: boolean;
  onFavouriteChange?: (
    restaurantId: number,
    isFavourited: boolean,
    favouriteId: number | null,
    type: 'restaurant' | 'menuItem'
  ) => void;
}

export const TopRestaurantCard: React.FC<TopRestaurantCardProps> = ({
  restaurant,
  isTop = false,
  className,
  initialFavouriteId = null,
  initialIsFavourited = false,
  skipInitialCheck = false,
  onFavouriteChange,
}) => {
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  
  // Set minimum date to today
  const minDate = getTodayDateString();
  const [date, setDate] = useState(minDate);
  const [guests, setGuests] = useState(2);

  // Load schedules when modal opens
  useEffect(() => {
    if (isModalOpen && restaurant.id) {
      const fetchSchedules = async () => {
        try {
          setLoadingSchedules(true);
          const fetchedSchedules = await schedulesService.getScheduleByRestaurant(restaurant.id);
          setSchedules(fetchedSchedules || []);
        } catch (err) {
          console.error("Error fetching schedules:", err);
          setSchedules([]);
        } finally {
          setLoadingSchedules(false);
        }
      };
      fetchSchedules();
    } else if (!isModalOpen) {
      // Reset schedules when modal closes
      setSchedules([]);
    }
  }, [isModalOpen, restaurant.id]);

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = "/auth/login";
      return;
    }
    setIsModalOpen(true);
  };

  const handleReservationComplete = () => {
    setIsModalOpen(false);
  };

  const handleCardClick = () => {
    window.location.href = `/restaurants/${restaurant.id}`;
  };

  return (
    <>
      <div
        className={cn(
          "group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 h-full",
          "bg-gradient-to-br from-[#8B1C3B] to-pink-600",
          isTop ? "min-h-[500px]" : "min-h-[250px]",
          className
        )}
        onClick={handleCardClick}
      >
        {/* Background Image/Pattern */}
        {restaurant.preview ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${getImageUrl(restaurant.preview)}')`,
            }}
          />
        ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "text-white font-bold opacity-20 group-hover:opacity-30 transition-opacity",
            isTop ? "text-8xl" : "text-7xl"
          )}>
            {restaurant.name[0].toUpperCase()}
          </span>
        </div>
        )}

        {/* Darkened Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 group-hover:from-black/80 group-hover:via-black/50 transition-all"></div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-4 md:p-6">
          {/* Rating Badge - Top Right */}
          {restaurant.average_rating && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <span className="text-sm font-semibold text-white drop-shadow-lg">
                {restaurant.average_rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Restaurant Name - Bottom */}
          <div className="mt-auto">
            <h3 className={cn(
              "font-bold text-white mb-1 drop-shadow-lg",
              isTop ? "text-2xl" : "text-lg"
            )}>
              {restaurant.name}
            </h3>
            {restaurant.city && restaurant.city.country && (
              <p className="text-white/80 text-xs">
                {restaurant.city.name}, {restaurant.city.country.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      {isAuthenticated && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          restaurantId={restaurant.id}
          schedules={schedules}
          onReservationComplete={handleReservationComplete}
          initialDate={date}
          initialGuests={guests}
        />
      )}
    </>
  );
};

export default TopRestaurantCard;

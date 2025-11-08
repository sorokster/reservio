import React, { useState, useEffect } from "react";
import type { Restaurant } from "@/src/types/restaurant";
import type { Schedule } from "@/src/types/schedule";
import { cn, getImageUrl } from "@/src/lib/utils";
import { ReservationModal } from "@/src/components/Restaurant/ReservationModal/ReservationModal";
import { FavouriteButton } from "@/src/components/common/FavouriteButton";
import { useAuth } from "@/src/hooks/useAuth";
import { schedulesService } from "@/src/services/schedules.service";
import { getTodayDateString } from "@/src/utils/date";

export interface RestaurantCardProps {
  restaurant: Restaurant;
  className?: string;
  onClick?: () => void;
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

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  className,
  onClick,
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
  
  // Ensure cuisines is always an array
  const cuisinesArray = Array.isArray(restaurant.cuisines) ? restaurant.cuisines : [];
  const displayCuisines = cuisinesArray.slice(0, 3);
  const hasMoreCuisines = cuisinesArray.length > 3;

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
    // Don't close modal automatically - let user see success message
    // Modal will be closed when user clicks "Close" button
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200",
        className
      )}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="w-full md:w-64 h-48 md:h-auto bg-gradient-to-br from-[#8B1C3B] to-pink-600 flex-shrink-0 relative overflow-hidden">
          {restaurant.preview ? (
            <>
              <img
                src={getImageUrl(restaurant.preview) || undefined}
                alt={restaurant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center hidden">
                <span className="text-white text-6xl font-bold opacity-30">
                  {restaurant.name[0].toUpperCase()}
                </span>
              </div>
            </>
          ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-6xl font-bold opacity-30">
              {restaurant.name[0].toUpperCase()}
            </span>
          </div>
          )}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {restaurant.average_rating && (
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">
                  {restaurant.average_rating.toFixed(1)}
                </span>
              </div>
            )}
            <FavouriteButton 
              restaurantId={restaurant.id} 
              size="md"
              initialFavouriteId={initialFavouriteId}
              initialIsFavourited={initialIsFavourited}
              skipInitialCheck={skipInitialCheck}
              onFavouriteChange={onFavouriteChange}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900 transition-colors">
                {restaurant.name}
              </h3>
            </div>

            {/* Location */}
            {(restaurant.city || restaurant.country) && (
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">
                  {restaurant.city?.name || ""}
                  {restaurant.city?.name && restaurant.country?.name && ", "}
                  {restaurant.country?.name || ""}
              </span>
            </div>
            )}

            {/* Description or Address */}
            {restaurant.company?.description ? (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{restaurant.company.description}</p>
            ) : restaurant.address ? (
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{restaurant.address}</p>
            ) : null}

            {/* Cuisines */}
            {displayCuisines.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {displayCuisines.map((cuisine) => (
                  <span
                    key={cuisine.id}
                    className="px-3 py-1 bg-[#8B1C3B]/10 text-[#8B1C3B] rounded-full text-xs font-medium"
                  >
                    {cuisine.name}
                  </span>
                ))}
                {hasMoreCuisines && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    +{(restaurant.cuisines?.length || 0) - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Reviews */}
            {restaurant.review_count > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span>
                  {restaurant.review_count} {restaurant.review_count === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
            <a
              href={`/restaurants/${restaurant.id}`}
              className="flex items-center justify-center flex-1 sm:flex-none px-6 py-2.5 bg-[#8B1C3B] hover:bg-[#6E152F] text-white rounded-xl font-medium transition-all active:scale-95 leading-tight"
            >
              View Details
            </a>
            <button
              onClick={handleBookNow}
              className="flex items-center justify-center px-6 py-2.5 bg-white border-2 border-[#8B1C3B] text-[#8B1C3B] hover:bg-[#8B1C3B] hover:text-white rounded-xl font-medium transition-all active:scale-95 leading-tight"
            >
              Book Now
            </button>
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
    </div>
  );
};

export default RestaurantCard;


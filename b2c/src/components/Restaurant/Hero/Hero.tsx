import React from "react";
import type { Restaurant } from "@/src/types/restaurant";
import type { Schedule } from "@/src/types/schedule";
import { cn, getImageUrl } from "@/src/lib/utils";
import { FavouriteButton } from "@/src/components/common/FavouriteButton";
import { getRestaurantStatus } from "@/src/utils/schedule";

export interface RestaurantHeroProps {
  restaurant: Restaurant;
  schedules?: Schedule[];
  className?: string;
}

export const RestaurantHero: React.FC<RestaurantHeroProps> = ({
  restaurant,
  schedules = [],
  className,
}) => {
  const restaurantStatus = getRestaurantStatus(schedules);

  const renderStars = (rating: number | null) => {
    if (rating === null) return null;
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return (
              <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            );
          } else if (i === fullStars && hasHalf) {
            return (
              <div key={i} className="relative w-4 h-4">
                <svg className="w-4 h-4 text-gray-300 absolute" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <svg className="w-4 h-4 text-yellow-400 fill-current absolute" style={{ clipPath: 'inset(0 50% 0 0)' }} viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              </div>
            );
          } else {
            return (
              <svg key={i} className="w-4 h-4 text-gray-300" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            );
          }
        })}
      </div>
    );
  };

  // Status badge component
  const StatusBadge = () => {
    const statusConfig = {
      open: { 
        bg: 'bg-green-600',
        text: 'text-white',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      },
      closing_soon: { 
        bg: 'bg-yellow-600',
        text: 'text-white',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      opening_soon: { 
        bg: 'bg-gray-600',
        text: 'text-white',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      closed: { 
        bg: 'bg-red-600',
        text: 'text-white',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      },
      unknown: { 
        bg: 'bg-gray-600',
        text: 'text-white',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    };

    const config = statusConfig[restaurantStatus.status as keyof typeof statusConfig] || statusConfig.unknown;

    return (
      <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg", config.bg, config.text)}>
        {config.icon}
        <span className="text-sm font-medium">{restaurantStatus.message}</span>
        {restaurantStatus.closingTime && (
          <span className="text-xs opacity-90">until {restaurantStatus.closingTime}</span>
        )}
        {restaurantStatus.openingTime && (
          <span className="text-xs opacity-90">at {restaurantStatus.openingTime}</span>
        )}
      </div>
    );
  };

  return (
    <div className={`relative bg-slate-900 overflow-hidden ${className}`}>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {restaurant.preview ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${getImageUrl(restaurant.preview)}')`,
            }}
          />
        ) : (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/95" />
      </div>

      <div className="relative container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Text and Info */}
            <div className="space-y-6">
            {/* Header Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  {restaurant.name}
                </h1>
                <FavouriteButton restaurantId={restaurant.id} size="lg" className="flex-shrink-0" />
              </div>
              
              {/* Description */}
              {restaurant.company?.description && (
                  <p className="text-gray-300 text-base leading-relaxed">
                    {restaurant.company.description}
                  </p>
              )}
              
              {/* Status */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                <StatusBadge />
              </div>
            </div>

            {/* Info List */}
              <div className="space-y-3 text-sm text-gray-400">
                {/* Location */}
              {(restaurant.city || restaurant.country || restaurant.address) && (
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>
                    {restaurant.address && `${restaurant.address}, `}
                    {restaurant.city?.name}
                    {restaurant.city && restaurant.country && ", "}
                    {restaurant.country?.name}
                  </span>
                </div>
              )}

              {/* Phone */}
              {restaurant.phone && (
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${restaurant.phone}`} className="hover:text-white transition-colors">
                    {restaurant.phone}
                  </a>
                </div>
              )}

              {/* Email */}
              {restaurant.email && (
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${restaurant.email}`} className="hover:text-white transition-colors">
                    {restaurant.email}
                  </a>
                </div>
              )}
            </div>

            {/* Cuisines */}
            {restaurant.cuisines && restaurant.cuisines.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-sm text-gray-400 font-medium">Cuisines:</span>
                {restaurant.cuisines.map((cuisine) => (
                  <span
                    key={cuisine.id}
                      className="px-3 py-1.5 text-xs font-medium text-gray-200 bg-gray-800/50 border border-gray-700 rounded-full hover:bg-gray-800 hover:border-gray-600 transition-colors"
                  >
                    {cuisine.name}
                  </span>
                ))}
              </div>
            )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantHero;

import React from "react";
import type { Restaurant } from "@/src/types/restaurant";
import type { FavouriteRestaurant } from "@/src/services/favourites.service";
import { TopRestaurantCard } from "./TopRestaurantCard";

export interface TopRestaurantsListProps {
  restaurants: Restaurant[];
  favouriteRestaurants?: Map<number, FavouriteRestaurant>;
  onFavouriteChange?: (
    restaurantId: number,
    isFavourited: boolean,
    favouriteId: number | null,
    type: 'restaurant' | 'menuItem'
  ) => void;
  className?: string;
}

export const TopRestaurantsList: React.FC<TopRestaurantsListProps> = ({
  restaurants,
  favouriteRestaurants = new Map(),
  onFavouriteChange,
  className,
}) => {
  const restaurantsArray = Array.isArray(restaurants) ? restaurants : [];

  if (restaurantsArray.length === 0) {
    return null;
  }

  // First restaurant is the top one (bigger), rest are smaller
  const topRestaurant = restaurantsArray[0];
  const otherRestaurants = restaurantsArray.slice(1);
  const firstThree = otherRestaurants.slice(0, 2); // First 2 after top (total 3 cards)
  const remainingRestaurants = otherRestaurants.slice(2); // Rest of the restaurants

  return (
    <div className={className}>
      {/* First 3 cards section */}
      <div 
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4" 
        style={{ 
          gridAutoRows: 'minmax(250px, auto)',
          gridAutoFlow: 'dense'
        }}
      >
        {/* Top Restaurant - Takes 2 columns and 2 rows */}
        {topRestaurant && (() => {
          const favourite = favouriteRestaurants.get(topRestaurant.id);
          return (
            <div className="md:col-span-2 md:row-span-2">
              <TopRestaurantCard
                key={topRestaurant.id}
                restaurant={topRestaurant}
                isTop={true}
                initialFavouriteId={favourite?.id || null}
                initialIsFavourited={!!favourite}
                skipInitialCheck={true}
                onFavouriteChange={onFavouriteChange}
              />
            </div>
          );
        })()}

        {/* Next 2 restaurants - span 2 columns each on large screens */}
        {firstThree.map((restaurant) => {
          const favourite = favouriteRestaurants.get(restaurant.id);
          return (
            <div key={restaurant.id} className="lg:col-span-2">
              <TopRestaurantCard
                restaurant={restaurant}
                isTop={false}
                initialFavouriteId={favourite?.id || null}
                initialIsFavourited={!!favourite}
                skipInitialCheck={true}
                onFavouriteChange={onFavouriteChange}
              />
            </div>
          );
        })}
      </div>

      {/* Remaining restaurants in 3 columns */}
      {remainingRestaurants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {remainingRestaurants.map((restaurant) => {
            const favourite = favouriteRestaurants.get(restaurant.id);
            return (
              <TopRestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isTop={false}
                initialFavouriteId={favourite?.id || null}
                initialIsFavourited={!!favourite}
                skipInitialCheck={true}
                onFavouriteChange={onFavouriteChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopRestaurantsList;

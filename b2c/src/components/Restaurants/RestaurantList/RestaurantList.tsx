"use client";

import React, { useState, useEffect } from "react";
import type { Restaurant } from "@/src/types/restaurant";
import type { FavouriteRestaurant } from "@/src/services/favourites.service";
import { RestaurantCard } from "../RestaurantCard";
import { Spinner } from "@/src/components/common/Spinner";
import { useAuth } from "@/src/hooks/useAuth";
import { favouritesService } from "@/src/services/favourites.service";

export interface RestaurantListProps {
  restaurants?: Restaurant[];
  loading?: boolean;
  onRestaurantClick?: (restaurant: Restaurant) => void;
  emptyMessage?: string;
  className?: string;
}

export const RestaurantList: React.FC<RestaurantListProps> = ({
  restaurants = [],
  loading = false,
  onRestaurantClick,
  emptyMessage = "No restaurants found",
  className,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [favouriteRestaurants, setFavouriteRestaurants] = useState<Map<number, FavouriteRestaurant>>(new Map());
  const [loadingFavourites, setLoadingFavourites] = useState(false);

  // Fetch all favourite restaurants once on mount
  useEffect(() => {
    const fetchFavourites = async () => {
      if (!isAuthenticated || !user?.id) {
        setFavouriteRestaurants(new Map());
        return;
      }

      try {
        setLoadingFavourites(true);
        const favourites = await favouritesService.getAllFavouriteRestaurantsByUser(user.id);
        setFavouriteRestaurants(favourites);
      } catch (error) {
        console.error("Error fetching favourite restaurants:", error);
      } finally {
        setLoadingFavourites(false);
      }
    };

    fetchFavourites();
  }, [isAuthenticated, user?.id]);

  // Handle favourite change from FavouriteButton
  const handleFavouriteChange = (restaurantId: number, isFavourited: boolean, favouriteId: number | null) => {
    setFavouriteRestaurants((prev) => {
      const newMap = new Map(prev);
      if (isFavourited && favouriteId) {
        // Add to favourites - we need to create a partial object
        const favouriteItem = {
          id: favouriteId,
          restaurant: { id: restaurantId } as any, // Minimal object for local state
          restaurant_id: restaurantId,
        } as FavouriteRestaurant;
        newMap.set(restaurantId, favouriteItem);
      } else {
        // Remove from favourites
        newMap.delete(restaurantId);
      }
      return newMap;
    });
  };

  // Ensure restaurants is always an array
  const restaurantsArray = Array.isArray(restaurants) ? restaurants : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (restaurantsArray.length === 0) {
    return (
      <div className="text-center py-20">
        <svg
          className="mx-auto h-16 w-16 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <p className="text-gray-600 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {restaurantsArray.map((restaurant) => {
          const favourite = favouriteRestaurants.get(restaurant.id);
          return (
            <RestaurantCard
              key={restaurant?.id || Math.random()}
              restaurant={restaurant}
              onClick={() => onRestaurantClick?.(restaurant)}
              initialFavouriteId={favourite?.id || null}
              initialIsFavourited={!!favourite}
              skipInitialCheck={true}
              onFavouriteChange={handleFavouriteChange}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RestaurantList;


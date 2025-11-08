"use client";

import React, { useState, useEffect } from "react";
import type { Restaurant } from "@/src/types/restaurant";
import type { FavouriteRestaurant } from "@/src/services/favourites.service";
import { TopRestaurantsHeader } from "./TopRestaurantsHeader";
import { TopRestaurantsList } from "./TopRestaurantsList";
import { Spinner } from "@/src/components/common/Spinner";
import { useAuth } from "@/src/hooks/useAuth";
import { favouritesService } from "@/src/services/favourites.service";

export interface TopRestaurantsSectionProps {
  restaurants: Restaurant[];
  loading?: boolean;
  error?: Error | null;
  title?: string;
  description?: string;
  maxItems?: number;
  className?: string;
}

export const TopRestaurantsSection: React.FC<TopRestaurantsSectionProps> = ({
  restaurants = [],
  loading = false,
  error = null,
  title = "Top Restaurants",
  description = "Discover the finest dining experiences rated by our community",
  maxItems = 12,
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
        // Add to favourites
        const favouriteItem = {
          id: favouriteId,
          restaurant: { id: restaurantId } as any,
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
  // Sort restaurants by rating (highest first) and take top items
  const topRestaurants = React.useMemo(() => {
    return [...restaurants]
      .sort((a, b) => {
        const ratingA = a.average_rating || 0;
        const ratingB = b.average_rating || 0;
        // If ratings are equal, sort by review count
        if (ratingA === ratingB) {
          return (b.review_count || 0) - (a.review_count || 0);
        }
        return ratingB - ratingA;
      })
      .slice(0, maxItems);
  }, [restaurants, maxItems]);

  if (error) {
    return null; // Don't show section if there's an error
  }

  return (
    <section className={`relative py-24 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <TopRestaurantsHeader title={title} description={description} />

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="lg" />
            </div>
          ) : topRestaurants.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600">No top restaurants available at the moment</p>
            </div>
          ) : (
            <TopRestaurantsList 
              restaurants={topRestaurants}
              favouriteRestaurants={favouriteRestaurants}
              onFavouriteChange={handleFavouriteChange}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default TopRestaurantsSection;


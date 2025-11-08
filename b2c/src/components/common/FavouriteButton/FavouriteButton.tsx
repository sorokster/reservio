"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { favouritesService } from "@/src/services/favourites.service";
import { cn } from "@/src/lib/utils";

export interface FavouriteButtonProps {
  restaurantId?: number;
  menuItemId?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  // Optional: pre-loaded favourite data to avoid API call
  initialFavouriteId?: number | null;
  initialIsFavourited?: boolean;
  skipInitialCheck?: boolean; // If true, skip API call and use initial values
  onFavouriteChange?: (
    id: number, 
    isFavourited: boolean, 
    favouriteId: number | null,
    type: 'restaurant' | 'menuItem'
  ) => void;
}

export const FavouriteButton: React.FC<FavouriteButtonProps> = ({
  restaurantId,
  menuItemId,
  className,
  size = "md",
  initialFavouriteId = null,
  initialIsFavourited = false,
  skipInitialCheck = false,
  onFavouriteChange,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [isFavourited, setIsFavourited] = useState(initialIsFavourited);
  const [isLoading, setIsLoading] = useState(false);
  const [favouriteId, setFavouriteId] = useState<number | null>(initialFavouriteId);

  // Check if item is favourited on mount (only if not provided via props)
  useEffect(() => {
    // If skipInitialCheck is true, use initial values and skip API call
    if (skipInitialCheck) {
      setIsFavourited(initialIsFavourited);
      setFavouriteId(initialFavouriteId);
      return;
    }

    const checkFavourite = async () => {
      if (!isAuthenticated || !user?.id) {
        setIsFavourited(false);
        return;
      }

      try {
        let favourite = null;
        if (restaurantId) {
          favourite = await favouritesService.isRestaurantFavourited(user.id, restaurantId);
        } else if (menuItemId) {
          favourite = await favouritesService.isMenuItemFavourited(user.id, menuItemId);
        }

        if (favourite) {
          setIsFavourited(true);
          setFavouriteId(favourite.id);
        } else {
          setIsFavourited(false);
          setFavouriteId(null);
        }
      } catch (error) {
        console.error("Error checking favourite:", error);
      }
    };

    checkFavourite();
  }, [isAuthenticated, user?.id, restaurantId, menuItemId, skipInitialCheck, initialIsFavourited, initialFavouriteId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated || !user?.id) {
      window.location.href = "/auth/login";
      return;
    }

    setIsLoading(true);
    try {
      if (isFavourited && favouriteId) {
        // Remove from favourites
        if (restaurantId) {
          await favouritesService.removeFavouriteRestaurant(favouriteId);
          setIsFavourited(false);
          setFavouriteId(null);
          // Notify parent component
          if (onFavouriteChange) {
            onFavouriteChange(restaurantId, false, null, 'restaurant');
          }
        } else if (menuItemId) {
          await favouritesService.removeFavouriteMenuItem(favouriteId);
          setIsFavourited(false);
          setFavouriteId(null);
          // Notify parent component
          if (onFavouriteChange) {
            onFavouriteChange(menuItemId, false, null, 'menuItem');
          }
        }
      } else {
        // Add to favourites
        if (restaurantId) {
          const favourite = await favouritesService.addFavouriteRestaurant(user.id, restaurantId);
          if (favourite && favourite.id) {
            setIsFavourited(true);
            setFavouriteId(favourite.id);
            // Notify parent component
            if (onFavouriteChange) {
              onFavouriteChange(restaurantId, true, favourite.id, 'restaurant');
            }
          } else {
            // If response doesn't have ID, re-check status
            const recheck = await favouritesService.isRestaurantFavourited(user.id, restaurantId);
            if (recheck) {
              setIsFavourited(true);
              setFavouriteId(recheck.id);
              // Notify parent component
              if (onFavouriteChange) {
                onFavouriteChange(restaurantId, true, recheck.id, 'restaurant');
              }
            }
          }
        } else if (menuItemId) {
          const favourite = await favouritesService.addFavouriteMenuItem(user.id, menuItemId);
          if (favourite && favourite.id) {
            setIsFavourited(true);
            setFavouriteId(favourite.id);
            // Notify parent component
            if (onFavouriteChange) {
              onFavouriteChange(menuItemId, true, favourite.id, 'menuItem');
            }
          } else {
            // If response doesn't have ID, re-check status
            const recheck = await favouritesService.isMenuItemFavourited(user.id, menuItemId);
            if (recheck) {
              setIsFavourited(true);
              setFavouriteId(recheck.id);
              // Notify parent component
              if (onFavouriteChange) {
                onFavouriteChange(menuItemId, true, recheck.id, 'menuItem');
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error toggling favourite:", error);
      // Show user-friendly error message
      const errorMessage = error?.data?.detail || error?.message || "Failed to update favourites";
      alert(errorMessage);
      // Re-check status on error to ensure UI is in sync
      try {
        if (restaurantId) {
          const recheck = await favouritesService.isRestaurantFavourited(user.id, restaurantId);
          setIsFavourited(!!recheck);
          setFavouriteId(recheck?.id || null);
        } else if (menuItemId) {
          const recheck = await favouritesService.isMenuItemFavourited(user.id, menuItemId);
          setIsFavourited(!!recheck);
          setFavouriteId(recheck?.id || null);
        }
      } catch (recheckError) {
        console.error("Error rechecking favourite status:", recheckError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "flex items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        isFavourited
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-red-50",
        sizeClasses[size],
        className
      )}
      aria-label={isFavourited ? "Remove from favourites" : "Add to favourites"}
    >
      <svg
        className={cn(
          size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6",
          isFavourited && "fill-current"
        )}
        fill={isFavourited ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};

export default FavouriteButton;


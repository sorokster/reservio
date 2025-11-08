import { useState, useEffect } from "react";
import { restaurantsService } from "@/src/services/restaurants.service";
import type { PaginatedResponse } from "@/src/services/restaurants.service";
import type { Restaurant } from "@/src/types/restaurant";

export interface UseRestaurantsOptions {
  filters?: {
    country?: number;
    city?: number;
    cuisine?: number;
    company?: number;
    minRating?: number;
  };
  search?: string;
  page?: number;
  pageSize?: number;
  skip?: boolean;
}

// Re-export PaginatedResponse from restaurants service
export type { PaginatedResponse } from "@/src/services/restaurants.service";

export interface UseRestaurantsResult {
  restaurants: Restaurant[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching restaurants with pagination and filters
 */
export function useRestaurants(
  options: UseRestaurantsOptions = {}
): UseRestaurantsResult {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(options.page || 1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const pageSize = options.pageSize || 10;

  const fetchRestaurants = async () => {
    if (options.skip) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use page from options, or reset to 1 if filters/search changed
      const page = options.page !== undefined ? options.page : currentPage;
      const offset = (page - 1) * pageSize;

      // Use restaurants service - all filters are sent to backend
      const data = await restaurantsService.getRestaurants({
        filters: {
          country: options.filters?.country,
          city: options.filters?.city,
          cuisine: options.filters?.cuisine,
          company: options.filters?.company,
          minRating: options.filters?.minRating,
        },
        search: options.search,
        limit: pageSize,
        offset: offset,
      });

      setRestaurants(data.results || []);
      setTotalCount(data.count || 0);
      // Recalculate totalPages based on new count from API
      const newTotalPages = Math.ceil((data.count || 0) / pageSize);
      setTotalPages(newTotalPages);
      setCurrentPage(page);
      setHasNextPage(!!data.next);
      setHasPreviousPage(!!data.previous);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch restaurants"));
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when filters or search change
  useEffect(() => {
    if (options.page === undefined) {
      setCurrentPage(1);
    }
  }, [
    options.filters?.country,
    options.filters?.city,
    options.filters?.cuisine,
    options.filters?.company,
    options.search,
  ]);

  useEffect(() => {
    fetchRestaurants();
  }, [
    options.skip,
    options.page,
    options.pageSize,
    options.filters?.country,
    options.filters?.city,
    options.filters?.cuisine,
    options.filters?.company,
    options.filters?.minRating,
    options.search,
  ]);

  return {
    restaurants,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    refetch: fetchRestaurants,
  };
}

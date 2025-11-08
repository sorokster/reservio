import { ApiService } from "./api.service";
import { API_ENDPOINTS } from "./api.config";
import type { Restaurant } from "@/src/types/restaurant";

export interface RestaurantFilters {
  country?: number;
  city?: number;
  cuisine?: number;
  company?: number;
  minRating?: number;
}

export interface RestaurantListParams {
  filters?: RestaurantFilters;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Restaurants service
 * Handles all restaurant-related API calls
 * Extends base ApiService for common HTTP methods
 */
class RestaurantsService extends ApiService {
  /**
   * Get list of restaurants with filters, search, and pagination
   */
  async getRestaurants(params?: RestaurantListParams): Promise<PaginatedResponse<Restaurant>> {
    const queryParams = new URLSearchParams();

    // Add filters
    if (params?.filters?.country) {
      queryParams.append("country_id", String(params.filters.country));
    }
    if (params?.filters?.city) {
      queryParams.append("city_id", String(params.filters.city));
    }
    if (params?.filters?.cuisine) {
      queryParams.append("cuisine", String(params.filters.cuisine));
    }
    if (params?.filters?.company) {
      queryParams.append("company_id", String(params.filters.company));
    }
    if (params?.filters?.minRating !== undefined && params.filters.minRating !== null) {
      queryParams.append("min_rating", String(params.filters.minRating));
    }

    // Add search
    if (params?.search) {
      queryParams.append("search", params.search);
    }

    // Add pagination
    if (params?.limit !== undefined) {
      queryParams.append("limit", String(params.limit));
    }
    if (params?.offset !== undefined) {
      queryParams.append("offset", String(params.offset));
    }

    const url = API_ENDPOINTS.RESTAURANTS.WITH_FILTERS(queryParams.toString());
    return this.get<PaginatedResponse<Restaurant>>(url);
  }

  /**
   * Get restaurant by ID
   */
  async getRestaurant(id: number | string): Promise<Restaurant> {
    return this.get<Restaurant>(API_ENDPOINTS.RESTAURANTS.DETAIL(id));
  }

  /**
   * Get all restaurants (without pagination)
   */
  async getAllRestaurants(): Promise<Restaurant[]> {
    const response = await this.get<PaginatedResponse<Restaurant> | Restaurant[]>(
      API_ENDPOINTS.RESTAURANTS.LIST
    );
    
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response)) {
      return response;
    }
    return response.results || [];
  }

}

// Export singleton instance
export const restaurantsService = new RestaurantsService();


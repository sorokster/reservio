import { ApiService } from "./api.service";
import { API_ENDPOINTS } from "./api.config";
import type { Cuisine } from "@/src/types/cuisine";
import type { PaginatedResponse } from "./restaurants.service";

/**
 * Cuisines service
 * Handles all cuisine-related API calls
 * Extends base ApiService for common HTTP methods
 */
class CuisinesService extends ApiService {
  /**
   * Get all cuisines
   * API returns paginated response, so we extract results
   */
  async getCuisines(): Promise<Cuisine[]> {
    const response = await this.get<PaginatedResponse<Cuisine> | Cuisine[]>(
      API_ENDPOINTS.FILTERS.CUISINES
    );
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response)) {
      return response;
    }
    return response.results || [];
  }
}

// Export singleton instance
export const cuisinesService = new CuisinesService();


import { ApiService } from "./api.service";
import { API_ENDPOINTS } from "./api.config";
import type { City } from "@/src/types/city";
import type { PaginatedResponse } from "./restaurants.service";

/**
 * Cities service
 * Handles all city-related API calls
 * Extends base ApiService for common HTTP methods
 */
class CitiesService extends ApiService {
  /**
   * Get all cities
   * API returns paginated response, so we extract results
   */
  async getCities(): Promise<City[]> {
    const response = await this.get<PaginatedResponse<City> | City[]>(
      API_ENDPOINTS.FILTERS.CITIES
    );
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response)) {
      return response;
    }
    return response.results || [];
  }
}

// Export singleton instance
export const citiesService = new CitiesService();


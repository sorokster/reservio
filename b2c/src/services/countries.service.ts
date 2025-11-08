import { ApiService } from "./api.service";
import { API_ENDPOINTS } from "./api.config";
import type { Country } from "@/src/types/country";
import type { PaginatedResponse } from "./restaurants.service";

/**
 * Countries service
 * Handles all country-related API calls
 * Extends base ApiService for common HTTP methods
 */
class CountriesService extends ApiService {
  /**
   * Get all countries
   * API returns paginated response, so we extract results
   */
  async getCountries(): Promise<Country[]> {
    const response = await this.get<PaginatedResponse<Country> | Country[]>(
      API_ENDPOINTS.FILTERS.COUNTRIES
    );
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response)) {
      return response;
    }
    return response.results || [];
  }
}

// Export singleton instance
export const countriesService = new CountriesService();


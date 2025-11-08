import { ApiService } from "./api.service";
import { API_ENDPOINTS } from "./api.config";
import type { Table } from "@/src/types/table";
import type { PaginatedResponse } from "./restaurants.service";

/**
 * Tables service
 * Handles all table-related API calls
 * Extends base ApiService for common HTTP methods
 */
class TablesService extends ApiService {
  /**
   * Get tables for a restaurant
   */
  async getTablesByRestaurant(restaurantId: number | string): Promise<Table[]> {
    const response = await this.get<PaginatedResponse<Table> | Table[]>(
      API_ENDPOINTS.TABLES.LIST(restaurantId)
    );
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response)) {
      return response;
    }
    return response.results || [];
  }
}

// Export singleton instance
export const tablesService = new TablesService();


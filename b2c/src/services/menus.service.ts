import { ApiService } from "./api.service";
import { API_ENDPOINTS } from "./api.config";
import type { Menu } from "@/src/types/menu";
import { PaginatedResponse } from "./restaurants.service";

/**
 * Menus service
 * Handles all menu-related API calls
 * Extends base ApiService for common HTTP methods
 */
class MenusService extends ApiService {
  /**
   * Get menus for a restaurant
   * API returns paginated response, so we extract results
   */
  async getMenusByRestaurant(restaurantId: number | string): Promise<Menu[]> {
    const response = await this.get<PaginatedResponse<Menu> | Menu[]>(
      API_ENDPOINTS.MENUS.LIST(restaurantId)
    );
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response)) {
      return response;
    }
    return response.results || [];
  }
}

// Export singleton instance
export const menusService = new MenusService();


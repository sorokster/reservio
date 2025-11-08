import { ApiService } from "./api.service";
import { API_ENDPOINTS } from "./api.config";
import type { Schedule } from "@/src/types/schedule";
import type { PaginatedResponse } from "./restaurants.service";

/**
 * Schedules service
 * Handles all schedule-related API calls
 * Extends base ApiService for common HTTP methods
 */
class SchedulesService extends ApiService {
  /**
   * Get schedule for a restaurant
   * API returns paginated response, so we extract results
   */
  async getScheduleByRestaurant(restaurantId: number | string): Promise<Schedule[]> {
    const response = await this.get<PaginatedResponse<Schedule> | Schedule[]>(
      API_ENDPOINTS.SCHEDULES.LIST(restaurantId)
    );
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response)) {
      return response;
    }
    return response.results || [];
  }
}

// Export singleton instance
export const schedulesService = new SchedulesService();


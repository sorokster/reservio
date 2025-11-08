import { ApiService } from "./api.service";
import { API_ENDPOINTS } from "./api.config";
import type { Review } from "@/src/types/review";
import type { PaginatedResponse } from "./restaurants.service";

export interface CreateReviewData {
  restaurant_id: number;
  user_id: number;
  rating: number;
  comment: string;
}

/**
 * Reviews service
 * Handles all review-related API calls
 * Extends base ApiService for common HTTP methods
 */
class ReviewsService extends ApiService {
  /**
   * Get reviews for a restaurant
   * API returns paginated response, so we extract results
   */
  async getReviewsByRestaurant(
    restaurantId: number | string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Review>> {
    // Build URL with proper query parameters
    // Django PageNumberPagination uses 'page' and 'page_size' parameters
    const baseUrl = API_ENDPOINTS.REVIEWS.BY_RESTAURANT(restaurantId);
    const url = `${baseUrl}&page=${page}&page_size=${pageSize}`;
    
    const response = await this.get<PaginatedResponse<Review> | Review[]>(url);
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response)) {
      return {
        count: response.length,
        next: null,
        previous: null,
        results: response,
      };
    }
    return response;
  }

  /**
   * Create a new review
   */
  async createReview(data: CreateReviewData): Promise<Review> {
    return this.post<Review>(API_ENDPOINTS.REVIEWS.CREATE, data);
  }
}

// Export singleton instance
export const reviewsService = new ReviewsService();


import { ApiService } from "./api.service";
import { API_ENDPOINTS } from "./api.config";
import type { Reservation } from "@/src/types/reservation";
import type { PaginatedResponse } from "./restaurants.service";

export interface CreateReservationData {
  restaurant_id: number;
  table_id: number;
  date: string;
  guests: number;
  time_from: string;
  time_to: string;
  user_id: number;
}

/**
 * Reservations service
 * Handles all reservation-related API calls
 * Extends base ApiService for common HTTP methods
 */
class ReservationsService extends ApiService {
  /**
   * Get reservations by restaurant and date
   */
  async getReservationsByDate(
    restaurantId: number | string,
    date: string
  ): Promise<Reservation[]> {
    const response = await this.get<PaginatedResponse<Reservation> | Reservation[]>(
      API_ENDPOINTS.RESERVATIONS.BY_DATE(restaurantId, date)
    );
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response)) {
      return response;
    }
    return response.results || [];
  }

  /**
   * Get reservations by restaurant ID
   */
  async getReservationsByRestaurant(
    restaurantId: number | string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Reservation>> {
    // Django PageNumberPagination uses 'page' and 'page_size' parameters
    const params = new URLSearchParams();
    params.append("restaurant_id", String(restaurantId));
    params.append("page", String(page));
    params.append("page_size", String(pageSize));
    
    const url = `${API_ENDPOINTS.RESERVATIONS.LIST}?${params.toString()}`;
    const response = await this.get<PaginatedResponse<Reservation> | Reservation[]>(url);
    
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
   * Get reservations by user ID with pagination
   */
  async getReservationsByUser(
    userId: number | string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Reservation>> {
    // Django PageNumberPagination uses 'page' and 'page_size' parameters
    const params = new URLSearchParams();
    params.append("user_id", String(userId));
    params.append("page", String(page));
    params.append("page_size", String(pageSize));
    
    const url = `${API_ENDPOINTS.RESERVATIONS.LIST}?${params.toString()}`;
    const response = await this.get<PaginatedResponse<Reservation> | Reservation[]>(url);
    
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
   * Get a single reservation by ID
   */
  async getReservationById(id: number | string): Promise<Reservation> {
    return this.get<Reservation>(API_ENDPOINTS.RESERVATIONS.DETAIL(id));
  }

  /**
   * Update a reservation
   */
  async updateReservation(
    id: number | string,
    data: Partial<CreateReservationData>
  ): Promise<Reservation> {
    return this.patch<Reservation>(API_ENDPOINTS.RESERVATIONS.UPDATE(id), data);
  }

  /**
   * Cancel/Delete a reservation
   */
  async cancelReservation(id: number | string): Promise<void> {
    return this.delete<void>(API_ENDPOINTS.RESERVATIONS.DELETE(id));
  }

  /**
   * Create a new reservation
   */
  async createReservation(data: CreateReservationData): Promise<Reservation> {
    return this.post<Reservation>(API_ENDPOINTS.RESERVATIONS.CREATE, data);
  }
}

// Export singleton instance
export const reservationsService = new ReservationsService();

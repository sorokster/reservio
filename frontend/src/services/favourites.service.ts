import { ApiService } from "./api.service";
import { API_ENDPOINTS } from "./api.config";
import type { Restaurant } from "@/src/types/restaurant";
import type { MenuItem } from "@/src/types/menu-item";
import type { PaginatedResponse } from "./restaurants.service";

export interface FavouriteRestaurant {
  id: number;
  user: number;
  user_id: number;
  restaurant: Restaurant;
  restaurant_id: number;
  created_at: string;
  updated_at: string;
}

export interface FavouriteRestaurantItem {
  id: number;
  user: number;
  user_id: number;
  menu_item: MenuItem;
  menu_item_id: number;
  created_at: string;
  updated_at: string;
}

/**
 * Favourites service
 * Handles all favourite-related API calls
 * Extends base ApiService for common HTTP methods
 */
class FavouritesService extends ApiService {
  /**
   * Get favourite restaurants by user
   */
  async getFavouriteRestaurants(
    userId: number | string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<FavouriteRestaurant>> {
    const params = new URLSearchParams();
    params.append("user_id", String(userId));
    params.append("page", String(page));
    params.append("page_size", String(pageSize));
    
    const url = `${API_ENDPOINTS.FAVOURITES.RESTAURANTS.LIST}?${params.toString()}`;
    const response = await this.get<PaginatedResponse<FavouriteRestaurant> | FavouriteRestaurant[]>(url);
    
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
   * Check if restaurant is favourited by user
   */
  async isRestaurantFavourited(
    userId: number | string,
    restaurantId: number | string
  ): Promise<FavouriteRestaurant | null> {
    const params = new URLSearchParams();
    params.append("user_id", String(userId));
    params.append("restaurant_id", String(restaurantId));
    
    const url = `${API_ENDPOINTS.FAVOURITES.RESTAURANTS.LIST}?${params.toString()}`;
    const response = await this.get<PaginatedResponse<FavouriteRestaurant> | FavouriteRestaurant[]>(url);
    
    if (Array.isArray(response)) {
      return response.length > 0 ? response[0] : null;
    }
    return response.results && response.results.length > 0 ? response.results[0] : null;
  }

  /**
   * Add restaurant to favourites
   */
  async addFavouriteRestaurant(
    userId: number | string,
    restaurantId: number | string
  ): Promise<FavouriteRestaurant> {
    return this.post<FavouriteRestaurant>(API_ENDPOINTS.FAVOURITES.RESTAURANTS.CREATE, {
      user_id: Number(userId),
      restaurant_id: Number(restaurantId),
    });
  }

  /**
   * Remove restaurant from favourites
   */
  async removeFavouriteRestaurant(id: number | string): Promise<void> {
    return this.delete<void>(API_ENDPOINTS.FAVOURITES.RESTAURANTS.DELETE(id));
  }

  /**
   * Get favourite menu items by user
   */
  async getFavouriteMenuItems(
    userId: number | string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<FavouriteRestaurantItem>> {
    const params = new URLSearchParams();
    params.append("user_id", String(userId));
    params.append("page", String(page));
    params.append("page_size", String(pageSize));
    
    const url = `${API_ENDPOINTS.FAVOURITES.MENU_ITEMS.LIST}?${params.toString()}`;
    const response = await this.get<PaginatedResponse<FavouriteRestaurantItem> | FavouriteRestaurantItem[]>(url);
    
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
   * Get all favourite restaurants by user (for batch checking)
   */
  async getAllFavouriteRestaurantsByUser(
    userId: number | string
  ): Promise<Map<number, FavouriteRestaurant>> {
    const result = new Map<number, FavouriteRestaurant>();
    let page = 1;
    const pageSize = 12;
    
    while (true) {
      const response = await this.getFavouriteRestaurants(userId, page, pageSize);
      
      // Add all items to map
      response.results.forEach((item) => {
        result.set(item.restaurant.id, item);
      });
      
      // If no more pages, break
      if (!response.next || response.results.length < pageSize) {
        break;
      }
      
      page++;
    }
    
    return result;
  }

  /**
   * Get all favourite menu items by user (for batch checking)
   */
  async getAllFavouriteMenuItemsByUser(
    userId: number | string
  ): Promise<Map<number, FavouriteRestaurantItem>> {
    const result = new Map<number, FavouriteRestaurantItem>();
    let page = 1;
    const pageSize = 100; // Get large batches
    
    while (true) {
      const response = await this.getFavouriteMenuItems(userId, page, pageSize);
      
      // Add all items to map
      response.results.forEach((item) => {
        result.set(item.menu_item.id, item);
      });
      
      // If no more pages, break
      if (!response.next || response.results.length < pageSize) {
        break;
      }
      
      page++;
    }
    
    return result;
  }

  /**
   * Check if menu item is favourited by user
   */
  async isMenuItemFavourited(
    userId: number | string,
    menuItemId: number | string
  ): Promise<FavouriteRestaurantItem | null> {
    const params = new URLSearchParams();
    params.append("user_id", String(userId));
    params.append("menu_item_id", String(menuItemId));
    
    const url = `${API_ENDPOINTS.FAVOURITES.MENU_ITEMS.LIST}?${params.toString()}`;
    const response = await this.get<PaginatedResponse<FavouriteRestaurantItem> | FavouriteRestaurantItem[]>(url);
    
    if (Array.isArray(response)) {
      return response.length > 0 ? response[0] : null;
    }
    return response.results && response.results.length > 0 ? response.results[0] : null;
  }

  /**
   * Add menu item to favourites
   */
  async addFavouriteMenuItem(
    userId: number | string,
    menuItemId: number | string
  ): Promise<FavouriteRestaurantItem> {
    return this.post<FavouriteRestaurantItem>(API_ENDPOINTS.FAVOURITES.MENU_ITEMS.CREATE, {
      user_id: Number(userId),
      menu_item_id: Number(menuItemId),
    });
  }

  /**
   * Remove menu item from favourites
   */
  async removeFavouriteMenuItem(id: number | string): Promise<void> {
    return this.delete<void>(API_ENDPOINTS.FAVOURITES.MENU_ITEMS.DELETE(id));
  }
}

// Export singleton instance
export const favouritesService = new FavouritesService();


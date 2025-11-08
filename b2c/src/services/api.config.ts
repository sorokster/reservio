/**
 * API Configuration
 * Centralized configuration for all backend API endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login/`,
    LOGOUT: `${API_BASE_URL}/auth/logout/`,
    REGISTER: `${API_BASE_URL}/auth/register/`,
    PROFILE: (userId: number | string) => `${API_BASE_URL}/auth/profile/${userId}/`,
  },

  // Restaurant endpoints
  RESTAURANTS: {
    LIST: `${API_BASE_URL}/api/restaurants/`,
    DETAIL: (id: number | string) => `${API_BASE_URL}/api/restaurants/${id}/`,
    WITH_FILTERS: (params?: string) => 
      `${API_BASE_URL}/api/restaurants/${params ? `?${params}` : ""}`,
  },

  // Table endpoints
  TABLES: {
    LIST: (restaurantId?: number | string) => 
      restaurantId 
        ? `${API_BASE_URL}/api/tables/?restaurant_id=${restaurantId}`
        : `${API_BASE_URL}/api/tables/`,
  },

  // Reservation endpoints
  RESERVATIONS: {
    LIST: `${API_BASE_URL}/api/reservations/`,
    CREATE: `${API_BASE_URL}/api/reservations/`,
    DETAIL: (id: number | string) => `${API_BASE_URL}/api/reservations/${id}/`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/reservations/${id}/`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/reservations/${id}/`,
    BY_RESTAURANT: (restaurantId: number | string, date?: string) => {
      const params = new URLSearchParams();
      params.append("restaurant_id", String(restaurantId));
      if (date) params.append("date", date);
      return `${API_BASE_URL}/api/reservations/?${params.toString()}`;
    },
    BY_USER: (userId: number | string) => 
      `${API_BASE_URL}/api/reservations/?user_id=${userId}`,
    BY_DATE: (restaurantId: number | string, date: string) =>
      `${API_BASE_URL}/api/reservations/?restaurant_id=${restaurantId}&date=${date}`,
  },

  // Schedule endpoints
  SCHEDULES: {
    LIST: (restaurantId?: number | string) =>
      restaurantId
        ? `${API_BASE_URL}/api/schedules/?restaurant_id=${restaurantId}`
        : `${API_BASE_URL}/api/schedules/`,
  },

  // Review endpoints
  REVIEWS: {
    LIST: `${API_BASE_URL}/api/reviews/`,
    CREATE: `${API_BASE_URL}/api/reviews/`,
    BY_RESTAURANT: (restaurantId: number | string) =>
      `${API_BASE_URL}/api/reviews/?restaurant_id=${restaurantId}`,
  },

  // Menu endpoints
  MENUS: {
    LIST: (restaurantId?: number | string) =>
      restaurantId
        ? `${API_BASE_URL}/api/menus/?restaurant_id=${restaurantId}`
        : `${API_BASE_URL}/api/menus/`,
  },

  // Filter options endpoints
  FILTERS: {
    COUNTRIES: `${API_BASE_URL}/api/countries/`,
    CITIES: `${API_BASE_URL}/api/cities/`,
    COMPANIES: `${API_BASE_URL}/api/companies/`,
    CUISINES: `${API_BASE_URL}/api/cuisines/`,
  },

  // Favourites endpoints
  FAVOURITES: {
    RESTAURANTS: {
      LIST: `${API_BASE_URL}/api/favourite-restaurants/`,
      CREATE: `${API_BASE_URL}/api/favourite-restaurants/`,
      DELETE: (id: number | string) => `${API_BASE_URL}/api/favourite-restaurants/${id}/`,
      BY_USER: (userId: number | string) => `${API_BASE_URL}/api/favourite-restaurants/?user_id=${userId}`,
      BY_RESTAURANT: (restaurantId: number | string) => `${API_BASE_URL}/api/favourite-restaurants/?restaurant_id=${restaurantId}`,
    },
    MENU_ITEMS: {
      LIST: `${API_BASE_URL}/api/favourite-restaurant-items/`,
      CREATE: `${API_BASE_URL}/api/favourite-restaurant-items/`,
      DELETE: (id: number | string) => `${API_BASE_URL}/api/favourite-restaurant-items/${id}/`,
      BY_USER: (userId: number | string) => `${API_BASE_URL}/api/favourite-restaurant-items/?user_id=${userId}`,
      BY_MENU_ITEM: (menuItemId: number | string) => `${API_BASE_URL}/api/favourite-restaurant-items/?menu_item_id=${menuItemId}`,
    },
  },
} as const;

/**
 * Get the base API URL
 */
export const getApiBaseUrl = (): string => API_BASE_URL;

/**
 * Build a URL with query parameters
 */
export const buildUrlWithParams = (
  baseUrl: string,
  params: Record<string, string | number | undefined>
): string => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  return url.toString();
};


import { ApiService } from "./api.service";
import { API_ENDPOINTS } from "./api.config";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

/**
 * Authentication service
 * Handles all authentication-related API calls
 * Extends base ApiService for common HTTP methods
 */
class AuthService extends ApiService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials) {
    return this.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  /**
   * Register new user
   */
  async register(data: RegisterData) {
    return this.post(API_ENDPOINTS.AUTH.REGISTER, data);
  }

  /**
   * Logout user
   */
  async logout() {
    return this.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  /**
   * Get user profile
   */
  async getProfile(userId: number | string): Promise<User> {
    return this.get<User>(API_ENDPOINTS.AUTH.PROFILE(userId));
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: number | string, data: Partial<User>): Promise<User> {
    const response = await this.patch<{ status: string } & User>(API_ENDPOINTS.AUTH.PROFILE(userId), data);
    
    // Django returns { status: 'success', id, username, email, ... }
    // Extract user data from response
    if (response.status === 'success') {
      return {
        id: response.id,
        username: response.username,
        email: response.email,
        first_name: response.first_name,
        last_name: response.last_name,
      };
    }
    
    // If no status field, assume it's already a User object
    return response as User;
  }
}

// Export singleton instance
export const authService = new AuthService();

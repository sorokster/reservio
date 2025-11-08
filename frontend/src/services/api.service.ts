import { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { apiClient } from "@/src/lib/axios";

/**
 * API Error with additional context
 */
export class ApiError extends Error {
  status?: number;
  statusText?: string;
  data?: any;
  originalError?: AxiosError;

  constructor(message: string, error?: AxiosError) {
    super(message);
    this.name = "ApiError";
    
    if (error?.response) {
      this.status = error.response.status;
      this.statusText = error.response.statusText;
      this.data = error.response.data;
    }
    
    this.originalError = error;
  }
}

/**
 * Base API Service
 * Provides common HTTP methods for all API services
 */
export class ApiService {
  protected client: AxiosInstance;

  constructor(client: AxiosInstance = apiClient) {
    this.client = client;
  }

  /**
   * Handle API errors and throw ApiError
   */
  protected handleError(error: unknown, url: string, method: string): never {
    // Handle network errors (no response from server)
    if (error instanceof Error && 'request' in error && !('response' in error)) {
      const axiosError = error as AxiosError;
      const message = axiosError.message || 'Network error. Please check your internet connection and try again.';
      console.error(`Network Error [${method.toUpperCase()} ${url}]:`, message, axiosError);
      throw new ApiError(message, axiosError);
    }
    
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const statusText = axiosError.response?.statusText;
      const data = axiosError.response?.data;
      
      // Extract error message from various possible formats
      let message = statusText || `Request failed with status code ${status}`;
      
      if (data) {
        // Handle string error messages
        if (typeof data === 'string') {
          message = data;
        }
        // Handle object with error fields
        else if (typeof data === 'object' && data !== null) {
          // Custom format: { status: 'error', detail: "..." } (used in auth views)
          if ('status' in data && data.status === 'error' && 'detail' in data && data.detail) {
            message = String(data.detail);
          }
          // Django REST Framework format: { detail: "..." }
          else if ('detail' in data && data.detail) {
            message = String(data.detail);
          }
          // Common format: { message: "..." }
          else if ('message' in data && data.message) {
            message = String(data.message);
          }
          // Handle validation errors: { field: ["error1", "error2"] }
          else if (status === 400 || status === 422) {
            const errorMessages: string[] = [];
            for (const [key, value] of Object.entries(data)) {
              if (Array.isArray(value)) {
                errorMessages.push(`${key}: ${value.join(', ')}`);
              } else if (typeof value === 'string') {
                errorMessages.push(`${key}: ${value}`);
              } else if (value && typeof value === 'object') {
                errorMessages.push(`${key}: ${JSON.stringify(value)}`);
              }
            }
            if (errorMessages.length > 0) {
              message = errorMessages.join('; ');
            } else if (Object.keys(data).length === 0) {
              // Empty object - use default message
              message = status === 400 ? 'Bad request. Please check your input.' : 'Validation error. Please check your input.';
            } else {
              message = 'Validation error. Please check your input.';
            }
          }
          // Handle non-empty object without known error fields
          else if (Object.keys(data).length > 0) {
            // Try to stringify for debugging, but use a more user-friendly message
            message = status === 401 ? 'Unauthorized. Please sign in.' :
                     status === 403 ? 'Forbidden. You do not have permission.' :
                     status === 404 ? 'Resource not found.' :
                     status === 500 ? 'Server error. Please try again later.' :
                     `Request failed with status ${status}`;
          }
        }
      }
      
      // If still no message and we have an empty object, use status-based default
      if (!message || (data && typeof data === 'object' && Object.keys(data).length === 0)) {
        message = status === 400 ? 'Bad request. Please check your input.' :
                 status === 401 ? 'Unauthorized. Please sign in.' :
                 status === 403 ? 'Forbidden. You do not have permission.' :
                 status === 404 ? 'Resource not found.' :
                 status === 500 ? 'Server error. Please try again later.' :
                 `Request failed with status ${status || 'unknown'}`;
      }
      
      console.error(`API Error [${method.toUpperCase()} ${url}]:`, {
        status,
        statusText,
        data,
        message,
      });
      
      throw new ApiError(message, axiosError);
    }
    
    // Handle non-axios errors (including network errors)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`API Error [${method.toUpperCase()} ${url}]:`, errorMessage, error);
    
    // Check if it's a network error
    if (errorMessage.includes('Network Error') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
      throw new ApiError('Network error. Please check your internet connection and ensure the server is running.');
    }
    
    throw new ApiError(errorMessage);
  }

  /**
   * GET request
   */
  protected async get<T>(url: string, config?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error, url, "GET");
    }
  }

  /**
   * POST request
   */
  protected async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error, url, "POST");
    }
  }

  /**
   * PUT request
   */
  protected async put<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error, url, "PUT");
    }
  }

  /**
   * PATCH request
   */
  protected async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error, url, "PATCH");
    }
  }

  /**
   * DELETE request
   */
  protected async delete<T>(url: string, config?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error, url, "DELETE");
    }
  }
}


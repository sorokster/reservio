import { useState, useEffect } from "react";
import { apiClient } from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/services/api.config";
import { Reservation } from "@/src/types/reservation";

export interface UseReservationsOptions {
  userId?: number | string;
  restaurantId?: number | string;
  date?: string;
  skip?: boolean;
}

export interface UseReservationsResult {
  reservations: Reservation[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createReservation: (data: Partial<Reservation>) => Promise<Reservation>;
  updateReservation: (id: number | string, data: Partial<Reservation>) => Promise<Reservation>;
  deleteReservation: (id: number | string) => Promise<void>;
}

/**
 * Hook for managing reservations
 */
export function useReservations(
  options: UseReservationsOptions = {}
): UseReservationsResult {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReservations = async () => {
    if (options.skip) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let url: string;
      if (options.userId) {
        url = API_ENDPOINTS.RESERVATIONS.BY_USER(options.userId);
      } else if (options.restaurantId && options.date) {
        url = API_ENDPOINTS.RESERVATIONS.BY_DATE(options.restaurantId, options.date);
      } else if (options.restaurantId) {
        url = API_ENDPOINTS.RESERVATIONS.BY_RESTAURANT(options.restaurantId);
      } else {
        url = API_ENDPOINTS.RESERVATIONS.LIST;
      }

      const response = await apiClient.get<Reservation[]>(url);
      setReservations(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch reservations"));
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (data: Partial<Reservation>): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>(
      API_ENDPOINTS.RESERVATIONS.CREATE,
      data
    );
    await fetchReservations();
    return response.data;
  };

  const updateReservation = async (
    id: number | string,
    data: Partial<Reservation>
  ): Promise<Reservation> => {
    const response = await apiClient.patch<Reservation>(
      API_ENDPOINTS.RESERVATIONS.UPDATE(id),
      data
    );
    await fetchReservations();
    return response.data;
  };

  const deleteReservation = async (id: number | string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.RESERVATIONS.DELETE(id));
    await fetchReservations();
  };

  useEffect(() => {
    fetchReservations();
  }, [
    options.skip,
    options.userId,
    options.restaurantId,
    options.date,
  ]);

  return {
    reservations,
    loading,
    error,
    refetch: fetchReservations,
    createReservation,
    updateReservation,
    deleteReservation,
  };
}


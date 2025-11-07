"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Reservation } from "@/src/types/reservation";
import { Table } from "@/src/types/table";
import { Restaurant } from "@/src/types/restaurant";

export default function ReservationEditPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reservationId = params?.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [guests, setGuests] = useState<number>(2);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTimeFrom, setSelectedTimeFrom] = useState<string>("");
  const [selectedTimeTo, setSelectedTimeTo] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && reservationId) {
      fetchReservation();
      fetchRestaurants();
    }
  }, [isAuthenticated, reservationId]);

  useEffect(() => {
    if (reservation) {
      // Initialize form with reservation data
      const restaurantId = reservation.restaurant_id || reservation.restaurant?.id;
      setSelectedRestaurant(restaurantId || null);
      setSelectedDate(reservation.date);
      setSelectedTable(reservation.table_id);
      setGuests(reservation.guests);
      if (reservation.time_slots.length > 0) {
        const firstSlot = reservation.time_slots[0];
        const lastSlot = reservation.time_slots[reservation.time_slots.length - 1];
        setSelectedTimeFrom(firstSlot.time_from.slice(0, 5));
        setSelectedTimeTo(lastSlot.time_to.slice(0, 5));
      }
      // Fetch tables for the restaurant
      if (restaurantId) {
        fetchTables(restaurantId);
        // Fetch reservations for the date to check availability
        if (reservation.date) {
          fetch(`http://localhost:8000/api/reservations/?restaurant_id=${restaurantId}&date=${reservation.date}`, {
            credentials: "include",
          })
            .then(res => res.json())
            .then(data => {
              setReservations(Array.isArray(data) ? data : data.results || []);
            })
            .catch(err => console.error("Error fetching reservations:", err));
        }
      }
    }
  }, [reservation]);

  useEffect(() => {
    if (selectedDate && selectedRestaurant) {
      fetchReservationsForDate();
    }
  }, [selectedDate, selectedTimeFrom, selectedTimeTo, selectedRestaurant]);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchTables(selectedRestaurant);
      setSelectedTable(null);
      if (selectedDate) {
        fetchReservationsForDate();
      }
    }
  }, [selectedRestaurant]);

  // Generate time slots (every 30 minutes from 10:00 to 22:00)
  useEffect(() => {
    const slots: string[] = [];
    for (let hour = 10; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        slots.push(time);
      }
    }
    setTimeSlots(slots);
  }, []);

  const fetchReservation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/reservations/${reservationId}/`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReservation(data);
      } else {
        if (response.status === 401) {
          setError("Authentication required. Please log in again.");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else if (response.status === 404) {
          setError("Reservation not found");
        } else if (response.status === 403) {
          setError("You don't have permission to view this reservation");
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.detail || "Failed to load reservation");
        }
      }
    } catch (err) {
      console.error("Error fetching reservation:", err);
      setError("An error occurred while loading the reservation");
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async (restaurantId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/tables/?restaurant_id=${restaurantId}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      setTables(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/restaurants/",
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      setRestaurants(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const fetchReservationsForDate = async () => {
    if (!selectedRestaurant || !selectedDate) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/reservations/?restaurant_id=${selectedRestaurant}&date=${selectedDate}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      setReservations(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  // Get booked tables for selected date and time (excluding current reservation)
  const getBookedTables = (): number[] => {
    if (!selectedDate || !selectedTimeFrom || !selectedTimeTo) return [];

    return reservations
      .filter((res) => {
        // Exclude current reservation from booked tables (handle both string and number IDs)
        if (res.id.toString() === reservationId.toString() || res.id === Number(reservationId)) {
          return false;
        }
        const resDate = res.date;
        
        // Check if any time slot overlaps with the selected time range
        const hasOverlappingSlot = res.time_slots.some((slot) => {
          const slotFrom = slot.time_from.slice(0, 5);
          const slotTo = slot.time_to.slice(0, 5);
          
          // Two time slots overlap if:
          // - new slot starts before existing slot ends AND
          // - new slot ends after existing slot starts
          return selectedTimeFrom < slotTo && selectedTimeTo > slotFrom;
        });
        
        return resDate === selectedDate && hasOverlappingSlot;
      })
      .map((res) => res.table_id);
  };

  const getAvailableTables = (): Table[] => {
    if (!selectedDate || !selectedTimeFrom || !selectedTimeTo) {
      // If no date/time selected, show all tables that can accommodate guests
      return tables.filter(table => table.seats >= guests);
    }

    const bookedTableIds = getBookedTables();
    const filtered = tables.filter(
      (table) => {
        // Always include currently selected table (it's this reservation)
        if (table.id === selectedTable) {
          return table.seats >= guests;
        }
        // For other tables, check if they're booked and have enough seats
        return !bookedTableIds.includes(table.id) && table.seats >= guests;
      }
    );
    
    // Ensure currently selected table is always in the list
    if (selectedTable) {
      const selectedTableObj = tables.find(t => t.id === selectedTable);
      if (selectedTableObj && !filtered.find(t => t.id === selectedTable)) {
        filtered.push(selectedTableObj);
      }
    }
    
    return filtered;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant || !selectedDate || !selectedTable || !selectedTimeFrom || !selectedTimeTo) {
      setError("Please fill in all fields");
      return;
    }

    // Validate that "to" time is after "from" time
    if (selectedTimeTo <= selectedTimeFrom) {
      setError("End time must be after start time");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        `http://localhost:8000/api/reservations/${reservationId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            restaurant_id: selectedRestaurant,
            date: selectedDate,
            table_id: selectedTable,
            guests: guests,
            time_slots_data: [
              {
                time_from: selectedTimeFrom,
                time_to: selectedTimeTo,
              },
            ],
          }),
          credentials: "include",
        }
      );

      if (response.ok) {
        setSuccess(true);
        // Refresh reservation data
        await fetchReservation();
        setTimeout(() => {
          router.push("/profile/reservations");
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to update reservation");
      }
    } catch (err) {
      console.error("Error updating reservation:", err);
      setError("An error occurred while updating the reservation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to cancel this reservation? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/reservations/${reservationId}/`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok || response.status === 204) {
        router.push("/profile/reservations");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to cancel reservation");
      }
    } catch (err) {
      console.error("Error deleting reservation:", err);
      setError("An error occurred while canceling the reservation");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const calculateDuration = (from: string, to: string): string => {
    const [fromHours, fromMinutes] = from.split(":").map(Number);
    const [toHours, toMinutes] = to.split(":").map(Number);
    const fromTotal = fromHours * 60 + fromMinutes;
    const toTotal = toHours * 60 + toMinutes;
    const durationMinutes = toTotal - fromTotal;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${minutes > 1 ? "s" : ""}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    } else {
      return `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
  };

  // Calendar helpers
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30); // 30 days in advance

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-center items-center">
          <div className="w-16 h-16 border-4 border-[#8B1C3B] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!reservation) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <a
              href="/profile/reservations"
              className="text-[#8B1C3B] hover:text-[#6E152F] font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Reservations
            </a>
          </div>
          {error && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const availableTables = getAvailableTables();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <a
            href="/profile/reservations"
            className="text-[#8B1C3B] hover:text-[#6E152F] font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Reservations
          </a>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Reservation</h1>
        <p className="text-gray-600 mb-8">
          {selectedRestaurant 
            ? restaurants.find(r => r.id === selectedRestaurant)?.name || reservation.restaurant?.name || "Restaurant"
            : reservation.restaurant?.name || "Restaurant"}
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-800">Reservation updated successfully!</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant</label>
              <select
                value={selectedRestaurant || ""}
                onChange={(e) => {
                  const restaurantId = e.target.value ? Number(e.target.value) : null;
                  setSelectedRestaurant(restaurantId);
                  setSelectedTable(null);
                  setSelectedTimeFrom("");
                  setSelectedTimeTo("");
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent outline-none"
                required
              >
                <option value="">Select a restaurant</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} - {restaurant.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTable(null);
                  setSelectedTimeFrom("");
                  setSelectedTimeTo("");
                }}
                min={formatDate(today)}
                max={formatDate(maxDate)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent outline-none"
                required
                disabled={!selectedRestaurant}
              />
              {selectedDate && (
                <p className="mt-2 text-sm text-gray-600">{getDayName(selectedDate)}</p>
              )}
              {!selectedRestaurant && (
                <p className="mt-2 text-sm text-gray-500">Please select a restaurant first</p>
              )}
            </div>

            {/* Guests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
              <select
                value={guests}
                onChange={(e) => {
                  setGuests(Number(e.target.value));
                  setSelectedTable(null);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent outline-none"
                required
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Selection */}
            {selectedDate && selectedRestaurant && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Time</label>
                  <select
                    value={selectedTimeFrom}
                    onChange={(e) => {
                      setSelectedTimeFrom(e.target.value);
                      setSelectedTable(null);
                      // Auto-set "to" time to 30 minutes later if not set
                      if (!selectedTimeTo && e.target.value) {
                        const [hours, minutes] = e.target.value.split(":").map(Number);
                        const endMinutes = minutes + 30;
                        const endHours = endMinutes >= 60 ? hours + 1 : hours;
                        const autoTo = `${endHours.toString().padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;
                        if (timeSlots.includes(autoTo)) {
                          setSelectedTimeTo(autoTo);
                        }
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select start time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Time</label>
                  <select
                    value={selectedTimeTo}
                    onChange={(e) => {
                      setSelectedTimeTo(e.target.value);
                      setSelectedTable(null);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent outline-none"
                    required
                    disabled={!selectedTimeFrom}
                  >
                    <option value="">Select end time</option>
                    {timeSlots
                      .filter((time) => !selectedTimeFrom || time > selectedTimeFrom)
                      .map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                  </select>
                  {selectedTimeFrom && selectedTimeTo && selectedTimeTo <= selectedTimeFrom && (
                    <p className="mt-2 text-sm text-red-600">End time must be after start time</p>
                  )}
                </div>

                {selectedTimeFrom && selectedTimeTo && selectedTimeTo > selectedTimeFrom && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      Duration: {calculateDuration(selectedTimeFrom, selectedTimeTo)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Table Selection */}
            {selectedRestaurant && selectedDate && selectedTimeFrom && selectedTimeTo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Table</label>
                {availableTables.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {availableTables.map((table) => (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => setSelectedTable(table.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedTable === table.id
                            ? "border-[#8B1C3B] bg-[#8B1C3B]/5 ring-2 ring-[#8B1C3B]/20"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-semibold text-gray-900">Table {table.number}</div>
                        <div className="text-sm text-gray-600">{table.seats} seats</div>
                        {selectedTable === table.id && (
                          <div className="text-xs text-[#8B1C3B] font-medium mt-1">Selected</div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-yellow-800">
                      No tables available for {guests} {guests === 1 ? "guest" : "guests"} from {selectedTimeFrom} to {selectedTimeTo} on{" "}
                      {getDayName(selectedDate)}. Please try a different time or date.
                    </p>
                  </div>
                )}
              </div>
            )}

            {(!selectedRestaurant || !selectedDate || !selectedTimeFrom || !selectedTimeTo) && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-blue-800">
                  {!selectedRestaurant 
                    ? "Please select a restaurant first."
                    : "Please select a date and time range to see available tables."}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting || !selectedRestaurant || !selectedDate || !selectedTable || !selectedTimeFrom || !selectedTimeTo || selectedTimeTo <= selectedTimeFrom}
                className="flex-1 px-6 py-3 bg-[#8B1C3B] hover:bg-[#6E152F] text-white rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Updating..." : "Update Reservation"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Canceling..." : "Cancel Reservation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



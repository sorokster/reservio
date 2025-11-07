"use client";

import React, { useState, useEffect } from "react";
import { Table } from "@/src/types/table";
import { Reservation } from "@/src/types/reservation";
import { useAuth } from "@/src/hooks/useAuth";

interface RestaurantReservationProps {
  restaurantId: number | string;
}

const RestaurantReservation: React.FC<RestaurantReservationProps> = ({ restaurantId }) => {
  const { isAuthenticated, user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [guests, setGuests] = useState<number>(2);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    fetchTables();
    if (selectedDate) {
      fetchReservations();
    }
  }, [restaurantId, selectedDate]);

  const fetchTables = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/tables/?restaurant_id=${restaurantId}`);
      const data = await response.json();
      setTables(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/reservations/?restaurant_id=${restaurantId}&date=${selectedDate}`
      );
      const data = await response.json();
      setReservations(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

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

  // Get booked tables for selected date and time
  const getBookedTables = (): number[] => {
    if (!selectedDate || !selectedTime) return [];
    
    return reservations
      .filter((res) => {
        const resDate = res.date;
        const hasTimeSlot = res.time_slots.some(
          (slot) => slot.time_from.slice(0, 5) === selectedTime
        );
        return resDate === selectedDate && hasTimeSlot;
      })
      .map((res) => res.table_id);
  };

  const getAvailableTables = (): Table[] => {
    const bookedTableIds = getBookedTables();
    return tables.filter(
      (table) => !bookedTableIds.includes(table.id) && table.seats >= guests
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTable || !selectedTime) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);

    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const endMinutes = minutes + 30;
      const endHours = endMinutes >= 60 ? hours + 1 : hours;
      const timeTo = `${endHours.toString().padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;

      const response = await fetch("http://localhost:8000/api/reservations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          user_id: user?.id,
          table_id: selectedTable,
          date: selectedDate,
          guests: guests,
          time_slots_data: [
            {
              time_from: selectedTime,
              time_to: timeTo,
            },
          ],
        }),
        credentials: "include",
      });

      if (response.ok) {
        alert("Reservation created successfully!");
        setSelectedDate("");
        setSelectedTable(null);
        setSelectedTime("");
        setGuests(2);
        fetchReservations();
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to create reservation");
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert("Failed to create reservation");
    } finally {
      setSubmitting(false);
    }
  };

  // Calendar helpers
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30); // 30 days in advance

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in to make a reservation</h3>
        <p className="text-gray-600 mb-6">Please sign in to book a table at this restaurant.</p>
        <a
          href="/login"
          className="inline-block px-6 py-3 bg-[#8B1C3B] hover:bg-[#6E152F] text-white rounded-xl font-medium transition-all active:scale-95"
        >
          Sign In
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-[#8B1C3B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const availableTables = getAvailableTables();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Make a Reservation</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTable(null);
              setSelectedTime("");
            }}
            min={formatDate(today)}
            max={formatDate(maxDate)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent outline-none"
            required
          />
          {selectedDate && (
            <p className="mt-2 text-sm text-gray-600">{getDayName(selectedDate)}</p>
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
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => {
                    setSelectedTime(time);
                    setSelectedTable(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedTime === time
                      ? "bg-[#8B1C3B] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Table Selection */}
        {selectedDate && selectedTime && availableTables.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Table</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableTables.map((table) => (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => setSelectedTable(table.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTable === table.id
                      ? "border-[#8B1C3B] bg-[#8B1C3B]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold text-gray-900">Table {table.number}</div>
                  <div className="text-sm text-gray-600">{table.seats} seats</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDate && selectedTime && availableTables.length === 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-yellow-800">
              No tables available for {guests} {guests === 1 ? "guest" : "guests"} at {selectedTime} on{" "}
              {getDayName(selectedDate)}. Please try a different time or date.
            </p>
          </div>
        )}

        {/* Submit Button */}
        {selectedDate && selectedTable && selectedTime && (
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-4 bg-[#8B1C3B] hover:bg-[#6E152F] text-white rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating Reservation..." : "Confirm Reservation"}
          </button>
        )}
      </form>
    </div>
  );
};

export default RestaurantReservation;


"use client";

import React, { useState, useEffect } from "react";
import { Table } from "@/src/types/table";
import { Reservation } from "@/src/types/reservation";
import { Schedule } from "@/src/types/schedule";
import { useAuth } from "@/src/hooks/useAuth";

interface RestaurantReservationHeroProps {
  restaurantId: number | string;
  onSuccess?: () => void;
  initialDate?: string;
  initialTime?: string;
  initialGuests?: number;
}

const RestaurantReservationHero: React.FC<RestaurantReservationHeroProps> = ({ 
  restaurantId, 
  onSuccess,
  initialDate,
  initialTime,
  initialGuests
}) => {
  const { isAuthenticated, user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || "");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [guests, setGuests] = useState<number>(initialGuests || 2);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTimeFrom, setSelectedTimeFrom] = useState<string>(initialTime || "");
  const [selectedTimeTo, setSelectedTimeTo] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showTables, setShowTables] = useState(false);
  const [schedule, setSchedule] = useState<Schedule[]>([]);

  useEffect(() => {
    fetchTables();
    fetchSchedule();
  }, [restaurantId]);

  useEffect(() => {
    if (selectedDate) {
      fetchReservations();
    }
  }, [restaurantId, selectedDate, selectedTimeFrom, selectedTimeTo]);

  // Update state when initial values change (when modal opens)
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
    if (initialTime) {
      setSelectedTimeFrom(initialTime);
      // Auto-set "to" time to 30 minutes later
      const [hours, minutes] = initialTime.split(":").map(Number);
      const endMinutes = minutes + 30;
      const endHours = endMinutes >= 60 ? hours + 1 : hours;
      const autoTo = `${endHours.toString().padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;
      setSelectedTimeTo(autoTo);
      setShowTables(true);
    }
    if (initialGuests) {
      setGuests(initialGuests);
    }
  }, [initialDate, initialTime, initialGuests]);

  const fetchTables = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/tables/?restaurant_id=${restaurantId}`, {
        credentials: "include",
      });
      const data = await response.json();
      setTables(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    if (!selectedDate) return;
    try {
      const response = await fetch(
        `http://localhost:8000/api/reservations/?restaurant_id=${restaurantId}&date=${selectedDate}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        const reservationsList = Array.isArray(data) ? data : (data.results || []);
        setReservations(reservationsList);
        console.log("Fetched reservations:", reservationsList.length, "for date:", selectedDate);
      } else {
        console.error("Failed to fetch reservations:", response.status);
        setReservations([]);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setReservations([]);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/schedules/?restaurant_id=${restaurantId}`
      );
      const data = await response.json();
      setSchedule(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  // Generate time slots based on schedule for selected date
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }

    const date = new Date(selectedDate);
    const weekday = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to Django weekday format (1 = Monday, 7 = Sunday)
    const djangoWeekday = weekday === 0 ? 7 : weekday;

    const daySchedule = schedule.find((s) => s.weekday === djangoWeekday);

    if (!daySchedule || daySchedule.is_closed || !daySchedule.time_from || !daySchedule.time_to) {
      setTimeSlots([]);
      return;
    }

    const slots: string[] = [];
    const [fromHour, fromMinute] = daySchedule.time_from.split(":").map(Number);
    const [toHour, toMinute] = daySchedule.time_to.split(":").map(Number);

    let currentHour = fromHour;
    let currentMinute = fromMinute;

    while (
      currentHour < toHour ||
      (currentHour === toHour && currentMinute < toMinute)
    ) {
      const time = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
      slots.push(time);

      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    setTimeSlots(slots);
  }, [selectedDate, schedule]);

  const getBookedTables = (timeFrom?: string, timeTo?: string): number[] => {
    const checkTimeFrom = timeFrom || selectedTimeFrom;
    const checkTimeTo = timeTo || selectedTimeTo;
    if (!selectedDate || !checkTimeFrom || !checkTimeTo) return [];
    
    // Normalize time format to HH:MM
    const normalizeTime = (timeStr: string): string => {
      if (!timeStr) return '';
      return timeStr.slice(0, 5);
    };
    
    // Normalize date format to YYYY-MM-DD
    const normalizeDate = (dateStr: string): string => {
      if (!dateStr) return '';
      return dateStr.split('T')[0];
    };
    
    const normalizedTimeFrom = normalizeTime(checkTimeFrom);
    const normalizedTimeTo = normalizeTime(checkTimeTo);
    const normalizedSelectedDate = normalizeDate(selectedDate);
    
    const bookedIds = reservations
      .filter((res) => {
        if (!res.time_slots || res.time_slots.length === 0) return false;
        
        const resDate = normalizeDate(res.date);
        if (resDate !== normalizedSelectedDate) return false;
        
        // Check if any time slot overlaps with the selected time range
        const hasOverlappingSlot = res.time_slots.some((slot) => {
          if (!slot.time_from || !slot.time_to) return false;
          const slotFrom = normalizeTime(slot.time_from);
          const slotTo = normalizeTime(slot.time_to);
          
          // Two time slots overlap if:
          // - new slot starts before existing slot ends AND
          // - new slot ends after existing slot starts
          return normalizedTimeFrom < slotTo && normalizedTimeTo > slotFrom;
        });
        
        return hasOverlappingSlot;
      })
      .map((res) => {
        // Handle both table_id and table.id formats
        return res.table_id || (res.table && res.table.id) || null;
      })
      .filter((id): id is number => id !== null && id !== undefined);
    
    return bookedIds;
  };

  // Check if a time slot has any available tables
  const isTimeSlotAvailable = (time: string): boolean => {
    if (!selectedDate || !time) return false;
    
    // For checking availability, we assume a 30-minute slot
    const [hours, minutes] = time.split(":").map(Number);
    const endMinutes = minutes + 30;
    const endHours = endMinutes >= 60 ? hours + 1 : hours;
    const timeTo = `${endHours.toString().padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;
    
    const bookedTableIds = getBookedTables(time, timeTo);
    const suitableTables = tables.filter((table) => table.seats >= guests);
    
    // If there's at least one suitable table that's not booked, the slot is available
    return suitableTables.some((table) => !bookedTableIds.includes(table.id));
  };

  // Get available time slots (only show times that have at least one available table)
  const getAvailableTimeSlots = (): string[] => {
    return timeSlots.filter(time => isTimeSlotAvailable(time));
  };

  const getAvailableTables = (): Table[] => {
    if (!selectedTimeFrom || !selectedTimeTo || !selectedDate) return [];
    // Use the memoized bookedTableIds for consistency
    const bookedIds = getBookedTables(selectedTimeFrom, selectedTimeTo);
    return tables.filter(
      (table) => {
        const isBooked = bookedIds.includes(table.id);
        const hasEnoughSeats = table.seats >= guests;
        return !isBooked && hasEnoughSeats;
      }
    );
  };

  const getAllTables = (): Table[] => {
    return tables.filter((table) => table.seats >= guests);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTable || !selectedTimeFrom || !selectedTimeTo) {
      alert("Please fill in all fields");
      return;
    }

    // Validate that "to" time is after "from" time
    if (selectedTimeTo <= selectedTimeFrom) {
      alert("End time must be after start time");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/api/reservations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          user_id: user.id,
          table_id: selectedTable,
          date: selectedDate,
          guests: guests,
          time_slots_data: [
            {
              time_from: selectedTimeFrom,
              time_to: selectedTimeTo,
            },
          ],
        }),
        credentials: "include",
      });

      if (response.ok) {
        alert("Reservation created successfully!");
        setSelectedDate("");
        setSelectedTable(null);
        setSelectedTimeFrom("");
        setSelectedTimeTo("");
        setGuests(2);
        setShowTables(false);
        fetchReservations();
        // Close modal if onSuccess callback is provided
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 500);
        }
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

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  // Calculate booked tables - must be before any conditional returns
  const bookedTableIds = React.useMemo(() => getBookedTables(selectedTimeFrom, selectedTimeTo), [selectedTimeFrom, selectedTimeTo, selectedDate, reservations]);
  
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

  if (!isAuthenticated) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-white mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">Sign in to make a reservation</h3>
          <p className="text-white/80 mb-6">Please sign in to book a table at this restaurant.</p>
          <a
            href="/login"
            className="inline-block px-8 py-3 bg-white text-[#8B1C3B] rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-[#8B1C3B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const availableTables = getAvailableTables();
  const allTables = getAllTables();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[#8B1C3B] rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Book a Table</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTable(null);
                setSelectedTimeFrom("");
                setSelectedTimeTo("");
                setShowTables(false);
              }}
              min={formatDate(today)}
              max={formatDate(maxDate)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-[#8B1C3B] outline-none transition-all bg-white"
              required
            />
            {selectedDate && (
              <p className="mt-2 text-sm text-gray-600 font-medium">{getDayName(selectedDate)}</p>
            )}
          </div>

          {/* Guests */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Guests</label>
            <select
              value={guests}
              onChange={(e) => {
                setGuests(Number(e.target.value));
                setSelectedTable(null);
                setShowTables(false);
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-[#8B1C3B] outline-none transition-all bg-white"
              required
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Available Times</label>
              {timeSlots.length === 0 ? (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-800 font-medium">
                    Restaurant is closed on {getDayName(selectedDate)}. Please select a different date.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl mb-4">
                  <p className="text-blue-800 text-sm font-medium">
                    Showing only available time slots with at least one free table for {guests} {guests === 1 ? "guest" : "guests"}
                  </p>
                </div>
              )}
            </div>

            {timeSlots.length > 0 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">From Time</label>
                  <select
                    value={selectedTimeFrom}
                    onChange={(e) => {
                      setSelectedTimeFrom(e.target.value);
                      setSelectedTable(null);
                      setShowTables(false);
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-[#8B1C3B] outline-none transition-all bg-white"
                    required
                  >
                    <option value="">Select start time</option>
                    {getAvailableTimeSlots().map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">To Time</label>
                  <select
                    value={selectedTimeTo}
                    onChange={(e) => {
                      setSelectedTimeTo(e.target.value);
                      setSelectedTable(null);
                      setShowTables(false);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-[#8B1C3B] outline-none transition-all bg-white"
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
                    <p className="mt-2 text-sm text-red-600 font-medium">End time must be after start time</p>
                  )}
                </div>

                {selectedTimeFrom && selectedTimeTo && selectedTimeTo > selectedTimeFrom && (
                  <div className="p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                    <p className="text-sm text-green-800 font-medium">
                      Duration: {calculateDuration(selectedTimeFrom, selectedTimeTo)}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Available Tables Display */}
        {selectedDate && selectedTimeFrom && selectedTimeTo && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-gray-700">Available Tables</label>
              <button
                type="button"
                onClick={() => setShowTables(!showTables)}
                className="text-sm text-[#8B1C3B] font-semibold hover:underline"
              >
                {showTables ? "Hide" : "Show"} all tables
              </button>
            </div>
            
            {showTables && (
              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {allTables.map((table) => {
                    const isBooked = bookedTableIds.includes(table.id);
                    const isAvailable = !isBooked && table.seats >= guests;
                    const isTooSmall = !isBooked && table.seats < guests;
                    const isSelected = selectedTable === table.id;

                    return (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => isAvailable && setSelectedTable(table.id)}
                        disabled={!isAvailable}
                        className={`relative p-4 rounded-xl border-2 transition-all transform ${
                          isSelected
                            ? "border-[#8B1C3B] bg-[#8B1C3B] text-white scale-105 shadow-lg"
                            : isBooked
                            ? "border-red-500 bg-red-500 text-white cursor-not-allowed opacity-90"
                            : isTooSmall
                            ? "border-yellow-500 bg-yellow-500 text-white cursor-not-allowed opacity-90"
                            : isAvailable
                            ? "border-green-500 bg-green-500 text-white hover:border-green-600 hover:bg-green-600 hover:scale-102 cursor-pointer"
                            : "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        {isBooked && (
                          <div className="absolute top-2 right-2">
                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                              Booked
                            </span>
                          </div>
                        )}
                        {isTooSmall && (
                          <div className="absolute top-2 right-2">
                            <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                              Too Small
                            </span>
                          </div>
                        )}
                        <div className={`font-bold text-lg ${isSelected ? "text-white" : isBooked || isTooSmall || isAvailable ? "text-white" : "text-gray-900"}`}>
                          Table {table.number}
                        </div>
                        <div className={`text-sm ${isSelected ? "text-white/90" : isBooked || isTooSmall || isAvailable ? "text-white/90" : "text-gray-600"}`}>
                          {table.seats} {table.seats === 1 ? "seat" : "seats"}
                        </div>
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#8B1C3B]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-600">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-gray-600">Too Small</span>
                  </div>
                </div>
              </div>
            )}

            {availableTables.length > 0 && !showTables && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableTables.slice(0, 4).map((table) => {
                  // Double-check that this table is not booked (safety check)
                  const isActuallyBooked = bookedTableIds.includes(table.id);
                  if (isActuallyBooked) return null; // Don't render booked tables in available section
                  
                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() => setSelectedTable(table.id)}
                      className={`p-4 rounded-xl border-2 transition-all transform ${
                        selectedTable === table.id
                          ? "border-[#8B1C3B] bg-[#8B1C3B] text-white scale-105 shadow-lg"
                          : "border-gray-300 bg-white hover:border-[#8B1C3B] hover:scale-102"
                      }`}
                    >
                      <div className="font-bold text-lg">Table {table.number}</div>
                      <div className="text-sm opacity-90">{table.seats} seats</div>
                    </button>
                  );
                })}
                {availableTables.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setShowTables(true)}
                    className="p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[#8B1C3B] hover:bg-[#8B1C3B]/5 transition-all"
                  >
                    <div className="font-semibold text-gray-700">+{availableTables.length - 4} more</div>
                  </button>
                )}
              </div>
            )}

            {availableTables.length === 0 && selectedTimeFrom && selectedTimeTo && (
              <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <p className="text-yellow-800 font-medium">
                  No tables available for {guests} {guests === 1 ? "guest" : "guests"} from {selectedTimeFrom} to {selectedTimeTo} on{" "}
                  {getDayName(selectedDate)}. Please try a different time or date.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        {selectedDate && selectedTable && selectedTimeFrom && selectedTimeTo && selectedTimeTo > selectedTimeFrom && (
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-8 py-4 bg-gradient-to-r from-[#8B1C3B] to-[#6E152F] hover:from-[#6E152F] hover:to-[#8B1C3B] text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Reservation...
              </span>
            ) : (
              "Confirm Reservation"
            )}
          </button>
        )}
      </form>
    </div>
  );
};

export default RestaurantReservationHero;


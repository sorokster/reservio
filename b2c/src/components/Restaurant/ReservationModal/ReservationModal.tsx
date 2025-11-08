"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Table } from "@/src/types/table";
import type { Schedule } from "@/src/types/schedule";
import { Button } from "@/src/components/common/Button";
import { Input } from "@/src/components/common/Input";
import { Select } from "@/src/components/common/Select";
import { SectionTitle } from "@/src/components/common/SectionTitle";
import { tablesService } from "@/src/services/tables.service";
import { reservationsService } from "@/src/services/reservations.service";
import { schedulesService } from "@/src/services/schedules.service";
import { ApiError } from "@/src/services/api.service";
import { useAuth } from "@/src/hooks/useAuth";
import { cn } from "@/src/lib/utils";
import { 
  getWeekdayForDate, 
  getScheduleForWeekday, 
  generateTimeOptions, 
  isReservationTimeValid,
  formatTime 
} from "@/src/utils/schedule";
import { getTodayDateString } from "@/src/utils/date";

export interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: number;
  schedules?: Schedule[];
  onReservationComplete?: () => void;
  initialDate?: string;
  initialGuests?: number;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  restaurantId,
  schedules: propSchedules = [],
  onReservationComplete,
  initialDate,
  initialGuests = 2,
}) => {
  const { user, isAuthenticated } = useAuth();
  
  // Set minimum date to today
  const minDate = getTodayDateString();
  
  // Set default date to today or initialDate
  const [date, setDate] = useState(initialDate || minDate);
  const [guests, setGuests] = useState(initialGuests);
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [tables, setTables] = useState<Table[]>([]);
  const [bookedTableIds, setBookedTableIds] = useState<number[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showErrorScreen, setShowErrorScreen] = useState(false);
  const [reservationDetails, setReservationDetails] = useState<{
    date: string;
    timeFrom: string;
    timeTo: string;
    guests: number;
    tableId: number | null;
    tableNumber: string;
  } | null>(null);
  
  // Load schedules if not provided via props
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Fetch schedules when modal opens if not provided
  useEffect(() => {
    // Don't do anything if modal is closed
    if (!isOpen) {
      setSchedules([]);
      setLoadingSchedules(false);
      return;
    }

    // If schedules are provided via props, use them immediately
    if (propSchedules && propSchedules.length > 0) {
      setSchedules(propSchedules);
      setLoadingSchedules(false);
      return;
    }

    // Otherwise, fetch schedules
    if (!restaurantId) {
      setLoadingSchedules(false);
      return;
    }

    let cancelled = false;
    
    const fetchSchedules = async () => {
      try {
        setLoadingSchedules(true);
        
        // Add timeout to prevent hanging (3 seconds)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Schedule request timeout')), 3000);
        });
        
        const fetchPromise = schedulesService.getScheduleByRestaurant(restaurantId);
        
        const fetchedSchedules = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (!cancelled) {
          setSchedules(fetchedSchedules || []);
          setLoadingSchedules(false);
        }
      } catch (err) {
        console.error("Error fetching schedules:", err);
        if (!cancelled) {
          setSchedules([]);
          setLoadingSchedules(false);
        }
      }
    };
    
    fetchSchedules();
    
    // Cleanup function
    return () => {
      cancelled = true;
      setLoadingSchedules(false);
    };
  }, [isOpen, restaurantId, propSchedules]);

  // Get schedule for selected date
  const selectedDateSchedule = useMemo(() => {
    if (!date || schedules.length === 0) return null;
    const weekday = getWeekdayForDate(date);
    return getScheduleForWeekday(schedules, weekday);
  }, [date, schedules]);

  // Generate time options based on schedule
  const timeOptions = useMemo(() => {
    return generateTimeOptions(selectedDateSchedule, 30, 1);
  }, [selectedDateSchedule]);

  // Filter time options for "to" based on "from" selection
  const timeToOptions = React.useMemo(() => {
    if (!timeFrom) return timeOptions;
    const fromIndex = timeOptions.findIndex((opt) => opt.value === timeFrom);
    if (fromIndex === -1) return timeOptions;
    return timeOptions.slice(fromIndex + 1);
  }, [timeFrom, timeOptions]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDate(initialDate || minDate);
      setGuests(initialGuests);
      setTimeFrom("");
      setTimeTo("");
      setSelectedTable(null);
      setError(null);
      setSuccess(false);
      setShowErrorScreen(false);
      setTables([]);
      setBookedTableIds([]);
      
      // Reset schedules only if not provided via props
      if (!propSchedules || propSchedules.length === 0) {
        setSchedules([]);
      } else {
        setSchedules(propSchedules);
      }
    }
  }, [isOpen, initialDate, initialGuests, minDate, propSchedules]);

  // Reset selected table when date, guests, or time changes (but keep time values)
  useEffect(() => {
    if (date || guests || timeFrom || timeTo) {
      setSelectedTable(null);
    }
  }, [date, guests, timeFrom, timeTo]);

  // Fetch tables and reservations only when all required fields are filled
  useEffect(() => {
    if (isOpen && restaurantId && date && guests && timeFrom && timeTo) {
      fetchTablesAndReservations();
    } else {
      // Clear tables if not all fields are filled
      setTables([]);
      setBookedTableIds([]);
      setSelectedTable(null);
      setLoadingTables(false);
    }
  }, [isOpen, restaurantId, date, guests, timeFrom, timeTo]);

  const fetchTablesAndReservations = async () => {
    // Only fetch if all required fields are filled
    if (!date || !guests || !timeFrom || !timeTo) {
      return;
    }

    try {
      setLoadingTables(true);
      setError(null);

      // Fetch all tables for the restaurant
      const allTables = await tablesService.getTablesByRestaurant(restaurantId);
      setTables(allTables);

      // Fetch reservations for the date
      try {
        const reservations = await reservationsService.getReservationsByDate(
          restaurantId,
          date
        );
        
        // Filter reservations that overlap with selected time
        const overlappingReservations = reservations.filter((reservation) => {
          // Check if reservation has time slots that overlap
          if (reservation.time_slots && reservation.time_slots.length > 0) {
            return reservation.time_slots.some((slot) => {
              const slotFrom = slot.time_from;
              const slotTo = slot.time_to;
              // Check for overlap
              return (
                (slotFrom >= timeFrom && slotFrom < timeTo) ||
                (slotTo > timeFrom && slotTo <= timeTo) ||
                (slotFrom <= timeFrom && slotTo >= timeTo)
              );
            });
          }
          return false;
        });

        // Extract table IDs from overlapping reservations
        // Handle both table_id (number) and table.id (from nested object)
        const bookedIds = overlappingReservations
          .map((r) => {
            // Try table_id first, then table.id, then table as number
            if (r.table_id !== undefined) {
              return typeof r.table_id === 'number' ? r.table_id : r.table_id;
            }
            if (r.table && typeof r.table === 'object' && r.table.id) {
              return r.table.id;
            }
            if (r.table && typeof r.table === 'number') {
              return r.table;
            }
            return null;
          })
          .filter((id): id is number => id !== null && typeof id === 'number');
        
        console.log('All reservations:', reservations);
        console.log('Overlapping reservations:', overlappingReservations);
        console.log('Booked table IDs:', bookedIds);
        setBookedTableIds(bookedIds);
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setBookedTableIds([]);
      }
    } catch (err) {
      console.error("Error fetching tables:", err);
      setError("Failed to load tables");
    } finally {
      setLoadingTables(false);
    }
  };

  // Check if reservation is available (at least 1 hour before closing)
  const isReservationAvailable = useMemo(() => {
    return isReservationTimeValid(selectedDateSchedule, timeFrom, timeTo, 1);
  }, [selectedDateSchedule, timeFrom, timeTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user?.id) {
      setError("Please sign in to make a reservation");
      return;
    }

    if (!date) {
      setError("Please select a date");
      return;
    }

    if (!selectedDateSchedule || selectedDateSchedule.is_closed) {
      setError("Restaurant is closed on this day");
      return;
    }

    if (!guests || guests < 1) {
      setError("Please select number of guests");
      return;
    }

    if (!timeFrom || !timeTo) {
      setError("Please select both start and end time");
      return;
    }

    if (!isReservationAvailable) {
      setError("Reservation must end at least 1 hour before closing time");
      return;
    }

    if (!selectedTable) {
      setError("Please select a table");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await reservationsService.createReservation({
        restaurant_id: restaurantId,
        table_id: selectedTable,
        date: date,
        guests: guests,
        time_from: timeFrom,
        time_to: timeTo,
        user_id: user.id,
      });

      // Find table number for display
      const bookedTable = tables.find(t => t.id === selectedTable);
      const tableNumber = bookedTable?.number || String(selectedTable);

      // Save reservation details for display
      setReservationDetails({
        date,
        timeFrom,
        timeTo,
        guests,
        tableId: selectedTable,
        tableNumber,
      });

      // Don't clear time - keep it for user convenience
      // Only clear selected table and tables list
      setSelectedTable(null);
      setTables([]);
      setBookedTableIds([]);
      
      setSuccess(true);
      setError(null);
      
      // Call callback but don't close modal automatically
      onReservationComplete?.();
    } catch (err) {
      setSuccess(false);
      setShowErrorScreen(true);
      if (err instanceof ApiError) {
        setError(err.message || "Failed to create reservation");
      } else if (err instanceof Error) {
        setError(err.message || "Failed to create reservation");
      } else {
        setError("Failed to create reservation");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDate(minDate);
    setGuests(2);
    setTimeFrom("");
    setTimeTo("");
    setSelectedTable(null);
    setError(null);
    setSuccess(false);
    setShowErrorScreen(false);
    setReservationDetails(null);
    onClose();
  };

  const handleResetForm = () => {
    setError(null);
    setSuccess(false);
    setShowErrorScreen(false);
    setReservationDetails(null);
    // Form is already cleared, just reset states
  };

  // Filter tables by guests capacity
  const allTables = tables.filter((table) => table.seats >= guests);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          {!success && (
            <div className="flex items-center justify-between mb-6">
              <SectionTitle>Select Time and Table</SectionTitle>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          
          {success && (
            <div className="flex justify-end mb-6">
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {success && reservationDetails ? (
            <div className="space-y-6">
              {/* Success Message Header */}
              <div className="text-center pb-6 border-b border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Reservation Confirmed!</h3>
                <p className="text-base text-gray-600">
                  Your table reservation has been successfully confirmed. You will receive a confirmation email shortly.
                </p>
              </div>
              
              {/* Reservation Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Reservation Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date</div>
                    </div>
                    <div className="text-base font-semibold text-gray-900">
                      {new Date(reservationDetails.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Time</div>
                    </div>
                    <div className="text-base font-semibold text-gray-900">
                      {formatTime(reservationDetails.timeFrom) || reservationDetails.timeFrom} - {formatTime(reservationDetails.timeTo) || reservationDetails.timeTo}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Table</div>
                    </div>
                    <div className="text-base font-semibold text-gray-900">
                      Table {reservationDetails.tableNumber}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Guests</div>
                    </div>
                    <div className="text-base font-semibold text-gray-900">
                      {reservationDetails.guests} {reservationDetails.guests === 1 ? 'guest' : 'guests'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : showErrorScreen && error ? (
            <div className="space-y-6">
              {/* Error Message */}
              <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-red-900 mb-2">Reservation Failed</h3>
                    <p className="text-base text-red-700">
                      {error || "We couldn't process your reservation. Please try again."}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleResetForm}
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Messages */}
              
              {error && !showErrorScreen && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-1">Reservation Failed</h4>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Date and Guests Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={minDate}
                  required
                />
                <Select
                  label="Guests"
                  value={String(guests)}
                  onChange={(value) => setGuests(Number(value))}
                  options={Array.from({ length: 10 }, (_, i) => ({
                    value: String(i + 1),
                    label: `${i + 1} ${i === 0 ? "guest" : "guests"}`,
                  }))}
                  required
                  className="bg-white"
                />
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Time From"
                  value={timeFrom}
                  onChange={(value) => {
                    console.log('Time From selected:', value);
                    setTimeFrom(value);
                  }}
                  placeholder={
                    loadingSchedules
                      ? "Loading..."
                      : !selectedDateSchedule 
                      ? "Select date first" 
                      : selectedDateSchedule.is_closed 
                      ? "Restaurant is closed" 
                      : "Select start time"
                  }
                  options={timeOptions}
                  required
                  disabled={loadingSchedules || !date || !selectedDateSchedule || selectedDateSchedule.is_closed || timeOptions.length === 0}
                  className="bg-white"
                />
                <Select
                  label="Time To"
                  value={timeTo}
                  onChange={(value) => {
                    console.log('Time To selected:', value);
                    setTimeTo(value);
                  }}
                  placeholder={
                    loadingSchedules
                      ? "Loading..."
                      : !timeFrom 
                      ? "Select start time first" 
                      : !isReservationAvailable && timeTo
                      ? "Must end 1h before closing"
                      : "Select end time"
                  }
                  options={timeToOptions}
                  required
                  disabled={loadingSchedules || !timeFrom || !date || !selectedDateSchedule || selectedDateSchedule.is_closed || timeToOptions.length === 0}
                  className="bg-white"
                />
              </div>
              
              {/* Warning if closing soon */}
              {selectedDateSchedule && !selectedDateSchedule.is_closed && timeTo && !isReservationAvailable && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800">
                    Reservation must end at least 1 hour before closing time ({formatTime(selectedDateSchedule.time_to)})
                  </p>
                </div>
              )}
              
              {/* Closed message */}
              {selectedDateSchedule && selectedDateSchedule.is_closed && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800">
                    Restaurant is closed on this day
                  </p>
                </div>
              )}

              {/* Tables Selection */}
              <div className="min-h-[300px] overflow-hidden">
                {!date || !guests || !timeFrom || !timeTo ? (
                  <div className="text-center py-8 text-gray-500 min-h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-base font-medium text-gray-700 mb-2">Select Date, Guests & Time</p>
                      <p className="text-sm text-gray-500">Please fill in all fields above to see available tables</p>
                    </div>
                  </div>
                ) : loadingTables ? (
                  <div className="flex justify-center items-center py-8 min-h-[300px]">
                    <div className="w-8 h-8 border-4 border-[#8B1C3B] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    {/* All Tables */}
                    {allTables.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Select a Table
                          </h3>
                          <span className="text-sm text-gray-500">
                            {allTables.length} {allTables.length === 1 ? 'table' : 'tables'} available
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {allTables.map((table) => {
                            const isBooked = bookedTableIds.includes(table.id);
                            const isSelected = selectedTable === table.id;
                            
                            if (isBooked) {
                              // Booked table - red background
                              return (
                                <div
                                  key={table.id}
                                  className="p-4 border-2 border-red-300 rounded-xl bg-red-500 text-center opacity-80 cursor-not-allowed"
                                >
                                  <div className="font-bold text-white">Table {table.number}</div>
                                  <div className="text-sm text-red-100">{table.seats} seats</div>
                                </div>
                              );
                            }
                            
                            // Available table - transparent by default, green when selected
                            return (
                              <button
                                key={table.id}
                                type="button"
                                onClick={() => setSelectedTable(table.id)}
                                className={cn(
                                  "p-4 border-2 rounded-xl transition-all text-center",
                                  isSelected
                                    ? "border-green-500 bg-green-500 text-white shadow-lg"
                                    : "border-gray-300 bg-transparent hover:border-green-400 hover:bg-green-50 text-gray-900"
                                )}
                              >
                                <div className={cn(
                                  "font-bold",
                                  isSelected ? "text-white" : "text-gray-900"
                                )}>
                                  Table {table.number}
                                </div>
                                <div className={cn(
                                  "text-sm",
                                  isSelected ? "text-green-50" : "text-gray-600"
                                )}>
                                  {table.seats} seats
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : tables.length > 0 ? (
                      <div className="text-center py-8 text-gray-600 min-h-[300px] flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-base font-medium text-gray-700 mb-2">No available tables</p>
                          <p className="text-sm text-gray-500">No tables match the number of guests</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-600 min-h-[300px] flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-base font-medium text-gray-700 mb-2">No tables available</p>
                          <p className="text-sm text-gray-500">No tables found for this restaurant</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  disabled={!selectedTable || !timeFrom || !timeTo || !isReservationAvailable || (selectedDateSchedule?.is_closed ?? false)}
                  className="flex-1"
                >
                  Confirm Reservation
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;



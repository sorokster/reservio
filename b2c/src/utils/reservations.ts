import type { Reservation, ReservationStatus } from "@/src/types/reservation";

/**
 * Reservation status types
 */
export type ReservationStatusType = "pending" | "confirmed" | "canceled";

/**
 * Format date for display
 */
export function formatReservationDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format date in short format
 */
export function formatReservationDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format time from time slots
 */
export function formatReservationTime(reservation: Reservation): string {
  if (!reservation.time_slots || reservation.time_slots.length === 0) {
    return "Time not specified";
  }

  const firstSlot = reservation.time_slots[0];
  const lastSlot = reservation.time_slots[reservation.time_slots.length - 1];

  const formatTime = (timeString: string) => {
    return timeString.split(":").slice(0, 2).join(":");
  };

  if (firstSlot.time_from === lastSlot.time_to) {
    return formatTime(firstSlot.time_from);
  }

  return `${formatTime(firstSlot.time_from)} - ${formatTime(lastSlot.time_to)}`;
}

/**
 * Get current status of reservation
 */
export function getReservationStatus(reservation: Reservation): ReservationStatusType {
  if (!reservation.statuses || reservation.statuses.length === 0) {
    return "pending";
  }

  // Get the latest status
  const latestStatus = reservation.statuses.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];

  // Handle both number and string status values
  // Status can be: 0 (pending), 1 (confirmed), 2 (canceled) or string
  let status: string | number = latestStatus.status;
  
  // If status is a number, convert to string
  if (typeof status === 'number') {
    // Map: 0 = pending, 1 = confirmed, 2 = canceled
    if (status === 1) return "confirmed";
    if (status === 2) return "canceled";
    return "pending";
  }
  
  // If status is a string, convert to lowercase and check
  const statusStr = String(status).toLowerCase();
  
  if (statusStr === "confirmed" || statusStr === "1") return "confirmed";
  if (statusStr === "canceled" || statusStr === "cancelled" || statusStr === "2") return "canceled";
  return "pending";
}

/**
 * Get status display text
 */
export function getStatusDisplayText(status: ReservationStatusType): string {
  const statusMap: Record<ReservationStatusType, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    canceled: "Canceled",
  };
  return statusMap[status] || "Unknown";
}

/**
 * Get status badge color classes (fancy version with gradients)
 */
export function getStatusBadgeClasses(status: ReservationStatusType): string {
  const statusMap: Record<ReservationStatusType, string> = {
    pending: "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 shadow-lg shadow-amber-500/30",
    confirmed: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600 shadow-lg shadow-green-500/30",
    canceled: "bg-gradient-to-r from-red-500 to-rose-500 text-white border-red-600 shadow-lg shadow-red-500/30",
  };
  return statusMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
}

/**
 * Check if reservation is upcoming (future date)
 */
export function isUpcomingReservation(reservation: Reservation): boolean {
  const reservationDate = new Date(reservation.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  reservationDate.setHours(0, 0, 0, 0);
  
  // If date is today, check time slots
  if (reservationDate.getTime() === today.getTime()) {
    if (reservation.time_slots && reservation.time_slots.length > 0) {
      const lastSlot = reservation.time_slots[reservation.time_slots.length - 1];
      const reservationEndTime = new Date(`${reservation.date}T${lastSlot.time_to}`);
      return reservationEndTime > new Date();
    }
  }
  
  return reservationDate >= today;
}

/**
 * Check if reservation is past
 */
export function isPastReservation(reservation: Reservation): boolean {
  return !isUpcomingReservation(reservation);
}

/**
 * Filter reservations by status
 */
export function filterReservationsByStatus(
  reservations: Reservation[],
  status: ReservationStatusType
): Reservation[] {
  if (!Array.isArray(reservations)) {
    return [];
  }
  return reservations.filter((reservation) => getReservationStatus(reservation) === status);
}

/**
 * Filter upcoming reservations
 */
export function filterUpcomingReservations(reservations: Reservation[]): Reservation[] {
  if (!Array.isArray(reservations)) {
    return [];
  }
  return reservations.filter(isUpcomingReservation);
}

/**
 * Filter past reservations
 */
export function filterPastReservations(reservations: Reservation[]): Reservation[] {
  if (!Array.isArray(reservations)) {
    return [];
  }
  return reservations.filter(isPastReservation);
}

/**
 * Sort reservations by date (newest first)
 */
export function sortReservationsByDate(
  reservations: Reservation[],
  ascending: boolean = false
): Reservation[] {
  if (!Array.isArray(reservations)) {
    return [];
  }
  return [...reservations].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Get reservation statistics
 */
export function getReservationStats(reservations: Reservation[]) {
  if (!Array.isArray(reservations)) {
    return {
      total: 0,
      upcoming: 0,
      past: 0,
      confirmed: 0,
      pending: 0,
      canceled: 0,
    };
  }
  
  const total = reservations.length;
  const upcoming = filterUpcomingReservations(reservations).length;
  const past = filterPastReservations(reservations).length;
  const confirmed = filterReservationsByStatus(reservations, "confirmed").length;
  const pending = filterReservationsByStatus(reservations, "pending").length;
  const canceled = filterReservationsByStatus(reservations, "canceled").length;

  return {
    total,
    upcoming,
    past,
    confirmed,
    pending,
    canceled,
  };
}


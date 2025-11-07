"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Reservation } from "@/src/types/reservation";

export default function ReservationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchReservations();
    }
  }, [isAuthenticated, user]);

  const fetchReservations = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/reservations/?user_id=${user.id}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        const reservationsList = Array.isArray(data) ? data : data.results || [];
        // Sort by date (newest first)
        reservationsList.sort((a: Reservation, b: Reservation) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setReservations(reservationsList);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401 || response.status === 403) {
          setError("Authentication required. Please log in again.");
        } else {
          setError(errorData.detail || "Failed to load reservations");
        }
      }
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError("An error occurred while loading reservations");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string): string => {
    return timeString.slice(0, 5);
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30";
      case "pending":
        return "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/30";
      case "cancelled":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg shadow-gray-500/30";
    }
  };

  const isUpcoming = (dateString: string): boolean => {
    const reservationDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    reservationDate.setHours(0, 0, 0, 0);
    return reservationDate >= today;
  };

  const getDateColor = (dateString: string): string => {
    if (!isUpcoming(dateString)) {
      return "bg-gray-100 text-gray-600";
    }
    const reservationDate = new Date(dateString);
    const today = new Date();
    const diffTime = reservationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "bg-gradient-to-br from-red-500 to-pink-600 text-white";
    if (diffDays <= 3) return "bg-gradient-to-br from-orange-500 to-amber-600 text-white";
    return "bg-gradient-to-br from-blue-500 to-indigo-600 text-white";
  };

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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <a
            href="/profile"
            className="text-[#8B1C3B] hover:text-[#6E152F] font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </a>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Reservations</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {reservations.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reservations yet</h3>
            <p className="text-gray-600 mb-6">You haven't made any reservations yet.</p>
            <a
              href="/restaurants"
              className="inline-block px-6 py-3 bg-[#8B1C3B] hover:bg-[#6E152F] text-white rounded-xl font-medium transition-all active:scale-95"
            >
              Browse Restaurants
            </a>
          </div>
        )}

        {reservations.length > 0 && (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#8B1C3B]/20"
              >
                {/* Gradient accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B1C3B] via-pink-500 to-[#8B1C3B]"></div>

                <div className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Left Section - Restaurant Info & Avatar */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {/* Restaurant Avatar */}
                      <div className="relative">
                        {reservation.restaurant?.name ? (
                          <div className="w-20 h-20 bg-gradient-to-br from-[#8B1C3B] to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[#8B1C3B]/30 transform group-hover:scale-110 transition-transform duration-300">
                            {reservation.restaurant.name[0].toUpperCase()}
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl"></div>
                        )}
                        {isUpcoming(reservation.date) && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                        )}
                      </div>

                      {/* Restaurant Info */}
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#8B1C3B] transition-colors">
                          {reservation.restaurant?.name || "Restaurant"}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="truncate">{reservation.restaurant?.address || "Address not available"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section - Date Card */}
                    <div className={`${getDateColor(reservation.date)} rounded-2xl p-4 shadow-lg flex-shrink-0 min-w-[140px]`}>
                      <div className="text-center">
                        <p className="text-xs opacity-90 font-medium uppercase tracking-wide mb-1">
                          {isUpcoming(reservation.date) ? "Upcoming" : "Past"}
                        </p>
                        <p className="text-2xl font-bold">{formatShortDate(reservation.date)}</p>
                        <p className="text-sm opacity-90 mt-1">{formatDate(reservation.date).split(',')[0]}</p>
                      </div>
                    </div>

                    {/* Details Section - Horizontal */}
                    <div className="flex-1 flex flex-wrap items-center gap-4 md:gap-6">
                      {/* Time */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100 flex items-center gap-3 min-w-[120px]">
                        <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Time</p>
                          <p className="text-sm font-bold text-gray-900">
                            {reservation.time_slots.length > 0
                              ? `${formatTime(reservation.time_slots[0].time_from)} - ${formatTime(
                                  reservation.time_slots[reservation.time_slots.length - 1].time_to
                                )}`
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Guests */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100 flex items-center gap-3 min-w-[100px]">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <div>
                          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Guests</p>
                          <p className="text-sm font-bold text-gray-900">{reservation.guests}</p>
                        </div>
                      </div>

                      {/* Table */}
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100 flex items-center gap-3 min-w-[100px]">
                        <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <div>
                          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Table</p>
                          <p className="text-sm font-bold text-gray-900">
                            {reservation.table?.number || `#${reservation.table_id}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Status & Actions */}
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      {/* Status Badge */}
                      {reservation.statuses && reservation.statuses.length > 0 && (
                        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(
                          reservation.statuses[reservation.statuses.length - 1].status
                        )}`}>
                          {reservation.statuses[reservation.statuses.length - 1].status_display ||
                            reservation.statuses[reservation.statuses.length - 1].status}
                        </span>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <a
                          href={`/profile/reservations/${reservation.id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8B1C3B] to-pink-600 hover:from-[#6E152F] hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-[#8B1C3B]/30"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </a>
                        <a
                          href={`/restaurants/${reservation.restaurant?.id || reservation.restaurant_id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


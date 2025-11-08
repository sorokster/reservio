"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { ProfileSidebar } from "@/src/components/profile";
import { HeroTitle } from "@/src/components/common/HeroTitle";
import { SectionTitle } from "@/src/components/common/SectionTitle";
import { Spinner } from "@/src/components/common/Spinner";
import { Button } from "@/src/components/common/Button";
import { reservationsService } from "@/src/services/reservations.service";
import type { Reservation } from "@/src/types/reservation";
import {
  formatReservationDate,
  formatReservationTime,
  getReservationStatus,
  getStatusBadgeClasses,
  getStatusDisplayText,
  isUpcomingReservation,
} from "@/src/utils/reservations";
import { cn } from "@/src/lib/utils";

export default function ReservationDetailPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reservationId = params?.id ? Number(params.id) : null;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch reservation
  useEffect(() => {
    const fetchReservation = async () => {
      if (!reservationId) {
        setError("Invalid reservation ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const data = await reservationsService.getReservationById(reservationId);
        setReservation(data);
      } catch (err) {
        console.error("Error fetching reservation:", err);
        setError("Failed to load reservation");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchReservation();
    }
  }, [isAuthenticated, reservationId]);

  const handleCancel = async () => {
    if (!reservationId || !confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    try {
      setCanceling(true);
      await reservationsService.cancelReservation(reservationId);
      router.push("/auth/profile/reservations");
    } catch (err) {
      console.error("Error canceling reservation:", err);
      alert("Failed to cancel reservation. Please try again.");
    } finally {
      setCanceling(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || !reservationId) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <HeroTitle>Reservation Details</HeroTitle>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <ProfileSidebar />
              </div>
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Reservation Not Found</h3>
                  <p className="text-gray-600 mb-4">{error || "The reservation you're looking for doesn't exist."}</p>
                  <Button
                    onClick={() => router.push("/auth/profile/reservations")}
                    variant="primary"
                  >
                    Back to Reservations
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status = getReservationStatus(reservation);
  const statusClasses = getStatusBadgeClasses(status);
  const statusText = getStatusDisplayText(status);
  const canCancel = status !== "canceled" && isUpcomingReservation(reservation);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <HeroTitle>Reservation Details</HeroTitle>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Reservation Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {reservation.restaurant.name}
                    </h2>
                    {reservation.restaurant.city && reservation.restaurant.country && (
                      <p className="text-gray-600">
                        {reservation.restaurant.address}
                        <br />
                        {reservation.restaurant.city.name}, {reservation.restaurant.country.name}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium border",
                      statusClasses
                    )}
                  >
                    {statusText}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <SectionTitle className="text-base mb-2">Date & Time</SectionTitle>
                    <p className="text-gray-900 font-medium">{formatReservationDate(reservation.date)}</p>
                    <p className="text-gray-600">{formatReservationTime(reservation)}</p>
                  </div>
                  <div>
                    <SectionTitle className="text-base mb-2">Guests</SectionTitle>
                    <p className="text-gray-900 font-medium">{reservation.guests} {reservation.guests === 1 ? "guest" : "guests"}</p>
                  </div>
                  <div>
                    <SectionTitle className="text-base mb-2">Table</SectionTitle>
                    <p className="text-gray-900 font-medium">
                      Table {reservation.table?.number || "N/A"}
                      {reservation.table?.seats && ` (${reservation.table.seats} seats)`}
                    </p>
                  </div>
                  <div>
                    <SectionTitle className="text-base mb-2">Reservation ID</SectionTitle>
                    <p className="text-gray-900 font-medium">#{reservation.id}</p>
                  </div>
                </div>

                {reservation.restaurant.phone && (
                  <div className="pt-6 border-t border-gray-200">
                    <SectionTitle className="text-base mb-2">Contact Restaurant</SectionTitle>
                    <a
                      href={`tel:${reservation.restaurant.phone}`}
                      className="text-[#8B1C3B] hover:underline font-medium"
                    >
                      {reservation.restaurant.phone}
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-200">
                  <Button
                    onClick={() => router.push(`/restaurants/${reservation.restaurant.id}`)}
                    variant="outline"
                    className="flex-1"
                  >
                    View Restaurant
                  </Button>
                  {canCancel && (
                    <Button
                      onClick={handleCancel}
                      variant="danger"
                      isLoading={canceling}
                      className="flex-1"
                    >
                      Cancel Reservation
                    </Button>
                  )}
                  <Button
                    onClick={() => router.push("/auth/profile/reservations")}
                    variant="secondary"
                    className="flex-1"
                  >
                    Back to List
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { ProfileSidebar } from "@/src/components/profile";
import { HeroTitle } from "@/src/components/common/HeroTitle";
import { Spinner } from "@/src/components/common/Spinner";
import { ReservationCard } from "@/src/components/profile/ReservationCard";
import { Pagination } from "@/src/components/common/Pagination";
import { reservationsService } from "@/src/services/reservations.service";
import type { Reservation } from "@/src/types/reservation";

export default function ReservationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch reservations
  useEffect(() => {
    const fetchReservations = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await reservationsService.getReservationsByUser(user.id, currentPage, pageSize);
        setReservations(response.results || []);
        setTotalCount(response.count || 0);
        setTotalPages(Math.ceil((response.count || 0) / pageSize));
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setError("Failed to load reservations");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isAuthenticated, user?.id, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <HeroTitle>My Reservations</HeroTitle>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Reservations List */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Spinner size="md" />
                </div>
              ) : reservations.length > 0 ? (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} reservations
                  </div>
                  <div className="space-y-4 mb-6">
                    {reservations.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        showActions={true}
                      />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reservations Found</h3>
                  <p className="text-gray-600 mb-4">You haven't made any reservations yet.</p>
                  <a
                    href="/restaurants"
                    className="inline-block px-6 py-3 bg-[#8B1C3B] text-white rounded-xl font-medium hover:bg-[#6E152F] transition-colors"
                  >
                    Browse Restaurants
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


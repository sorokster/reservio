"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { ProfileHeader, StatsCard, ReservationCard, ProfileSidebar } from "@/src/components/profile";
import { HeroTitle } from "@/src/components/common/HeroTitle";
import { Spinner } from "@/src/components/common/Spinner";
import { reservationsService } from "@/src/services/reservations.service";
import type { Reservation } from "@/src/types/reservation";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        const response = await reservationsService.getReservationsByUser(user.id, 1, 10);
        setReservations(response.results || []);
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setError("Failed to load reservations");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isAuthenticated, user?.id]);

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

  // Calculate statistics
  const totalReservations = reservations.length;
  const upcomingReservations = reservations.filter((res) => {
    const resDate = new Date(res.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return resDate >= today;
  }).length;
  const pastReservations = totalReservations - upcomingReservations;

  // Get recent and upcoming reservations
  const sortedReservations = [...reservations].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  const recentReservations = sortedReservations.slice(0, 5);
  const upcomingReservationsList = sortedReservations
    .filter((res) => {
      const resDate = new Date(res.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return resDate >= today;
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <HeroTitle>Profile</HeroTitle>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Header */}
              <div className="mb-6">
                <ProfileHeader user={user} />
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatsCard
                  title="Total Reservations"
                  value={totalReservations}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                />
                <StatsCard
                  title="Upcoming"
                  value={upcomingReservations}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
                <StatsCard
                  title="Past"
                  value={pastReservations}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Recent Reservations */}
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner size="md" />
                </div>
              ) : recentReservations.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Reservations</h2>
                  {recentReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      onClick={() => router.push(`/auth/profile/reservations/${reservation.id}`)}
                      className="cursor-pointer"
                    >
                      <ReservationCard reservation={reservation} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reservations Yet</h3>
                  <p className="text-gray-600 mb-4">Start exploring restaurants and make your first reservation!</p>
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


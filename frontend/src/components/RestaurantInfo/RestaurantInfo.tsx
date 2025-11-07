"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Restaurant } from "@/src/types/restaurant";
import { Schedule } from "@/src/types/schedule";
import Image from "next/image";
import ReservationModal from "@/src/components/ReservationModal";
import RestaurantMenu from "@/src/components/RestaurantMenu";
import { useAuth } from "@/src/hooks/useAuth";

interface RestaurantInfoProps {
  restaurantId?: number | string;
}

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({ restaurantId: propRestaurantId }) => {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const restaurantId = propRestaurantId || slug || id || "";
  const { isAuthenticated } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    guests: "2",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantRes, scheduleRes] = await Promise.all([
          fetch(`http://localhost:8000/api/restaurants/${restaurantId}/`),
          fetch(`http://localhost:8000/api/schedules/?restaurant_id=${restaurantId}`),
        ]);

        const restaurantData = await restaurantRes.json();
        const scheduleData = await scheduleRes.json();

        setRestaurant(restaurantData);
        setSchedule(Array.isArray(scheduleData) ? scheduleData : (scheduleData.results || []));
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchData();
    }
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-[#8B1C3B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant not found</h2>
        <p className="text-gray-600">The restaurant you're looking for doesn't exist.</p>
      </div>
    );
  }

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const scheduleMap = schedule.reduce((acc, s) => {
    acc[s.weekday] = s;
    return acc;
  }, {} as Record<number, Schedule>);

  return (
    <div className="min-h-screen from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative min-h-[500px] from-[#8B1C3B] to-[#6E152F] overflow-visible pb-32 md:pb-40">
        <Image
          src="/images/default-restaurant.jpg"
          alt={restaurant.name}
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
        <div className="relative container mx-auto px-4 py-12 h-full">
          <div className="flex flex-col items-center justify-center">
            {/* Restaurant Title */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">{restaurant.name}</h1>
            </div>
            
            {/* Quick Reservation Form - Centered and extending beyond hero */}
            <div className="relative w-full max-w-4xl -mb-32 md:-mb-40 z-10">
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8B1C3B] to-[#6E152F] rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Book a Table</h2>
                </div>
                
                {isAuthenticated ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <svg className="w-4 h-4 inline mr-2 text-[#8B1C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-[#8B1C3B] outline-none transition-all bg-white text-gray-900 font-medium"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <svg className="w-4 h-4 inline mr-2 text-[#8B1C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Time
                      </label>
                      <select
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-[#8B1C3B] outline-none transition-all bg-white text-gray-900 font-medium"
                      >
                        <option value="">Select time</option>
                        <option value="12:00">12:00</option>
                        <option value="12:30">12:30</option>
                        <option value="13:00">13:00</option>
                        <option value="13:30">13:30</option>
                        <option value="14:00">14:00</option>
                        <option value="14:30">14:30</option>
                        <option value="15:00">15:00</option>
                        <option value="18:00">18:00</option>
                        <option value="18:30">18:30</option>
                        <option value="19:00">19:00</option>
                        <option value="19:30">19:30</option>
                        <option value="20:00">20:00</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <svg className="w-4 h-4 inline mr-2 text-[#8B1C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Guests
                      </label>
                      <select
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-[#8B1C3B] outline-none transition-all bg-white text-gray-900 font-medium"
                      >
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8+</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                    <p className="text-blue-800 text-center font-medium">
                      <a href="/login" className="font-semibold hover:underline text-[#8B1C3B]">Sign in</a> to make a reservation
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => setIsReservationModalOpen(true)}
                  className="w-full px-8 py-4 bg-gradient-to-r from-[#8B1C3B] to-[#6E152F] hover:from-[#6E152F] hover:to-[#8B1C3B] text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Reserve Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {restaurant.company.description || `Welcome to ${restaurant.name}, a fine dining experience in the heart of ${restaurant.city.name}.`}
              </p>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-5">
                {/* Company */}
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 bg-[#8B1C3B]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#8B1C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Company</p>
                    <p className="text-gray-900 font-semibold text-lg">{restaurant.company.name}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 bg-[#8B1C3B]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#8B1C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="text-gray-900 font-medium">{restaurant.address}</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {restaurant.city.name}, {restaurant.country.name}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                {restaurant.phone && (
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-12 h-12 bg-[#8B1C3B]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#8B1C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <a href={`tel:${restaurant.phone}`} className="text-gray-900 font-medium hover:text-[#8B1C3B] transition-colors">
                        {restaurant.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {restaurant.email && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#8B1C3B]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#8B1C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <a href={`mailto:${restaurant.email}`} className="text-gray-900 font-medium hover:text-[#8B1C3B] transition-colors">
                        {restaurant.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Menu */}
            <RestaurantMenu restaurantId={restaurantId} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Opening Hours - Sticky */}
            <div className="sticky top-8 bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Opening Hours</h2>
              <div className="space-y-3">
                {weekdays.map((day, index) => {
                  const daySchedule = scheduleMap[index + 1];
                  return (
                    <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium text-gray-700">{day}</span>
                      <span className="text-gray-600">
                        {daySchedule?.is_closed ? (
                          <span className="text-red-500">Closed</span>
                        ) : daySchedule?.time_from && daySchedule?.time_to ? (
                          `${daySchedule.time_from.slice(0, 5)} - ${daySchedule.time_to.slice(0, 5)}`
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        restaurantId={restaurantId}
        initialData={formData}
      />
    </div>
  );
};

export default RestaurantInfo;


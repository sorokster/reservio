"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { restaurantsService } from "@/src/services/restaurants.service";
import { schedulesService } from "@/src/services/schedules.service";
import { menusService } from "@/src/services/menus.service";
import { reviewsService } from "@/src/services/reviews.service";
import type { Restaurant } from "@/src/types/restaurant";
import type { Schedule } from "@/src/types/schedule";
import type { Menu } from "@/src/types/menu";
import { RestaurantHero } from "@/src/components/Restaurant/Hero";
import { RestaurantMenu } from "@/src/components/Restaurant/Menu";
import { ReservationBlock } from "@/src/components/Restaurant/ReservationBlock";
import { RestaurantTabsContent } from "@/src/components/Restaurant/RestaurantTabsContent";
import { Spinner } from "@/src/components/common/Spinner";

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params?.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) return;

      try {
        setLoading(true);
        setError(null);

        const [restaurantData, schedulesData, menusData, reviewsResponse] = await Promise.all([
          restaurantsService.getRestaurant(restaurantId),
          schedulesService.getScheduleByRestaurant(restaurantId),
          menusService.getMenusByRestaurant(restaurantId),
          reviewsService.getReviewsByRestaurant(restaurantId, 1, 100).catch(() => ({ results: [], count: 0 })),
        ]);

        setRestaurant(restaurantData);
        setSchedules(schedulesData);
        setMenus(menusData);
        setReviews(reviewsResponse.results || []);
      } catch (err) {
        console.error("Error fetching restaurant data:", err);
        setError(err instanceof Error ? err.message : "Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  const handleReviewAdded = async () => {
    // Refresh reviews after adding new one
    try {
      const reviewsResponse = await reviewsService.getReviewsByRestaurant(restaurantId, 1, 100);
      setReviews(reviewsResponse.results || []);
    } catch (err) {
      console.error("Error refreshing reviews:", err);
    }
  };

  // Calculate average ratings from reviews
  const averageRatings = useMemo(() => {
    if (!restaurant) return null;
    
    if (reviews.length === 0) {
      return {
        overall: restaurant.average_rating || null,
        food: null,
        interior: null,
        atmosphere: null,
        service: null,
      };
    }

    const totals = reviews.reduce(
      (acc, review) => ({
        overall: acc.overall + Number(review.overall),
        food: acc.food + Number(review.food),
        interior: acc.interior + Number(review.interior),
        atmosphere: acc.atmosphere + Number(review.atmosphere),
        service: acc.service + Number(review.service),
      }),
      { overall: 0, food: 0, interior: 0, atmosphere: 0, service: 0 }
    );

    return {
      overall: totals.overall / reviews.length,
      food: totals.food / reviews.length,
      interior: totals.interior / reviews.length,
      atmosphere: totals.atmosphere / reviews.length,
      service: totals.service / reviews.length,
    };
  }, [reviews, restaurant]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The restaurant you're looking for doesn't exist."}</p>
          <button
            onClick={() => router.push("/restaurants")}
            className="px-6 py-3 bg-[#8B1C3B] text-white rounded-xl font-medium hover:bg-[#6E152F] transition-colors"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Reservation Form */}
      <RestaurantHero 
        restaurant={restaurant} 
        schedules={schedules}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Content blocks */}
            <div className="lg:col-span-2 space-y-8">
              {/* Ratings Block */}
              {averageRatings && restaurant.review_count > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="flex flex-wrap items-stretch gap-0">
                    {/* Overall Rating - Larger Block */}
                    {averageRatings.overall !== null && averageRatings.overall !== undefined && (
                      <>
                        <div className="flex-1 min-w-[200px] px-6 py-4">
                          <div className="text-center h-full flex flex-col justify-center">
                            <div className="text-xs font-semibold text-[#8B1C3B] uppercase tracking-wide mb-2">Overall</div>
                            <div className="text-5xl font-bold text-[#8B1C3B] mb-2">
                              {averageRatings.overall.toFixed(1)}
                            </div>
                            <div className="flex justify-center mb-2">
                              {Array.from({ length: 5 }).map((_, i) => {
                                const fullStars = Math.floor(averageRatings.overall!);
                                const hasHalf = averageRatings.overall! % 1 >= 0.5;
                                if (i < fullStars) {
                                  return (
                                    <svg key={i} className="w-5 h-5 text-[#8B1C3B] fill-current" viewBox="0 0 20 20">
                                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                  );
                                } else if (i === fullStars && hasHalf) {
                                  return (
                                    <div key={i} className="relative w-5 h-5">
                                      <svg className="w-5 h-5 text-gray-200 absolute" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                      <svg className="w-5 h-5 text-[#8B1C3B] fill-current absolute" style={{ clipPath: 'inset(0 50% 0 0)' }} viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <svg key={i} className="w-5 h-5 text-gray-200" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
                                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                  );
                                }
                              })}
                            </div>
                            <p className="text-xs font-medium text-gray-600">
                              {restaurant.review_count} {restaurant.review_count === 1 ? "review" : "reviews"}
                            </p>
                          </div>
                        </div>
                        <div className="w-px bg-gray-200" />
                      </>
                    )}

                    {/* Detailed Ratings */}
                    {averageRatings.food !== null && averageRatings.food !== undefined && (
                      <>
                        <div className="flex-1 min-w-[140px] px-4 py-4">
                          <div className="text-center h-full flex flex-col justify-center">
                            <div className="text-xs font-semibold text-[#8B1C3B] mb-1.5">Food</div>
                            <div className="text-2xl font-bold text-[#8B1C3B] mb-1.5">{averageRatings.food.toFixed(1)}</div>
                            <div className="flex justify-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => {
                                const fullStars = Math.floor(averageRatings.food!);
                                const hasHalf = averageRatings.food! % 1 >= 0.5;
                                if (i < fullStars) {
                                  return (
                                    <svg key={i} className="w-4 h-4 text-[#8B1C3B] fill-current" viewBox="0 0 20 20">
                                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                  );
                                } else if (i === fullStars && hasHalf) {
                                  return (
                                    <div key={i} className="relative w-4 h-4">
                                      <svg className="w-4 h-4 text-gray-200 absolute" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                      <svg className="w-4 h-4 text-[#8B1C3B] fill-current absolute" style={{ clipPath: 'inset(0 50% 0 0)' }} viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <svg key={i} className="w-4 h-4 text-gray-200" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
                                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                  );
                                }
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="w-px bg-gray-200" />
                      </>
                    )}
                    {averageRatings.interior !== null && averageRatings.interior !== undefined && (
                      <>
                        <div className="flex-1 min-w-[140px] px-4 py-4">
                          <div className="text-center h-full flex flex-col justify-center">
                            <div className="text-xs font-semibold text-[#8B1C3B] mb-1.5">Interior</div>
                            <div className="text-2xl font-bold text-[#8B1C3B] mb-1.5">{averageRatings.interior.toFixed(1)}</div>
                            <div className="flex justify-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => {
                                const fullStars = Math.floor(averageRatings.interior!);
                                const hasHalf = averageRatings.interior! % 1 >= 0.5;
                                if (i < fullStars) {
                                  return (
                                    <svg key={i} className="w-4 h-4 text-[#8B1C3B] fill-current" viewBox="0 0 20 20">
                                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                  );
                                } else if (i === fullStars && hasHalf) {
                                  return (
                                    <div key={i} className="relative w-4 h-4">
                                      <svg className="w-4 h-4 text-gray-200 absolute" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                      <svg className="w-4 h-4 text-[#8B1C3B] fill-current absolute" style={{ clipPath: 'inset(0 50% 0 0)' }} viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <svg key={i} className="w-4 h-4 text-gray-200" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
                                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                  );
                                }
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="w-px bg-gray-200" />
                      </>
                    )}
                    {averageRatings.atmosphere !== null && averageRatings.atmosphere !== undefined && (
                      <>
                        <div className="flex-1 min-w-[140px] px-4 py-4">
                          <div className="text-center h-full flex flex-col justify-center">
                            <div className="text-xs font-semibold text-[#8B1C3B] mb-1.5">Atmosphere</div>
                            <div className="text-2xl font-bold text-[#8B1C3B] mb-1.5">{averageRatings.atmosphere.toFixed(1)}</div>
                            <div className="flex justify-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => {
                                const fullStars = Math.floor(averageRatings.atmosphere!);
                                const hasHalf = averageRatings.atmosphere! % 1 >= 0.5;
                                if (i < fullStars) {
                                  return (
                                    <svg key={i} className="w-4 h-4 text-[#8B1C3B] fill-current" viewBox="0 0 20 20">
                                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                  );
                                } else if (i === fullStars && hasHalf) {
                                  return (
                                    <div key={i} className="relative w-4 h-4">
                                      <svg className="w-4 h-4 text-gray-200 absolute" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                      <svg className="w-4 h-4 text-[#8B1C3B] fill-current absolute" style={{ clipPath: 'inset(0 50% 0 0)' }} viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <svg key={i} className="w-4 h-4 text-gray-200" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
                                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                  );
                                }
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="w-px bg-gray-200" />
                      </>
                    )}
                    {averageRatings.service !== null && averageRatings.service !== undefined && (
                      <div className="flex-1 min-w-[140px] px-4 py-4">
                        <div className="text-center h-full flex flex-col justify-center">
                          <div className="text-xs font-semibold text-[#8B1C3B] mb-1.5">Service</div>
                          <div className="text-2xl font-bold text-[#8B1C3B] mb-1.5">{averageRatings.service.toFixed(1)}</div>
                          <div className="flex justify-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const fullStars = Math.floor(averageRatings.service!);
                              const hasHalf = averageRatings.service! % 1 >= 0.5;
                              if (i < fullStars) {
                                return (
                                  <svg key={i} className="w-4 h-4 text-[#8B1C3B] fill-current" viewBox="0 0 20 20">
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                  </svg>
                                );
                              } else if (i === fullStars && hasHalf) {
                                return (
                                  <div key={i} className="relative w-4 h-4">
                                    <svg className="w-4 h-4 text-gray-200 absolute" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
                                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                    <svg className="w-4 h-4 text-[#8B1C3B] fill-current absolute" style={{ clipPath: 'inset(0 50% 0 0)' }} viewBox="0 0 20 20">
                                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                  </div>
                                );
                              } else {
                                return (
                                  <svg key={i} className="w-4 h-4 text-gray-200" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                  </svg>
                                );
                              }
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Combined Section with Tabs: Opening Hours + Reviews + Map */}
              <RestaurantTabsContent
                schedules={schedules}
                restaurantId={restaurant.id}
                restaurant={restaurant}
                onReviewAdded={handleReviewAdded}
              />

              {/* Menu Section */}
              <RestaurantMenu menus={menus} />
            </div>

            {/* Right Column - Sticky Reservation Block */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <ReservationBlock restaurantId={restaurant.id} schedules={schedules} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


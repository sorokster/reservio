"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { ProfileSidebar } from "@/src/components/profile";
import { HeroTitle } from "@/src/components/common/HeroTitle";
import { SectionTitle } from "@/src/components/common/SectionTitle";
import { Spinner } from "@/src/components/common/Spinner";
import { Pagination } from "@/src/components/common/Pagination";
import { RestaurantCard } from "@/src/components/Restaurants/RestaurantCard";
import { favouritesService } from "@/src/services/favourites.service";
import type { FavouriteRestaurant, FavouriteRestaurantItem } from "@/src/services/favourites.service";
import { cn, getImageUrl } from "@/src/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function FavouritesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  const [favouriteRestaurants, setFavouriteRestaurants] = useState<FavouriteRestaurant[]>([]);
  const [favouriteMenuItems, setFavouriteMenuItems] = useState<FavouriteRestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [restaurantsPage, setRestaurantsPage] = useState(1);
  const [menuItemsPage, setMenuItemsPage] = useState(1);
  const [restaurantsTotalPages, setRestaurantsTotalPages] = useState(1);
  const [menuItemsTotalPages, setMenuItemsTotalPages] = useState(1);
  const pageSize = 10;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch favourites
  useEffect(() => {
    const fetchFavourites = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const [restaurantsResponse, menuItemsResponse] = await Promise.all([
          favouritesService.getFavouriteRestaurants(user.id, restaurantsPage, pageSize),
          favouritesService.getFavouriteMenuItems(user.id, menuItemsPage, pageSize),
        ]);
        
        setFavouriteRestaurants(restaurantsResponse.results || []);
        setFavouriteMenuItems(menuItemsResponse.results || []);
        setRestaurantsTotalPages(Math.ceil((restaurantsResponse.count || 0) / pageSize));
        setMenuItemsTotalPages(Math.ceil((menuItemsResponse.count || 0) / pageSize));
      } catch (err) {
        console.error("Error fetching favourites:", err);
        setError("Failed to load favourites");
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [isAuthenticated, user?.id, restaurantsPage, menuItemsPage]);

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
            <HeroTitle>My Favourites</HeroTitle>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Favourite Restaurants */}
              <section>
                <SectionTitle className="mb-6">Favourite Restaurants</SectionTitle>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Spinner size="md" />
                  </div>
                ) : favouriteRestaurants.length > 0 ? (
                  <>
                    <div className="space-y-4 mb-6">
                      {favouriteRestaurants.map((fav) => (
                        <RestaurantCard
                          key={fav.id}
                          restaurant={fav.restaurant}
                        />
                      ))}
                    </div>
                    {restaurantsTotalPages > 1 && (
                      <Pagination
                        currentPage={restaurantsPage}
                        totalPages={restaurantsTotalPages}
                        onPageChange={setRestaurantsPage}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Favourite Restaurants</h3>
                    <p className="text-gray-600 mb-4">Start exploring restaurants and add them to your favourites!</p>
                    <a
                      href="/restaurants"
                      className="inline-block px-6 py-3 bg-[#8B1C3B] text-white rounded-xl font-medium hover:bg-[#6E152F] transition-colors"
                    >
                      Browse Restaurants
                    </a>
                  </div>
                )}
              </section>

              {/* Favourite Menu Items */}
              <section>
                <SectionTitle className="mb-6">Favourite Dishes</SectionTitle>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Spinner size="md" />
                  </div>
                ) : favouriteMenuItems.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {favouriteMenuItems.map((fav) => {
                        const item = fav.menu_item;
                        return (
                          <div
                            key={fav.id}
                            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all"
                          >
                            <div className="flex gap-4">
                              {/* Dish Image */}
                              <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-[#8B1C3B] to-pink-600 relative">
                                {item.image ? (
                                <Image
                                    src={getImageUrl(item.image) || "/images/default-restaurant.jpg"}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="96px"
                                />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-white text-xl font-bold opacity-50">
                                      {item.name[0].toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Dish Info */}
                              <div className="flex-grow min-w-0">
                                <h4 className="text-lg font-bold text-gray-900 mb-1">
                                  {item.name}
                                </h4>
                                {item.description && (
                                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                    {item.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-bold text-[#8B1C3B]">
                                    ${item.price}
                                  </span>
                                  {item.restaurant_id && (
                                    <Link
                                      href={`/restaurants/${item.restaurant_id}`}
                                      className="text-sm text-[#8B1C3B] hover:underline"
                                    >
                                      View Restaurant
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {menuItemsTotalPages > 1 && (
                      <Pagination
                        currentPage={menuItemsPage}
                        totalPages={menuItemsTotalPages}
                        onPageChange={setMenuItemsPage}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Favourite Dishes</h3>
                    <p className="text-gray-600 mb-4">Browse restaurant menus and add your favourite dishes!</p>
                    <a
                      href="/restaurants"
                      className="inline-block px-6 py-3 bg-[#8B1C3B] text-white rounded-xl font-medium hover:bg-[#6E152F] transition-colors"
                    >
                      Browse Restaurants
                    </a>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRestaurants } from "@/src/hooks/useRestaurants";
import { RestaurantList } from "@/src/components/Restaurants/RestaurantList";
import { RestaurantSearch } from "@/src/components/Restaurants/RestaurantSearch";
import { RestaurantFilters } from "@/src/components/Restaurants/RestaurantFilters";
import { Pagination } from "@/src/components/common/Pagination";
import { HeroTitle } from "@/src/components/common/HeroTitle";
import type { Restaurant } from "@/src/types/restaurant";
import type { Country } from "@/src/types/country";
import type { City } from "@/src/types/city";
import type { Cuisine } from "@/src/types/cuisine";
import { restaurantsService } from "@/src/services/restaurants.service";
import { countriesService } from "@/src/services/countries.service";
import { citiesService } from "@/src/services/cities.service";
import { cuisinesService } from "@/src/services/cuisines.service";
import { debounce } from "@/src/lib/utils";

export default function RestaurantsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query
  const debouncedSearch = useMemo(
    () => debounce((value: string) => setDebouncedSearchQuery(value), 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Fetch filter options using restaurants service
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoadingFilters(true);
        const [countriesData, citiesData, cuisinesData] = await Promise.all([
          countriesService.getCountries(),
          citiesService.getCities(),
          cuisinesService.getCuisines(),
        ]);
        setCountries(countriesData);
        setCities(citiesData);
        setCuisines(cuisinesData);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      } finally {
        setLoadingFilters(false);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch restaurants with filters and pagination - all filters are sent to backend
  const {
    restaurants,
    loading,
    error,
    totalPages,
    totalCount,
    currentPage: activePage,
    refetch,
  } = useRestaurants({
    filters: {
      country: selectedCountry || undefined,
      city: selectedCity || undefined,
      cuisine: selectedCuisine || undefined,
      minRating: minRating || undefined,
    },
    search: debouncedSearchQuery || undefined,
    page: currentPage,
    pageSize: 10,
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCountry, selectedCity, selectedCuisine, minRating, debouncedSearchQuery]);

  // Reset city when country changes
  useEffect(() => {
    setSelectedCity(null);
  }, [selectedCountry]);

  const handleResetFilters = () => {
    setSelectedCountry(null);
    setSelectedCity(null);
    setSelectedCuisine(null);
    setMinRating(null);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    router.push(`/restaurants/${restaurant.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <HeroTitle>Restaurants</HeroTitle>
        </div>

        {/* Main Content: Restaurants List + Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters - First on mobile, Right Side on desktop (Sticky) */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="sticky top-4">
              <RestaurantFilters
                countries={countries || []}
                cities={cities || []}
                cuisines={cuisines || []}
                selectedCountry={selectedCountry}
                selectedCity={selectedCity}
                selectedCuisine={selectedCuisine}
                minRating={minRating}
                onCountryChange={setSelectedCountry}
                onCityChange={setSelectedCity}
                onCuisineChange={setSelectedCuisine}
                onRatingChange={setMinRating}
                onReset={handleResetFilters}
                loading={loadingFilters}
              />
            </div>
          </div>

          {/* Restaurant List - Left Side */}
          <div className="lg:col-span-3 order-last lg:order-first">
            {/* Search Section */}
            <div className="mb-6">
              <RestaurantSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name or address..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-800">{error.message}</p>
              </div>
            )}

            {/* Results Count */}
            {!loading && totalCount > 0 && (
              <div className="mb-6 text-sm text-gray-600">
                Found {totalCount} restaurant{totalCount !== 1 ? "s" : ""}
                {totalPages > 1 && ` (Page ${activePage} of ${totalPages})`}
              </div>
            )}

            {/* Restaurant List */}
            <RestaurantList
              restaurants={restaurants}
              loading={loading}
              onRestaurantClick={handleRestaurantClick}
              emptyMessage="No restaurants found. Try adjusting your filters."
            />

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={activePage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


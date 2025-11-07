"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Restaurant } from "@/src/types/restaurant";
import { Country } from "@/src/types/country";
import { City } from "@/src/types/city";
import { Company } from "@/src/types/company";
import { Cuisine } from "@/src/types/cuisine";
import Image from "next/image";

interface RestaurantsProps {
  title?: string;
}

const Restaurants: React.FC<RestaurantsProps> = ({ title = "All Restaurants" }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    limit: 12,
    offset: 0,
  });
  
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [restaurantCuisines, setRestaurantCuisines] = useState<Record<number, number[]>>({});

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const fetchData = async (url: string, name: string): Promise<any[]> => {
          try {
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            if (!response.ok) {
              console.error(`Error fetching ${name}:`, response.status, response.statusText);
              return [];
            }
            const data = await response.json();
            return Array.isArray(data) ? data : (data.results || []);
          } catch (error) {
            console.error(`Error fetching ${name}:`, error);
            return [];
          }
        };

        const [countriesList, citiesList, companiesList, cuisinesList] = await Promise.all([
          fetchData("http://localhost:8000/api/countries/", "countries"),
          fetchData("http://localhost:8000/api/cities/", "cities"),
          fetchData("http://localhost:8000/api/companies/", "companies"),
          fetchData("http://localhost:8000/api/cuisines/", "cuisines"),
        ]);

        console.log("Filter options loaded:", {
          countries: countriesList.length,
          cities: citiesList.length,
          companies: companiesList.length,
          cuisines: cuisinesList.length,
        });

        setCountries(countriesList);
        setCities(citiesList);
        setCompanies(companiesList);
        setCuisines(cuisinesList);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Ratings are now included in restaurant data from API, no need for separate requests

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch restaurants with filters
  const fetchRestaurants = useCallback(async (offset = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (debouncedSearchQuery) {
        params.append("search", debouncedSearchQuery);
      }
      if (selectedCountry) {
        params.append("country_id", selectedCountry.toString());
      }
      if (selectedCity) {
        params.append("city_id", selectedCity.toString());
      }
      if (selectedCompany) {
        params.append("company_id", selectedCompany.toString());
      }
      
      // Add pagination parameters
      const limit = 12;
      params.append("limit", limit.toString());
      params.append("offset", offset.toString());

      const url = `http://localhost:8000/api/restaurants/${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();
      
      // Handle pagination response format
      if (Array.isArray(data)) {
        setRestaurants(data);
        setPagination(prev => ({ ...prev, count: data.length, next: null, previous: null, offset, limit }));
      } else {
        setRestaurants(data.results || []);
        setPagination(prev => ({
          ...prev,
          count: data.count || 0,
          next: data.next || null,
          previous: data.previous || null,
          offset,
          limit,
        }));
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, selectedCountry, selectedCity, selectedCompany]);

  useEffect(() => {
    fetchRestaurants(0);
  }, [fetchRestaurants]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCountry(value ? parseInt(value) : null);
    setSelectedCity(null); // Reset city when country changes
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCity(value ? parseInt(value) : null);
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCompany(value ? parseInt(value) : null);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCountry(null);
    setSelectedCity(null);
    setSelectedCompany(null);
    setSelectedCuisine(null);
    setMinRating(null);
  };

  const handlePageChange = (newOffset: number) => {
    fetchRestaurants(newOffset);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoadMore = async () => {
    if (!pagination.next || loadingMore) return;

    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      
      if (debouncedSearchQuery) {
        params.append("search", debouncedSearchQuery);
      }
      if (selectedCountry) {
        params.append("country_id", selectedCountry.toString());
      }
      if (selectedCity) {
        params.append("city_id", selectedCity.toString());
      }
      if (selectedCompany) {
        params.append("company_id", selectedCompany.toString());
      }
      
      const nextOffset = pagination.offset + pagination.limit;
      params.append("limit", pagination.limit.toString());
      params.append("offset", nextOffset.toString());

      const url = `http://localhost:8000/api/restaurants/${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setRestaurants(prev => [...prev, ...data]);
        setPagination(prev => ({ ...prev, count: prev.count, next: null, previous: null, offset: nextOffset }));
      } else {
        setRestaurants(prev => [...prev, ...(data.results || [])]);
        setPagination(prev => ({
          ...prev,
          count: data.count || prev.count,
          next: data.next || null,
          previous: data.previous || null,
          offset: nextOffset,
        }));
      }
    } catch (error) {
      console.error("Error loading more restaurants:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleNextPage = () => {
    if (pagination.next) {
      const nextOffset = pagination.offset + pagination.limit;
      handlePageChange(nextOffset);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      const prevOffset = Math.max(0, pagination.offset - pagination.limit);
      handlePageChange(prevOffset);
    }
  };

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.count / pagination.limit);
  const startItem = pagination.offset + 1;
  const endItem = Math.min(pagination.offset + pagination.limit, pagination.count);

  const filteredCities = selectedCountry
    ? cities.filter((city) => city.country.id === selectedCountry)
    : cities;

  // Fetch restaurant cuisines
  useEffect(() => {
    const fetchRestaurantCuisines = async () => {
      if (restaurants.length === 0) return;
      
      try {
        const cuisinesMap: Record<number, number[]> = {};
        await Promise.all(
          restaurants.map(async (restaurant) => {
            try {
              const response = await fetch(`http://localhost:8000/api/menus/?restaurant_id=${restaurant.id}`);
              const data = await response.json();
              const menus = Array.isArray(data) ? data : (data.results || []);
              
              const cuisineIds = new Set<number>();
              menus.forEach((menu: any) => {
                if (menu.cuisines && Array.isArray(menu.cuisines)) {
                  menu.cuisines.forEach((cuisine: any) => {
                    cuisineIds.add(cuisine.id);
                  });
                }
              });
              
              cuisinesMap[restaurant.id] = Array.from(cuisineIds);
            } catch (error) {
              console.error(`Error fetching cuisines for restaurant ${restaurant.id}:`, error);
            }
          })
        );
        setRestaurantCuisines(cuisinesMap);
      } catch (error) {
        console.error("Error fetching restaurant cuisines:", error);
      }
    };

    fetchRestaurantCuisines();
  }, [restaurants]);

  // Filter restaurants by cuisine and rating (client-side)
  // Only apply client-side filters if they are set
  const finalFilteredRestaurants = restaurants.filter((restaurant) => {
    // Filter by cuisine - only filter if cuisine is selected and we have data
    if (selectedCuisine !== null) {
      const restaurantCuisineIds = restaurantCuisines[restaurant.id];
      // If we don't have cuisine data yet, don't filter out the restaurant
      // This allows restaurants to show while cuisine data is loading
      if (restaurantCuisineIds !== undefined && !restaurantCuisineIds.includes(selectedCuisine)) {
        return false;
      }
    }
    
    // Filter by rating - only filter if rating is set
    if (minRating !== null) {
      const rating = restaurant.average_rating;
      // If restaurant has no rating yet, don't filter it out
      // Only filter if we have a rating and it's below the minimum
      if (rating !== null && rating !== undefined && rating < minRating) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="min-h-screen from-gray-50 to-gray-100 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">Discover amazing restaurants in your area</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Restaurants List */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by name or address..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent outline-none transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[#8B1C3B] border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" style={{ animationDirection: "reverse" }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Restaurants List */}
            {!loading && (
              <>
                {finalFilteredRestaurants.length > 0 ? (
                  <div className="space-y-6">
                    {finalFilteredRestaurants.map((restaurant) => {
                      const rating = restaurant.average_rating;
                      return (
                        <a
                          key={restaurant.id}
                          href={`/restaurants/${restaurant.id}`}
                          className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
                        >
                          <div className="flex flex-col md:flex-row">
                            {/* Image - Left Side */}
                            <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                              <Image
                                src="/images/default-restaurant.jpg"
                                alt={restaurant.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            
                            {/* Info - Right Side */}
                            <div className="flex-1 p-6">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-[#8B1C3B] transition-colors">
                                    {restaurant.name}
                                  </h3>
                                  <p className="text-gray-600 text-sm mb-2">
                                    {restaurant.company.name}
                                  </p>
                                </div>
                                {rating && (
                                  <div className="flex items-center gap-1 bg-[#8B1C3B]/10 px-3 py-1 rounded-full">
                                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-start gap-2 mb-3">
                                <svg
                                  className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <p className="text-gray-600 text-sm flex-1">
                                  {restaurant.address}, {restaurant.city.name}, {restaurant.country.name}
                                </p>
                              </div>
                              
                              {restaurant.phone && (
                                <div className="flex items-center gap-2 mb-4">
                                  <svg
                                    className="w-5 h-5 text-gray-400 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                  </svg>
                                  <p className="text-gray-600 text-sm">{restaurant.phone}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <svg
                      className="mx-auto h-24 w-24 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No restaurants found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {!loading && finalFilteredRestaurants.length > 0 && pagination.count > pagination.limit && (
              <div className="mt-12 flex flex-col items-center gap-4">
                {/* Results info */}
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{startItem}</span> to{" "}
                  <span className="font-semibold text-gray-900">{endItem}</span> of{" "}
                  <span className="font-semibold text-gray-900">{pagination.count}</span> restaurants
                </div>

                {/* Pagination controls */}
                <div className="flex items-center gap-2">
                  {/* Previous button */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={!pagination.previous}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      pagination.previous
                        ? "bg-white border-2 border-gray-300 text-gray-700 hover:border-[#8B1C3B] hover:text-[#8B1C3B] active:scale-95"
                        : "bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Previous</span>
                    </div>
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange((pageNum - 1) * pagination.limit)}
                          className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                            currentPage === pageNum
                              ? "bg-[#8B1C3B] text-white scale-110 shadow-lg"
                              : "bg-white border-2 border-gray-300 text-gray-700 hover:border-[#8B1C3B] hover:text-[#8B1C3B] active:scale-95"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next button */}
                  <button
                    onClick={handleNextPage}
                    disabled={!pagination.next}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      pagination.next
                        ? "bg-white border-2 border-gray-300 text-gray-700 hover:border-[#8B1C3B] hover:text-[#8B1C3B] active:scale-95"
                        : "bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>Next</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filters Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-2xl shadow-lg p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Filters</h2>
              
              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={selectedCountry || ""}
                  onChange={handleCountryChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">All Countries</option>
                  {countries.length > 0 ? (
                    countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading...</option>
                  )}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <select
                  value={selectedCity || ""}
                  onChange={handleCityChange}
                  disabled={!selectedCountry}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent outline-none transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">All Cities</option>
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>{selectedCountry ? "No cities found" : "Select a country first"}</option>
                  )}
                </select>
              </div>

              {/* Company Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <select
                  value={selectedCompany || ""}
                  onChange={handleCompanyChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">All Companies</option>
                  {companies.length > 0 ? (
                    companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading...</option>
                  )}
                </select>
              </div>

              {/* Cuisine Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine
                </label>
                <select
                  value={selectedCuisine || ""}
                  onChange={(e) => setSelectedCuisine(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">All Cuisines</option>
                  {cuisines.length > 0 ? (
                    cuisines.map((cuisine) => (
                      <option key={cuisine.id} value={cuisine.id}>
                        {cuisine.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading...</option>
                  )}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={minRating || ""}
                  onChange={(e) => setMinRating(e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {(selectedCountry || selectedCity || selectedCompany || selectedCuisine || minRating || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-all active:scale-95"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Restaurants;


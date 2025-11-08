import React from "react";
import { RestaurantList } from "./RestaurantList";
import { RestaurantSearch } from "./RestaurantSearch";
import { RestaurantFilters } from "./RestaurantFilters";
import { Pagination } from "@/src/components/common/Pagination";
import { HeroTitle } from "@/src/components/common/HeroTitle";
import type { Restaurant } from "@/src/types/restaurant";
import type { Country } from "@/src/types/country";
import type { City } from "@/src/types/city";
import type { Cuisine } from "@/src/types/cuisine";

export interface RestaurantsProps {
  restaurants?: Restaurant[];
  loading?: boolean;
  error?: Error | null;
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  countries?: Country[];
  cities?: City[];
  cuisines?: Cuisine[];
  searchQuery?: string;
  selectedCountry?: number | null;
  selectedCity?: number | null;
  selectedCuisine?: number | null;
  minRating?: number | null;
  onSearchChange?: (value: string) => void;
  onCountryChange?: (countryId: number | null) => void;
  onCityChange?: (cityId: number | null) => void;
  onCuisineChange?: (cuisineId: number | null) => void;
  onRatingChange?: (rating: number | null) => void;
  onResetFilters?: () => void;
  onRestaurantClick?: (restaurant: Restaurant) => void;
  onPageChange?: (page: number) => void;
  showFilters?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  emptyMessage?: string;
  title?: string;
  className?: string;
}

export const Restaurants: React.FC<RestaurantsProps> = ({
  restaurants = [],
  loading = false,
  error = null,
  totalCount = 0,
  totalPages = 0,
  currentPage = 1,
  countries = [],
  cities = [],
  cuisines = [],
  searchQuery = "",
  selectedCountry = null,
  selectedCity = null,
  selectedCuisine = null,
  minRating = null,
  onSearchChange,
  onCountryChange,
  onCityChange,
  onCuisineChange,
  onRatingChange,
  onResetFilters,
  onRestaurantClick,
  onPageChange,
  showFilters = true,
  showSearch = true,
  showPagination = true,
  emptyMessage = "No restaurants found",
  title,
  className,
}) => {
  // Ensure all arrays are actually arrays
  const restaurantsArray = Array.isArray(restaurants) ? restaurants : [];
  const countriesArray = Array.isArray(countries) ? countries : [];
  const citiesArray = Array.isArray(cities) ? cities : [];
  const cuisinesArray = Array.isArray(cuisines) ? cuisines : [];
  return (
    <div className={className}>
      {title && (
        <div className="mb-8">
          <HeroTitle>{title}</HeroTitle>
        </div>
      )}

      {/* Search and Filters Section */}
      {(showSearch || showFilters) && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Search */}
          {showSearch && (
            <div className="lg:col-span-3">
              <RestaurantSearch
                value={searchQuery}
                onChange={onSearchChange || (() => {})}
                placeholder="Search by name or address..."
              />
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className={showSearch ? "lg:col-span-1" : "lg:col-span-4"}>
              <RestaurantFilters
                countries={countriesArray}
                cities={citiesArray}
                cuisines={cuisinesArray}
                selectedCountry={selectedCountry}
                selectedCity={selectedCity}
                selectedCuisine={selectedCuisine}
                minRating={minRating}
                onCountryChange={onCountryChange || (() => {})}
                onCityChange={onCityChange || (() => {})}
                onCuisineChange={onCuisineChange || (() => {})}
                onRatingChange={onRatingChange || (() => {})}
                onReset={onResetFilters || (() => {})}
              />
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800">{error.message}</p>
        </div>
      )}

      {/* Results Count */}
      {!loading && (totalCount > 0 || restaurantsArray.length > 0) && (
        <div className="mb-6 text-sm text-gray-600">
          Found {totalCount > 0 ? totalCount : restaurantsArray.length} restaurant{(totalCount > 0 ? totalCount : restaurantsArray.length) !== 1 ? "s" : ""}
          {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
        </div>
      )}

      {/* Restaurant List */}
      <RestaurantList
        restaurants={restaurantsArray}
        loading={loading}
        onRestaurantClick={onRestaurantClick}
        emptyMessage={emptyMessage}
      />

      {/* Pagination */}
      {showPagination && !loading && totalPages > 1 && onPageChange && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Restaurants;


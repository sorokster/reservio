import React from "react";
import type { Country } from "@/src/types/country";
import type { City } from "@/src/types/city";
import type { Cuisine } from "@/src/types/cuisine";
import { Select } from "@/src/components/common/Select";
import { Spinner } from "@/src/components/common/Spinner";

export interface RestaurantFiltersProps {
  countries?: Country[];
  cities?: City[];
  cuisines?: Cuisine[];
  selectedCountry: number | null;
  selectedCity: number | null;
  selectedCuisine: number | null;
  minRating: number | null;
  onCountryChange: (countryId: number | null) => void;
  onCityChange: (cityId: number | null) => void;
  onCuisineChange: (cuisineId: number | null) => void;
  onRatingChange: (rating: number | null) => void;
  onReset: () => void;
  loading?: boolean;
  className?: string;
}

export const RestaurantFilters: React.FC<RestaurantFiltersProps> = ({
  countries = [],
  cities = [],
  cuisines = [],
  selectedCountry,
  selectedCity,
  selectedCuisine,
  minRating,
  onCountryChange,
  onCityChange,
  onCuisineChange,
  onRatingChange,
  onReset,
  loading = false,
  className,
}) => {
  const hasActiveFilters =
    selectedCountry !== null ||
    selectedCity !== null ||
    selectedCuisine !== null ||
    minRating !== null;

  // Filter cities based on selected country
  // Ensure cities is always an array
  const citiesArray = Array.isArray(cities) ? cities : [];
  const availableCities = selectedCountry
    ? citiesArray.filter((city) => city?.country?.id === selectedCountry)
    : citiesArray;

  return (
    <div className={className}>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && !loading && (
            <button
              onClick={onReset}
              className="text-sm text-[#8B1C3B] hover:text-[#6E152F] font-medium"
            >
              Reset
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="space-y-4">
          {/* Country Filter */}
          <Select
            label="Country"
            value={selectedCountry ? String(selectedCountry) : ""}
            onChange={(value) => onCountryChange(value ? Number(value) : null)}
            placeholder="All Countries"
            options={Array.isArray(countries) ? countries.map((country) => ({
              value: String(country?.id || ""),
              label: country?.name || "",
            })).filter((opt) => opt.value !== undefined && opt.value !== "") : []}
          />

          {/* City Filter - Only show when country is selected */}
          {selectedCountry && availableCities.length > 0 && (
            <Select
              label="City"
              value={selectedCity ? String(selectedCity) : ""}
              onChange={(value) => onCityChange(value ? Number(value) : null)}
              placeholder="All Cities"
              options={Array.isArray(availableCities) ? availableCities.map((city) => ({
                value: String(city?.id || ""),
                label: city?.name || "",
              })).filter((opt) => opt.value !== undefined && opt.value !== "") : []}
            />
          )}

          {/* Cuisine Filter */}
          <Select
            label="Cuisine"
            value={selectedCuisine ? String(selectedCuisine) : ""}
            onChange={(value) => onCuisineChange(value ? Number(value) : null)}
            placeholder="All Cuisines"
            options={Array.isArray(cuisines) ? cuisines.map((cuisine) => ({
              value: String(cuisine?.id || ""),
              label: cuisine?.name || "",
            })).filter((opt) => opt.value !== undefined && opt.value !== "") : []}
          />

          {/* Rating Filter */}
          <Select
            label="Minimum Rating"
            value={minRating ? String(minRating) : ""}
            onChange={(value) => onRatingChange(value ? Number(value) : null)}
            placeholder="Any Rating"
            options={[
              { value: "4", label: "4+ Stars" },
              { value: "3", label: "3+ Stars" },
              { value: "2", label: "2+ Stars" },
              { value: "1", label: "1+ Stars" },
            ]}
          />
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantFilters;


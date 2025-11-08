"use client";

import React from "react";
import Hero from "@/src/components/Hero";
import { TopRestaurantsSection } from "@/src/components/TopRestaurants";
import { FAQ } from "@/src/components/FAQ";
import { useRestaurants } from "@/src/hooks/useRestaurants";

export default function HomePage() {
  // Fetch restaurants for top section
  const {
    restaurants,
    loading,
    error,
  } = useRestaurants({
    page: 1,
    pageSize: 20, // Fetch more to have better selection for top 12
  });

  return (
    <>
      <Hero />
      <TopRestaurantsSection
        restaurants={restaurants}
        loading={loading}
        error={error}
        title="Top Restaurants"
        description="Discover the finest dining experiences rated by our community"
        maxItems={12}
      />
      <FAQ />
    </>
  );
}

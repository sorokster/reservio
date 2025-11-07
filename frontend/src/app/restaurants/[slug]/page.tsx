"use client";

import React from "react";
import { useParams } from "next/navigation";
import RestaurantInfo from "@/src/components/RestaurantInfo";
import RestaurantReviews from "@/src/components/RestaurantReviews";

export default function RestaurantInfoPage() {
  const params = useParams();
  const restaurantId = (Array.isArray(params?.slug) ? params.slug[0] : params?.slug) || 
                       (Array.isArray(params?.id) ? params.id[0] : params?.id) || "";

  return (
    <div className="min-h-screen from-gray-50 to-gray-100">
      <RestaurantInfo restaurantId={restaurantId} />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <RestaurantReviews restaurantId={restaurantId} />
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { cn } from "@/src/lib/utils";

import type { RestaurantPosition } from "@/src/types/restaurant-position";

export interface RestaurantMapProps {
  positions?: RestaurantPosition[];
  address?: string;
  restaurantName?: string;
  className?: string;
}

export const RestaurantMap: React.FC<RestaurantMapProps> = ({
  positions,
  address,
  restaurantName,
  className,
}) => {
  // Get first position with coordinates, or use address
  const getMapUrl = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    // Try to find first position with coordinates
    const positionWithCoords = positions?.find(
      (pos) => pos.latitude !== null && pos.longitude !== null
    );
    
    if (positionWithCoords && positionWithCoords.latitude && positionWithCoords.longitude) {
      // Use coordinates from RestaurantPosition
      if (apiKey) {
        return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${positionWithCoords.latitude},${positionWithCoords.longitude}&zoom=15`;
      } else {
        // Fallback to OpenStreetMap
        return `https://www.openstreetmap.org/export/embed.html?bbox=${positionWithCoords.longitude - 0.01},${positionWithCoords.latitude - 0.01},${positionWithCoords.longitude + 0.01},${positionWithCoords.latitude + 0.01}&layer=mapnik&marker=${positionWithCoords.latitude},${positionWithCoords.longitude}`;
      }
    } else if (address) {
      // Use address for geocoding if no coordinates available
      const encodedAddress = encodeURIComponent(address);
      if (apiKey) {
        return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}&zoom=15`;
      } else {
        // Fallback to OpenStreetMap search
        return `https://www.openstreetmap.org/export/embed.html?bbox=-0.1,-0.1,0.1,0.1&layer=mapnik&q=${encodedAddress}`;
      }
    }
    return null;
  };

  const mapUrl = getMapUrl();

  if (!mapUrl) {
    return (
      <div className={cn("w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center", className)}>
        <p className="text-gray-500 text-sm">Map location not available</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full h-96 rounded-lg overflow-hidden border border-gray-200", className)}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        title={restaurantName ? `Map for ${restaurantName}` : "Restaurant location"}
      />
    </div>
  );
};

export default RestaurantMap;


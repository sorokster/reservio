"use client";

import React from "react";
import { cn } from "@/src/lib/utils";

import type { RestaurantLocation } from "@/src/types/restaurant-location";

export interface RestaurantMapProps {
  locations?: RestaurantLocation[];
  address?: string;
  restaurantName?: string;
  className?: string;
}

export const RestaurantMap: React.FC<RestaurantMapProps> = ({
  locations,
  address,
  restaurantName,
  className,
}) => {
  // Get first location with coordinates, or use address
  const getMapUrl = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    // Try to find first location with coordinates
    const locationWithCoords = locations?.find(
      (loc) => loc.latitude !== null && loc.longitude !== null
    );
    
    if (locationWithCoords && locationWithCoords.latitude && locationWithCoords.longitude) {
      // Use coordinates from RestaurantLocation
      if (apiKey) {
        return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${locationWithCoords.latitude},${locationWithCoords.longitude}&zoom=15`;
      } else {
        // Fallback to OpenStreetMap
        return `https://www.openstreetmap.org/export/embed.html?bbox=${locationWithCoords.longitude - 0.01},${locationWithCoords.latitude - 0.01},${locationWithCoords.longitude + 0.01},${locationWithCoords.latitude + 0.01}&layer=mapnik&marker=${locationWithCoords.latitude},${locationWithCoords.longitude}`;
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


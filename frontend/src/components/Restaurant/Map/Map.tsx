"use client";

import React from "react";
import { cn } from "@/src/lib/utils";

export interface RestaurantMapProps {
  mapPosition?: {
    lat: number;
    lng: number;
  } | null;
  address?: string;
  restaurantName?: string;
  className?: string;
}

export const RestaurantMap: React.FC<RestaurantMapProps> = ({
  mapPosition,
  address,
  restaurantName,
  className,
}) => {
  // If we have map position, use it; otherwise use address for geocoding
  const getMapUrl = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (mapPosition) {
      // Use coordinates directly
      if (apiKey) {
        return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${mapPosition.lat},${mapPosition.lng}&zoom=15`;
      } else {
        // Fallback to static map or OpenStreetMap
        return `https://www.openstreetmap.org/export/embed.html?bbox=${mapPosition.lng - 0.01},${mapPosition.lat - 0.01},${mapPosition.lng + 0.01},${mapPosition.lat + 0.01}&layer=mapnik&marker=${mapPosition.lat},${mapPosition.lng}`;
      }
    } else if (address) {
      // Use address for geocoding
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


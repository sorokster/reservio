"use client";

import React, { useState, useEffect } from "react";
import { Menu } from "@/src/types/menu";
import { MenuItem } from "@/src/types/menu-item";
import { Cuisine } from "@/src/types/cuisine";

interface RestaurantMenuProps {
  restaurantId: number | string;
}

const RestaurantMenu: React.FC<RestaurantMenuProps> = ({ restaurantId }) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/menus/?restaurant_id=${restaurantId}`);
        const data = await response.json();
        setMenus(Array.isArray(data) ? data : (data.results || []));
      } catch (error) {
        console.error("Error fetching menus:", error);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchMenus();
    }
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-[#8B1C3B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Menu not available</h3>
        <p className="text-gray-600">This restaurant hasn't added their menu yet.</p>
      </div>
    );
  }

  // Get all unique cuisines from all menus
  const allCuisines = Array.from(
    new Map(
      menus.flatMap(menu => menu.cuisines.map(c => [c.id, c]))
    ).values()
  );

  // Filter items by selected cuisine
  const getFilteredItems = (menu: Menu): MenuItem[] => {
    if (!selectedCuisine) return menu.items;
    return menu.items.filter(item => 
      menu.cuisines.some(c => c.id.toString() === selectedCuisine && c.items.some(i => i.id === item.id))
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0 mr-4">Menu</h2>
        {allCuisines.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setSelectedCuisine(null)}
                className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  !selectedCuisine
                    ? "bg-[#8B1C3B] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {allCuisines.map((cuisine) => (
                <button
                  key={cuisine.id}
                  onClick={() => setSelectedCuisine(cuisine.id.toString())}
                  className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    selectedCuisine === cuisine.id.toString()
                      ? "bg-[#8B1C3B] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cuisine.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-12">
        {menus.map((menu) => {
          const filteredItems = getFilteredItems(menu);
          if (filteredItems.length === 0) return null;

          return (
            <div key={menu.id} className="border-b border-gray-200 last:border-0 pb-8 last:pb-0">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{menu.name}</h3>
                {menu.description && (
                  <p className="text-gray-600">{menu.description}</p>
                )}
              </div>

              {/* Group items by cuisine */}
              {menu.cuisines
                .filter(cuisine => !selectedCuisine || cuisine.id.toString() === selectedCuisine)
                .map((cuisine) => {
                  const cuisineItems = filteredItems.filter(item => 
                    menu.cuisines.find(c => c.id === cuisine.id)?.items.some(i => i.id === item.id)
                  );
                  
                  if (cuisineItems.length === 0) return null;

                  return (
                    <div key={cuisine.id} className="mb-8 last:mb-0">
                      <h4 className="text-xl font-semibold text-[#8B1C3B] mb-4">{cuisine.name}</h4>
                      <div className="space-y-6">
                        {cuisineItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h5 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h5>
                              {item.description && (
                                <p className="text-gray-600 text-sm">{item.description}</p>
                              )}
                            </div>
                            <div className="text-lg font-bold text-[#8B1C3B] whitespace-nowrap">
                              ${parseFloat(item.price).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

              {/* Items without cuisine */}
              {filteredItems
                .filter(item => !menu.cuisines.some(c => c.items.some(i => i.id === item.id)))
                .map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-4 mb-6">
                    <div className="flex-1">
                      <h5 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h5>
                      {item.description && (
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      )}
                    </div>
                    <div className="text-lg font-bold text-[#8B1C3B] whitespace-nowrap">
                      ${parseFloat(item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RestaurantMenu;


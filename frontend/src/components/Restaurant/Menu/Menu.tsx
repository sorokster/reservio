import React, { useState, useMemo, useEffect, useRef } from "react";
import type { Menu } from "@/src/types/menu";
import type { Cuisine } from "@/src/types/cuisine";
import { cn } from "@/src/lib/utils";
import Image from "next/image";
import { SectionTitle } from "@/src/components/common/SectionTitle";
import { BlockTitle } from "@/src/components/common/BlockTitle";
import { FavouriteButton } from "@/src/components/common/FavouriteButton";
import { useAuth } from "@/src/hooks/useAuth";
import { favouritesService } from "@/src/services/favourites.service";
import type { FavouriteRestaurantItem } from "@/src/services/favourites.service";

export interface RestaurantMenuProps {
  menus: Menu[];
  className?: string;
}

export const RestaurantMenu: React.FC<RestaurantMenuProps> = ({
  menus,
  className,
}) => {
  const { isAuthenticated, user } = useAuth();
  // Map of menu item ID to favourite item
  const [favouriteMenuItems, setFavouriteMenuItems] = useState<Map<number, FavouriteRestaurantItem>>(new Map());
  const [loadingFavourites, setLoadingFavourites] = useState(false);
  // Collect all unique cuisines from all menus
  const allCuisines = useMemo(() => {
    const cuisineMap = new Map<number, Cuisine>();
    menus.forEach((menu) => {
      if (menu.cuisines && menu.cuisines.length > 0) {
        menu.cuisines.forEach((cuisine) => {
          if (!cuisineMap.has(cuisine.id)) {
            cuisineMap.set(cuisine.id, cuisine);
          }
        });
      }
    });
    return Array.from(cuisineMap.values());
  }, [menus]);

  const [activeCuisineId, setActiveCuisineId] = useState<number | null>(
    allCuisines.length > 0 ? allCuisines[0].id : null
  );
  const [isScrolling, setIsScrolling] = useState(false);
  const sectionRefs = useRef<Map<number, HTMLElement>>(new Map());

  // Fetch all favourite menu items once on mount
  useEffect(() => {
    const fetchFavourites = async () => {
      if (!isAuthenticated || !user?.id) {
        setFavouriteMenuItems(new Map());
        return;
      }

      try {
        setLoadingFavourites(true);
        const favourites = await favouritesService.getAllFavouriteMenuItemsByUser(user.id);
        setFavouriteMenuItems(favourites);
      } catch (error) {
        console.error("Error fetching favourite menu items:", error);
      } finally {
        setLoadingFavourites(false);
      }
    };

    fetchFavourites();
  }, [isAuthenticated, user?.id]);

  // Handle favourite change from FavouriteButton
  const handleFavouriteChange = (menuItemId: number, isFavourited: boolean, favouriteId: number | null) => {
    setFavouriteMenuItems((prev) => {
      const newMap = new Map(prev);
      if (isFavourited && favouriteId) {
        // Add to favourites - we need to create a partial object
        // In a real scenario, we might want to refetch, but for now we'll use a minimal object
        const favouriteItem = {
          id: favouriteId,
          menu_item: { id: menuItemId } as any,
          menu_item_id: menuItemId,
        } as FavouriteRestaurantItem;
        newMap.set(menuItemId, favouriteItem);
      } else {
        // Remove from favourites
        newMap.delete(menuItemId);
      }
      return newMap;
    });
  };

  // Sort menus by order
  const sortedMenus = [...menus].sort((a, b) => a.order - b.order);

  // Group menus by cuisine (only show cuisine-specific sections, no "All" section)
  const menusByCuisine = useMemo(() => {
    const grouped = new Map<number, Menu[]>();
    
    // Group menus by cuisine
    allCuisines.forEach((cuisine) => {
      const cuisineMenus = sortedMenus.filter((menu) =>
        menu.cuisines?.some((c) => c.id === cuisine.id)
      );
      if (cuisineMenus.length > 0) {
        grouped.set(cuisine.id, cuisineMenus);
      }
    });
    
    return grouped;
  }, [sortedMenus, allCuisines]);

  // Scroll to section when tab is clicked
  const handleTabClick = (cuisineId: number) => {
    setIsScrolling(true);
    setActiveCuisineId(cuisineId);
    
    const sectionElement = sectionRefs.current.get(cuisineId);
    
    if (sectionElement) {
      const offset = 100; // Offset for sticky tabs
      const elementPosition = sectionElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Reset scrolling flag after scroll animation
      setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    }
  };

  // Intersection Observer for auto-switching tabs on scroll
  useEffect(() => {
    if (isScrolling) return; // Don't update during programmatic scroll

    const observerOptions = {
      root: null,
      rootMargin: "-100px 0px -50% 0px", // Trigger when section is near top
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute("data-cuisine-id");
          if (sectionId) {
            const cuisineId = Number(sectionId);
            if (!isNaN(cuisineId)) {
              setActiveCuisineId(cuisineId);
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    sectionRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [isScrolling, menusByCuisine]);

  if (menus.length === 0) {
    return (
      <div className={className}>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <SectionTitle>Menu</SectionTitle>
          </div>
          <p className="text-gray-600">Menu information not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header with Collapse Button */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <SectionTitle>Menu</SectionTitle>
        </div>

        {/* Cuisine Tabs - Sticky and Scrollable */}
        {allCuisines.length > 0 && (
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
            <div className="overflow-x-auto scrollbar-hide scroll-smooth px-8">
              <div className="flex gap-2 min-w-max py-4">
                {allCuisines.map((cuisine) => (
                  <button
                    key={cuisine.id}
                    onClick={() => handleTabClick(cuisine.id)}
                    className={cn(
                      "px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer",
                      activeCuisineId === cuisine.id
                        ? "border-[#8B1C3B] text-[#8B1C3B]"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {cuisine.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Menu Content */}
        <div className="p-8">
          {/* Render sections grouped by cuisine */}
          {Array.from(menusByCuisine.entries()).map(([cuisineId, cuisineMenus]) => {
            const cuisine = allCuisines.find((c) => c.id === cuisineId);
            
            return (
              <div
                key={cuisineId}
                id={`cuisine-${cuisineId}`}
                data-cuisine-id={String(cuisineId)}
                ref={(el) => {
                  if (el) {
                    sectionRefs.current.set(cuisineId, el);
                  }
                }}
                className="scroll-mt-24"
              >
                {/* Section Header */}
                <div className="mt-12 mb-8 pt-8 first:pt-0">
                  <BlockTitle>
                    {cuisine?.name || "Menu"}
                  </BlockTitle>
                </div>

                {/* Menus in this cuisine section */}
                <div className="mb-12 last:mb-0">
                  {cuisineMenus.map((menu) => {
                    // Filter items by cuisine
                    const filteredItems = menu.items?.filter((item) => item.cuisine === cuisineId) || [];
                    
                    // Only show menu if it has items for this cuisine
                    if (filteredItems.length === 0) {
                      return null;
                    }
                    
                    return (
                      <div key={menu.id} className="mb-8 last:mb-0">
                        {/* Menu Items - filtered by cuisine */}
                        <div className="grid grid-cols-1 gap-4">
                          {filteredItems.map((item) => (
                            <div
                              key={item.id}
                              className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#8B1C3B]/30 transition-all duration-300"
                            >
                              <div className="flex gap-6 p-5">
                                {/* Dish Image */}
                                <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-[#8B1C3B] to-pink-600 relative shadow-md group-hover:shadow-lg transition-shadow">
                                  <Image
                                    src="/images/default-restaurant.jpg"
                                    alt={item.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="128px"
                                  />
                                </div>
                                
                                {/* Dish Info */}
                                <div className="flex-grow min-w-0 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#8B1C3B] transition-colors">
                                          {item.name}
                                        </h4>
                                        <FavouriteButton
                                          menuItemId={item.id}
                                          size="sm"
                                          initialIsFavourited={favouriteMenuItems.has(item.id)}
                                          initialFavouriteId={favouriteMenuItems.get(item.id)?.id || null}
                                          skipInitialCheck={true}
                                          onFavouriteChange={handleFavouriteChange}
                                        />
                                      </div>
                                      <span className="text-xl font-bold text-[#8B1C3B] flex-shrink-0 whitespace-nowrap">
                                        ${item.price}
                                      </span>
                                    </div>
                                    {item.description && (
                                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenu;


import React, { useState, useMemo, useEffect, useRef } from "react";
import type { Menu } from "@/src/types/menu";
import type { MenuCategory } from "@/src/types/menu-category";
import { cn, getImageUrl } from "@/src/lib/utils";
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
  
  // Sort menus by order first
  const sortedMenus = useMemo(() => {
    return [...menus].sort((a, b) => a.order - b.order);
  }, [menus]);

  // Collect all unique categories from all menus, preserving order from MenuCategoryOrder
  const allCategories = useMemo(() => {
    const categoryMap = new Map<number, MenuCategory>();
    
    // Collect categories from all menus
    // Each category in menu.categories already has order from MenuCategoryOrder (via serializer)
    sortedMenus.forEach((menu) => {
      if (menu.categories && menu.categories.length > 0) {
        // Categories are already sorted by order from backend (MenuCategoryOrder.order_by('order'))
        menu.categories.forEach((category) => {
          const categoryOrder = category.order ?? 999;
          if (!categoryMap.has(category.id)) {
            // First time seeing this category - store it with its order from this menu
            categoryMap.set(category.id, { 
              id: category.id, 
              name: category.name, 
              order: categoryOrder 
            });
          } else {
            // Category already exists - use minimum order from all menus
            const existing = categoryMap.get(category.id)!;
            const existingOrder = existing.order ?? 999;
            if (categoryOrder < existingOrder) {
              categoryMap.set(category.id, { 
                id: category.id, 
                name: category.name, 
                order: categoryOrder 
              });
            }
          }
        });
      }
    });
    
    // Sort by order (ascending) only
    return Array.from(categoryMap.values()).sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      return orderA - orderB;
    });
  }, [sortedMenus]);

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
    allCategories.length > 0 ? allCategories[0].id : null
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
        const favouriteItem = {
          id: favouriteId,
          menu_item: { id: menuItemId } as any,
          menu_item_id: menuItemId,
        } as FavouriteRestaurantItem;
        newMap.set(menuItemId, favouriteItem);
      } else {
        newMap.delete(menuItemId);
      }
      return newMap;
    });
  };


  // Group items by category across all menus, avoiding duplicates
  const itemsByCategory = useMemo(() => {
    const grouped = new Map<number, Array<{ menu: Menu; item: any }>>();
    const seenItems = new Set<string>(); // Track seen items by categoryId-itemId
    
    sortedMenus.forEach((menu) => {
      if (menu.items && menu.items.length > 0) {
        menu.items.forEach((item) => {
          const categoryId = item.category?.id || item.category_id;
          if (categoryId) {
            // Create unique key for item in this category
            const itemKey = `${categoryId}-${item.id}`;
            
            // Only add if we haven't seen this item in this category before
            if (!seenItems.has(itemKey)) {
              if (!grouped.has(categoryId)) {
                grouped.set(categoryId, []);
              }
              grouped.get(categoryId)!.push({ menu, item });
              seenItems.add(itemKey);
            }
          }
        });
      }
    });
    
    return grouped;
  }, [sortedMenus]);

  // Scroll to section when tab is clicked
  const handleTabClick = (categoryId: number) => {
    setIsScrolling(true);
    setActiveCategoryId(categoryId);
    
    const sectionElement = sectionRefs.current.get(categoryId);
    
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
          const sectionId = entry.target.getAttribute("data-category-id");
          if (sectionId) {
            const categoryId = Number(sectionId);
            if (!isNaN(categoryId)) {
              setActiveCategoryId(categoryId);
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
  }, [isScrolling, itemsByCategory]);

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
      <div className="bg-white rounded-2xl shadow-lg">
        {/* Header with Collapse Button */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <SectionTitle>Menu</SectionTitle>
        </div>

        {/* Category Tabs - Sticky and Scrollable */}
        {allCategories.length > 0 && (
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm rounded-t-2xl">
            <div className="overflow-x-auto scrollbar-hide scroll-smooth px-8">
              <div className="flex gap-2 min-w-max py-4">
                {allCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleTabClick(category.id)}
                    className={cn(
                      "px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer",
                      activeCategoryId === category.id
                        ? "border-[#8B1C3B] text-[#8B1C3B]"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Menu Content */}
        <div className="p-8 overflow-hidden">
          {/* Render sections grouped by category, sorted by order */}
          {Array.from(itemsByCategory.entries())
            .map(([categoryId, items]) => {
              const category = allCategories.find((c) => c.id === categoryId);
              return { categoryId, items, category, order: category?.order ?? 999 };
            })
            .sort((a, b) => a.order - b.order)
            .map(({ categoryId, items, category }) => (
              <div
                key={categoryId}
                id={`category-${categoryId}`}
                data-category-id={String(categoryId)}
                ref={(el) => {
                  if (el) {
                    sectionRefs.current.set(categoryId, el);
                  }
                }}
                className="scroll-mt-24"
              >
                {/* Menu Items in this category */}
                <div className="mt-12 mb-12 first:mt-0">
                  {/* Section Title */}
                  <div className="mb-8">
                  <BlockTitle>
                      {category?.name || "Menu"}
                  </BlockTitle>
                </div>
                  <div className="grid grid-cols-1">
                    {items.map(({ menu, item }, index) => (
                      <div
                        key={`${menu.id}-${item.id}`}
                        className={`group relative bg-white pb-5 ${index < items.length - 1 ? 'border-b border-gray-200 mb-5' : ''}`}
                      >
                        <div className="flex gap-6">
                          {/* Left Part - Info */}
                          <div className="flex-grow min-w-0 flex flex-col">
                            {/* Title */}
                            <h4 className="text-lg font-semibold text-gray-900 group-hover:text-[#8B1C3B] transition-colors mb-1">
                              {item.name}
                            </h4>
                            
                            {/* Price */}
                            <div className="text-lg font-semibold text-[#8B1C3B] mb-3">
                              ${item.price}
                            </div>

                            {/* Description */}
                            {item.description && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                            )}

                            {/* Labels Row */}
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              {/* Weight */}
                              {item.weight && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M 7.5 1 C 6.851563 1 6.300781 1.421875 6.09375 2 L 2.675781 2 L 0.00390625 8 L 0 8 L 0 8.003906 L -0.00390625 8.015625 L 0.00390625 8.015625 C 0.0117188 9.660156 1.355469 11 3 11 C 4.652344 11 6 9.652344 6 8 L 5.976563 8 L 3.765625 3 L 6.09375 3 C 6.246094 3.417969 6.578125 3.753906 7 3.90625 L 7 13 L 5 13 L 5 14 L 10 14 L 10 13 L 8 13 L 8 3.90625 C 8.421875 3.753906 8.753906 3.417969 8.90625 3 L 11.230469 3 L 9 8 L 9 8.003906 L 8.996094 8.015625 L 9 8.015625 C 9.011719 9.660156 10.355469 11 12 11 C 13.652344 11 15 9.652344 15 8 L 14.980469 8 L 12.328125 2 L 8.90625 2 C 8.699219 1.421875 8.148438 1 7.5 1 Z M 7.5 2 C 7.78125 2 8 2.21875 8 2.5 C 8 2.78125 7.78125 3 7.5 3 C 7.21875 3 7 2.78125 7 2.5 C 7 2.21875 7.21875 2 7.5 2 Z M 3 3.734375 L 4.886719 8 L 1.097656 8 Z M 12 3.734375 L 13.886719 8 L 10.097656 8 Z M 1.28125 9 L 4.71875 9 C 4.375 9.597656 3.742188 10 3 10 C 2.257813 10 1.625 9.597656 1.28125 9 Z M 10.277344 9 L 13.722656 9 C 13.378906 9.597656 12.742188 10 12 10 C 11.257813 10 10.621094 9.597656 10.277344 9 Z" fill="currentColor"></path>
                                  </svg>
                                  <span>{item.weight}g</span>
                                </div>
                              )}

                              {/* New Badge */}
                              {item.is_new && (
                                <div className="flex items-center gap-1.5 text-xs text-red-600">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8.01178 1.01562C7.89068 1.01562 7.76959 1.05859 7.67584 1.14453L6.4649 2.23828L4.86725 1.89453C4.61725 1.83984 4.36725 1.98828 4.28912 2.23047L3.78912 3.78516L2.23444 4.28516C1.99225 4.36328 1.84772 4.61328 1.90241 4.86328L1.92975 4.99609H3.28912L4.33991 4.66016C4.49225 4.60937 4.61334 4.48828 4.66412 4.33594L5.10162 2.96875L6.50787 3.26953C6.66022 3.30469 6.82818 3.26172 6.94537 3.15234L8.00787 2.19141L9.07428 3.15234C9.19146 3.25781 9.35943 3.30078 9.51568 3.26953L10.918 2.96875L11.3594 4.33594C11.4063 4.48828 11.5274 4.60937 11.6797 4.66016L12.7305 4.99609H14.0938L14.1212 4.86328C14.1719 4.61328 14.0274 4.36328 13.7813 4.28516L12.2305 3.78516L11.7305 2.23047C11.6524 1.98828 11.4024 1.83984 11.1485 1.89453L9.55475 2.23828L8.34381 1.14453C8.25006 1.05859 8.13287 1.01562 8.01178 1.01562ZM2.00006 5.99609V9.99609H3.00006V8.24609L4.00006 8.99609V9.99609H5.00006V5.99609H4.00006V7.74609L3.00006 6.99609V5.99609H2.00006ZM6.00006 5.99609V9.99609H9.00006V8.99609H7.00006V8.84375L9.00006 8.08984V5.99609H6.00006ZM10.0001 5.99609V10.2422L12.0001 9.07422L14.0001 10.2422V5.99609H13.0001V8.50391L12.0001 7.91797L11.0001 8.50391V5.99609H10.0001ZM7.00006 6.99609H8.00006V7.40234L7.00006 7.77734V6.99609ZM1.93366 10.9961L1.90241 11.1484C1.84772 11.3984 1.99225 11.6484 2.23444 11.7266L3.78912 12.2266L4.28912 13.7773C4.36725 14.0234 4.62115 14.1641 4.86725 14.1172L6.4649 13.7734L7.67193 14.8672C7.76959 14.9531 7.89068 14.9961 8.00787 14.9961C8.12897 14.9961 8.25006 14.9531 8.34381 14.8672L9.55475 13.7734L11.1524 14.1172C11.4063 14.1641 11.6524 14.0234 11.7305 13.7773L12.2305 12.2266L13.7813 11.7266C14.0274 11.6484 14.1719 11.3984 14.1212 11.1484L14.0899 10.9961H12.793L11.6837 11.3555C11.5274 11.4023 11.4102 11.5234 11.3594 11.6758L10.9219 13.043L9.51568 12.7422C9.35943 12.707 9.19537 12.75 9.07818 12.8555L8.00787 13.8242L6.94537 12.8594C6.85162 12.7734 6.73443 12.7305 6.60943 12.7305C6.57818 12.7305 6.53912 12.7344 6.50787 12.7422L5.10162 13.043L4.66412 11.6797C4.61334 11.5234 4.49225 11.4062 4.33991 11.3555L3.22662 10.9961H1.93366Z" fill="currentColor"></path>
                                  </svg>
                                  <span className="font-medium">New</span>
                                </div>
                              )}
                                </div>
                                
                            {/* Favourite Button */}
                            <div className="mt-auto">
                                        <FavouriteButton
                                          menuItemId={item.id}
                                          size="sm"
                                          initialIsFavourited={favouriteMenuItems.has(item.id)}
                                          initialFavouriteId={favouriteMenuItems.get(item.id)?.id || null}
                                          skipInitialCheck={true}
                                          onFavouriteChange={handleFavouriteChange}
                                        />
                                      </div>
                          </div>

                          {/* Right Part - Image */}
                          <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative shadow-md group-hover:shadow-lg transition-shadow">
                            {item.image ? (
                              <Image
                                src={getImageUrl(item.image) || "/images/default-restaurant.jpg"}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="128px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <span className="text-gray-400 text-2xl font-bold opacity-50">
                                  {item.name[0].toUpperCase()}
                                      </span>
                              </div>
                            )}
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenu;

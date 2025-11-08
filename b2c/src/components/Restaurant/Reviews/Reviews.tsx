import React, { useState, useEffect, useMemo } from "react";
import type { Review } from "@/src/types/review";
import { Button } from "@/src/components/common/Button";
import { Input } from "@/src/components/common/Input";
import { Select } from "@/src/components/common/Select";
import { Pagination } from "@/src/components/common/Pagination";
import { useAuth } from "@/src/hooks/useAuth";
import { reviewsService } from "@/src/services/reviews.service";
import { ApiError } from "@/src/services/api.service";
import { formatDate, cn } from "@/src/lib/utils";
import type { PaginatedResponse } from "@/src/services/restaurants.service";

export interface RestaurantReviewsProps {
  restaurantId: number;
  reviews?: Review[];
  restaurant?: {
    average_rating?: number | null;
    review_count?: number;
  };
  onReviewAdded?: () => void;
  className?: string;
}

export const RestaurantReviews: React.FC<RestaurantReviewsProps> = ({
  restaurantId,
  reviews: initialReviews,
  restaurant,
  onReviewAdded,
  className,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [food, setFood] = useState<number | null>(null);
  const [interior, setInterior] = useState<number | null>(null);
  const [atmosphere, setAtmosphere] = useState<number | null>(null);
  const [service, setService] = useState<number | null>(null);
  const [overall, setOverall] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pageSize = 10;

  // Calculate average ratings from reviews
  const averageRatings = useMemo(() => {
    if (reviews.length === 0) {
      return {
        overall: restaurant?.average_rating || null,
        food: null,
        interior: null,
        atmosphere: null,
        service: null,
        count: restaurant?.review_count || 0,
      };
    }

    const totals = reviews.reduce(
      (acc, review) => ({
        overall: acc.overall + Number(review.overall),
        food: acc.food + Number(review.food),
        interior: acc.interior + Number(review.interior),
        atmosphere: acc.atmosphere + Number(review.atmosphere),
        service: acc.service + Number(review.service),
      }),
      { overall: 0, food: 0, interior: 0, atmosphere: 0, service: 0 }
    );

    return {
      overall: totals.overall / reviews.length,
      food: totals.food / reviews.length,
      interior: totals.interior / reviews.length,
      atmosphere: totals.atmosphere / reviews.length,
      service: totals.service / reviews.length,
      count: totalCount || reviews.length,
    };
  }, [reviews, totalCount, restaurant]);

  // Fetch reviews when page or restaurant changes
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        setError(null);
        const response = await reviewsService.getReviewsByRestaurant(
          restaurantId,
          currentPage,
          pageSize
        );
        setReviews(response.results || []);
        setTotalCount(response.count || 0);
        setTotalPages(Math.ceil((response.count || 0) / pageSize));
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews");
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [restaurantId, currentPage, pageSize]);

  const ratingOptions = [
    { value: "5", label: "5 - Excellent" },
    { value: "4", label: "4 - Very Good" },
    { value: "3", label: "3 - Good" },
    { value: "2", label: "2 - Fair" },
    { value: "1", label: "1 - Poor" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

      if (!isAuthenticated) {
        setError("Please sign in to leave a review");
        return;
      }

      if (!user?.id) {
        setError("User information not available. Please sign in again.");
        return;
      }

    if (!food || !interior || !atmosphere || !service || !overall || !comment.trim()) {
      setError("Please provide all ratings and a comment");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newReview = await reviewsService.createReview({
        restaurant_id: restaurantId,
        user_id: user.id,
        food: food,
        interior: interior,
        atmosphere: atmosphere,
        service: service,
        overall: overall,
        comment: comment.trim(),
      });

      // Refresh reviews after adding new one
      setComment("");
      setFood(null);
      setInterior(null);
      setAtmosphere(null);
      setService(null);
      setOverall(null);
      setShowForm(false);
      
      // Reset to first page and refresh
      setCurrentPage(1);
      const response = await reviewsService.getReviewsByRestaurant(
        restaurantId,
        1,
        pageSize
      );
      setReviews(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / pageSize));
      
      onReviewAdded?.();
    } catch (err) {
      // Always show user-friendly error message
      setError("Не удалось отправить отзыв. Пожалуйста, попробуйте еще раз.");
      console.error("Error submitting review:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number | null, size: "sm" | "md" | "lg" = "md") => {
    if (rating === null) return null;
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={cn(
              sizeClasses[size],
              i < Math.round(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            )}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        <span className={cn("font-semibold text-gray-700 ml-1", size === "lg" ? "text-lg" : size === "sm" ? "text-xs" : "text-sm")}>
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const StarRatingInput = ({ value, onChange, label }: { value: number | null; onChange: (value: number) => void; label: string }) => {
    const [hoveredValue, setHoveredValue] = useState<number | null>(null);

    const handleStarClick = (starIndex: number, isHalf: boolean) => {
      const rating = isHalf ? starIndex + 0.5 : starIndex + 1;
      onChange(rating);
    };

    const getStarFill = (starIndex: number) => {
      const currentValue = hoveredValue !== null ? hoveredValue : value;
      if (currentValue === null) return 0;
      
      const fullStars = Math.floor(currentValue);
      const hasHalf = currentValue % 1 >= 0.5;
      
      if (starIndex < fullStars) return 1;
      if (starIndex === fullStars && hasHalf) return 0.5;
      return 0;
    };

    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => {
              const fill = getStarFill(i);
              
              return (
                <div
                  key={i}
                  className="relative cursor-pointer"
                  onMouseLeave={() => setHoveredValue(null)}
                >
                  <div className="relative w-6 h-6">
                    <div
                      className="absolute left-0 top-0 w-1/2 h-full z-10"
                      onMouseEnter={() => setHoveredValue(i + 0.5)}
                      onClick={() => handleStarClick(i, true)}
                    />
                    <div
                      className="absolute right-0 top-0 w-1/2 h-full z-10"
                      onMouseEnter={() => setHoveredValue(i + 1)}
                      onClick={() => handleStarClick(i, false)}
                    />
                    
                    <div className="relative w-6 h-6">
                      <svg 
                        className="w-6 h-6 text-gray-300 absolute inset-0"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      
                      {fill > 0 && (
                        <div 
                          className="absolute inset-0 overflow-hidden"
                          style={{ 
                            clipPath: fill === 1 ? 'inset(0)' : 'inset(0 50% 0 0)',
                          }}
                        >
                          <svg 
                            className="w-6 h-6 text-yellow-400 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {value !== null && (
            <span className="text-xs font-semibold text-[#8B1C3B] ml-1">
              {value.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Remove CollapsibleSection wrapper - it will be handled by parent */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Reviews</h3>
          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "Write a Review"}
            </Button>
          )}
        </div>

        {/* Review Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 rounded-xl bg-white border border-gray-200 shadow-md">
            <div className="p-5 space-y-4">
              {/* Compact Star Ratings */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StarRatingInput
                  value={food}
                  onChange={setFood}
                  label="Food"
                />
                <StarRatingInput
                  value={interior}
                  onChange={setInterior}
                  label="Interior"
                />
                <StarRatingInput
                  value={atmosphere}
                  onChange={setAtmosphere}
                  label="Atmosphere"
                />
                <StarRatingInput
                  value={service}
                  onChange={setService}
                  label="Service"
                />
                <StarRatingInput
                  value={overall}
                  onChange={setOverall}
                  label="Overall"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#8B1C3B] focus:border-[#8B1C3B] outline-none resize-none"
                  placeholder="Share your experience..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {comment.length} chars (min 10)
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setComment("");
                    setFood(null);
                    setInterior(null);
                    setAtmosphere(null);
                    setService(null);
                    setOverall(null);
                    setError(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={loading}
                  className="flex-1"
                  disabled={!food || !interior || !atmosphere || !service || !overall || !comment.trim() || comment.trim().length < 10}
                >
                  Submit
              </Button>
              </div>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {loadingReviews ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-[#8B1C3B] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet. Be the first to review!</p>
        ) : (
          <>
            <div className="space-y-6 mb-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {review.user?.first_name} {review.user?.last_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {/* Overall Rating */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={cn(
                            "w-5 h-5",
                              i < Number(review.overall)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          )}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                        <span className="text-sm font-medium text-gray-700 ml-1">
                          {Number(review.overall).toFixed(1)}
                        </span>
                      </div>
                      {/* Detailed Ratings */}
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        <span>Food: {Number(review.food).toFixed(1)}</span>
                        <span>Interior: {Number(review.interior).toFixed(1)}</span>
                        <span>Atmosphere: {Number(review.atmosphere).toFixed(1)}</span>
                        <span>Service: {Number(review.service).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
        </div>
      </div>
    );
  };

export default RestaurantReviews;


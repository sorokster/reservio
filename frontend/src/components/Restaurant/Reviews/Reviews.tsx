import React, { useState, useEffect } from "react";
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
  onReviewAdded?: () => void;
  className?: string;
}

export const RestaurantReviews: React.FC<RestaurantReviewsProps> = ({
  restaurantId,
  reviews: initialReviews,
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
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pageSize = 10;

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
    { value: 5, label: "5 - Excellent" },
    { value: 4, label: "4 - Very Good" },
    { value: 3, label: "3 - Good" },
    { value: 2, label: "2 - Fair" },
    { value: 1, label: "1 - Poor" },
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

    if (!rating || !comment.trim()) {
      setError("Please provide both rating and comment");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newReview = await reviewsService.createReview({
        restaurant_id: restaurantId,
        user_id: user.id,
        rating: rating,
        comment: comment.trim(),
      });

      // Refresh reviews after adding new one
      setComment("");
      setRating(null);
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

  return (
    <div className={className}>
      {/* Remove CollapsibleSection wrapper - it will be handled by parent */}
      <div>
        <div className="flex items-center justify-end mb-6">
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
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="space-y-4">
              <Select
                label="Rating"
                value={rating ? String(rating) : ""}
                onChange={(value) => setRating(value ? Number(value) : null)}
                placeholder="Select rating"
                options={ratingOptions}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent outline-none"
                  placeholder="Share your experience..."
                  required
                />
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <Button type="submit" variant="primary" isLoading={loading}>
                Submit Review
              </Button>
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
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={cn(
                            "w-5 h-5",
                            i < Number(review.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          )}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
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


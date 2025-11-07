"use client";

import React, { useState, useEffect } from "react";
import { Review } from "@/src/types/review";
import { Restaurant } from "@/src/types/restaurant";
import { useAuth } from "@/src/hooks/useAuth";

interface RestaurantReviewsProps {
  restaurantId: number | string;
}

const RestaurantReviews: React.FC<RestaurantReviewsProps> = ({ restaurantId }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: "5.00",
    comment: "",
  });

  useEffect(() => {
    fetchData();
  }, [restaurantId]);

  const fetchData = async () => {
    try {
      // Fetch both restaurant data (with aggregated rating) and reviews
      const [restaurantRes, reviewsRes] = await Promise.all([
        fetch(`http://localhost:8000/api/restaurants/${restaurantId}/`),
        fetch(`http://localhost:8000/api/reviews/?restaurant_id=${restaurantId}`),
      ]);

      const restaurantData = await restaurantRes.json();
      const reviewsData = await reviewsRes.json();

      setRestaurant(restaurantData);
      setReviews(Array.isArray(reviewsData) ? reviewsData : (reviewsData.results || []));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/api/reviews/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          user_id: user?.id,
          rating: formData.rating,
          comment: formData.comment,
        }),
        credentials: "include",
      });

      if (response.ok) {
        setFormData({ rating: "5.00", comment: "" });
        setShowForm(false);
        fetchData();
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return (
              <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <defs>
                  <linearGradient id="half-fill">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <path fill="url(#half-fill)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          } else {
            return (
              <svg key={i} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          }
        })}
        <span className="ml-2 text-gray-600 font-medium">{numRating.toFixed(1)}</span>
      </div>
    );
  };

  // Use average_rating from API (aggregated data) instead of calculating from loaded reviews
  // This ensures consistency with the restaurant list page
  const averageRating = restaurant?.average_rating 
    ? restaurant.average_rating.toFixed(1)
    : reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + parseFloat(r.rating), 0) / reviews.length).toFixed(1)
    : "0.0";
  
  // Use review_count from API if available, otherwise use loaded reviews length
  const reviewCount = restaurant?.review_count ?? reviews.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-[#8B1C3B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reviews</h2>
          <div className="flex items-center gap-4">
            {renderStars(averageRating)}
            <span className="text-gray-600">({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</span>
          </div>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 md:mt-0 px-6 py-3 bg-[#8B1C3B] hover:bg-[#6E152F] text-white rounded-xl font-medium transition-all active:scale-95"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        )}
      </div>

      {isAuthenticated && showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Write a Review</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <select
              name="rating"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent outline-none"
              required
            >
              <option value="1.00">1 - Poor</option>
              <option value="2.00">2 - Fair</option>
              <option value="3.00">3 - Good</option>
              <option value="4.00">4 - Very Good</option>
              <option value="5.00">5 - Excellent</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1C3B] focus:border-transparent outline-none"
              placeholder="Share your experience..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-[#8B1C3B] hover:bg-[#6E152F] text-white rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {!isAuthenticated && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-blue-800">
            <a href="/login" className="font-semibold hover:underline">Sign in</a> to write a review
          </p>
        </div>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Be the first to review this restaurant!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {review.user.first_name} {review.user.last_name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {renderStars(review.rating)}
              </div>
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RestaurantReviews;


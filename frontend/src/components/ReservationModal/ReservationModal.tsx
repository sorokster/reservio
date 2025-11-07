"use client";

import React, { useEffect } from "react";
import RestaurantReservationHero from "@/src/components/RestaurantReservationHero";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: number | string;
  initialData?: {
    date?: string;
    time?: string;
    guests?: string;
  };
}

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, restaurantId, initialData }) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-500 hover:bg-white hover:text-gray-900 transition-all shadow-lg hover:scale-110"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <RestaurantReservationHero 
              restaurantId={restaurantId} 
              onSuccess={onClose}
              initialDate={initialData?.date}
              initialTime={initialData?.time}
              initialGuests={initialData?.guests ? parseInt(initialData.guests) : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;


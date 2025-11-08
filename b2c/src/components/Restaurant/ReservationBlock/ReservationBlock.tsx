"use client";

import React, { useState } from "react";
import type { Schedule } from "@/src/types/schedule";
import { Button } from "@/src/components/common/Button";
import { Input } from "@/src/components/common/Input";
import { Select } from "@/src/components/common/Select";
import { BlockTitle } from "@/src/components/common/BlockTitle";
import { useAuth } from "@/src/hooks/useAuth";
import { ReservationModal } from "@/src/components/Restaurant/ReservationModal/ReservationModal";
import { getTodayDateString } from "@/src/utils/date";

export interface ReservationBlockProps {
  restaurantId: number;
  schedules?: Schedule[];
  className?: string;
}

export const ReservationBlock: React.FC<ReservationBlockProps> = ({
  restaurantId,
  schedules = [],
  className,
}) => {
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Set minimum date to today
  const minDate = getTodayDateString();
  const [date, setDate] = useState(minDate);
  const [guests, setGuests] = useState(2);

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      window.location.href = "/auth/login";
      return;
    }
    setIsModalOpen(true);
  };

  const handleReservationComplete = () => {
    // Reservation completed successfully
  };

  return (
    <>
      <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
        <div className="mb-6">
          <BlockTitle>Make a Reservation</BlockTitle>
        </div>
        
        <div className="space-y-4 mb-6">
          <Input
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={minDate}
            required
          />
          
          <Select
            label="Guests"
            value={String(guests)}
            onChange={(value) => setGuests(Number(value))}
            options={Array.from({ length: 10 }, (_, i) => ({
              value: i + 1,
              label: `${i + 1} ${i === 0 ? "guest" : "guests"}`,
            }))}
            required
          />
        </div>

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleOpenModal}
          className="w-full"
        >
          {isAuthenticated ? "Reserve a Table" : "Sign in to Reserve"}
        </Button>
      </div>

      {/* Reservation Modal */}
      {isAuthenticated && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          restaurantId={restaurantId}
          schedules={schedules}
          onReservationComplete={handleReservationComplete}
          initialDate={date}
          initialGuests={guests}
        />
      )}
    </>
  );
};

export default ReservationBlock;


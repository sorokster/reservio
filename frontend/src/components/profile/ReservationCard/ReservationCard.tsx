import React from "react";
import type { Reservation } from "@/src/types/reservation";
import {
  formatReservationDateShort,
  formatReservationTime,
  getReservationStatus,
  getStatusBadgeClasses,
  getStatusDisplayText,
  isUpcomingReservation,
} from "@/src/utils/reservations";
import { cn } from "@/src/lib/utils";
import Link from "next/link";

export interface ReservationCardProps {
  reservation: Reservation;
  className?: string;
  showActions?: boolean;
  onCancel?: (id: number) => void;
  onEdit?: (id: number) => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  className,
  showActions = true,
  onCancel,
  onEdit,
}) => {
  const status = getReservationStatus(reservation);
  const statusClasses = getStatusBadgeClasses(status);
  const statusText = getStatusDisplayText(status);
  const time = formatReservationTime(reservation);
  const date = formatReservationDateShort(reservation.date);

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all",
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Link
                href={`/restaurants/${reservation.restaurant.id}`}
                className="text-lg font-bold text-gray-900 hover:text-[#8B1C3B] transition-colors"
              >
                {reservation.restaurant.name}
              </Link>
              {reservation.restaurant.city && reservation.restaurant.country && (
                <p className="text-sm text-gray-600 mt-1">
                  {reservation.restaurant.city.name}, {reservation.restaurant.country.name}
                </p>
              )}
            </div>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border",
                statusClasses
              )}
            >
              {statusText}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Date</p>
              <p className="font-medium text-gray-900">{date}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Time</p>
              <p className="font-medium text-gray-900">{time}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Guests</p>
              <p className="font-medium text-gray-900">{reservation.guests}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Table</p>
              <p className="font-medium text-gray-900">
                {reservation.table?.number || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-2 md:flex-col">
            <Link
              href={`/auth/profile/reservations/${reservation.id}`}
              className="px-4 py-2 bg-[#8B1C3B] hover:bg-[#6E152F] text-white rounded-lg font-medium transition-all active:scale-95 text-center text-sm"
            >
              View Details
            </Link>
            {status !== "canceled" && isUpcomingReservation(reservation) && (
              <>
                {onEdit && (
                  <button
                    onClick={() => onEdit(reservation.id)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-all active:scale-95 text-sm"
                  >
                    Edit
                  </button>
                )}
                {onCancel && (
                  <button
                    onClick={() => onCancel(reservation.id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-all active:scale-95 text-sm"
                  >
                    Cancel
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationCard;


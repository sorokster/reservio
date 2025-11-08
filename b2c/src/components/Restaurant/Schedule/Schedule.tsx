import React from "react";
import type { Schedule } from "@/src/types/schedule";
import { cn } from "@/src/lib/utils";
import { 
  sortSchedulesByWeekday, 
  getCurrentDay, 
  formatTime, 
  DAY_NAMES 
} from "@/src/utils/schedule";

export interface RestaurantScheduleProps {
  schedules: Schedule[];
  className?: string;
}

// Clock icon SVG component
const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const RestaurantSchedule: React.FC<RestaurantScheduleProps> = ({
  schedules,
  className,
}) => {
  const sortedSchedules = sortSchedulesByWeekday(schedules);
  const currentDay = getCurrentDay();

  return (
    <div className={className}>
      {/* Remove CollapsibleSection wrapper - it will be handled by parent */}
      <div>
        {schedules.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <ClockIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">Schedule information not available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedSchedules.map((schedule) => {
              const isToday = schedule.weekday === currentDay;
              const dayName = schedule.weekday_display || DAY_NAMES[schedule.weekday];
              const isClosed = schedule.is_closed;
              const hasHours = schedule.time_from && schedule.time_to;

              return (
                <div
                  key={schedule.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl transition-all duration-200",
                    isToday
                      ? "bg-[#8B1C3B]/10 border-2 border-[#8B1C3B]/30"
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {isToday && (
                      <span className="px-2 py-0.5 bg-[#8B1C3B] text-white text-xs font-medium rounded-full">
                        Today
                      </span>
                    )}
                    <span
                      className={cn(
                        "font-semibold",
                        isToday ? "text-[#8B1C3B]" : "text-gray-900"
                      )}
                    >
                      {dayName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isClosed ? (
                      <span className="flex items-center gap-1.5 text-red-600 font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Closed
                      </span>
                    ) : hasHours ? (
                      <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <ClockIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-mono">
                          {formatTime(schedule.time_from)} - {formatTime(schedule.time_to)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Hours not specified</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantSchedule;

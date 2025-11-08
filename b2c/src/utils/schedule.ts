import type { Schedule } from "@/src/types/schedule";

/**
 * Day names mapping (0 = Monday, 6 = Sunday)
 */
export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/**
 * Restaurant status types
 */
export type RestaurantStatus = 
  | "open" 
  | "closed" 
  | "closing_soon" 
  | "opening_soon" 
  | "unknown";

/**
 * Restaurant status result
 */
export interface RestaurantStatusResult {
  status: RestaurantStatus;
  message: string;
  closingTime?: string | null;
  openingTime?: string | null;
}

/**
 * Format time string to remove seconds (HH:MM:SS -> HH:MM)
 */
export function formatTime(time: string | null | undefined): string | null {
  if (!time) return null;
  return time.split(':').slice(0, 2).join(':');
}

/**
 * Get current day of week (0 = Monday, 6 = Sunday)
 */
export function getCurrentDay(): number {
  const today = new Date().getDay();
  // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  return today === 0 ? 6 : today - 1;
}

/**
 * Get weekday for a date string (0 = Monday, 6 = Sunday)
 */
export function getWeekdayForDate(dateString: string): number {
  const date = new Date(dateString);
  const day = date.getDay();
  // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  return day === 0 ? 6 : day - 1;
}

/**
 * Convert time string (HH:MM or HH:MM:SS) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Get schedule for a specific weekday
 */
export function getScheduleForWeekday(
  schedules: Schedule[],
  weekday: number
): Schedule | null {
  return schedules.find(s => s.weekday === weekday) || null;
}

/**
 * Get today's schedule
 */
export function getTodaySchedule(schedules: Schedule[]): Schedule | null {
  const currentDay = getCurrentDay();
  return getScheduleForWeekday(schedules, currentDay);
}

/**
 * Sort schedules by weekday
 */
export function sortSchedulesByWeekday(schedules: Schedule[]): Schedule[] {
  return [...schedules].sort((a, b) => a.weekday - b.weekday);
}

/**
 * Get restaurant status based on schedules
 */
export function getRestaurantStatus(schedules: Schedule[]): RestaurantStatusResult {
  if (!schedules || schedules.length === 0) {
    return { status: 'unknown', message: 'Schedule not available' };
  }

  const currentDay = getCurrentDay();
  const sortedSchedules = sortSchedulesByWeekday(schedules);
  const todaySchedule = getScheduleForWeekday(sortedSchedules, currentDay);
  
  if (!todaySchedule) {
    return { status: 'unknown', message: 'Schedule not available' };
  }

  if (todaySchedule.is_closed) {
    return { status: 'closed', message: 'Closed today' };
  }

  if (!todaySchedule.time_from || !todaySchedule.time_to) {
    return { status: 'unknown', message: 'Hours not specified' };
  }

  const now = new Date();
  const fromTime = timeToMinutes(todaySchedule.time_from);
  const toTime = timeToMinutes(todaySchedule.time_to);
  const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

  // Check if restaurant is currently open
  if (currentTimeMinutes >= fromTime && currentTimeMinutes < toTime) {
    const timeUntilClose = toTime - currentTimeMinutes;
    if (timeUntilClose <= 60) {
      return { 
        status: 'closing_soon', 
        message: 'Closes soon',
        closingTime: formatTime(todaySchedule.time_to)
      };
    }
    return { 
      status: 'open', 
      message: 'Open now',
      closingTime: formatTime(todaySchedule.time_to)
    };
  }

  // Check if opening within an hour
  if (currentTimeMinutes < fromTime) {
    const timeUntilOpen = fromTime - currentTimeMinutes;
    if (timeUntilOpen <= 60) {
      return { 
        status: 'opening_soon', 
        message: 'Opens soon',
        openingTime: formatTime(todaySchedule.time_from)
      };
    }
  }

  // Check if closed today but might open tomorrow
  if (currentTimeMinutes >= toTime) {
    const nextDay = (currentDay + 1) % 7;
    const nextDaySchedule = getScheduleForWeekday(sortedSchedules, nextDay);
    
    if (nextDaySchedule && !nextDaySchedule.is_closed && nextDaySchedule.time_from) {
      const nextFromTime = timeToMinutes(nextDaySchedule.time_from);
      const minutesUntilMidnight = (24 * 60) - currentTimeMinutes;
      const totalMinutesUntilOpen = minutesUntilMidnight + nextFromTime;
      
      if (totalMinutesUntilOpen <= 60) {
        return { 
          status: 'opening_soon', 
          message: 'Opens soon',
          openingTime: formatTime(nextDaySchedule.time_from)
        };
      }
    }
  }

  return { 
    status: 'closed', 
    message: 'Closed now'
  };
}

/**
 * Generate time options for a schedule
 */
export interface TimeOption {
  value: string;
  label: string;
}

/**
 * Generate time options based on schedule
 * @param schedule - Schedule object
 * @param intervalMinutes - Interval between time slots (default: 30)
 * @param minHoursBeforeClose - Minimum hours before closing (default: 1)
 */
export function generateTimeOptions(
  schedule: Schedule | null,
  intervalMinutes: number = 30,
  minHoursBeforeClose: number = 1
): TimeOption[] {
  if (!schedule || schedule.is_closed || !schedule.time_from || !schedule.time_to) {
    return [];
  }

  const options: TimeOption[] = [];
  const fromTime = timeToMinutes(schedule.time_from);
  const toTime = timeToMinutes(schedule.time_to);
  const minTimeBeforeClose = minHoursBeforeClose * 60; // Convert to minutes
  
  // Generate slots every intervalMinutes, but ensure we have at least minHoursBeforeClose before closing
  for (let minutes = fromTime; minutes < toTime - minTimeBeforeClose; minutes += intervalMinutes) {
    const timeString = minutesToTime(minutes);
    options.push({ value: timeString, label: timeString });
  }
  
  return options;
}

/**
 * Check if reservation time is valid (ends at least minHoursBeforeClose before closing)
 */
export function isReservationTimeValid(
  schedule: Schedule | null,
  timeFrom: string,
  timeTo: string,
  minHoursBeforeClose: number = 1
): boolean {
  if (!schedule || schedule.is_closed || !schedule.time_to) {
    return false;
  }

  const toTime = timeToMinutes(timeTo);
  const closingTime = timeToMinutes(schedule.time_to);
  const minTimeBeforeClose = minHoursBeforeClose * 60;

  return toTime <= closingTime - minTimeBeforeClose;
}


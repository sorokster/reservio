import type { Schedule } from "@/src/types/schedule";

/**
 * Day names mapping (index 0 = Monday, index 6 = Sunday)
 * Note: weekday values from backend are 1-7 (Monday=1, Sunday=7)
 * To use with DAY_NAMES array, subtract 1: DAY_NAMES[weekday - 1]
 */
export const DAY_NAMES = [
  "Monday",   // index 0, weekday 1
  "Tuesday",  // index 1, weekday 2
  "Wednesday", // index 2, weekday 3
  "Thursday",  // index 3, weekday 4
  "Friday",    // index 4, weekday 5
  "Saturday",  // index 5, weekday 6
  "Sunday",    // index 6, weekday 7
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
 * Get current day of week (1 = Monday, 7 = Sunday)
 * Matches Django WeekDay model: MON = 1, TUE = 2, ..., SUN = 7
 */
export function getCurrentDay(): number {
  const today = new Date().getDay();
  // Convert JavaScript day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  // to Django format (1 = Monday, 2 = Tuesday, ..., 7 = Sunday)
  return today === 0 ? 7 : today;
}

/**
 * Get weekday for a date string (1 = Monday, 7 = Sunday)
 * Matches Django WeekDay model: MON = 1, TUE = 2, ..., SUN = 7
 */
export function getWeekdayForDate(dateString: string): number {
  const date = new Date(dateString);
  const day = date.getDay();
  // Convert JavaScript day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  // to Django format (1 = Monday, 2 = Tuesday, ..., 7 = Sunday)
  return day === 0 ? 7 : day;
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
    // Calculate next day (1-7 format: Monday=1, Sunday=7)
    const nextDay = currentDay === 7 ? 1 : currentDay + 1;
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
 * @param selectedDate - Selected date string (YYYY-MM-DD format) to filter past times
 * @param minMinutesFromNow - Minimum minutes from current time for booking (default: 30)
 */
export function generateTimeOptions(
  schedule: Schedule | null,
  intervalMinutes: number = 30,
  minHoursBeforeClose: number = 1,
  selectedDate?: string,
  minMinutesFromNow: number = 30
): TimeOption[] {
  if (!schedule || schedule.is_closed || !schedule.time_from || !schedule.time_to) {
    return [];
  }

  const options: TimeOption[] = [];
  const fromTime = timeToMinutes(schedule.time_from);
  const toTime = timeToMinutes(schedule.time_to);
  const minTimeBeforeClose = minHoursBeforeClose * 60; // Convert to minutes
  
  // Calculate minimum time for today's bookings
  let minBookingTime = fromTime;
  if (selectedDate) {
    const today = new Date();
    const selected = new Date(selectedDate);
    const isToday = 
      selected.getFullYear() === today.getFullYear() &&
      selected.getMonth() === today.getMonth() &&
      selected.getDate() === today.getDate();
    
    if (isToday) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      // Minimum booking time is current time + minMinutesFromNow, rounded up to next interval
      const minAllowedMinutes = currentMinutes + minMinutesFromNow;
      // Round up to next interval
      const roundedMinMinutes = Math.ceil(minAllowedMinutes / intervalMinutes) * intervalMinutes;
      minBookingTime = Math.max(fromTime, roundedMinMinutes);
    }
  }
  
  // Generate slots every intervalMinutes, but ensure we have at least minHoursBeforeClose before closing
  // and start from minBookingTime (which accounts for current time if today)
  for (let minutes = minBookingTime; minutes < toTime - minTimeBeforeClose; minutes += intervalMinutes) {
    const timeString = minutesToTime(minutes);
    options.push({ value: timeString, label: timeString });
  }
  
  return options;
}

/**
 * Check if reservation time is valid (ends at least minHoursBeforeClose before closing)
 * Also checks that the time is not in the past (if date is today)
 * @param schedule - Schedule object
 * @param timeFrom - Start time string (HH:MM)
 * @param timeTo - End time string (HH:MM)
 * @param minHoursBeforeClose - Minimum hours before closing (default: 1)
 * @param selectedDate - Selected date string (YYYY-MM-DD format) to check if time is in past
 * @param minMinutesFromNow - Minimum minutes from current time for booking (default: 30)
 */
export function isReservationTimeValid(
  schedule: Schedule | null,
  timeFrom: string,
  timeTo: string,
  minHoursBeforeClose: number = 1,
  selectedDate?: string,
  minMinutesFromNow: number = 30
): boolean {
  if (!schedule || schedule.is_closed || !schedule.time_to) {
    return false;
  }

  // Check if time is in the past (if date is today)
  if (selectedDate && timeFrom) {
    const today = new Date();
    const selected = new Date(selectedDate);
    const isToday = 
      selected.getFullYear() === today.getFullYear() &&
      selected.getMonth() === today.getMonth() &&
      selected.getDate() === today.getDate();
    
    if (isToday) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const fromTime = timeToMinutes(timeFrom);
      const minAllowedMinutes = currentMinutes + minMinutesFromNow;
      
      // Check if start time is at least minMinutesFromNow from now
      if (fromTime < minAllowedMinutes) {
        return false;
      }
    }
  }

  const toTime = timeToMinutes(timeTo);
  const closingTime = timeToMinutes(schedule.time_to);
  const minTimeBeforeClose = minHoursBeforeClose * 60;

  return toTime <= closingTime - minTimeBeforeClose;
}


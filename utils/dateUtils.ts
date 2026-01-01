/**
 * Date utility functions for formatting dates in IST (Indian Standard Time)
 * IST is UTC+5:30 (Asia/Kolkata timezone)
 */

const IST_TIMEZONE = "Asia/Kolkata";
const LOCALE = "en-IN";

/**
 * Format a date string to IST locale string (date and time)
 * @param dateString - ISO date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string in IST
 */
export function formatDateTimeIST(
  dateString: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return "N/A";
  
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) return "Invalid Date";
  
  // If dateStyle or timeStyle is provided, don't include individual formatting options
  // They are mutually exclusive
  const hasDateOrTimeStyle = options?.dateStyle || options?.timeStyle;
  
  const defaultOptions: Intl.DateTimeFormatOptions = hasDateOrTimeStyle
    ? {
        timeZone: IST_TIMEZONE,
        ...options,
      }
    : {
        timeZone: IST_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        ...options,
      };
  
  return date.toLocaleString(LOCALE, defaultOptions);
}

/**
 * Format a date string to IST date only (no time)
 * @param dateString - ISO date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string in IST
 */
export function formatDateIST(
  dateString: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return "N/A";
  
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) return "Invalid Date";
  
  // If dateStyle is provided, don't include individual formatting options
  // They are mutually exclusive
  const hasDateStyle = options?.dateStyle;
  
  const defaultOptions: Intl.DateTimeFormatOptions = hasDateStyle
    ? {
        timeZone: IST_TIMEZONE,
        ...options,
      }
    : {
        timeZone: IST_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        ...options,
      };
  
  return date.toLocaleDateString(LOCALE, defaultOptions);
}

/**
 * Format a date string to IST time only (no date)
 * @param dateString - ISO date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string in IST
 */
export function formatTimeIST(
  dateString: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return "N/A";
  
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) return "Invalid Date";
  
  // If timeStyle is provided, don't include individual formatting options
  // They are mutually exclusive
  const hasTimeStyle = options?.timeStyle;
  
  const defaultOptions: Intl.DateTimeFormatOptions = hasTimeStyle
    ? {
        timeZone: IST_TIMEZONE,
        ...options,
      }
    : {
        timeZone: IST_TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        ...options,
      };
  
  return date.toLocaleTimeString(LOCALE, defaultOptions);
}

/**
 * Format a date string to IST with custom format
 * @param dateString - ISO date string or Date object
 * @param format - Format string (e.g., "DD/MM/YYYY HH:mm:ss")
 * @returns Formatted date string in IST
 */
export function formatDateCustomIST(
  dateString: string | Date | null | undefined,
  format: "short" | "medium" | "long" | "full" = "medium"
): string {
  if (!dateString) return "N/A";
  
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) return "Invalid Date";
  
  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: {
      timeZone: IST_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
    medium: {
      timeZone: IST_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    },
    long: {
      timeZone: IST_TIMEZONE,
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    },
    full: {
      timeZone: IST_TIMEZONE,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    },
  };
  
  return date.toLocaleString(LOCALE, formatOptions[format]);
}

/**
 * Get current date/time in IST
 * @returns Current date string in IST
 */
export function getCurrentIST(): string {
  return formatDateTimeIST(new Date());
}


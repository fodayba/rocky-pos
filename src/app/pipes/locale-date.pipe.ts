import { Pipe, PipeTransform } from '@angular/core';
import { LocaleService } from '../services/locale.service';

/**
 * Pipe for formatting date and time values according to the current locale
 * 
 * Usage: {{ date | localeDate }} or {{ date | localeDate:'time' }}
 * Example: {{ date | localeDate }} => "12/01/2025" (en-US) or "01/12/2025" (en-SL)
 */
@Pipe({
  name: 'localeDate',
  standalone: true,
  pure: false // Re-evaluate when locale changes
})
export class LocaleDatePipe implements PipeTransform {
  constructor(private localeService: LocaleService) {}

  /**
   * Transform a date value into a formatted date/time string
   * @param value - The date value to format (Date object or ISO string)
   * @param format - Optional format type: 'short', 'long', 'time', 'datetime'
   * @returns Formatted date/time string
   */
  transform(value: Date | string | null | undefined, format: string = 'short'): string {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return '';
    }

    // Convert string to Date if needed
    let date: Date;
    if (typeof value === 'string') {
      date = new Date(value);
    } else {
      date = value;
    }

    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return String(value);
    }

    const locale = this.localeService.getCurrentLocale();
    const dateFormat = locale.dateFormat;

    switch (format) {
      case 'short':
        return this.formatShortDate(date, dateFormat.short);
      case 'long':
        return this.formatLongDate(date, dateFormat.long);
      case 'time':
        return this.formatTime(date, dateFormat.time);
      case 'datetime':
        return `${this.formatShortDate(date, dateFormat.short)} ${this.formatTime(date, dateFormat.time)}`;
      default:
        return this.formatShortDate(date, dateFormat.short);
    }
  }

  /**
   * Format date in short format (MM/DD/YYYY or DD/MM/YYYY)
   * @param date - Date to format
   * @param pattern - Format pattern
   * @returns Formatted date string
   */
  private formatShortDate(date: Date, pattern: string): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (pattern === 'MM/DD/YYYY') {
      return `${month}/${day}/${year}`;
    } else if (pattern === 'DD/MM/YYYY') {
      return `${day}/${month}/${year}`;
    }

    // Default fallback
    return `${month}/${day}/${year}`;
  }

  /**
   * Format date in long format (MMMM D, YYYY or D MMMM YYYY)
   * @param date - Date to format
   * @param pattern - Format pattern
   * @returns Formatted date string
   */
  private formatLongDate(date: Date, pattern: string): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    if (pattern === 'MMMM D, YYYY') {
      return `${month} ${day}, ${year}`;
    } else if (pattern === 'D MMMM YYYY') {
      return `${day} ${month} ${year}`;
    }

    // Default fallback
    return `${month} ${day}, ${year}`;
  }

  /**
   * Format time in 12-hour or 24-hour format
   * @param date - Date to format
   * @param timeFormat - '12h' or '24h'
   * @returns Formatted time string
   */
  private formatTime(date: Date, timeFormat: string): string {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (timeFormat === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes} ${period}`;
    } else {
      // 24-hour format
      const hours24 = String(hours).padStart(2, '0');
      return `${hours24}:${minutes}`;
    }
  }
}

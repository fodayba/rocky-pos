import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Pipe for formatting dates as relative time strings (e.g., "2 hours ago", "in 3 days")
 * 
 * Usage: {{ date | relativeTime }}
 * Example: {{ date | relativeTime }} => "2 hours ago" or "in 3 days"
 */
@Pipe({
  name: 'relativeTime',
  standalone: true,
  pure: false // Re-evaluate when locale changes
})
export class RelativeTimePipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  /**
   * Transform a date value into a relative time string
   * @param value - The date value to format (Date object or ISO string)
   * @returns Localized relative time string
   */
  transform(value: Date | string | null | undefined): string {
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

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const isPast = diffMs > 0;
    const absDiffMs = Math.abs(diffMs);

    // Calculate time units
    const seconds = Math.floor(absDiffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    // Determine the appropriate translation key and count
    let key: string;
    let count: number;

    if (seconds < 10) {
      return this.translateService.instant('common.relativeTime.justNow');
    } else if (seconds < 60) {
      key = isPast ? 'common.relativeTime.secondsAgo' : 'common.relativeTime.inSeconds';
      count = seconds;
    } else if (minutes === 1) {
      key = isPast ? 'common.relativeTime.minuteAgo' : 'common.relativeTime.inMinute';
      return this.translateService.instant(key);
    } else if (minutes < 60) {
      key = isPast ? 'common.relativeTime.minutesAgo' : 'common.relativeTime.inMinutes';
      count = minutes;
    } else if (hours === 1) {
      key = isPast ? 'common.relativeTime.hourAgo' : 'common.relativeTime.inHour';
      return this.translateService.instant(key);
    } else if (hours < 24) {
      key = isPast ? 'common.relativeTime.hoursAgo' : 'common.relativeTime.inHours';
      count = hours;
    } else if (days === 1) {
      key = isPast ? 'common.relativeTime.dayAgo' : 'common.relativeTime.inDay';
      return this.translateService.instant(key);
    } else if (days < 7) {
      key = isPast ? 'common.relativeTime.daysAgo' : 'common.relativeTime.inDays';
      count = days;
    } else if (weeks === 1) {
      key = isPast ? 'common.relativeTime.weekAgo' : 'common.relativeTime.inWeek';
      return this.translateService.instant(key);
    } else if (weeks < 4) {
      key = isPast ? 'common.relativeTime.weeksAgo' : 'common.relativeTime.inWeeks';
      count = weeks;
    } else if (months === 1) {
      key = isPast ? 'common.relativeTime.monthAgo' : 'common.relativeTime.inMonth';
      return this.translateService.instant(key);
    } else if (months < 12) {
      key = isPast ? 'common.relativeTime.monthsAgo' : 'common.relativeTime.inMonths';
      count = months;
    } else if (years === 1) {
      key = isPast ? 'common.relativeTime.yearAgo' : 'common.relativeTime.inYear';
      return this.translateService.instant(key);
    } else {
      key = isPast ? 'common.relativeTime.yearsAgo' : 'common.relativeTime.inYears';
      count = years;
    }

    return this.translateService.instant(key, { count });
  }
}

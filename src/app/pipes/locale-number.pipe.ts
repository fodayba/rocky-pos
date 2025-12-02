import { Pipe, PipeTransform } from '@angular/core';
import { LocaleService } from '../services/locale.service';

/**
 * Pipe for formatting numeric values according to the current locale
 * 
 * Usage: {{ value | localeNumber }} or {{ value | localeNumber:'1.2-2' }} or {{ value | localeNumber:'percent' }}
 * Example: {{ 1234.56 | localeNumber }} => "1,234.56"
 * Example: {{ 0.85 | localeNumber:'percent' }} => "85%"
 */
@Pipe({
  name: 'localeNumber',
  standalone: true,
  pure: false // Re-evaluate when locale changes
})
export class LocaleNumberPipe implements PipeTransform {
  constructor(private localeService: LocaleService) {}

  /**
   * Transform a numeric value into a formatted number string
   * @param value - The numeric value to format
   * @param digitsInfo - Optional format specification (e.g., '1.2-2' for min 1 integer, 2-2 decimals) or 'percent'
   * @returns Formatted number string
   */
  transform(value: number | null | undefined, digitsInfo?: string): string {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return '';
    }

    // Handle invalid numbers
    if (isNaN(value)) {
      return 'N/A';
    }

    const locale = this.localeService.getCurrentLocale();

    // Handle percentage formatting
    if (digitsInfo === 'percent') {
      return this.formatPercentage(value);
    }

    // Parse digits info (e.g., '1.2-2' means minIntegerDigits.minFractionDigits-maxFractionDigits)
    const { minFractionDigits, maxFractionDigits } = this.parseDigitsInfo(digitsInfo);

    // Format the number
    return this.formatNumber(value, minFractionDigits, maxFractionDigits);
  }

  /**
   * Format a number with thousands separators and decimal places
   * @param value - The number to format
   * @param minDecimals - Minimum decimal places
   * @param maxDecimals - Maximum decimal places
   * @returns Formatted number string
   */
  private formatNumber(value: number, minDecimals: number, maxDecimals: number): string {
    // Convert to string to check decimal places
    const valueStr = value.toString();
    const hasDecimals = valueStr.includes('.');
    
    // Determine actual decimal places to use
    let actualDecimals = minDecimals;
    if (hasDecimals && maxDecimals > minDecimals) {
      const decimalPart = valueStr.split('.')[1] || '';
      actualDecimals = Math.min(decimalPart.length, maxDecimals);
      actualDecimals = Math.max(actualDecimals, minDecimals);
    }
    
    // Round to actual decimal places
    const rounded = Number(value.toFixed(actualDecimals));
    
    // Convert to string with fixed decimals
    let result = rounded.toFixed(actualDecimals);
    
    // Split into integer and decimal parts
    const [integerPart, decimalPart] = result.split('.');
    
    // Add thousands separators (comma)
    const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Combine with decimal part
    return decimalPart !== undefined ? `${withSeparators}.${decimalPart}` : withSeparators;
  }

  /**
   * Format a number as a percentage
   * @param value - The decimal value to format (e.g., 0.85 for 85%)
   * @returns Formatted percentage string
   */
  private formatPercentage(value: number): string {
    // Convert to percentage (multiply by 100)
    const percentage = value * 100;
    
    // Determine decimal places needed
    const percentageStr = percentage.toString();
    const hasDecimals = percentageStr.includes('.');
    
    let formatted: string;
    if (hasDecimals) {
      const decimalPart = percentageStr.split('.')[1] || '';
      const decimalPlaces = Math.min(decimalPart.length, 2);
      formatted = this.formatNumber(percentage, decimalPlaces, decimalPlaces);
    } else {
      formatted = this.formatNumber(percentage, 0, 0);
    }
    
    return `${formatted}%`;
  }

  /**
   * Parse digits info string
   * @param digitsInfo - Format specification (e.g., '1.2-2')
   * @returns Object with min and max fraction digits
   */
  private parseDigitsInfo(digitsInfo?: string): { minFractionDigits: number; maxFractionDigits: number } {
    if (!digitsInfo) {
      // Default: show decimals if present, up to 3 places
      return { minFractionDigits: 0, maxFractionDigits: 10 };
    }

    // Parse format like '1.2-2' (minIntegerDigits.minFractionDigits-maxFractionDigits)
    const parts = digitsInfo.split('.');
    if (parts.length === 2) {
      const fractionParts = parts[1].split('-');
      const minFractionDigits = parseInt(fractionParts[0], 10) || 0;
      const maxFractionDigits = parseInt(fractionParts[1], 10) || minFractionDigits;
      return { minFractionDigits, maxFractionDigits };
    }

    return { minFractionDigits: 0, maxFractionDigits: 10 };
  }
}

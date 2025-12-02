import { Pipe, PipeTransform } from '@angular/core';
import { LocaleService } from '../services/locale.service';

/**
 * Pipe for formatting currency values according to the current locale
 * 
 * Usage: {{ value | localeCurrency }}
 * Example: {{ 1234.56 | localeCurrency }} => "$1,234.56" (en-US) or "Le 1,234.56" (en-SL)
 */
@Pipe({
  name: 'localeCurrency',
  standalone: true,
  pure: false // Re-evaluate when locale changes
})
export class LocaleCurrencyPipe implements PipeTransform {
  constructor(private localeService: LocaleService) {}

  /**
   * Transform a numeric value into a formatted currency string
   * @param value - The numeric value to format
   * @param currencyCode - Optional currency code override
   * @returns Formatted currency string
   */
  transform(value: number | null | undefined, currencyCode?: string): string {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return '';
    }

    // Handle invalid numbers
    if (isNaN(value)) {
      return 'N/A';
    }

    const locale = this.localeService.getCurrentLocale();
    const currency = locale.currency;
    const symbol = currencyCode ? this.getCurrencySymbol(currencyCode) : currency.symbol;
    const decimals = currency.decimals;

    // Format the number with thousands separators and decimals
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    
    // Format with fixed decimals
    const formattedNumber = this.formatNumber(absoluteValue, decimals);
    
    // Apply currency symbol
    // For SLL (Le), add a space after the symbol
    const needsSpace = currency.code === 'SLL' && !symbol.endsWith(' ');
    const formattedCurrency = needsSpace 
      ? `${symbol} ${formattedNumber}` 
      : `${symbol}${formattedNumber}`;
    
    // Handle negative values
    if (isNegative) {
      return `-${formattedCurrency}`;
    }
    
    return formattedCurrency;
  }

  /**
   * Format a number with thousands separators and decimal places
   * @param value - The number to format
   * @param decimals - Number of decimal places
   * @returns Formatted number string
   */
  private formatNumber(value: number, decimals: number): string {
    // Round to specified decimal places
    const rounded = value.toFixed(decimals);
    
    // Split into integer and decimal parts
    const [integerPart, decimalPart] = rounded.split('.');
    
    // Add thousands separators
    const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Combine with decimal part
    return decimalPart ? `${withSeparators}.${decimalPart}` : withSeparators;
  }

  /**
   * Get currency symbol for a given currency code
   * @param currencyCode - ISO 4217 currency code
   * @returns Currency symbol
   */
  private getCurrencySymbol(currencyCode: string): string {
    const symbolMap: { [key: string]: string } = {
      'USD': '$',
      'SLL': 'Le '
    };
    
    return symbolMap[currencyCode] || currencyCode + ' ';
  }
}

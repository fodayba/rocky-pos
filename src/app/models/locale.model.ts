/**
 * Currency configuration for a locale
 */
export interface CurrencyConfig {
  code: string;           // ISO 4217 code: 'USD', 'SLL'
  symbol: string;         // '$', 'Le'
  format: string;         // Format pattern
  decimals: number;       // Decimal places
}

/**
 * Date and time formatting configuration for a locale
 */
export interface DateFormatConfig {
  short: string;          // 'MM/DD/YYYY' or 'DD/MM/YYYY'
  long: string;           // 'MMMM D, YYYY'
  time: string;           // '12h' or '24h'
}

/**
 * Complete locale configuration
 */
export interface LocaleConfig {
  code: string;           // e.g., 'en-US', 'en-SL'
  language: string;       // e.g., 'en'
  region: string;         // e.g., 'US', 'SL'
  displayName: string;    // e.g., 'English (United States)'
  currency: CurrencyConfig;
  dateFormat: DateFormatConfig;
}

/**
 * Available locale configurations for the application
 */
export const LOCALE_CONFIGS: LocaleConfig[] = [
  {
    code: 'en-US',
    language: 'en',
    region: 'US',
    displayName: 'English (United States)',
    currency: {
      code: 'USD',
      symbol: '$',
      format: '$1,234.56',
      decimals: 2
    },
    dateFormat: {
      short: 'MM/DD/YYYY',
      long: 'MMMM D, YYYY',
      time: '12h'
    }
  },
  {
    code: 'en-SL',
    language: 'en',
    region: 'SL',
    displayName: 'English (Sierra Leone)',
    currency: {
      code: 'SLL',
      symbol: 'Le',
      format: 'Le 1,234.56',
      decimals: 2
    },
    dateFormat: {
      short: 'DD/MM/YYYY',
      long: 'D MMMM YYYY',
      time: '24h'
    }
  }
];

/**
 * Default locale code
 */
export const DEFAULT_LOCALE = 'en-US';

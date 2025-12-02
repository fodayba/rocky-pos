import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocaleCurrencyPipe } from './locale-currency.pipe';
import { LocaleService } from '../services/locale.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('LocaleCurrencyPipe', () => {
  let pipe: LocaleCurrencyPipe;
  let localeService: LocaleService;
  let translateService: TranslateService;

  beforeEach(() => {
    // Create a mock TranslateService
    translateService = {
      setDefaultLang: vi.fn(),
      use: vi.fn().mockReturnValue(of({})),
      instant: vi.fn(),
      get: vi.fn().mockReturnValue(of('')),
      onLangChange: of({}),
      onTranslationChange: of({}),
      onDefaultLangChange: of({})
    } as any;

    localeService = new LocaleService(translateService);
    pipe = new LocaleCurrencyPipe(localeService);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('US locale (en-US)', () => {
    beforeEach(async () => {
      await localeService.setLocale('en-US');
    });

    it('should format currency as $1,234.56', () => {
      const result = pipe.transform(1234.56);
      expect(result).toBe('$1,234.56');
    });

    it('should format large numbers with thousands separators', () => {
      const result = pipe.transform(1234567.89);
      expect(result).toBe('$1,234,567.89');
    });

    it('should format small numbers correctly', () => {
      const result = pipe.transform(5.99);
      expect(result).toBe('$5.99');
    });
  });

  describe('Sierra Leone locale (en-SL)', () => {
    beforeEach(async () => {
      await localeService.setLocale('en-SL');
    });

    it('should format currency as Le 1,234.56', () => {
      const result = pipe.transform(1234.56);
      expect(result).toBe('Le 1,234.56');
    });

    it('should format large numbers with thousands separators', () => {
      const result = pipe.transform(1234567.89);
      expect(result).toBe('Le 1,234,567.89');
    });
  });

  describe('zero values', () => {
    beforeEach(async () => {
      await localeService.setLocale('en-US');
    });

    it('should display zero with decimals', () => {
      const result = pipe.transform(0);
      expect(result).toBe('$0.00');
    });

    it('should display zero with correct decimal places', () => {
      const result = pipe.transform(0.00);
      expect(result).toBe('$0.00');
    });
  });

  describe('negative values', () => {
    beforeEach(async () => {
      await localeService.setLocale('en-US');
    });

    it('should show negative indicator for negative values', () => {
      const result = pipe.transform(-1234.56);
      expect(result).toBe('-$1,234.56');
    });

    it('should show negative indicator for small negative values', () => {
      const result = pipe.transform(-5.99);
      expect(result).toBe('-$5.99');
    });

    it('should handle negative zero', () => {
      const result = pipe.transform(-0);
      expect(result).toBe('$0.00');
    });
  });

  describe('edge cases', () => {
    beforeEach(async () => {
      await localeService.setLocale('en-US');
    });

    it('should return empty string for null', () => {
      const result = pipe.transform(null);
      expect(result).toBe('');
    });

    it('should return empty string for undefined', () => {
      const result = pipe.transform(undefined);
      expect(result).toBe('');
    });

    it('should return N/A for NaN', () => {
      const result = pipe.transform(NaN);
      expect(result).toBe('N/A');
    });
  });

  describe('Property 8: Large currency values format correctly', () => {
    /**
     * Feature: app-localization, Property 8: Large currency values format correctly
     * Validates: Requirements 3.5
     * 
     * For any currency value in the range of millions to billions,
     * the currency formatter should include appropriate thousands separators and maintain decimal precision
     */
    it('should format large currency values with thousands separators and decimal precision', async () => {
      const fc = await import('fast-check');
      
      await fc.assert(
        fc.asyncProperty(
          // Generate large numbers in the range of millions to billions
          fc.double({ min: 1_000_000, max: 999_999_999_999, noNaN: true }),
          fc.constantFrom('en-US', 'en-SL'),
          async (value, localeCode) => {
            // Set the locale
            await localeService.setLocale(localeCode);
            
            // Transform the value
            const result = pipe.transform(value);
            
            // Verify the result is a string
            expect(typeof result).toBe('string');
            
            // Verify it contains the currency symbol
            const locale = localeService.getCurrentLocale();
            const expectedSymbol = locale.currency.symbol;
            expect(result).toContain(expectedSymbol);
            
            // Verify it contains thousands separators (commas)
            expect(result).toMatch(/,/);
            
            // Verify it has decimal precision (2 decimal places)
            expect(result).toMatch(/\.\d{2}$/);
            
            // Verify the number of commas is appropriate for the magnitude
            const numericPart = result.replace(/[^0-9,\.]/g, '');
            const commaCount = (numericPart.match(/,/g) || []).length;
            
            // For millions, expect at least 1 comma
            // For billions, expect at least 3 commas
            if (value >= 1_000_000_000) {
              expect(commaCount).toBeGreaterThanOrEqual(3);
            } else if (value >= 1_000_000) {
              expect(commaCount).toBeGreaterThanOrEqual(1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

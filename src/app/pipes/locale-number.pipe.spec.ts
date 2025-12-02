import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocaleNumberPipe } from './locale-number.pipe';
import { LocaleService } from '../services/locale.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('LocaleNumberPipe', () => {
  let pipe: LocaleNumberPipe;
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
    pipe = new LocaleNumberPipe(localeService);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('US locale (en-US)', () => {
    beforeEach(async () => {
      await localeService.setLocale('en-US');
    });

    it('should use comma as thousands separator', () => {
      const result = pipe.transform(1234567.89);
      expect(result).toBe('1,234,567.89');
    });

    it('should use period as decimal separator', () => {
      const result = pipe.transform(1234.56);
      expect(result).toBe('1,234.56');
    });

    it('should format small numbers correctly', () => {
      const result = pipe.transform(123.45);
      expect(result).toBe('123.45');
    });

    it('should format numbers without decimals when specified', () => {
      const result = pipe.transform(1234.567, '1.0-0');
      expect(result).toBe('1,235');
    });

    it('should format numbers with specific decimal places', () => {
      const result = pipe.transform(1234.5, '1.2-2');
      expect(result).toBe('1,234.50');
    });
  });

  describe('Sierra Leone locale (en-SL)', () => {
    beforeEach(async () => {
      await localeService.setLocale('en-SL');
    });

    it('should use comma as thousands separator', () => {
      const result = pipe.transform(1234567.89);
      expect(result).toBe('1,234,567.89');
    });

    it('should use period as decimal separator', () => {
      const result = pipe.transform(1234.56);
      expect(result).toBe('1,234.56');
    });

    it('should format small numbers correctly', () => {
      const result = pipe.transform(123.45);
      expect(result).toBe('123.45');
    });
  });

  describe('percentage formatting', () => {
    beforeEach(async () => {
      await localeService.setLocale('en-US');
    });

    it('should format decimal as percentage', () => {
      const result = pipe.transform(0.85, 'percent');
      expect(result).toBe('85%');
    });

    it('should format whole number percentage', () => {
      const result = pipe.transform(1.0, 'percent');
      expect(result).toBe('100%');
    });

    it('should format percentage with decimals', () => {
      const result = pipe.transform(0.8567, 'percent');
      expect(result).toBe('85.67%');
    });

    it('should format small percentage', () => {
      const result = pipe.transform(0.05, 'percent');
      expect(result).toBe('5%');
    });

    it('should format percentage less than 1%', () => {
      const result = pipe.transform(0.005, 'percent');
      expect(result).toBe('0.5%');
    });

    it('should format zero percentage', () => {
      const result = pipe.transform(0, 'percent');
      expect(result).toBe('0%');
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

    it('should handle zero', () => {
      const result = pipe.transform(0);
      expect(result).toBe('0');
    });

    it('should handle negative numbers', () => {
      const result = pipe.transform(-1234.56);
      expect(result).toBe('-1,234.56');
    });
  });

  describe('Property 10: Percentages format by locale', () => {
    /**
     * Feature: app-localization, Property 10: Percentages format by locale
     * Validates: Requirements 5.3
     * 
     * For any percentage value and any locale, the percentage formatter should use
     * that locale's conventions for decimal separators and percent symbol placement
     */
    it('should format percentages according to locale conventions', async () => {
      const fc = await import('fast-check');
      
      await fc.assert(
        fc.asyncProperty(
          // Generate percentage values (0 to 1 for 0% to 100%)
          fc.double({ min: 0, max: 1, noNaN: true }),
          fc.constantFrom('en-US', 'en-SL'),
          async (value, localeCode) => {
            // Set the locale
            await localeService.setLocale(localeCode);
            
            // Transform the value as percentage
            const result = pipe.transform(value, 'percent');
            
            // Verify the result is a string
            expect(typeof result).toBe('string');
            
            // Verify it ends with percent symbol
            expect(result).toMatch(/%$/);
            
            // Verify it contains a number
            expect(result).toMatch(/\d/);
            
            // For both locales, verify decimal separator is period (.)
            // (Both en-US and en-SL use period as decimal separator)
            if (result.includes('.')) {
              expect(result).toMatch(/\d+\.\d+%/);
            }
            
            // Verify the percentage value is reasonable (0-100)
            const numericPart = result.replace(/[^0-9.]/g, '');
            const percentValue = parseFloat(numericPart);
            expect(percentValue).toBeGreaterThanOrEqual(0);
            expect(percentValue).toBeLessThanOrEqual(100);
            
            // Verify the conversion is correct (within rounding tolerance)
            const expectedPercent = value * 100;
            expect(Math.abs(percentValue - expectedPercent)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { ValidatedTranslateLoader } from './validated-translate-loader';
import { of, throwError } from 'rxjs';

/**
 * Property-based tests for ValidatedTranslateLoader
 * Feature: app-localization, Property 12: Invalid translation files are rejected
 * Validates: Requirements 7.3
 */
describe('ValidatedTranslateLoader - Property Tests', () => {
  /**
   * Property 12: Invalid translation files are rejected
   * For any translation file with invalid JSON structure or missing required fields,
   * the translation loader should reject it and log an error
   */
  it('Property 12: should reject invalid translation files and return empty object', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate invalid translation structures
        fc.oneof(
          // Arrays are invalid
          fc.array(fc.string()),
          // Primitives are invalid
          fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null)),
          // Objects with array values are invalid
          fc.dictionary(fc.string(), fc.array(fc.string())).filter(obj => Object.keys(obj).length > 0),
          // Objects with number values are invalid
          fc.dictionary(fc.string(), fc.integer()).filter(obj => Object.keys(obj).length > 0),
          // Objects with boolean values are invalid
          fc.dictionary(fc.string(), fc.boolean()).filter(obj => Object.keys(obj).length > 0)
        ),
        fc.string({ minLength: 2, maxLength: 5 }), // locale code
        async (invalidTranslations, locale) => {
          // Spy on console.error and console.warn to verify error logging
          const consoleErrors: string[] = [];
          const consoleWarns: string[] = [];
          const originalError = console.error;
          const originalWarn = console.warn;
          console.error = (...args: any[]) => {
            consoleErrors.push(args.join(' '));
          };
          console.warn = (...args: any[]) => {
            consoleWarns.push(args.join(' '));
          };

          try {
            // Mock HttpClient
            const mockHttp = {
              get: vi.fn().mockReturnValue(of(invalidTranslations))
            } as any;

            const loader = new ValidatedTranslateLoader(mockHttp, '/assets/i18n/', '.json');

            // Request translation
            const result = await new Promise((resolve) => {
              loader.getTranslation(locale).subscribe(resolve);
            });

            // Should return empty object for invalid files
            expect(result).toEqual({});

            // Should have logged an error or warning
            const totalLogs = consoleErrors.length + consoleWarns.length;
            expect(totalLogs).toBeGreaterThan(0);
            
            const allMessages = [...consoleErrors, ...consoleWarns].join(' ');
            expect(allMessages.toLowerCase()).toMatch(/invalid|error|not a valid/);
          } finally {
            console.error = originalError;
            console.warn = originalWarn;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Valid translation files are accepted
   * For any valid translation file structure, the loader should accept it
   */
  it('should accept valid translation files with nested structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid translation structures (nested objects with string values)
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.oneof(
            fc.string(),
            fc.dictionary(fc.string({ minLength: 1, maxLength: 20 }), fc.string())
          )
        ),
        fc.string({ minLength: 2, maxLength: 5 }), // locale code
        async (validTranslations, locale) => {
          // Mock HttpClient
          const mockHttp = {
            get: vi.fn().mockReturnValue(of(validTranslations))
          } as any;

          const loader = new ValidatedTranslateLoader(mockHttp, '/assets/i18n/', '.json');

          // Request translation
          const result = await new Promise((resolve) => {
            loader.getTranslation(locale).subscribe(resolve);
          });

          // Should return the translations unchanged
          expect(result).toEqual(validTranslations);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Network errors are handled gracefully
   * For any network error, the loader should return empty object and log error
   */
  it('should handle network errors gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 2, maxLength: 5 }), // locale code
        fc.integer({ min: 400, max: 599 }), // HTTP error code
        async (locale, errorCode) => {
          // Spy on console.error
          const consoleErrors: string[] = [];
          const originalError = console.error;
          console.error = (...args: any[]) => {
            consoleErrors.push(args.join(' '));
          };

          try {
            // Mock HttpClient with error
            const mockHttp = {
              get: vi.fn().mockReturnValue(throwError(() => new Error(`HTTP ${errorCode}`)))
            } as any;

            const loader = new ValidatedTranslateLoader(mockHttp, '/assets/i18n/', '.json');

            // Request translation
            const result = await new Promise((resolve) => {
              loader.getTranslation(locale).subscribe(resolve);
            });

            // Should return empty object
            expect(result).toEqual({});

            // Should have logged an error
            expect(consoleErrors.length).toBeGreaterThan(0);
            expect(consoleErrors.some(msg => msg.includes('Failed to load'))).toBe(true);
          } finally {
            console.error = originalError;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

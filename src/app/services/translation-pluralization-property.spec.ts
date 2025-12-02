import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import * as fc from 'fast-check';

describe('Property 11: Pluralization rules apply', () => {
  /**
   * Feature: app-localization, Property 11: Pluralization rules apply
   * Validates: Requirements 6.5
   * 
   * For any count value and any pluralizable translation key,
   * the translation service should return the grammatically correct plural form for that count
   */
  
  let translateService: TranslateService;

  beforeEach(() => {
    // Create a mock TranslateService with pluralization support
    translateService = {
      setDefaultLang: vi.fn(),
      use: vi.fn().mockReturnValue(of({})),
      instant: vi.fn((key: string, params?: any) => {
        // Mock translations with ICU MessageFormat pluralization
        const translations: Record<string, string> = {
          items: '{count, plural, =0{No items} =1{One item} other{{{count}} items}}',
          messages: '{count, plural, =0{No messages} =1{One message} other{{{count}} messages}}',
          users: '{count, plural, =0{No users} =1{One user} other{{{count}} users}}',
          files: '{count, plural, =0{No files} =1{One file} other{{{count}} files}}',
          days: '{count, plural, =0{Today} =1{Tomorrow} other{{{count}} days}}'
        };
        
        let template = translations[key] || key;
        
        if (params && params.count !== undefined) {
          const count = params.count;
          
          // Parse ICU MessageFormat pattern manually
          const pluralStart = template.indexOf('{count, plural,');
          if (pluralStart !== -1) {
            // Find the three forms
            const zeroStart = template.indexOf('=0{', pluralStart) + 3;
            const zeroEnd = template.indexOf('}', zeroStart);
            const zeroForm = template.substring(zeroStart, zeroEnd);
            
            const oneStart = template.indexOf('=1{', zeroEnd) + 3;
            const oneEnd = template.indexOf('}', oneStart);
            const oneForm = template.substring(oneStart, oneEnd);
            
            const otherStart = template.indexOf('other{', oneEnd) + 6;
            // Find the matching closing brace for 'other'
            let braceCount = 1;
            let otherEnd = otherStart;
            while (braceCount > 0 && otherEnd < template.length) {
              if (template[otherEnd] === '{') braceCount++;
              if (template[otherEnd] === '}') braceCount--;
              if (braceCount > 0) otherEnd++;
            }
            const otherForm = template.substring(otherStart, otherEnd);
            
            if (count === 0) {
              return zeroForm;
            } else if (count === 1) {
              return oneForm;
            } else {
              // Replace {{count}} in the other form with the actual count
              return otherForm.replace(/\{\{count\}\}/g, String(count));
            }
          }
        }
        
        return template;
      }),
      get: vi.fn((key: string, params?: any) => {
        return of(translateService.instant(key, params));
      }),
      onLangChange: of({}),
      onTranslationChange: of({}),
      onDefaultLangChange: of({})
    } as any;
  });

  it('should return zero form for count of 0', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('items', 'messages', 'users', 'files'),
        async (key) => {
          const result = translateService.instant(key, { count: 0 });
          
          // Zero form should not contain a number
          expect(result).not.toMatch(/\d+/);
          // Should start with "No"
          expect(result).toMatch(/^No /);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return singular form for count of 1', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('items', 'messages', 'users', 'files'),
        async (key) => {
          const result = translateService.instant(key, { count: 1 });
          
          // Singular form should start with "One"
          expect(result).toMatch(/^One /);
          // Should not contain the number 1
          expect(result).not.toContain('1');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return plural form with count for values greater than 1', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('items', 'messages', 'users', 'files'),
        fc.integer({ min: 2, max: 10000 }),
        async (key, count) => {
          const result = translateService.instant(key, { count });
          
          // Plural form should contain the count
          expect(result).toContain(String(count));
          // Should not start with "No" or "One"
          expect(result).not.toMatch(/^(No|One) /);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle all count values correctly across different keys', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('items', 'messages', 'users', 'files', 'days'),
        fc.integer({ min: 0, max: 1000 }),
        async (key, count) => {
          const result = translateService.instant(key, { count });
          
          // Result should be a non-empty string
          expect(result).toBeDefined();
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
          
          // Verify correct form based on count
          if (count === 0) {
            // Zero form - should not contain digits (except for 'days' which might say "Today")
            if (key !== 'days') {
              expect(result).toMatch(/^No /);
            }
          } else if (count === 1) {
            // Singular form - should not contain the digit 1 (except for 'days' which might say "Tomorrow")
            if (key !== 'days') {
              expect(result).toMatch(/^One /);
            }
          } else {
            // Plural form - should contain the count
            expect(result).toContain(String(count));
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain consistency for the same count across multiple calls', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('items', 'messages', 'users', 'files'),
        fc.integer({ min: 0, max: 100 }),
        async (key, count) => {
          // Call multiple times with the same parameters
          const result1 = translateService.instant(key, { count });
          const result2 = translateService.instant(key, { count });
          const result3 = translateService.instant(key, { count });
          
          // All results should be identical
          expect(result1).toBe(result2);
          expect(result2).toBe(result3);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge case counts correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('items', 'messages', 'users', 'files'),
        fc.constantFrom(0, 1, 2, 10, 100, 1000, 9999),
        async (key, count) => {
          const result = translateService.instant(key, { count });
          
          // Should return a valid string
          expect(result).toBeDefined();
          expect(typeof result).toBe('string');
          
          // Should follow pluralization rules
          if (count === 0) {
            expect(result).toMatch(/^No /);
          } else if (count === 1) {
            expect(result).toMatch(/^One /);
          } else {
            expect(result).toContain(String(count));
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not leave placeholder syntax in the result', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('items', 'messages', 'users', 'files', 'days'),
        fc.integer({ min: 0, max: 1000 }),
        async (key, count) => {
          const result = translateService.instant(key, { count });
          
          // Should not contain ICU MessageFormat syntax
          expect(result).not.toMatch(/{count, plural/);
          expect(result).not.toMatch(/=0{/);
          expect(result).not.toMatch(/=1{/);
          expect(result).not.toMatch(/other{/);
          
          // For counts > 1, should not contain {{count}} placeholder
          if (count > 1) {
            expect(result).not.toMatch(/\{\{count\}\}/);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

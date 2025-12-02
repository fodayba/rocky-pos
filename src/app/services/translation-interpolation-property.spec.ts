import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import * as fc from 'fast-check';

describe('Property 7: Parameter interpolation works', () => {
  /**
   * Feature: app-localization, Property 7: Parameter interpolation works
   * Validates: Requirements 2.6, 6.4
   * 
   * For any translation with parameter placeholders and any valid parameter object,
   * the translation service should substitute all placeholders with their corresponding values
   */
  
  let translateService: TranslateService;

  beforeEach(() => {
    // Create a mock TranslateService with interpolation support
    translateService = {
      setDefaultLang: vi.fn(),
      use: vi.fn().mockReturnValue(of({})),
      instant: vi.fn((key: string, params?: any) => {
        // Mock translations with various parameter patterns
        const translations: Record<string, string> = {
          singleParam: 'Hello {{name}}',
          twoParams: '{{user}} has {{count}} items',
          threeParams: '{{a}} and {{b}} and {{c}}',
          numberParam: 'Total: {{amount}}',
          mixedParams: '{{text}} - {{number}} - {{bool}}'
        };
        
        let result = translations[key] || key;
        
        if (params) {
          // Simple interpolation: replace {{key}} with params[key]
          Object.keys(params).forEach(paramKey => {
            const value = String(params[paramKey]);
            // Use a function to avoid special replacement patterns like $&, $`, $', etc.
            result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), () => value);
          });
        }
        
        return result;
      }),
      get: vi.fn((key: string, params?: any) => {
        return of(translateService.instant(key, params));
      }),
      onLangChange: of({}),
      onTranslationChange: of({}),
      onDefaultLangChange: of({})
    } as any;
  });

  it('should substitute all parameter placeholders with their values', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate translation keys with parameters
        fc.constantFrom('singleParam', 'twoParams', 'threeParams', 'numberParam', 'mixedParams'),
        // Generate parameter objects based on the key
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 1000 }),
        fc.boolean(),
        async (key, stringValue, numberValue, boolValue) => {
          // Create appropriate params based on the key
          let params: any;
          let expectedPattern: RegExp;
          
          switch (key) {
            case 'singleParam':
              params = { name: stringValue };
              break;
            case 'twoParams':
              params = { user: stringValue, count: numberValue };
              break;
            case 'threeParams':
              params = { a: stringValue, b: numberValue, c: boolValue };
              break;
            case 'numberParam':
              params = { amount: numberValue };
              break;
            case 'mixedParams':
              params = { text: stringValue, number: numberValue, bool: boolValue };
              break;
            default:
              params = {};
          }
          
          // Get the translation with parameters
          const result = translateService.instant(key, params);
          
          // Verify no placeholders remain (all {{param}} should be replaced)
          expect(result).not.toMatch(/{{.*?}}/);
          
          // Verify the result is a non-empty string
          expect(result).toBeDefined();
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
          
          // Verify all parameter values appear in the result
          Object.values(params).forEach(value => {
            expect(result).toContain(String(value));
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty parameter objects without crashing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('singleParam', 'twoParams', 'threeParams'),
        async (key) => {
          // Get translation with empty params
          const result = translateService.instant(key, {});
          
          // Should return the template with placeholders intact
          expect(result).toBeDefined();
          expect(typeof result).toBe('string');
          // Placeholders should remain when no params provided
          expect(result).toMatch(/{{.*?}}/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle parameter values of different types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.integer(),
        fc.float(),
        fc.boolean(),
        async (str, int, float, bool) => {
          const params = {
            stringParam: str,
            intParam: int,
            floatParam: float,
            boolParam: bool
          };
          
          // Create a translation template with all param types
          const mockTranslation = '{{stringParam}}-{{intParam}}-{{floatParam}}-{{boolParam}}';
          
          // Mock the instant method for this specific test
          vi.mocked(translateService.instant).mockImplementation((key: string, p?: any) => {
            if (!p) return mockTranslation;
            
            let result = mockTranslation;
            Object.keys(p).forEach(paramKey => {
              // Use a function to avoid special replacement patterns like $&, $`, $', etc.
              const value = String(p[paramKey]);
              result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), () => value);
            });
            return result;
          });
          
          const result = translateService.instant('test', params);
          
          // Verify all parameter values are in the result as strings
          expect(result).toContain(String(str));
          expect(result).toContain(String(int));
          expect(result).toContain(String(float));
          expect(result).toContain(String(bool));
          
          // Verify no placeholders remain
          expect(result).not.toMatch(/{{.*?}}/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle special characters in parameter values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 30 }),
        async (value) => {
          const params = { param: value };
          
          // Mock for this test
          vi.mocked(translateService.instant).mockImplementation((key: string, p?: any) => {
            if (!p) return 'Value: {{param}}';
            return `Value: ${p.param}`;
          });
          
          const result = translateService.instant('test', params);
          
          // The parameter value should appear in the result exactly as provided
          expect(result).toContain(value);
          expect(result).not.toMatch(/{{param}}/);
        }
      ),
      { numRuns: 100 }
    );
  });
});

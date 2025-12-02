import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('Translation Pluralization', () => {
  let translateService: TranslateService;

  beforeEach(() => {
    // Create a mock TranslateService with pluralization support
    translateService = {
      setDefaultLang: vi.fn(),
      use: vi.fn().mockReturnValue(of({})),
      instant: vi.fn((key: string, params?: any) => {
        // Mock translations with ICU MessageFormat pluralization
        const translations: Record<string, string> = {
          itemsPlural: '{count, plural, =0{No items} =1{One item} other{{{count}} items}}',
          messagesPlural: '{count, plural, =0{No messages} =1{One message} other{{{count}} messages}}',
          daysPlural: '{count, plural, =0{Today} =1{Tomorrow} other{In {{count}} days}}',
          filesPlural: '{count, plural, =0{No files selected} =1{One file selected} other{{{count}} files selected}}',
          usersPlural: '{count, plural, =0{No users} =1{One user} other{{{count}} users}}'
        };
        
        let template = translations[key] || key;
        
        if (params && params.count !== undefined) {
          // Simple pluralization logic for testing
          const count = params.count;
          
          // Parse ICU MessageFormat pattern manually
          // Extract the parts between the braces
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

  it('should return zero form when count is 0', async () => {
    const result = await new Promise<string>((resolve) => {
      translateService.get('itemsPlural', { count: 0 }).subscribe(result => {
        resolve(result);
      });
    });
    expect(result).toBe('No items');
  });

  it('should return singular form when count is 1', async () => {
    const result = await new Promise<string>((resolve) => {
      translateService.get('itemsPlural', { count: 1 }).subscribe(result => {
        resolve(result);
      });
    });
    expect(result).toBe('One item');
  });

  it('should return plural form when count is greater than 1', async () => {
    const result = await new Promise<string>((resolve) => {
      translateService.get('itemsPlural', { count: 5 }).subscribe(result => {
        resolve(result);
      });
    });
    expect(result).toBe('5 items');
  });

  it('should handle messages pluralization', async () => {
    const testCases = [
      { count: 0, expected: 'No messages' },
      { count: 1, expected: 'One message' },
      { count: 10, expected: '10 messages' }
    ];

    for (const testCase of testCases) {
      const result = await new Promise<string>((resolve) => {
        translateService.get('messagesPlural', { count: testCase.count }).subscribe(result => {
          resolve(result);
        });
      });
      expect(result).toBe(testCase.expected);
    }
  });

  it('should handle days pluralization with special zero case', async () => {
    const testCases = [
      { count: 0, expected: 'Today' },
      { count: 1, expected: 'Tomorrow' },
      { count: 7, expected: 'In 7 days' }
    ];

    for (const testCase of testCases) {
      const result = await new Promise<string>((resolve) => {
        translateService.get('daysPlural', { count: testCase.count }).subscribe(result => {
          resolve(result);
        });
      });
      expect(result).toBe(testCase.expected);
    }
  });

  it('should handle files pluralization', async () => {
    const testCases = [
      { count: 0, expected: 'No files selected' },
      { count: 1, expected: 'One file selected' },
      { count: 3, expected: '3 files selected' }
    ];

    for (const testCase of testCases) {
      const result = await new Promise<string>((resolve) => {
        translateService.get('filesPlural', { count: testCase.count }).subscribe(result => {
          resolve(result);
        });
      });
      expect(result).toBe(testCase.expected);
    }
  });

  it('should use instant method for synchronous pluralization', () => {
    expect(translateService.instant('itemsPlural', { count: 0 })).toBe('No items');
    expect(translateService.instant('itemsPlural', { count: 1 })).toBe('One item');
    expect(translateService.instant('itemsPlural', { count: 42 })).toBe('42 items');
  });

  it('should handle large numbers in pluralization', () => {
    const result = translateService.instant('usersPlural', { count: 1000 });
    expect(result).toBe('1000 users');
  });
});

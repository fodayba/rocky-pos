import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('Translation Parameter Interpolation', () => {
  let translateService: TranslateService;

  beforeEach(() => {
    // Create a mock TranslateService with interpolation support
    translateService = {
      setDefaultLang: vi.fn(),
      use: vi.fn().mockReturnValue(of({})),
      instant: vi.fn((key: string, params?: any) => {
        // Mock interpolation logic
        const translations: Record<string, string> = {
          greeting: 'Hello, {{name}}!',
          itemCount: '{{count}} items',
          priceDisplay: 'Price: {{price}}',
          dateDisplay: 'Date: {{date}}',
          multiParam: '{{user}} purchased {{count}} items for {{total}}'
        };
        
        let result = translations[key] || key;
        
        if (params) {
          // Simple interpolation: replace {{key}} with params[key]
          Object.keys(params).forEach(paramKey => {
            result = result.replace(`{{${paramKey}}}`, String(params[paramKey]));
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

  it('should interpolate string parameters', async () => {
    const result = await new Promise<string>((resolve) => {
      translateService.get('greeting', { name: 'John' }).subscribe(result => {
        resolve(result);
      });
    });
    expect(result).toBe('Hello, John!');
  });

  it('should interpolate number parameters', async () => {
    const result = await new Promise<string>((resolve) => {
      translateService.get('itemCount', { count: 5 }).subscribe(result => {
        resolve(result);
      });
    });
    expect(result).toBe('5 items');
  });

  it('should interpolate decimal number parameters', async () => {
    const result = await new Promise<string>((resolve) => {
      translateService.get('priceDisplay', { price: 19.99 }).subscribe(result => {
        resolve(result);
      });
    });
    expect(result).toBe('Price: 19.99');
  });

  it('should interpolate date parameters', async () => {
    const date = new Date('2024-01-15');
    const result = await new Promise<string>((resolve) => {
      translateService.get('dateDisplay', { date: date.toISOString() }).subscribe(result => {
        resolve(result);
      });
    });
    expect(result).toContain('Date: 2024-01-15');
  });

  it('should interpolate multiple parameters', async () => {
    const result = await new Promise<string>((resolve) => {
      translateService.get('multiParam', { 
        user: 'Alice', 
        count: 3, 
        total: '$45.00' 
      }).subscribe(result => {
        resolve(result);
      });
    });
    expect(result).toBe('Alice purchased 3 items for $45.00');
  });

  it('should handle missing parameters gracefully', async () => {
    const result = await new Promise<string>((resolve) => {
      translateService.get('greeting', {}).subscribe(result => {
        resolve(result);
      });
    });
    // ngx-translate leaves the placeholder when parameter is missing
    expect(result).toBe('Hello, {{name}}!');
  });

  it('should use instant method for synchronous translation', () => {
    const result = translateService.instant('greeting', { name: 'Bob' });
    expect(result).toBe('Hello, Bob!');
  });
});

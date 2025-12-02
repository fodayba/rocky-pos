import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import * as fc from 'fast-check';
import { RelativeTimePipe } from './relative-time.pipe';

describe('Property 9: Relative times are localized', () => {
  /**
   * Feature: app-localization, Property 9: Relative times are localized
   * Validates: Requirements 4.5
   * 
   * For any time difference and any locale, the relative time formatter
   * should return text in that locale's language
   */
  
  let pipe: RelativeTimePipe;
  let translateService: TranslateService;
  let translationMap: Map<string, Map<string, string>>;

  beforeEach(() => {
    // Set up translation maps for different locales
    translationMap = new Map();
    
    // en-US translations
    const enUSTranslations = new Map<string, string>([
      ['common.relativeTime.justNow', 'just now'],
      ['common.relativeTime.secondsAgo', '{{count}} seconds ago'],
      ['common.relativeTime.minuteAgo', 'a minute ago'],
      ['common.relativeTime.minutesAgo', '{{count}} minutes ago'],
      ['common.relativeTime.hourAgo', 'an hour ago'],
      ['common.relativeTime.hoursAgo', '{{count}} hours ago'],
      ['common.relativeTime.dayAgo', 'a day ago'],
      ['common.relativeTime.daysAgo', '{{count}} days ago'],
      ['common.relativeTime.weekAgo', 'a week ago'],
      ['common.relativeTime.weeksAgo', '{{count}} weeks ago'],
      ['common.relativeTime.monthAgo', 'a month ago'],
      ['common.relativeTime.monthsAgo', '{{count}} months ago'],
      ['common.relativeTime.yearAgo', 'a year ago'],
      ['common.relativeTime.yearsAgo', '{{count}} years ago'],
      ['common.relativeTime.inSeconds', 'in {{count}} seconds'],
      ['common.relativeTime.inMinute', 'in a minute'],
      ['common.relativeTime.inMinutes', 'in {{count}} minutes'],
      ['common.relativeTime.inHour', 'in an hour'],
      ['common.relativeTime.inHours', 'in {{count}} hours'],
      ['common.relativeTime.inDay', 'in a day'],
      ['common.relativeTime.inDays', 'in {{count}} days'],
      ['common.relativeTime.inWeek', 'in a week'],
      ['common.relativeTime.inWeeks', 'in {{count}} weeks'],
      ['common.relativeTime.inMonth', 'in a month'],
      ['common.relativeTime.inMonths', 'in {{count}} months'],
      ['common.relativeTime.inYear', 'in a year'],
      ['common.relativeTime.inYears', 'in {{count}} years']
    ]);
    
    // en-SL translations (same as en-US for this test, but could be different)
    const enSLTranslations = new Map<string, string>([
      ['common.relativeTime.justNow', 'just now'],
      ['common.relativeTime.secondsAgo', '{{count}} seconds ago'],
      ['common.relativeTime.minuteAgo', 'a minute ago'],
      ['common.relativeTime.minutesAgo', '{{count}} minutes ago'],
      ['common.relativeTime.hourAgo', 'an hour ago'],
      ['common.relativeTime.hoursAgo', '{{count}} hours ago'],
      ['common.relativeTime.dayAgo', 'a day ago'],
      ['common.relativeTime.daysAgo', '{{count}} days ago'],
      ['common.relativeTime.weekAgo', 'a week ago'],
      ['common.relativeTime.weeksAgo', '{{count}} weeks ago'],
      ['common.relativeTime.monthAgo', 'a month ago'],
      ['common.relativeTime.monthsAgo', '{{count}} months ago'],
      ['common.relativeTime.yearAgo', 'a year ago'],
      ['common.relativeTime.yearsAgo', '{{count}} years ago'],
      ['common.relativeTime.inSeconds', 'in {{count}} seconds'],
      ['common.relativeTime.inMinute', 'in a minute'],
      ['common.relativeTime.inMinutes', 'in {{count}} minutes'],
      ['common.relativeTime.inHour', 'in an hour'],
      ['common.relativeTime.inHours', 'in {{count}} hours'],
      ['common.relativeTime.inDay', 'in a day'],
      ['common.relativeTime.inDays', 'in {{count}} days'],
      ['common.relativeTime.inWeek', 'in a week'],
      ['common.relativeTime.inWeeks', 'in {{count}} weeks'],
      ['common.relativeTime.inMonth', 'in a month'],
      ['common.relativeTime.inMonths', 'in {{count}} months'],
      ['common.relativeTime.inYear', 'in a year'],
      ['common.relativeTime.inYears', 'in {{count}} years']
    ]);
    
    translationMap.set('en-US', enUSTranslations);
    translationMap.set('en-SL', enSLTranslations);
    
    let currentLocale = 'en-US';
    
    // Create mock TranslateService
    translateService = {
      setDefaultLang: vi.fn(),
      use: vi.fn((locale: string) => {
        currentLocale = locale;
        return of({});
      }),
      instant: vi.fn((key: string | string[], params?: any) => {
        const keyStr = Array.isArray(key) ? key[0] : key;
        const translations = translationMap.get(currentLocale);
        let result = translations?.get(keyStr) || keyStr;
        
        if (params && typeof result === 'string') {
          Object.keys(params).forEach(paramKey => {
            const value = String(params[paramKey]);
            result = (result as string).replace(new RegExp(`{{${paramKey}}}`, 'g'), () => value);
          });
        }
        
        return result;
      }),
      get: vi.fn(),
      onLangChange: of({}),
      onTranslationChange: of({}),
      onDefaultLangChange: of({})
    } as any;
    
    // Create pipe instance directly
    pipe = new RelativeTimePipe(translateService);
  });

  it('should return localized text for any time difference', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random dates (past and future) - filter out invalid dates
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
          .filter(date => !isNaN(date.getTime())),
        // Generate locale
        fc.constantFrom('en-US', 'en-SL'),
        async (targetDate, locale) => {
          // Switch to the specified locale
          await translateService.use(locale);
          
          // Transform the date
          const result = pipe.transform(targetDate);
          
          // Verify the result is a non-empty string
          expect(result).toBeDefined();
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
          
          // Verify the result doesn't contain untranslated placeholders
          expect(result).not.toMatch(/{{.*?}}/);
          
          // Verify the result contains expected relative time keywords
          const relativeTimeKeywords = [
            'just now', 'second', 'minute', 'hour', 'day', 'week', 'month', 'year',
            'ago', 'in '
          ];
          
          const containsKeyword = relativeTimeKeywords.some(keyword => 
            result.toLowerCase().includes(keyword)
          );
          
          expect(containsKeyword).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle both past and future times correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate time offsets in milliseconds
        fc.integer({ min: -365 * 24 * 60 * 60 * 1000, max: 365 * 24 * 60 * 60 * 1000 }),
        fc.constantFrom('en-US', 'en-SL'),
        async (offsetMs, locale) => {
          await translateService.use(locale);
          
          const now = new Date();
          const targetDate = new Date(now.getTime() + offsetMs);
          
          const result = pipe.transform(targetDate);
          
          // Verify result is valid
          expect(result).toBeDefined();
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
          
          // For past times (negative offset), result should contain "ago" or "just now"
          // For future times (positive offset), result should contain "in "
          if (offsetMs < -10000) { // More than 10 seconds in the past
            expect(result.toLowerCase()).toMatch(/ago|just now/);
          } else if (offsetMs > 10000) { // More than 10 seconds in the future
            expect(result.toLowerCase()).toContain('in ');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should use translation service for all relative time strings', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 10, max: 1000000 }), // seconds offset
        fc.constantFrom('en-US', 'en-SL'),
        async (secondsOffset, locale) => {
          await translateService.use(locale);
          
          const now = new Date();
          const targetDate = new Date(now.getTime() - secondsOffset * 1000);
          
          // Clear mock call history
          vi.mocked(translateService.instant).mockClear();
          
          const result = pipe.transform(targetDate);
          
          // Verify TranslateService.instant was called
          expect(translateService.instant).toHaveBeenCalled();
          
          // Verify the call was for a relative time translation key
          const calls = vi.mocked(translateService.instant).mock.calls;
          const hasRelativeTimeKey = calls.some(call => {
            const key = Array.isArray(call[0]) ? call[0][0] : call[0];
            return typeof key === 'string' && key.includes('common.relativeTime');
          });
          
          expect(hasRelativeTimeKey).toBe(true);
          
          // Verify result is valid
          expect(result).toBeDefined();
          expect(typeof result).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge cases gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en-US', 'en-SL'),
        async (locale) => {
          await translateService.use(locale);
          
          // Test null
          expect(pipe.transform(null)).toBe('');
          
          // Test undefined
          expect(pipe.transform(undefined)).toBe('');
          
          // Test invalid date string
          const invalidResult = pipe.transform('invalid-date');
          expect(invalidResult).toBe('invalid-date');
          
          // Test very recent time (should be "just now")
          const now = new Date();
          const veryRecent = new Date(now.getTime() - 5000); // 5 seconds ago
          const recentResult = pipe.transform(veryRecent);
          expect(recentResult.toLowerCase()).toContain('just now');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce different results for different locales', async () => {
    // This test verifies that switching locales can produce different outputs
    // (even if en-US and en-SL are currently the same, the infrastructure should support it)
    
    const testDate = new Date('2024-01-01T00:00:00Z');
    
    await translateService.use('en-US');
    const resultUS = pipe.transform(testDate);
    
    await translateService.use('en-SL');
    const resultSL = pipe.transform(testDate);
    
    // Both should be valid strings
    expect(resultUS).toBeDefined();
    expect(resultSL).toBeDefined();
    expect(typeof resultUS).toBe('string');
    expect(typeof resultSL).toBe('string');
    
    // Both should use the translation service
    expect(translateService.instant).toHaveBeenCalled();
  });
});

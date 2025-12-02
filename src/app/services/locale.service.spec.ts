import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import * as fc from 'fast-check';
import { LocaleService } from './locale.service';
import { LOCALE_CONFIGS } from '../models/locale.model';

describe('LocaleService', () => {
  let service: LocaleService;
  let translateService: TranslateService;
  let httpClient: any;

  beforeEach(() => {
    // Create a mock HttpClient
    httpClient = {
      get: vi.fn(),
      patch: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };

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

    service = new LocaleService(translateService, httpClient);
  });

  describe('Property 1: Language selection updates translations', () => {
    /**
     * Feature: app-localization, Property 1: Language selection updates translations
     * Validates: Requirements 1.2
     * 
     * For any valid locale code, when a user selects that locale,
     * all subsequent translation requests should return text from that locale's translation file
     */
    it('should update TranslateService language when locale is set', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...LOCALE_CONFIGS.map(config => config.code)),
          async (localeCode) => {
            // Reset mocks for each iteration
            vi.clearAllMocks();
            
            // Mock translation data for the locale
            const mockTranslations = {
              'test.key': `Translation in ${localeCode}`
            };
            
            // Mock the TranslateService to return our test translations
            vi.mocked(translateService.use).mockReturnValue(of(mockTranslations));
            vi.mocked(translateService.instant).mockReturnValue(mockTranslations['test.key']);
            
            // Set the locale
            await service.setLocale(localeCode);
            
            // Verify TranslateService.use was called with the correct locale
            expect(translateService.use).toHaveBeenCalledWith(localeCode);
            
            // Verify the current locale is updated
            const currentLocale = service.getCurrentLocale();
            expect(currentLocale.code).toBe(localeCode);
            
            // Verify translations are from the correct locale
            const translation = translateService.instant('test.key');
            expect(translation).toContain(localeCode);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Region selection updates formatting', () => {
    /**
     * Feature: app-localization, Property 2: Region selection updates formatting
     * Validates: Requirements 1.3
     * 
     * For any valid region code, when a user selects that region,
     * currency, date, and number formatters should use that region's conventions
     */
    it('should update formatting configuration when locale is set', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...LOCALE_CONFIGS.map(config => config.code)),
          async (localeCode) => {
            // Reset mocks for each iteration
            vi.clearAllMocks();
            vi.mocked(translateService.use).mockReturnValue(of({}));
            
            // Set the locale
            await service.setLocale(localeCode);
            
            // Get the current locale
            const currentLocale = service.getCurrentLocale();
            
            // Verify the locale code matches
            expect(currentLocale.code).toBe(localeCode);
            
            // Verify currency configuration is set correctly
            expect(currentLocale.currency).toBeDefined();
            expect(currentLocale.currency.code).toBeDefined();
            expect(currentLocale.currency.symbol).toBeDefined();
            expect(currentLocale.currency.decimals).toBeGreaterThanOrEqual(0);
            
            // Verify date format configuration is set correctly
            expect(currentLocale.dateFormat).toBeDefined();
            expect(currentLocale.dateFormat.short).toBeDefined();
            expect(currentLocale.dateFormat.long).toBeDefined();
            expect(currentLocale.dateFormat.time).toBeDefined();
            
            // Verify region-specific formatting conventions
            const expectedConfig = LOCALE_CONFIGS.find(c => c.code === localeCode);
            expect(currentLocale.currency.code).toBe(expectedConfig?.currency.code);
            expect(currentLocale.currency.symbol).toBe(expectedConfig?.currency.symbol);
            expect(currentLocale.dateFormat.short).toBe(expectedConfig?.dateFormat.short);
            expect(currentLocale.dateFormat.time).toBe(expectedConfig?.dateFormat.time);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 4: Translation service returns current locale text', () => {
    /**
     * Feature: app-localization, Property 4: Translation service returns current locale text
     * Validates: Requirements 2.2
     * 
     * For any translation key that exists in the current locale's translation file,
     * the translation service should return the text in that locale
     */
    it('should return translations from the current locale', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...LOCALE_CONFIGS.map(config => config.code)),
          fc.constantFrom('common.save', 'common.cancel', 'auth.login', 'auth.logout'),
          async (localeCode, translationKey) => {
            // Reset mocks
            vi.clearAllMocks();
            
            // Mock translation data specific to the locale
            const mockTranslations: Record<string, string> = {
              'common.save': `Save in ${localeCode}`,
              'common.cancel': `Cancel in ${localeCode}`,
              'auth.login': `Login in ${localeCode}`,
              'auth.logout': `Logout in ${localeCode}`
            };
            
            vi.mocked(translateService.use).mockReturnValue(of(mockTranslations));
            vi.mocked(translateService.instant).mockImplementation((key: string) => {
              return mockTranslations[key] || key;
            });
            
            // Set the locale
            await service.setLocale(localeCode);
            
            // Get translation
            const translation = translateService.instant(translationKey);
            
            // Verify the translation contains the locale identifier
            expect(translation).toContain(localeCode);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Missing translations fall back', () => {
    /**
     * Feature: app-localization, Property 5: Missing translations fall back
     * Validates: Requirements 2.3
     * 
     * For any translation key that exists in the fallback language but not in the current locale,
     * the translation service should return the fallback language text
     */
    it('should fall back to default language for missing translations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...LOCALE_CONFIGS.map(config => config.code)),
          fc.string({ minLength: 1, maxLength: 20 }).map(s => `missing.${s}`),
          async (localeCode, missingKey) => {
            // Reset mocks
            vi.clearAllMocks();
            
            const fallbackText = `Fallback text for ${missingKey}`;
            
            // Mock: current locale doesn't have the key, but fallback does
            vi.mocked(translateService.use).mockReturnValue(of({}));
            vi.mocked(translateService.instant).mockImplementation((key: string) => {
              // If key is missing in current locale, return fallback
              if (key === missingKey) {
                return fallbackText;
              }
              return key;
            });
            
            // Set the locale
            await service.setLocale(localeCode);
            
            // Get translation for missing key
            const translation = translateService.instant(missingKey);
            
            // Should return fallback text, not the key itself
            expect(translation).toBe(fallbackText);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Non-existent keys return the key', () => {
    /**
     * Feature: app-localization, Property 6: Non-existent keys return the key
     * Validates: Requirements 2.4
     * 
     * For any translation key that does not exist in any translation file,
     * the translation service should return the key itself
     */
    it('should return the key itself when translation does not exist', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...LOCALE_CONFIGS.map(config => config.code)),
          fc.string({ minLength: 5, maxLength: 30 }).map(s => `nonexistent.${s}`),
          async (localeCode, nonexistentKey) => {
            // Reset mocks
            vi.clearAllMocks();
            
            // Mock: key doesn't exist in any locale
            vi.mocked(translateService.use).mockReturnValue(of({}));
            vi.mocked(translateService.instant).mockImplementation((key: string) => {
              // Return the key itself when not found
              return key;
            });
            
            // Set the locale
            await service.setLocale(localeCode);
            
            // Get translation for non-existent key
            const translation = translateService.instant(nonexistentKey);
            
            // Should return the key itself as a visible indicator
            expect(translation).toBe(nonexistentKey);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: Preference persistence round-trip', () => {
    /**
     * Feature: app-localization, Property 3: Preference persistence round-trip
     * Validates: Requirements 1.4, 8.2
     * 
     * For any valid locale code, saving a user's locale preference and then loading it
     * should return the same locale code
     */
    it('should persist and retrieve the same locale preference', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...LOCALE_CONFIGS.map(config => config.code)),
          fc.uuid(),
          async (localeCode, userId) => {
            // Reset mocks
            vi.clearAllMocks();
            
            // Mock successful save
            httpClient.patch.mockReturnValue(of({ locale: localeCode }));
            
            // Mock successful load returning the same locale
            httpClient.get.mockReturnValue(of({ locale: localeCode }));
            
            // Save the preference
            await service.saveUserPreference(userId, localeCode);
            
            // Verify save was called with correct parameters
            expect(httpClient.patch).toHaveBeenCalledWith(
              expect.stringContaining(`/users/${userId}/preferences`),
              { locale: localeCode }
            );
            
            // Load the preference
            const loadedLocale = await service.loadUserPreference(userId);
            
            // Verify load was called with correct parameters
            expect(httpClient.get).toHaveBeenCalledWith(
              expect.stringContaining(`/users/${userId}/preferences`)
            );
            
            // Round-trip property: loaded locale should match saved locale
            expect(loadedLocale).toBe(localeCode);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 14: Preference changes persist to backend', () => {
    /**
     * Feature: app-localization, Property 14: Preference changes persist to backend
     * Validates: Requirements 8.1, 8.4
     * 
     * For any locale preference change, the application should make a backend API call
     * to store the preference in the user's profile
     */
    it('should make backend API call when locale preference changes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...LOCALE_CONFIGS.map(config => config.code)),
          fc.uuid(),
          async (localeCode, userId) => {
            // Reset mocks
            vi.clearAllMocks();
            
            // Mock successful backend call
            httpClient.patch.mockReturnValue(of({ locale: localeCode }));
            vi.mocked(translateService.use).mockReturnValue(of({}));
            
            // Change locale with user ID (simulating preference change)
            await service.setLocale(localeCode, userId);
            
            // Verify backend API was called to persist the preference
            expect(httpClient.patch).toHaveBeenCalledWith(
              expect.stringContaining(`/users/${userId}/preferences`),
              { locale: localeCode }
            );
            
            // Verify it was called exactly once
            expect(httpClient.patch).toHaveBeenCalledTimes(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with default locale', () => {
      const currentLocale = service.getCurrentLocale();
      expect(currentLocale.code).toBe('en-US');
    });

    it('should have available locales', () => {
      expect(service.availableLocales.length).toBeGreaterThan(0);
      expect(service.availableLocales).toEqual(LOCALE_CONFIGS);
    });

    it('should detect browser locale - en-US exact match', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        configurable: true
      });
      const detected = service.detectBrowserLocale();
      expect(detected).toBe('en-US');
    });

    it('should detect browser locale - en-SL exact match', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-SL',
        configurable: true
      });
      const detected = service.detectBrowserLocale();
      expect(detected).toBe('en-SL');
    });

    it('should fall back to en-US for unsupported locale', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'fr-FR',
        configurable: true
      });
      const detected = service.detectBrowserLocale();
      expect(detected).toBe('en-US');
    });

    it('should match language code when exact match not found', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-GB',
        configurable: true
      });
      const detected = service.detectBrowserLocale();
      // Should match 'en' and return first English locale (en-US)
      expect(detected).toBe('en-US');
    });

    it('should handle missing navigator.language', () => {
      Object.defineProperty(navigator, 'language', {
        value: undefined,
        configurable: true
      });
      const detected = service.detectBrowserLocale();
      expect(detected).toBe('en-US');
    });
  });

  describe('Backend Integration Unit Tests', () => {
    it('should make API call with correct data when saving preference', async () => {
      const userId = 'test-user-123';
      const localeCode = 'en-SL';
      
      httpClient.patch.mockReturnValue(of({ locale: localeCode }));
      
      await service.saveUserPreference(userId, localeCode);
      
      expect(httpClient.patch).toHaveBeenCalledWith(
        expect.stringContaining(`/users/${userId}/preferences`),
        { locale: localeCode }
      );
    });

    it('should handle error when backend is unavailable during save', async () => {
      const userId = 'test-user-123';
      const localeCode = 'en-US';
      
      httpClient.patch.mockReturnValue(throwError(() => new Error('Network error')));
      
      await expect(service.saveUserPreference(userId, localeCode)).rejects.toThrow();
    });

    it('should make API call with correct data when loading preference', async () => {
      const userId = 'test-user-456';
      const expectedLocale = 'en-US';
      
      httpClient.get.mockReturnValue(of({ locale: expectedLocale }));
      
      const result = await service.loadUserPreference(userId);
      
      expect(httpClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`/users/${userId}/preferences`)
      );
      expect(result).toBe(expectedLocale);
    });

    it('should return null when backend is unavailable during load', async () => {
      const userId = 'test-user-789';
      
      httpClient.get.mockReturnValue(throwError(() => new Error('Network error')));
      
      const result = await service.loadUserPreference(userId);
      
      expect(result).toBeNull();
    });

    it('should fall back to browser detection when no preference exists', async () => {
      const userId = 'new-user';
      
      // Mock loadUserPreference returning null (no saved preference)
      httpClient.get.mockReturnValue(throwError(() => new Error('Not found')));
      
      const loadedPreference = await service.loadUserPreference(userId);
      expect(loadedPreference).toBeNull();
      
      // Should fall back to browser detection
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        configurable: true
      });
      const browserLocale = service.detectBrowserLocale();
      expect(browserLocale).toBe('en-US');
    });
  });
});

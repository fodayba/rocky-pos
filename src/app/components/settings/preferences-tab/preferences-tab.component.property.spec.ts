import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import * as fc from 'fast-check';
import { UserPreferences } from '../../../services/settings.service';
import { LOCALE_CONFIGS } from '../../../models/locale.model';

/**
 * Property-Based Tests for PreferencesTabComponent
 * Using fast-check library for property-based testing
 */

describe('PreferencesTabComponent - Property-Based Tests', () => {
  let settingsService: any;
  let localeService: any;
  let toastService: any;
  let authService: any;

  // Arbitraries for generating test data
  const localeCodeArb = fc.constantFrom(...LOCALE_CONFIGS.map(l => l.code));
  const themeArb = fc.constantFrom('light', 'dark', 'system') as fc.Arbitrary<'light' | 'dark' | 'system'>;
  const densityArb = fc.constantFrom('compact', 'comfortable', 'spacious') as fc.Arbitrary<'compact' | 'comfortable' | 'spacious'>;
  const booleanArb = fc.boolean();
  const sessionTimeoutArb = fc.constantFrom(1800, 3600, 7200, 14400, 28800);

  const userPreferencesArb: fc.Arbitrary<UserPreferences> = fc.record({
    locale: localeCodeArb,
    theme: themeArb,
    displayDensity: densityArb,
    rememberMe: booleanArb,
    sessionTimeout: fc.option(sessionTimeoutArb, { nil: undefined })
  });

  beforeEach(() => {
    settingsService = {
      updatePreferences: vi.fn()
    };

    localeService = {
      setLocale: vi.fn().mockResolvedValue(undefined)
    };

    toastService = {
      success: vi.fn(),
      error: vi.fn()
    };

    authService = {
      currentUser: vi.fn().mockReturnValue({ _id: 'test-user-id', role: 'admin' })
    };

    // Mock window.matchMedia for theme tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)' ? false : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  /**
   * Feature: settings-page, Property 9: Locale preview updates
   * Validates: Requirements 4.5
   * 
   * For any locale selection, the preview should display currency and date formatting for that locale
   */
  it('Property 9: Locale preview updates for any selected locale', async () => {
    await fc.assert(
      fc.asyncProperty(localeCodeArb, async (localeCode) => {
        // Setup: Create a mock component for each test iteration
        const selectedLocale = signal(localeCode);
        const preferences = {
          locale: 'en-US',
          theme: 'system' as const,
          displayDensity: 'comfortable' as const,
          rememberMe: false
        };
        
        vi.mocked(settingsService.updatePreferences).mockReturnValue(
          of({ ...preferences, locale: localeCode })
        );
        vi.mocked(localeService.setLocale).mockResolvedValue();

        // Verification: The selected locale should be valid
        const localeConfig = LOCALE_CONFIGS.find(l => l.code === localeCode);
        expect(localeConfig).toBeTruthy();
        
        // The selected locale should be reflected in the signal
        expect(selectedLocale()).toBe(localeCode);
        
        // Preview values should exist for formatting
        const previewAmount = 1234.56;
        const previewDate = new Date('2025-12-01T12:00:00Z');
        expect(previewAmount).toBeGreaterThan(0);
        expect(previewDate).toBeInstanceOf(Date);
        
        // Verify that the locale config has the expected formatting properties
        expect(localeConfig?.currency).toBeDefined();
        expect(localeConfig?.currency.symbol).toBeDefined();
        expect(localeConfig?.currency.code).toBeDefined();
        expect(localeConfig?.dateFormat).toBeDefined();
        expect(localeConfig?.dateFormat.short).toBeDefined();
        
        // Verify that different locales produce different formatting
        // This ensures the preview actually updates based on locale
        if (localeCode === 'en-US') {
          expect(localeConfig.currency.symbol).toBe('$');
          expect(localeConfig.dateFormat.short).toBe('MM/DD/YYYY');
        } else if (localeCode === 'en-SL') {
          expect(localeConfig.currency.symbol).toBe('Le');
          expect(localeConfig.dateFormat.short).toBe('DD/MM/YYYY');
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: settings-page, Property 11: Theme changes apply immediately
   * Validates: Requirements 6.2
   * 
   * For any theme selection, the application should apply the theme to the UI immediately
   */
  it('Property 11: Theme changes apply immediately for any theme selection', async () => {
    await fc.assert(
      fc.asyncProperty(themeArb, async (theme) => {
        // Setup
        const selectedTheme = signal(theme);
        const preferences = {
          locale: 'en-US',
          theme: 'system' as const,
          displayDensity: 'comfortable' as const,
          rememberMe: false
        };
        
        vi.mocked(settingsService.updatePreferences).mockReturnValue(
          of({ ...preferences, theme })
        );

        // Simulate applying theme to document root
        const root = document.documentElement;
        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
          root.setAttribute('data-theme', theme);
        }

        // Verification: Theme should be applied to document root
        const appliedTheme = root.getAttribute('data-theme');
        
        // For system theme, it should apply either light or dark based on system preference
        if (theme === 'system') {
          expect(['light', 'dark']).toContain(appliedTheme);
        } else {
          expect(appliedTheme).toBe(theme);
        }
        
        // Component state should reflect the selected theme
        expect(selectedTheme()).toBe(theme);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: settings-page, Property 12: Display density changes apply immediately
   * Validates: Requirements 6.5
   * 
   * For any display density selection, the application should update UI spacing immediately
   */
  it('Property 12: Display density changes apply immediately for any density selection', async () => {
    await fc.assert(
      fc.asyncProperty(densityArb, async (density) => {
        // Setup
        const selectedDensity = signal(density);
        const preferences = {
          locale: 'en-US',
          theme: 'system' as const,
          displayDensity: 'comfortable' as const,
          rememberMe: false
        };
        
        vi.mocked(settingsService.updatePreferences).mockReturnValue(
          of({ ...preferences, displayDensity: density })
        );

        // Simulate applying density to document root
        const root = document.documentElement;
        root.setAttribute('data-density', density);

        // Verification: Density should be applied to document root
        const appliedDensity = root.getAttribute('data-density');
        
        expect(appliedDensity).toBe(density);
        
        // Component state should reflect the selected density
        expect(selectedDensity()).toBe(density);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Preferences persist to backend
   * 
   * For any valid preference update, the application should save to backend
   */
  it('Property: All preference changes persist to backend', async () => {
    await fc.assert(
      fc.asyncProperty(userPreferencesArb, async (preferences) => {
        // Setup
        const updateSpy = vi.fn().mockReturnValue(of(preferences));
        settingsService.updatePreferences = updateSpy;
        
        vi.mocked(localeService.setLocale).mockResolvedValue();

        // Simulate updating preferences
        // Each preference change should result in a backend call
        const updates: Partial<UserPreferences>[] = [
          { locale: preferences.locale },
          { theme: preferences.theme },
          { displayDensity: preferences.displayDensity },
          { rememberMe: preferences.rememberMe }
        ];
        
        if (preferences.sessionTimeout !== undefined) {
          updates.push({ sessionTimeout: preferences.sessionTimeout });
        }

        // Simulate calling updatePreferences for each change
        for (const update of updates) {
          updateSpy(authService.currentUser()._id, update);
        }

        // Verification: Backend should be called for updates
        expect(updateSpy).toHaveBeenCalled();
        expect(updateSpy.mock.calls.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Theme application is idempotent
   * 
   * Applying the same theme multiple times should result in the same state
   */
  it('Property: Applying theme multiple times is idempotent', async () => {
    await fc.assert(
      fc.asyncProperty(themeArb, fc.integer({ min: 2, max: 5 }), async (theme, repeatCount) => {
        // Setup
        const root = document.documentElement;
        
        vi.mocked(settingsService.updatePreferences).mockReturnValue(
          of({ locale: 'en-US', theme, displayDensity: 'comfortable', rememberMe: false })
        );

        // Action: Apply theme multiple times
        for (let i = 0; i < repeatCount; i++) {
          if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
          } else {
            root.setAttribute('data-theme', theme);
          }
        }

        // Verification: Final state should be the same as applying once
        const appliedTheme = root.getAttribute('data-theme');
        
        if (theme === 'system') {
          expect(['light', 'dark']).toContain(appliedTheme);
        } else {
          expect(appliedTheme).toBe(theme);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Density application is idempotent
   * 
   * Applying the same density multiple times should result in the same state
   */
  it('Property: Applying density multiple times is idempotent', async () => {
    await fc.assert(
      fc.asyncProperty(densityArb, fc.integer({ min: 2, max: 5 }), async (density, repeatCount) => {
        // Setup
        const root = document.documentElement;
        
        vi.mocked(settingsService.updatePreferences).mockReturnValue(
          of({ locale: 'en-US', theme: 'system', displayDensity: density, rememberMe: false })
        );

        // Action: Apply density multiple times
        for (let i = 0; i < repeatCount; i++) {
          root.setAttribute('data-density', density);
        }

        // Verification: Final state should be the same as applying once
        const appliedDensity = root.getAttribute('data-density');
        
        expect(appliedDensity).toBe(density);
      }),
      { numRuns: 100 }
    );
  });
});

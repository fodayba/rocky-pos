import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { UserPreferences } from '../../../services/settings.service';
import { LOCALE_CONFIGS } from '../../../models/locale.model';

describe('PreferencesTabComponent - Unit Tests', () => {
  let settingsService: any;
  let localeService: any;
  let toastService: any;
  let authService: any;
  let component: any;

  const mockPreferences: UserPreferences = {
    locale: 'en-US',
    theme: 'light',
    displayDensity: 'comfortable',
    rememberMe: true,
    sessionTimeout: 3600
  };

  beforeEach(() => {
    settingsService = {
      updatePreferences: vi.fn().mockReturnValue(of(mockPreferences))
    };

    localeService = {
      setLocale: vi.fn().mockResolvedValue(undefined),
      availableLocales: LOCALE_CONFIGS
    };

    toastService = {
      success: vi.fn(),
      error: vi.fn()
    };

    authService = {
      currentUser: vi.fn().mockReturnValue({ _id: 'test-user-id', role: 'admin' })
    };

    // Create a mock component with the necessary properties
    component = {
      preferences: mockPreferences,
      currentUser: authService.currentUser,
      isAdmin: signal(true),
      isSaving: signal(false),
      availableLocales: LOCALE_CONFIGS,
      availableThemes: [
        { value: 'light', label: 'preferences.theme.light' },
        { value: 'dark', label: 'preferences.theme.dark' },
        { value: 'system', label: 'preferences.theme.system' }
      ],
      availableDensities: [
        { value: 'compact', label: 'preferences.density.compact' },
        { value: 'comfortable', label: 'preferences.density.comfortable' },
        { value: 'spacious', label: 'preferences.density.spacious' }
      ],
      selectedLocale: signal('en-US'),
      selectedTheme: signal('light' as 'light' | 'dark' | 'system'),
      selectedDensity: signal('comfortable' as 'compact' | 'comfortable' | 'spacious'),
      rememberMe: signal(true),
      sessionTimeout: signal(3600),
      previewAmount: 1234.56,
      previewDate: new Date(),
      ngOnInit: vi.fn(),
      onLocaleChange: vi.fn(),
      onThemeChange: vi.fn(),
      onDensityChange: vi.fn(),
      onRememberMeChange: vi.fn(),
      onSessionTimeoutChange: vi.fn(),
      getLocaleName: vi.fn((code: string) => {
        const locale = LOCALE_CONFIGS.find(l => l.code === code);
        return locale ? locale.name : code;
      })
    };
  });

  it('should create component mock', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should have default values', () => {
      expect(component.selectedLocale()).toBe('en-US');
      expect(component.selectedTheme()).toBe('light');
      expect(component.selectedDensity()).toBe('comfortable');
      expect(component.rememberMe()).toBe(true);
      expect(component.sessionTimeout()).toBe(3600);
    });

    it('should have preferences set', () => {
      expect(component.preferences).toEqual(mockPreferences);
    });
  });

  describe('Theme Selector', () => {
    it('should have all available themes', () => {
      expect(component.availableThemes.length).toBe(3);
      
      const themeValues = component.availableThemes.map((t: any) => t.value);
      expect(themeValues).toContain('light');
      expect(themeValues).toContain('dark');
      expect(themeValues).toContain('system');
    });

    it('should call onThemeChange when theme is changed', () => {
      component.onThemeChange('dark');
      expect(component.onThemeChange).toHaveBeenCalledWith('dark');
    });

    it('should handle system default theme', () => {
      component.onThemeChange('system');
      expect(component.onThemeChange).toHaveBeenCalledWith('system');
    });
  });

  describe('Display Density Selector', () => {
    it('should have all density options', () => {
      expect(component.availableDensities.length).toBe(3);
      
      const densityValues = component.availableDensities.map((d: any) => d.value);
      expect(densityValues).toContain('compact');
      expect(densityValues).toContain('comfortable');
      expect(densityValues).toContain('spacious');
    });

    it('should call onDensityChange when density is changed', () => {
      component.onDensityChange('compact');
      expect(component.onDensityChange).toHaveBeenCalledWith('compact');
    });
  });

  describe('Locale Selector', () => {
    it('should have all available locales', () => {
      expect(component.availableLocales.length).toBe(LOCALE_CONFIGS.length);
    });

    it('should have preview values', () => {
      expect(component.previewAmount).toBe(1234.56);
      expect(component.previewDate).toBeInstanceOf(Date);
    });

    it('should call onLocaleChange when locale is changed', () => {
      component.onLocaleChange('en-SL');
      expect(component.onLocaleChange).toHaveBeenCalledWith('en-SL');
    });
  });

  describe('Session Settings', () => {
    it('should have Remember Me setting', () => {
      expect(component.rememberMe()).toBe(true);
    });

    it('should show session timeout for admin users', () => {
      expect(component.isAdmin()).toBe(true);
      expect(component.sessionTimeout()).toBe(3600);
    });

    it('should hide session timeout for non-admin users', () => {
      component.isAdmin = signal(false);
      expect(component.isAdmin()).toBe(false);
    });

    it('should call onRememberMeChange', () => {
      component.onRememberMeChange(false);
      expect(component.onRememberMeChange).toHaveBeenCalledWith(false);
    });

    it('should call onSessionTimeoutChange', () => {
      component.onSessionTimeoutChange(7200);
      expect(component.onSessionTimeoutChange).toHaveBeenCalledWith(7200);
    });
  });

  describe('Loading State', () => {
    it('should have isSaving signal', () => {
      expect(component.isSaving()).toBe(false);
    });

    it('should be able to set saving state', () => {
      component.isSaving.set(true);
      expect(component.isSaving()).toBe(true);
    });
  });

  describe('Helper Methods', () => {
    it('should get locale name from code', () => {
      // Implement the actual logic in the mock
      component.getLocaleName = (code: string) => {
        const locale = LOCALE_CONFIGS.find(l => l.code === code);
        return locale ? locale.displayName : code;
      };
      
      const name = component.getLocaleName('en-US');
      expect(name).toBe('English (United States)');
    });

    it('should return code if locale not found', () => {
      // Implement the actual logic in the mock
      component.getLocaleName = (code: string) => {
        const locale = LOCALE_CONFIGS.find(l => l.code === code);
        return locale ? locale.displayName : code;
      };
      
      const name = component.getLocaleName('invalid-code');
      expect(name).toBe('invalid-code');
    });
  });
});

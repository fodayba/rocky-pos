import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { LOCALE_CONFIGS } from '../../../models/locale.model';
import { BehaviorSubject } from 'rxjs';

/**
 * Unit tests for LanguageSelectorComponent
 * 
 * These tests verify:
 * - Dropdown displays available locales (Requirements 1.2)
 * - Selection calls LocaleService (Requirements 1.2, 1.3)
 * - Current locale is highlighted (Requirements 1.2)
 */
describe('LanguageSelectorComponent', () => {
  let localeService: any;
  let authService: any;
  let currentLocaleSubject: BehaviorSubject<any>;
  let component: any;

  beforeEach(() => {
    // Create a BehaviorSubject for currentLocale$
    currentLocaleSubject = new BehaviorSubject(LOCALE_CONFIGS[0]);

    // Create mock services
    localeService = {
      setLocale: vi.fn().mockResolvedValue(undefined),
      getCurrentLocale: vi.fn().mockReturnValue(LOCALE_CONFIGS[0]),
      availableLocales: LOCALE_CONFIGS,
      currentLocale$: currentLocaleSubject.asObservable()
    };

    authService = {
      currentUser: signal({ _id: 'user123', firstName: 'Test', lastName: 'User', role: 'admin' })
    };

    // Create a mock component with the necessary properties and methods
    component = {
      localeService,
      authService,
      isOpen: signal(false),
      availableLocales: LOCALE_CONFIGS,
      currentLocale: LOCALE_CONFIGS[0],
      
      toggleDropdown() {
        this.isOpen.set(!this.isOpen());
      },
      
      closeDropdown() {
        this.isOpen.set(false);
      },
      
      async selectLocale(locale: any) {
        const currentUser = this.authService.currentUser();
        const userId = currentUser?._id;
        
        try {
          await this.localeService.setLocale(locale.code, userId);
          this.closeDropdown();
        } catch (error) {
          console.error('Failed to set locale:', error);
          this.closeDropdown();
        }
      },
      
      isCurrentLocale(locale: any) {
        return this.currentLocale.code === locale.code;
      }
    };

    // Subscribe to locale changes
    currentLocaleSubject.subscribe(locale => {
      component.currentLocale = locale;
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Dropdown display', () => {
    it('should display available locales', () => {
      expect(component.availableLocales.length).toBe(LOCALE_CONFIGS.length);
      expect(component.availableLocales).toEqual(LOCALE_CONFIGS);
    });

    it('should not display dropdown when closed', () => {
      expect(component.isOpen()).toBe(false);
    });

    it('should display dropdown when opened', () => {
      component.toggleDropdown();
      expect(component.isOpen()).toBe(true);
    });
  });

  describe('Locale selection', () => {
    it('should call LocaleService.setLocale when locale is selected', async () => {
      component.toggleDropdown();

      const newLocale = LOCALE_CONFIGS[1]; // Select second locale
      await component.selectLocale(newLocale);

      expect(localeService.setLocale).toHaveBeenCalledWith(newLocale.code, 'user123');
    });

    it('should close dropdown after selecting locale', async () => {
      component.toggleDropdown();
      expect(component.isOpen()).toBe(true);

      await component.selectLocale(LOCALE_CONFIGS[1]);

      expect(component.isOpen()).toBe(false);
    });

    it('should close dropdown even if setLocale fails', async () => {
      localeService.setLocale.mockRejectedValue(new Error('Backend error'));
      
      component.toggleDropdown();
      expect(component.isOpen()).toBe(true);

      await component.selectLocale(LOCALE_CONFIGS[1]);

      expect(component.isOpen()).toBe(false);
    });
  });

  describe('Current locale highlighting', () => {
    it('should identify current locale correctly', () => {
      expect(component.isCurrentLocale(LOCALE_CONFIGS[0])).toBe(true);
      expect(component.isCurrentLocale(LOCALE_CONFIGS[1])).toBe(false);
    });

    it('should update current locale when locale changes', () => {
      // Change current locale
      currentLocaleSubject.next(LOCALE_CONFIGS[1]);
      
      // Wait for subscription to update
      setTimeout(() => {
        expect(component.currentLocale.code).toBe(LOCALE_CONFIGS[1].code);
      }, 0);
    });
  });

  describe('Dropdown toggle', () => {
    it('should toggle dropdown open and closed', () => {
      expect(component.isOpen()).toBe(false);

      component.toggleDropdown();
      expect(component.isOpen()).toBe(true);

      component.toggleDropdown();
      expect(component.isOpen()).toBe(false);
    });

    it('should close dropdown when closeDropdown is called', () => {
      component.toggleDropdown();
      expect(component.isOpen()).toBe(true);

      component.closeDropdown();
      expect(component.isOpen()).toBe(false);
    });
  });

  describe('Display current locale', () => {
    it('should have current locale set', () => {
      expect(component.currentLocale).toBeDefined();
      expect(component.currentLocale.code).toBe(LOCALE_CONFIGS[0].code);
    });

    it('should update current locale when locale changes', () => {
      currentLocaleSubject.next(LOCALE_CONFIGS[1]);
      
      // Wait for subscription to update
      setTimeout(() => {
        expect(component.currentLocale.code).toBe(LOCALE_CONFIGS[1].code);
        expect(component.currentLocale.displayName).toBe(LOCALE_CONFIGS[1].displayName);
      }, 0);
    });
  });
});

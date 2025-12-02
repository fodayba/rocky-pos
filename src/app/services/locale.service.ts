import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { LocaleConfig, LOCALE_CONFIGS, DEFAULT_LOCALE } from '../models/locale.model';
import { environment } from '../../environments/environment';

/**
 * Service for managing application locale and regional settings
 */
@Injectable({
  providedIn: 'root'
})
export class LocaleService {
  private currentLocaleSubject: BehaviorSubject<LocaleConfig>;
  public currentLocale$: Observable<LocaleConfig>;
  public availableLocales: LocaleConfig[] = LOCALE_CONFIGS;
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private translateService: TranslateService,
    private http: HttpClient
  ) {
    // Initialize with default locale
    const initialLocale = this.getLocaleConfig(DEFAULT_LOCALE);
    this.currentLocaleSubject = new BehaviorSubject<LocaleConfig>(initialLocale);
    this.currentLocale$ = this.currentLocaleSubject.asObservable();
    
    // Set default language in TranslateService
    this.translateService.setDefaultLang(DEFAULT_LOCALE);
    this.translateService.use(DEFAULT_LOCALE);
  }

  /**
   * Set the current locale
   * @param localeCode - The locale code to set (e.g., 'en-US', 'en-SL')
   * @param userId - Optional user ID to save preference to backend
   * @returns Promise that resolves when locale is set
   */
  async setLocale(localeCode: string, userId?: string): Promise<void> {
    const localeConfig = this.getLocaleConfig(localeCode);
    
    if (!localeConfig) {
      console.warn(`Locale ${localeCode} not found, falling back to ${DEFAULT_LOCALE}`);
      return this.setLocale(DEFAULT_LOCALE, userId);
    }

    // Update TranslateService
    await firstValueFrom(this.translateService.use(localeCode));
    
    // Update current locale
    this.currentLocaleSubject.next(localeConfig);

    // Save to backend if user ID is provided
    if (userId) {
      await this.saveUserPreference(userId, localeCode);
    }
  }

  /**
   * Get the current locale configuration
   * @returns Current LocaleConfig
   */
  getCurrentLocale(): LocaleConfig {
    return this.currentLocaleSubject.value;
  }

  /**
   * Detect browser locale from navigator.language
   * @returns Detected locale code or default locale if not supported
   */
  detectBrowserLocale(): string {
    if (typeof navigator === 'undefined') {
      return DEFAULT_LOCALE;
    }

    const browserLang = navigator.language || (navigator as any).userLanguage;
    
    if (!browserLang) {
      return DEFAULT_LOCALE;
    }

    // Check if we have an exact match
    const exactMatch = LOCALE_CONFIGS.find(
      config => config.code.toLowerCase() === browserLang.toLowerCase()
    );
    
    if (exactMatch) {
      return exactMatch.code;
    }

    // Check if we have a language match (e.g., 'en' matches 'en-US')
    const languageCode = browserLang.split('-')[0].toLowerCase();
    const languageMatch = LOCALE_CONFIGS.find(
      config => config.language.toLowerCase() === languageCode
    );
    
    if (languageMatch) {
      return languageMatch.code;
    }

    // Fall back to default locale
    return DEFAULT_LOCALE;
  }

  /**
   * Load user's locale preference from backend
   * @param userId - The user ID to load preferences for
   * @returns Promise that resolves to the locale code or null if not found
   */
  async loadUserPreference(userId: string): Promise<string | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ locale: string }>(`${this.apiUrl}/users/${userId}/preferences`)
      );
      return response.locale;
    } catch (error) {
      console.warn('Failed to load user locale preference:', error);
      return null;
    }
  }

  /**
   * Save user's locale preference to backend
   * @param userId - The user ID to save preferences for
   * @param localeCode - The locale code to save
   * @returns Promise that resolves when preference is saved
   */
  async saveUserPreference(userId: string, localeCode: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/users/${userId}/preferences`, { locale: localeCode })
      );
    } catch (error) {
      console.error('Failed to save user locale preference:', error);
      throw error;
    }
  }

  /**
   * Get locale configuration by code
   * @param localeCode - The locale code to look up
   * @returns LocaleConfig or undefined if not found
   */
  private getLocaleConfig(localeCode: string): LocaleConfig {
    const config = LOCALE_CONFIGS.find(
      locale => locale.code.toLowerCase() === localeCode.toLowerCase()
    );
    
    return config || LOCALE_CONFIGS.find(locale => locale.code === DEFAULT_LOCALE)!;
  }
}

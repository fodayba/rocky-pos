import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, catchError, map, of } from 'rxjs';

/**
 * Custom TranslateLoader that validates translation files before loading
 * Implements validation for JSON structure and required fields
 */
export class ValidatedTranslateLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private prefix: string = '/assets/i18n/',
    private suffix: string = '.json'
  ) {}

  /**
   * Load and validate translation file
   * @param lang - Language code to load
   * @returns Observable of translation object
   */
  getTranslation(lang: string): Observable<any> {
    const path = `${this.prefix}${lang}${this.suffix}`;
    
    return this.http.get(path).pipe(
      map((translations: any) => {
        // Validate the translation file
        if (!this.isValidTranslationFile(translations, lang)) {
          console.error(`Invalid translation file structure for locale: ${lang}`);
          // Return empty object to allow app to continue with fallback
          return {};
        }
        
        return translations;
      }),
      catchError((error) => {
        console.error(`Failed to load translation file for locale: ${lang}`, error);
        // Return empty object to allow app to continue with fallback
        return of({});
      })
    );
  }

  /**
   * Validate translation file structure
   * @param translations - Translation object to validate
   * @param lang - Language code for logging
   * @returns True if valid, false otherwise
   */
  private isValidTranslationFile(translations: any, lang: string): boolean {
    // Check if translations is an object
    if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
      console.error(`Translation file for ${lang} is not a valid object`);
      return false;
    }

    // Check if the object has at least one key
    const keys = Object.keys(translations);
    if (keys.length === 0) {
      console.warn(`Translation file for ${lang} is empty`);
      return true; // Empty is technically valid, just warn
    }

    // Validate that all values are either strings or nested objects
    const isValid = this.validateTranslationStructure(translations, lang, '');
    
    return isValid;
  }

  /**
   * Recursively validate translation structure
   * @param obj - Object to validate
   * @param lang - Language code for logging
   * @param path - Current path in the object tree
   * @returns True if valid, false otherwise
   */
  private validateTranslationStructure(obj: any, lang: string, path: string): boolean {
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (value === null || value === undefined) {
        console.warn(`Translation key "${currentPath}" in ${lang} has null/undefined value`);
        continue;
      }

      if (typeof value === 'string') {
        // Valid: string value
        continue;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Valid: nested object, recurse
        if (!this.validateTranslationStructure(value, lang, currentPath)) {
          return false;
        }
      } else {
        // Invalid: arrays or other types are not allowed
        console.error(`Translation key "${currentPath}" in ${lang} has invalid type: ${typeof value}`);
        return false;
      }
    }

    return true;
  }
}

/**
 * Factory function for creating ValidatedTranslateLoader
 * @param http - HttpClient instance
 * @returns ValidatedTranslateLoader instance
 */
export function createValidatedTranslateLoader(http: HttpClient): ValidatedTranslateLoader {
  return new ValidatedTranslateLoader(http, '/assets/i18n/', '.json');
}

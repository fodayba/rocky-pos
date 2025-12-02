import { Injectable } from '@angular/core';
import { LocaleService } from './locale.service';

/**
 * Service that updates the document's lang attribute when locale changes
 * This is important for accessibility and SEO
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentLanguageService {
  constructor(private localeService: LocaleService) {}

  /**
   * Initialize the service by subscribing to locale changes
   * This should be called during app initialization
   */
  initialize(): void {
    // Subscribe to locale changes and update document language
    this.localeService.currentLocale$.subscribe(locale => {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = locale.code;
      }
    });
  }
}

/**
 * Factory function to initialize the DocumentLanguageService
 * This is used as an APP_INITIALIZER
 */
export function initializeDocumentLanguage(service: DocumentLanguageService): () => void {
  return () => {
    service.initialize();
  };
}

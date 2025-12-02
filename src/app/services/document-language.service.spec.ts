import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentLanguageService } from './document-language.service';
import { BehaviorSubject } from 'rxjs';
import { LocaleConfig, LOCALE_CONFIGS } from '../models/locale.model';

describe('DocumentLanguageService', () => {
  let service: DocumentLanguageService;
  let currentLocaleSubject: BehaviorSubject<LocaleConfig>;

  beforeEach(() => {
    // Create a mock locale subject
    currentLocaleSubject = new BehaviorSubject<LocaleConfig>(LOCALE_CONFIGS[0]);

    // Create mock LocaleService
    const mockLocaleService = {
      currentLocale$: currentLocaleSubject.asObservable()
    } as any;

    // Create service instance with mock
    service = new DocumentLanguageService();
    (service as any).localeService = mockLocaleService;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update document.documentElement.lang when locale changes', () => {
    // Initialize the service
    service.initialize();

    // Initial locale should be set
    expect(document.documentElement.lang).toBe('en-US');

    // Change locale to en-SL
    currentLocaleSubject.next(LOCALE_CONFIGS[1]);

    // Document lang should be updated
    expect(document.documentElement.lang).toBe('en-SL');
  });

  it('should update document.documentElement.lang back to en-US', () => {
    // Initialize the service
    service.initialize();

    // Change to en-SL first
    currentLocaleSubject.next(LOCALE_CONFIGS[1]);
    expect(document.documentElement.lang).toBe('en-SL');

    // Change back to en-US
    currentLocaleSubject.next(LOCALE_CONFIGS[0]);
    expect(document.documentElement.lang).toBe('en-US');
  });
});

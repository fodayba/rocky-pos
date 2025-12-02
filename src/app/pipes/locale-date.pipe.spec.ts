import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocaleDatePipe } from './locale-date.pipe';
import { LocaleService } from '../services/locale.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('LocaleDatePipe', () => {
  let pipe: LocaleDatePipe;
  let localeService: LocaleService;
  let translateService: TranslateService;

  beforeEach(() => {
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

    localeService = new LocaleService(translateService);
    pipe = new LocaleDatePipe(localeService);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('US locale (en-US)', () => {
    beforeEach(async () => {
      await localeService.setLocale('en-US');
    });

    it('should format dates as MM/DD/YYYY', () => {
      const date = new Date('2025-12-01T10:30:00');
      const result = pipe.transform(date, 'short');
      expect(result).toBe('12/01/2025');
    });

    it('should format dates with single digit day', () => {
      const date = new Date('2025-01-05T10:30:00');
      const result = pipe.transform(date, 'short');
      expect(result).toBe('01/05/2025');
    });

    it('should format dates with single digit month', () => {
      const date = new Date('2025-03-15T10:30:00');
      const result = pipe.transform(date, 'short');
      expect(result).toBe('03/15/2025');
    });

    it('should use 12-hour time with AM/PM', () => {
      const dateAM = new Date('2025-12-01T09:30:00');
      const resultAM = pipe.transform(dateAM, 'time');
      expect(resultAM).toBe('9:30 AM');

      const datePM = new Date('2025-12-01T15:45:00');
      const resultPM = pipe.transform(datePM, 'time');
      expect(resultPM).toBe('3:45 PM');
    });

    it('should handle midnight correctly', () => {
      const date = new Date('2025-12-01T00:00:00');
      const result = pipe.transform(date, 'time');
      expect(result).toBe('12:00 AM');
    });

    it('should handle noon correctly', () => {
      const date = new Date('2025-12-01T12:00:00');
      const result = pipe.transform(date, 'time');
      expect(result).toBe('12:00 PM');
    });
  });

  describe('Sierra Leone locale (en-SL)', () => {
    beforeEach(async () => {
      await localeService.setLocale('en-SL');
    });

    it('should format dates as DD/MM/YYYY', () => {
      const date = new Date('2025-12-01T10:30:00');
      const result = pipe.transform(date, 'short');
      expect(result).toBe('01/12/2025');
    });

    it('should format dates with single digit day', () => {
      const date = new Date('2025-01-05T10:30:00');
      const result = pipe.transform(date, 'short');
      expect(result).toBe('05/01/2025');
    });

    it('should format dates with single digit month', () => {
      const date = new Date('2025-03-15T10:30:00');
      const result = pipe.transform(date, 'short');
      expect(result).toBe('15/03/2025');
    });

    it('should use 24-hour time', () => {
      const dateMorning = new Date('2025-12-01T09:30:00');
      const resultMorning = pipe.transform(dateMorning, 'time');
      expect(resultMorning).toBe('09:30');

      const dateAfternoon = new Date('2025-12-01T15:45:00');
      const resultAfternoon = pipe.transform(dateAfternoon, 'time');
      expect(resultAfternoon).toBe('15:45');
    });

    it('should handle midnight correctly in 24-hour format', () => {
      const date = new Date('2025-12-01T00:00:00');
      const result = pipe.transform(date, 'time');
      expect(result).toBe('00:00');
    });

    it('should handle noon correctly in 24-hour format', () => {
      const date = new Date('2025-12-01T12:00:00');
      const result = pipe.transform(date, 'time');
      expect(result).toBe('12:00');
    });
  });

  describe('long date format', () => {
    it('should format US locale long dates', async () => {
      await localeService.setLocale('en-US');
      const date = new Date('2025-12-01T10:30:00');
      const result = pipe.transform(date, 'long');
      expect(result).toBe('December 1, 2025');
    });

    it('should format SL locale long dates', async () => {
      await localeService.setLocale('en-SL');
      const date = new Date('2025-12-01T10:30:00');
      const result = pipe.transform(date, 'long');
      expect(result).toBe('1 December 2025');
    });
  });

  describe('datetime format', () => {
    it('should format US locale datetime', async () => {
      await localeService.setLocale('en-US');
      const date = new Date('2025-12-01T15:30:00');
      const result = pipe.transform(date, 'datetime');
      expect(result).toBe('12/01/2025 3:30 PM');
    });

    it('should format SL locale datetime', async () => {
      await localeService.setLocale('en-SL');
      const date = new Date('2025-12-01T15:30:00');
      const result = pipe.transform(date, 'datetime');
      expect(result).toBe('01/12/2025 15:30');
    });
  });

  describe('edge cases', () => {
    beforeEach(async () => {
      await localeService.setLocale('en-US');
    });

    it('should return empty string for null', () => {
      const result = pipe.transform(null);
      expect(result).toBe('');
    });

    it('should return empty string for undefined', () => {
      const result = pipe.transform(undefined);
      expect(result).toBe('');
    });

    it('should handle ISO date strings', () => {
      const result = pipe.transform('2025-12-01T10:30:00Z', 'short');
      expect(result).toMatch(/\d{2}\/\d{2}\/2025/);
    });

    it('should return original value for invalid dates', () => {
      const result = pipe.transform('invalid-date');
      expect(result).toBe('invalid-date');
    });
  });
});

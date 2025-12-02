import { Component, OnInit, Input, Output, EventEmitter, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService, UserPreferences } from '../../../services/settings.service';
import { LocaleService } from '../../../services/locale.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';
import { LocaleCurrencyPipe } from '../../../pipes/locale-currency.pipe';
import { LocaleDatePipe } from '../../../pipes/locale-date.pipe';
import { LOCALE_CONFIGS } from '../../../models/locale.model';

@Component({
  selector: 'app-preferences-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LocaleCurrencyPipe, LocaleDatePipe],
  templateUrl: './preferences-tab.component.html',
  styleUrl: './preferences-tab.component.css'
})
export class PreferencesTabComponent implements OnInit {
  @Input() preferences: UserPreferences | null = null;
  @Output() unsavedChanges = new EventEmitter<boolean>();

  private settingsService = inject(SettingsService);
  private localeService = inject(LocaleService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  
  isSaving = signal(false);
  
  // Available options
  availableLocales = LOCALE_CONFIGS;
  availableThemes: Array<{ value: 'light' | 'dark' | 'system', label: string }> = [
    { value: 'light', label: 'preferences.theme.light' },
    { value: 'dark', label: 'preferences.theme.dark' },
    { value: 'system', label: 'preferences.theme.system' }
  ];
  availableDensities: Array<{ value: 'compact' | 'comfortable' | 'spacious', label: string }> = [
    { value: 'compact', label: 'preferences.density.compact' },
    { value: 'comfortable', label: 'preferences.density.comfortable' },
    { value: 'spacious', label: 'preferences.density.spacious' }
  ];

  // Local state for form
  selectedLocale = signal<string>('en-US');
  selectedTheme = signal<'light' | 'dark' | 'system'>('system');
  selectedDensity = signal<'compact' | 'comfortable' | 'spacious'>('comfortable');
  rememberMe = signal<boolean>(false);
  sessionTimeout = signal<number>(3600);

  // Preview values
  previewAmount = 1234.56;
  previewDate = new Date();

  ngOnInit(): void {
    if (this.preferences) {
      this.selectedLocale.set(this.preferences.locale || 'en-US');
      this.selectedTheme.set(this.preferences.theme || 'system');
      this.selectedDensity.set(this.preferences.displayDensity || 'comfortable');
      this.rememberMe.set(this.preferences.rememberMe || false);
      this.sessionTimeout.set(this.preferences.sessionTimeout || 3600);
    }
  }

  async onLocaleChange(localeCode: string): Promise<void> {
    this.selectedLocale.set(localeCode);
    const userId = this.currentUser()?.id;
    
    if (userId) {
      this.isSaving.set(true);
      try {
        // Update locale in LocaleService (which handles translation)
        await this.localeService.setLocale(localeCode, userId);
        
        // Also update in preferences
        await this.savePreferences({ locale: localeCode });
        
        this.toastService.success('Locale updated successfully');
      } catch (error) {
        console.error('Failed to update locale:', error);
        this.toastService.error('Failed to update locale');
      } finally {
        this.isSaving.set(false);
      }
    }
  }

  onThemeChange(theme: 'light' | 'dark' | 'system'): void {
    this.selectedTheme.set(theme);
    this.applyTheme(theme);
    this.savePreferences({ theme });
  }

  onDensityChange(density: 'compact' | 'comfortable' | 'spacious'): void {
    this.selectedDensity.set(density);
    this.applyDensity(density);
    this.savePreferences({ displayDensity: density });
  }

  onRememberMeChange(enabled: boolean): void {
    this.rememberMe.set(enabled);
    this.savePreferences({ rememberMe: enabled });
  }

  onSessionTimeoutChange(timeout: number): void {
    this.sessionTimeout.set(timeout);
    this.savePreferences({ sessionTimeout: timeout });
  }

  private applyTheme(theme: 'light' | 'dark' | 'system'): void {
    const root = document.documentElement;
    
    if (theme === 'system') {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }

  private applyDensity(density: 'compact' | 'comfortable' | 'spacious'): void {
    const root = document.documentElement;
    root.setAttribute('data-density', density);
  }

  private async savePreferences(updates: Partial<UserPreferences>): Promise<void> {
    const userId = this.currentUser()?.id;
    if (!userId) return;

    this.isSaving.set(true);
    
    try {
      await new Promise<void>((resolve, reject) => {
        this.settingsService.updatePreferences(userId, updates).subscribe({
          next: (updatedPrefs) => {
            // Update local preferences
            if (this.preferences) {
              Object.assign(this.preferences, updatedPrefs);
            }
            resolve();
          },
          error: (error) => reject(error)
        });
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    } finally {
      this.isSaving.set(false);
    }
  }

  getLocaleName(localeCode: string): string {
    const locale = this.availableLocales.find(l => l.code === localeCode);
    return locale ? locale.displayName : localeCode;
  }
}

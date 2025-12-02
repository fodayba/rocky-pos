import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LocaleService } from '../../../services/locale.service';
import { AuthService } from '../../../services/auth.service';
import { LocaleConfig } from '../../../models/locale.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule, IconComponent],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css'
})
export class LanguageSelectorComponent {
  private localeService = inject(LocaleService);
  private authService = inject(AuthService);

  isOpen = signal(false);
  availableLocales: LocaleConfig[] = this.localeService.availableLocales;
  currentLocale = this.localeService.getCurrentLocale();

  constructor() {
    // Subscribe to locale changes to update current locale display
    this.localeService.currentLocale$.subscribe(locale => {
      this.currentLocale = locale;
    });
  }

  toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  async selectLocale(locale: LocaleConfig): Promise<void> {
    const currentUser = this.authService.currentUser();
    const userId = currentUser?._id;

    try {
      await this.localeService.setLocale(locale.code, userId);
      this.closeDropdown();
    } catch (error) {
      console.error('Failed to set locale:', error);
      // Still close dropdown even if backend save fails
      this.closeDropdown();
    }
  }

  isCurrentLocale(locale: LocaleConfig): boolean {
    return this.currentLocale.code === locale.code;
  }
}

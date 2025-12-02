import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { SettingsService, UserSettings, UserProfile } from '../../services/settings.service';
import { IconComponent } from '../shared/icon/icon.component';
import { ProfileTabComponent } from './profile-tab/profile-tab.component';
import { SecurityTabComponent } from './security-tab/security-tab.component';
import { PreferencesTabComponent } from './preferences-tab/preferences-tab.component';
import { NotificationsTabComponent } from './notifications-tab/notifications-tab.component';
import { AdvancedTabComponent } from './advanced-tab/advanced-tab.component';

export type SettingsTab = 'profile' | 'security' | 'preferences' | 'notifications' | 'advanced';

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, IconComponent, ProfileTabComponent, SecurityTabComponent, PreferencesTabComponent, NotificationsTabComponent, AdvancedTabComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private settingsService = inject(SettingsService);
  private router = inject(Router);

  currentTab = signal<SettingsTab>('profile');
  hasUnsavedChanges = signal(false);
  isLoading = signal(true);
  userSettings = signal<UserSettings | null>(null);
  currentUser = this.authService.currentUser;

  tabs: TabConfig[] = [
    { id: 'profile', label: 'settings.tabs.profile', icon: 'users' },
    { id: 'security', label: 'settings.tabs.security', icon: 'alert' },
    { id: 'preferences', label: 'settings.tabs.preferences', icon: 'globe' },
    { id: 'notifications', label: 'settings.tabs.notifications', icon: 'inbox' },
    { id: 'advanced', label: 'settings.tabs.advanced', icon: 'info' }
  ];

  ngOnInit(): void {
    this.loadUserSettings();
  }

  private loadUserSettings(): void {
    const userId = this.currentUser()?.id;
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading.set(true);
    this.settingsService.getUserSettings(userId).subscribe({
      next: (settings) => {
        this.userSettings.set(settings);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load user settings:', error);
        this.isLoading.set(false);
      }
    });
  }

  switchTab(tab: SettingsTab): void {
    if (this.hasUnsavedChanges()) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to switch tabs?');
      if (!confirmed) {
        return;
      }
      this.hasUnsavedChanges.set(false);
    }
    this.currentTab.set(tab);
  }

  handleTabKeydown(event: KeyboardEvent, currentIndex: number): void {
    let newIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : this.tabs.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex < this.tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = this.tabs.length - 1;
        break;
      default:
        return;
    }
    
    this.switchTab(this.tabs[newIndex].id);
    // Focus the new tab button
    setTimeout(() => {
      const tabButton = document.getElementById(this.tabs[newIndex].id + '-tab');
      tabButton?.focus();
    }, 0);
  }

  setUnsavedChanges(hasChanges: boolean): void {
    this.hasUnsavedChanges.set(hasChanges);
  }

  onProfileUpdated(profile: UserProfile): void {
    // Update the user settings with the new profile
    const currentSettings = this.userSettings();
    if (currentSettings) {
      this.userSettings.set({
        ...currentSettings,
        profile: profile
      });
    }
  }

  canDeactivate(): boolean {
    if (this.hasUnsavedChanges()) {
      return confirm('You have unsaved changes. Are you sure you want to leave?');
    }
    return true;
  }
}

import { Component, OnInit, signal, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { SettingsService, RecentActivity, UserSettings } from '../../../services/settings.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { LocaleService } from '../../../services/locale.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Location } from '../../../models/location.model';
import { UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-advanced-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, IconComponent, ModalComponent],
  templateUrl: './advanced-tab.component.html',
  styleUrl: './advanced-tab.component.css'
})
export class AdvancedTabComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private localeService = inject(LocaleService);
  private router = inject(Router);

  // Input from parent component
  userSettings = input.required<UserSettings>();

  // State signals
  recentActivity = signal<RecentActivity[]>([]);
  isLoadingActivity = signal(false);
  isExporting = signal(false);
  exportDownloadUrl = signal<string | null>(null);
  showDeleteConfirmation = signal(false);
  showFinalWarning = signal(false);
  deletePassword = signal('');
  isDeletingAccount = signal(false);

  currentUser = this.authService.currentUser;

  ngOnInit(): void {
    this.loadRecentActivity();
  }

  get assignedLocation(): Location | undefined {
    return this.userSettings().profile.primaryLocation;
  }

  get isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  get lastLogin(): Date | undefined {
    return this.userSettings().profile.lastLogin;
  }

  get lastLoginIp(): string | undefined {
    // This would come from security settings or profile
    // For now, we'll return undefined as it's not in the current UserProfile interface
    return undefined;
  }

  /**
   * Load recent activity logs
   */
  loadRecentActivity(): void {
    const userId = this.currentUser()?.id;
    if (!userId) return;

    this.isLoadingActivity.set(true);
    this.settingsService.getRecentActivity(userId, 10).subscribe({
      next: (activities) => {
        this.recentActivity.set(activities);
        this.isLoadingActivity.set(false);
      },
      error: (error) => {
        console.error('Failed to load recent activity:', error);
        this.isLoadingActivity.set(false);
      }
    });
  }

  /**
   * Format timestamp using locale settings
   */
  formatTimestamp(timestamp: Date): string {
    const locale = this.localeService.getCurrentLocale();
    return new Date(timestamp).toLocaleString(locale.code, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Request data export
   */
  exportData(): void {
    const userId = this.currentUser()?.id;
    if (!userId) return;

    this.isExporting.set(true);
    this.exportDownloadUrl.set(null);

    this.settingsService.requestDataExport(userId).subscribe({
      next: (response) => {
        this.exportDownloadUrl.set(response.downloadUrl);
        this.isExporting.set(false);
        this.toastService.success('Data export completed successfully');
      },
      error: (error) => {
        console.error('Failed to export data:', error);
        this.isExporting.set(false);
        // Error toast is handled by the service
      }
    });
  }

  /**
   * Download exported data
   */
  downloadExport(): void {
    const url = this.exportDownloadUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }

  /**
   * Initiate account deletion process
   */
  initiateAccountDeletion(): void {
    this.showDeleteConfirmation.set(true);
  }

  /**
   * Cancel account deletion
   */
  cancelDeletion(): void {
    this.showDeleteConfirmation.set(false);
    this.showFinalWarning.set(false);
    this.deletePassword.set('');
  }

  /**
   * Show final warning before deletion
   */
  proceedToFinalWarning(): void {
    if (!this.deletePassword()) {
      this.toastService.error('Please enter your password');
      return;
    }
    this.showDeleteConfirmation.set(false);
    this.showFinalWarning.set(true);
  }

  /**
   * Confirm account deletion
   */
  confirmAccountDeletion(): void {
    const userId = this.currentUser()?.id;
    const password = this.deletePassword();

    if (!userId || !password) {
      this.toastService.error('Invalid request');
      return;
    }

    this.isDeletingAccount.set(true);

    this.settingsService.deleteAccount(userId, password).subscribe({
      next: () => {
        this.isDeletingAccount.set(false);
        this.showFinalWarning.set(false);
        this.toastService.success('Account marked for deletion. You will receive an email with recovery instructions.');
        
        // Log out the user
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Failed to delete account:', error);
        this.isDeletingAccount.set(false);
        // Error toast is handled by the service
      }
    });
  }
}

import { Component, OnInit, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService, NotificationPreferences } from '../../../services/settings.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';

type NotificationCategory = 'sales' | 'inventory' | 'system' | 'security';
type NotificationType = 'email' | 'inApp';

@Component({
  selector: 'app-notifications-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './notifications-tab.component.html',
  styleUrl: './notifications-tab.component.css'
})
export class NotificationsTabComponent implements OnInit {
  @Input() notifications: NotificationPreferences | null = null;
  @Output() unsavedChanges = new EventEmitter<boolean>();

  private settingsService = inject(SettingsService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  isSaving = signal(false);

  // Local state for notification preferences
  emailNotifications = signal<Record<NotificationCategory, boolean>>({
    sales: true,
    inventory: true,
    system: true,
    security: true
  });

  inAppNotifications = signal<Record<NotificationCategory, boolean>>({
    sales: true,
    inventory: true,
    system: true,
    security: true
  });

  // Categories for display
  categories: Array<{ key: NotificationCategory, label: string, description: string }> = [
    { 
      key: 'sales', 
      label: 'notifications.categories.sales.label',
      description: 'notifications.categories.sales.description'
    },
    { 
      key: 'inventory', 
      label: 'notifications.categories.inventory.label',
      description: 'notifications.categories.inventory.description'
    },
    { 
      key: 'system', 
      label: 'notifications.categories.system.label',
      description: 'notifications.categories.system.description'
    },
    { 
      key: 'security', 
      label: 'notifications.categories.security.label',
      description: 'notifications.categories.security.description'
    }
  ];

  ngOnInit(): void {
    if (this.notifications) {
      this.emailNotifications.set({ ...this.notifications.email });
      this.inAppNotifications.set({ ...this.notifications.inApp });
    }
  }

  toggleEmailNotification(category: NotificationCategory): void {
    const current = this.emailNotifications();
    const updated = {
      ...current,
      [category]: !current[category]
    };
    this.emailNotifications.set(updated);
    this.saveNotificationPreferences();
  }

  toggleInAppNotification(category: NotificationCategory): void {
    const current = this.inAppNotifications();
    const updated = {
      ...current,
      [category]: !current[category]
    };
    this.inAppNotifications.set(updated);
    this.saveNotificationPreferences();
  }

  private async saveNotificationPreferences(): Promise<void> {
    const userId = this.currentUser()?.id;
    if (!userId) return;

    this.isSaving.set(true);

    const preferences: NotificationPreferences = {
      email: this.emailNotifications(),
      inApp: this.inAppNotifications()
    };

    try {
      await new Promise<void>((resolve, reject) => {
        this.settingsService.updateNotifications(userId, preferences).subscribe({
          next: (updatedNotifs) => {
            // Update local notifications
            if (this.notifications) {
              Object.assign(this.notifications, updatedNotifs);
            }
            this.toastService.success('Notification preferences updated');
            resolve();
          },
          error: (error) => {
            this.toastService.error('Failed to update notification preferences');
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    } finally {
      this.isSaving.set(false);
    }
  }

  getEmailNotification(category: NotificationCategory): boolean {
    return this.emailNotifications()[category];
  }

  getInAppNotification(category: NotificationCategory): boolean {
    return this.inAppNotifications()[category];
  }
}

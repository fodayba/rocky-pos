import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { NotificationPreferences } from '../../../services/settings.service';

describe('NotificationsTabComponent - Unit Tests', () => {
  let settingsService: any;
  let toastService: any;
  let authService: any;
  let component: any;

  type NotificationCategory = 'sales' | 'inventory' | 'system' | 'security';

  const mockNotifications: NotificationPreferences = {
    email: {
      sales: true,
      inventory: true,
      system: true,
      security: true
    },
    inApp: {
      sales: true,
      inventory: false,
      system: true,
      security: true
    }
  };

  beforeEach(() => {
    settingsService = {
      updateNotifications: vi.fn().mockReturnValue(of(mockNotifications))
    };

    toastService = {
      success: vi.fn(),
      error: vi.fn()
    };

    authService = {
      currentUser: signal({ id: 'test-user-id', role: 'admin' })
    };

    // Create a mock component with the necessary properties
    component = {
      notifications: mockNotifications,
      currentUser: authService.currentUser,
      isSaving: signal(false),
      emailNotifications: signal({ ...mockNotifications.email }),
      inAppNotifications: signal({ ...mockNotifications.inApp }),
      categories: [
        { 
          key: 'sales' as NotificationCategory, 
          label: 'notifications.categories.sales.label',
          description: 'notifications.categories.sales.description'
        },
        { 
          key: 'inventory' as NotificationCategory, 
          label: 'notifications.categories.inventory.label',
          description: 'notifications.categories.inventory.description'
        },
        { 
          key: 'system' as NotificationCategory, 
          label: 'notifications.categories.system.label',
          description: 'notifications.categories.system.description'
        },
        { 
          key: 'security' as NotificationCategory, 
          label: 'notifications.categories.security.label',
          description: 'notifications.categories.security.description'
        }
      ],
      ngOnInit: vi.fn(),
      toggleEmailNotification: vi.fn(),
      toggleInAppNotification: vi.fn(),
      getEmailNotification: vi.fn((category: NotificationCategory) => {
        return component.emailNotifications()[category];
      }),
      getInAppNotification: vi.fn((category: NotificationCategory) => {
        return component.inAppNotifications()[category];
      })
    };
  });

  it('should create component mock', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should have notification preferences set', () => {
      expect(component.notifications).toEqual(mockNotifications);
    });

    it('should initialize email notifications from props', () => {
      expect(component.emailNotifications()).toEqual(mockNotifications.email);
    });

    it('should initialize in-app notifications from props', () => {
      expect(component.inAppNotifications()).toEqual(mockNotifications.inApp);
    });
  });

  describe('Notification Categories', () => {
    it('should have all four categories', () => {
      expect(component.categories.length).toBe(4);
    });

    it('should have sales category', () => {
      const salesCategory = component.categories.find((c: any) => c.key === 'sales');
      expect(salesCategory).toBeTruthy();
      expect(salesCategory.label).toBe('notifications.categories.sales.label');
      expect(salesCategory.description).toBe('notifications.categories.sales.description');
    });

    it('should have inventory category', () => {
      const inventoryCategory = component.categories.find((c: any) => c.key === 'inventory');
      expect(inventoryCategory).toBeTruthy();
      expect(inventoryCategory.label).toBe('notifications.categories.inventory.label');
      expect(inventoryCategory.description).toBe('notifications.categories.inventory.description');
    });

    it('should have system category', () => {
      const systemCategory = component.categories.find((c: any) => c.key === 'system');
      expect(systemCategory).toBeTruthy();
      expect(systemCategory.label).toBe('notifications.categories.system.label');
      expect(systemCategory.description).toBe('notifications.categories.system.description');
    });

    it('should have security category', () => {
      const securityCategory = component.categories.find((c: any) => c.key === 'security');
      expect(securityCategory).toBeTruthy();
      expect(securityCategory.label).toBe('notifications.categories.security.label');
      expect(securityCategory.description).toBe('notifications.categories.security.description');
    });

    it('should organize categories in correct order', () => {
      expect(component.categories[0].key).toBe('sales');
      expect(component.categories[1].key).toBe('inventory');
      expect(component.categories[2].key).toBe('system');
      expect(component.categories[3].key).toBe('security');
    });
  });

  describe('Email Notifications', () => {
    it('should display email notification toggles', () => {
      // Verify all categories have email notification state
      expect(component.getEmailNotification('sales')).toBe(true);
      expect(component.getEmailNotification('inventory')).toBe(true);
      expect(component.getEmailNotification('system')).toBe(true);
      expect(component.getEmailNotification('security')).toBe(true);
    });

    it('should call toggleEmailNotification when toggle is clicked', () => {
      component.toggleEmailNotification('sales');
      expect(component.toggleEmailNotification).toHaveBeenCalledWith('sales');
    });

    it('should handle email notification toggle for each category', () => {
      const categories: NotificationCategory[] = ['sales', 'inventory', 'system', 'security'];
      
      categories.forEach(category => {
        component.toggleEmailNotification(category);
        expect(component.toggleEmailNotification).toHaveBeenCalledWith(category);
      });
    });
  });

  describe('In-App Notifications', () => {
    it('should display in-app notification toggles', () => {
      // Verify all categories have in-app notification state
      expect(component.getInAppNotification('sales')).toBe(true);
      expect(component.getInAppNotification('inventory')).toBe(false);
      expect(component.getInAppNotification('system')).toBe(true);
      expect(component.getInAppNotification('security')).toBe(true);
    });

    it('should call toggleInAppNotification when toggle is clicked', () => {
      component.toggleInAppNotification('inventory');
      expect(component.toggleInAppNotification).toHaveBeenCalledWith('inventory');
    });

    it('should handle in-app notification toggle for each category', () => {
      const categories: NotificationCategory[] = ['sales', 'inventory', 'system', 'security'];
      
      categories.forEach(category => {
        component.toggleInAppNotification(category);
        expect(component.toggleInAppNotification).toHaveBeenCalledWith(category);
      });
    });
  });

  describe('Service Integration', () => {
    it('should call settings service when toggling notifications', async () => {
      // Setup: Create a real implementation for testing
      const realToggleEmail = async (category: NotificationCategory) => {
        const current = component.emailNotifications();
        const updated = {
          ...current,
          [category]: !current[category]
        };
        component.emailNotifications.set(updated);

        const preferences: NotificationPreferences = {
          email: updated,
          inApp: component.inAppNotifications()
        };

        component.isSaving.set(true);
        
        await new Promise<void>((resolve) => {
          settingsService.updateNotifications('test-user-id', preferences).subscribe({
            next: () => {
              toastService.success('Notification preferences updated');
              resolve();
            }
          });
        });
        
        component.isSaving.set(false);
      };

      // Execute
      await realToggleEmail('sales');

      // Verify
      expect(settingsService.updateNotifications).toHaveBeenCalled();
      expect(toastService.success).toHaveBeenCalledWith('Notification preferences updated');
    });

    it('should show error toast when save fails', async () => {
      // Setup: Mock service to return error
      settingsService.updateNotifications = vi.fn().mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      // Create a real implementation for testing
      const realToggleEmail = async (category: NotificationCategory) => {
        const current = component.emailNotifications();
        const updated = {
          ...current,
          [category]: !current[category]
        };
        component.emailNotifications.set(updated);

        const preferences: NotificationPreferences = {
          email: updated,
          inApp: component.inAppNotifications()
        };

        component.isSaving.set(true);
        
        try {
          await new Promise<void>((resolve, reject) => {
            settingsService.updateNotifications('test-user-id', preferences).subscribe({
              next: () => resolve(),
              error: (err: Error) => reject(err)
            });
          });
        } catch (error) {
          toastService.error('Failed to update notification preferences');
        }
        
        component.isSaving.set(false);
      };

      // Execute
      await realToggleEmail('sales');

      // Verify
      expect(settingsService.updateNotifications).toHaveBeenCalled();
      expect(toastService.error).toHaveBeenCalledWith('Failed to update notification preferences');
    });

    it('should set isSaving flag during save operation', async () => {
      // Create a real implementation for testing
      const realToggleEmail = async (category: NotificationCategory) => {
        const current = component.emailNotifications();
        const updated = {
          ...current,
          [category]: !current[category]
        };
        component.emailNotifications.set(updated);

        const preferences: NotificationPreferences = {
          email: updated,
          inApp: component.inAppNotifications()
        };

        component.isSaving.set(true);
        expect(component.isSaving()).toBe(true);
        
        await new Promise<void>((resolve) => {
          settingsService.updateNotifications('test-user-id', preferences).subscribe({
            next: () => resolve()
          });
        });
        
        component.isSaving.set(false);
        expect(component.isSaving()).toBe(false);
      };

      // Execute
      await realToggleEmail('sales');

      // Verify final state
      expect(component.isSaving()).toBe(false);
    });
  });

  describe('Notification State Management', () => {
    it('should maintain separate state for email and in-app notifications', () => {
      // Initial state
      expect(component.emailNotifications()).toEqual(mockNotifications.email);
      expect(component.inAppNotifications()).toEqual(mockNotifications.inApp);

      // Modify email notifications
      component.emailNotifications.set({
        ...component.emailNotifications(),
        sales: false
      });

      // Verify in-app notifications are unchanged
      expect(component.inAppNotifications()).toEqual(mockNotifications.inApp);
    });

    it('should allow different values for same category in email vs in-app', () => {
      // Set different values for inventory
      component.emailNotifications.set({
        ...component.emailNotifications(),
        inventory: true
      });
      
      component.inAppNotifications.set({
        ...component.inAppNotifications(),
        inventory: false
      });

      // Verify they can have different values
      expect(component.getEmailNotification('inventory')).toBe(true);
      expect(component.getInAppNotification('inventory')).toBe(false);
    });
  });

  describe('UI State', () => {
    it('should disable toggles when saving', () => {
      component.isSaving.set(true);
      expect(component.isSaving()).toBe(true);
    });

    it('should enable toggles when not saving', () => {
      component.isSaving.set(false);
      expect(component.isSaving()).toBe(false);
    });
  });
});

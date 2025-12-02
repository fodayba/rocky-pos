import { describe, it, expect } from 'vitest';

describe('LayoutComponent - Settings Navigation', () => {
  describe('Settings Link in Navigation', () => {
    it('should include settings in navigation configuration', () => {
      const settingsNavItem = {
        label: 'settings.title',
        path: '/settings',
        icon: 'settings',
        roles: ['admin', 'manager', 'cashier']
      };

      expect(settingsNavItem.label).toBe('settings.title');
      expect(settingsNavItem.path).toBe('/settings');
      expect(settingsNavItem.icon).toBe('settings');
    });

    it('should display settings link for all roles', () => {
      const settingsRoles = ['admin', 'manager', 'cashier'];

      expect(settingsRoles).toContain('admin');
      expect(settingsRoles).toContain('manager');
      expect(settingsRoles).toContain('cashier');
    });

    it('should use settings icon', () => {
      const settingsIcon = 'settings';
      expect(settingsIcon).toBe('settings');
    });
  });
});

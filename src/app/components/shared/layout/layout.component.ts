import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';
import { ShiftService } from '../../../services/shift.service';
import { IconComponent, IconName } from '../icon/icon.component';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

interface NavItem {
  label: string;
  path: string;
  icon: IconName;
  roles: string[];
}

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, IconComponent, TranslateModule, LanguageSelectorComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  public authService = inject(AuthService);
  private shiftService = inject(ShiftService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  sidebarOpen = signal(true);
  currentUser = this.authService.currentUser;
  currentShift = this.shiftService.currentShift;
  hasActiveShift = this.shiftService.hasActiveShift;

  navItems: NavItem[] = [
    {
      label: 'common.dashboard',
      path: '/dashboard',
      icon: 'dashboard',
      roles: ['admin', 'manager', 'cashier']
    },
    {
      label: 'common.posTerminal',
      path: '/pos',
      icon: 'pos',
      roles: ['admin', 'manager', 'cashier']
    },
    {
      label: 'common.inventory',
      path: '/inventory',
      icon: 'inventory',
      roles: ['admin', 'manager']
    },
    {
      label: 'common.fuelManagement',
      path: '/fuel',
      icon: 'fuel',
      roles: ['admin', 'manager']
    },
    {
      label: 'common.customers',
      path: '/customers',
      icon: 'users',
      roles: ['admin', 'manager', 'cashier']
    },
    {
      label: 'common.shifts',
      path: '/shifts',
      icon: 'clock',
      roles: ['admin', 'manager', 'cashier']
    },
    {
      label: 'common.reports',
      path: '/reports',
      icon: 'chart',
      roles: ['admin', 'manager']
    },
    {
      label: 'settings.title',
      path: '/settings',
      icon: 'settings',
      roles: ['admin', 'manager', 'cashier']
    }
  ];

  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  canAccessRoute(roles: string[]): boolean {
    const userRole = this.currentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  logout(): void {
    if (confirm(this.translate.instant('common.logoutConfirm'))) {
      this.authService.logout();
    }
  }
}

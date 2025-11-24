import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ShiftService } from '../../../services/shift.service';
import { IconComponent, IconName } from '../icon/icon.component';

interface NavItem {
  label: string;
  path: string;
  icon: IconName;
  roles: string[];
}

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, IconComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  public authService = inject(AuthService);
  private shiftService = inject(ShiftService);
  private router = inject(Router);
  private document = inject(DOCUMENT);

  sidebarOpen = signal(true);
  darkMode = signal(false);
  currentUser = this.authService.currentUser;
  currentShift = this.shiftService.currentShift;
  hasActiveShift = this.shiftService.hasActiveShift;

  constructor() {
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    this.darkMode.set(savedDarkMode);

    // Apply dark mode on init
    if (savedDarkMode) {
      this.document.documentElement.classList.add('dark');
    }

    // Watch for dark mode changes
    effect(() => {
      if (this.darkMode()) {
        this.document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        this.document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
    });
  }

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'dashboard',
      roles: ['admin', 'manager', 'cashier']
    },
    {
      label: 'POS Terminal',
      path: '/pos',
      icon: 'pos',
      roles: ['admin', 'manager', 'cashier']
    },
    {
      label: 'Inventory',
      path: '/inventory',
      icon: 'inventory',
      roles: ['admin', 'manager']
    },
    {
      label: 'Fuel Management',
      path: '/fuel',
      icon: 'fuel',
      roles: ['admin', 'manager']
    },
    {
      label: 'Customers',
      path: '/customers',
      icon: 'users',
      roles: ['admin', 'manager', 'cashier']
    },
    {
      label: 'Shifts',
      path: '/shifts',
      icon: 'clock',
      roles: ['admin', 'manager', 'cashier']
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: 'chart',
      roles: ['admin', 'manager']
    }
  ];

  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  toggleDarkMode(): void {
    this.darkMode.set(!this.darkMode());
  }

  canAccessRoute(roles: string[]): boolean {
    const userRole = this.currentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }
}

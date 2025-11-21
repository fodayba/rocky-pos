import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ShiftService } from '../../../services/shift.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  public authService = inject(AuthService);
  private shiftService = inject(ShiftService);
  private router = inject(Router);

  sidebarOpen = signal(true);
  currentUser = this.authService.currentUser;
  currentShift = this.shiftService.currentShift;
  hasActiveShift = this.shiftService.hasActiveShift;

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      roles: ['admin', 'manager', 'cashier']
    },
    {
      label: 'POS Terminal',
      path: '/pos',
      icon: '💳',
      roles: ['admin', 'manager', 'cashier']
    },
    {
      label: 'Inventory',
      path: '/inventory',
      icon: '📦',
      roles: ['admin', 'manager']
    },
    {
      label: 'Fuel Management',
      path: '/fuel',
      icon: '⛽',
      roles: ['admin', 'manager']
    },
    {
      label: 'Customers',
      path: '/customers',
      icon: '👥',
      roles: ['admin', 'manager', 'cashier']
    },
    {
      label: 'Shifts',
      path: '/shifts',
      icon: '🕐',
      roles: ['admin', 'manager', 'cashier']
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: '📈',
      roles: ['admin', 'manager']
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
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }
}

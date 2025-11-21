import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';
import { LoginComponent } from './components/auth/login/login.component';
import { LayoutComponent } from './components/shared/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PosComponent } from './components/pos/pos.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { FuelComponent } from './components/inventory/fuel.component';
import { CustomersComponent } from './components/customers/customers.component';
import { ShiftsComponent } from './components/shifts/shifts.component';
import { ReportsComponent } from './components/reports/reports.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'pos',
        component: PosComponent
      },
      {
        path: 'inventory',
        component: InventoryComponent,
        canActivate: [roleGuard(['admin', 'manager'])]
      },
      {
        path: 'fuel',
        component: FuelComponent,
        canActivate: [roleGuard(['admin', 'manager'])]
      },
      {
        path: 'customers',
        component: CustomersComponent
      },
      {
        path: 'shifts',
        component: ShiftsComponent
      },
      {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [roleGuard(['admin', 'manager'])]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PosComponent } from './components/pos/pos.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { FuelComponent } from './components/fuel/fuel.component';
import { CustomersComponent } from './components/customers/customers.component';
import { CustomerFormComponent } from './components/customers/customer-form/customer-form.component';
import { CustomerDetailsComponent } from './components/customers/customer-details/customer-details.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { PromotionsComponent } from './components/promotions/promotions.component';
import { TimeTrackingComponent } from './components/time-tracking/time-tracking.component';
import { GiftCardsComponent } from './components/gift-cards/gift-cards.component';
import { PurchaseOrdersComponent } from './components/purchase-orders/purchase-orders.component';
import { ShiftsComponent } from './components/shifts/shifts.component';
import { ReportsComponent } from './components/reports/reports.component';
import { LayoutComponent } from './components/shared/layout/layout.component';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'pos',
        component: PosComponent,
      },
      {
        path: 'inventory',
        component: InventoryComponent,
        canActivate: [roleGuard(['admin', 'manager'])],
      },
      {
        path: 'fuel',
        component: FuelComponent,
        canActivate: [roleGuard(['admin', 'manager'])],
      },
      {
        path: 'customers',
        children: [
          {
            path: '',
            component: CustomersComponent,
          },
          {
            path: 'add',
            component: CustomerFormComponent,
          },
          {
            path: 'edit/:id',
            component: CustomerFormComponent,
            data: { prerender: false },
          },
          {
            path: ':id',
            component: CustomerDetailsComponent,
            data: { prerender: false },
          },
        ],
      },
      {
        path: 'suppliers',
        component: SuppliersComponent,
        canActivate: [roleGuard(['admin', 'manager'])],
      },
      {
        path: 'promotions',
        component: PromotionsComponent,
        canActivate: [roleGuard(['admin', 'manager'])],
      },
      {
        path: 'time-tracking',
        component: TimeTrackingComponent,
        canActivate: [roleGuard(['admin', 'manager', 'cashier'])],
      },
      {
        path: 'gift-cards',
        component: GiftCardsComponent,
        canActivate: [roleGuard(['admin', 'manager', 'cashier'])],
      },
      {
        path: 'purchase-orders',
        component: PurchaseOrdersComponent,
        canActivate: [roleGuard(['admin', 'manager'])],
      },
      {
        path: 'shifts',
        component: ShiftsComponent,
      },
      {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [roleGuard(['admin', 'manager'])],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

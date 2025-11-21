# Rocky POS - Frontend Redesign Plan

## Executive Summary

Complete redesign of the Angular frontend to match all 21 backend modules with a modern, enterprise-grade UI/UX.

**Current State**: 5 working components (Login, Dashboard, POS, Inventory, Shifts), 3 stubs
**Target State**: 21 feature modules + 15 new components + comprehensive admin system

---

## Architecture Overview

### Technology Stack (Keeping)
- **Framework**: Angular 21 with Standalone Components
- **State Management**: Angular Signals + RxJS
- **Styling**: Tailwind CSS v4 + Custom Design System
- **Build**: Angular CLI with SSR support
- **API**: RESTful HTTP with JWT authentication

### New Additions
- **Toast Notifications**: Custom toast service (replace alerts)
- **Global Loading State**: Centralized loading indicators
- **Form Validation**: Reactive forms with custom validators
- **Data Tables**: Sortable, filterable, paginated tables
- **Charts**: Chart.js or similar for analytics
- **Date Handling**: date-fns or dayjs
- **PDF Generation**: jsPDF for receipts/reports
- **Barcode Generation**: ngx-barcode or similar

---

## Component Architecture

### Current Components (To Enhance)
1. ✅ **Login** - Keep, add "remember me"
2. ✅ **Dashboard** - Enhance with more widgets
3. ✅ **POS** - Keep, add receipt printing
4. ✅ **Inventory** - Enhance with filters, sorting
5. ✅ **Shifts** - Keep, add detailed reconciliation
6. 🔄 **Signup** - Complete styling and validation

### Components to Build (15 New)
7. **Fuel Management** - Tank levels, pricing, deliveries
8. **Customers** - Full CRUD with loyalty program
9. **Reports** - Sales, inventory, financial, employee analytics
10. **Locations** - Multi-location management
11. **Suppliers** - Vendor management
12. **Fleet Accounts** - Account, vehicle, driver, card management
13. **Purchase Orders** - Procurement workflow
14. **Promotions** - Discount/coupon management
15. **Gift Cards** - Card issuance and tracking
16. **Invoicing** - Fleet account billing
17. **Time Tracking** - Employee clock in/out
18. **Scheduling** - Employee work schedules
19. **Tax Management** - Jurisdiction and rate management
20. **Inventory Transfers** - Inter-location transfers
21. **Audit Logs** - Compliance and security logs

### Admin Components (5 New)
22. **User Management** - Create/edit users, permissions
23. **Settings** - System configuration
24. **Location Settings** - Per-location configuration
25. **Backup & Restore** - Data management
26. **System Health** - Monitoring dashboard

---

## Module Structure

```
src/app/
├── core/
│   ├── services/
│   │   ├── auth.service.ts                    ✅ Keep
│   │   ├── storage.service.ts                 ✅ Keep
│   │   ├── toast.service.ts                   🆕 New
│   │   ├── loading.service.ts                 🆕 New
│   │   ├── error-handler.service.ts           🆕 New
│   │   └── print.service.ts                   🆕 New
│   ├── interceptors/
│   │   ├── auth.interceptor.ts                ✅ Keep
│   │   ├── loading.interceptor.ts             🆕 New
│   │   └── error.interceptor.ts               🆕 New
│   ├── guards/
│   │   ├── auth.guard.ts                      ✅ Keep
│   │   └── role.guard.ts                      ✅ Keep (enhanced)
│   └── models/
│       ├── user.model.ts                      ✅ Keep
│       ├── product.model.ts                   ✅ Keep
│       ├── transaction.model.ts               ✅ Keep
│       ├── shift.model.ts                     ✅ Keep
│       ├── customer.model.ts                  ✅ Keep
│       ├── fuel.model.ts                      ✅ Keep
│       ├── location.model.ts                  🆕 New
│       ├── supplier.model.ts                  🆕 New
│       ├── fleet-account.model.ts             🆕 New
│       ├── purchase-order.model.ts            🆕 New
│       ├── promotion.model.ts                 🆕 New
│       ├── gift-card.model.ts                 🆕 New
│       ├── invoice.model.ts                   🆕 New
│       ├── time-entry.model.ts                🆕 New
│       ├── schedule.model.ts                  🆕 New
│       ├── tax-jurisdiction.model.ts          🆕 New
│       ├── inventory-transfer.model.ts        🆕 New
│       └── audit-log.model.ts                 🆕 New
│
├── features/
│   ├── auth/
│   │   ├── login/                             ✅ Keep
│   │   ├── signup/                            🔄 Enhance
│   │   └── forgot-password/                   🆕 New
│   │
│   ├── dashboard/
│   │   ├── dashboard.component.ts             ✅ Keep
│   │   ├── widgets/
│   │   │   ├── revenue-widget/                🆕 New
│   │   │   ├── sales-chart-widget/            🆕 New
│   │   │   ├── top-products-widget/           🆕 New
│   │   │   ├── alerts-widget/                 🆕 New
│   │   │   └── shift-summary-widget/          🆕 New
│   │   └── dashboard.service.ts               🆕 New
│   │
│   ├── pos/
│   │   ├── pos.component.ts                   ✅ Keep
│   │   ├── components/
│   │   │   ├── product-search/                🆕 New
│   │   │   ├── shopping-cart/                 🆕 New
│   │   │   ├── payment-modal/                 🆕 New
│   │   │   ├── receipt-preview/               🆕 New
│   │   │   └── customer-lookup/               🆕 New
│   │   └── pos.service.ts                     🆕 New
│   │
│   ├── inventory/
│   │   ├── inventory-list/                    ✅ Keep (enhance)
│   │   ├── product-form/                      🆕 New
│   │   ├── low-stock-alert/                   🆕 New
│   │   ├── stock-adjustment/                  🆕 New
│   │   └── inventory.service.ts               🔄 Enhance
│   │
│   ├── fuel/
│   │   ├── fuel-list/                         🆕 New
│   │   ├── tank-management/                   🆕 New
│   │   ├── fuel-pricing/                      🆕 New
│   │   ├── fuel-delivery/                     🆕 New
│   │   └── fuel.service.ts                    ✅ Keep (enhance)
│   │
│   ├── customers/
│   │   ├── customer-list/                     🆕 New
│   │   ├── customer-form/                     🆕 New
│   │   ├── customer-details/                  🆕 New
│   │   ├── loyalty-program/                   🆕 New
│   │   └── customer.service.ts                ✅ Keep (enhance)
│   │
│   ├── shifts/
│   │   ├── shift-list/                        ✅ Keep
│   │   ├── shift-open-modal/                  ✅ Keep
│   │   ├── shift-close-modal/                 ✅ Keep
│   │   ├── shift-details/                     🆕 New
│   │   └── shift.service.ts                   ✅ Keep (enhance)
│   │
│   ├── reports/
│   │   ├── report-selector/                   🆕 New
│   │   ├── sales-report/                      🆕 New
│   │   ├── inventory-report/                  🆕 New
│   │   ├── employee-report/                   🆕 New
│   │   ├── financial-report/                  🆕 New
│   │   └── report.service.ts                  🆕 New
│   │
│   ├── locations/
│   │   ├── location-list/                     🆕 New
│   │   ├── location-form/                     🆕 New
│   │   ├── location-details/                  🆕 New
│   │   ├── location-settings/                 🆕 New
│   │   └── location.service.ts                🆕 New
│   │
│   ├── suppliers/
│   │   ├── supplier-list/                     🆕 New
│   │   ├── supplier-form/                     🆕 New
│   │   ├── supplier-details/                  🆕 New
│   │   └── supplier.service.ts                🆕 New
│   │
│   ├── fleet-accounts/
│   │   ├── fleet-account-list/                🆕 New
│   │   ├── fleet-account-form/                🆕 New
│   │   ├── fleet-account-details/             🆕 New
│   │   ├── vehicle-management/                🆕 New
│   │   ├── driver-management/                 🆕 New
│   │   ├── card-management/                   🆕 New
│   │   └── fleet-account.service.ts           🆕 New
│   │
│   ├── purchase-orders/
│   │   ├── purchase-order-list/               🆕 New
│   │   ├── purchase-order-form/               🆕 New
│   │   ├── purchase-order-details/            🆕 New
│   │   └── purchase-order.service.ts          🆕 New
│   │
│   ├── promotions/
│   │   ├── promotion-list/                    🆕 New
│   │   ├── promotion-form/                    🆕 New
│   │   ├── promotion-details/                 🆕 New
│   │   └── promotion.service.ts               🆕 New
│   │
│   ├── gift-cards/
│   │   ├── gift-card-list/                    🆕 New
│   │   ├── gift-card-form/                    🆕 New
│   │   ├── gift-card-details/                 🆕 New
│   │   ├── gift-card-lookup/                  🆕 New
│   │   └── gift-card.service.ts               🆕 New
│   │
│   ├── invoicing/
│   │   ├── invoice-list/                      🆕 New
│   │   ├── invoice-form/                      🆕 New
│   │   ├── invoice-details/                   🆕 New
│   │   └── invoice.service.ts                 🆕 New
│   │
│   ├── time-tracking/
│   │   ├── time-clock/                        🆕 New
│   │   ├── time-entry-list/                   🆕 New
│   │   ├── time-adjustment/                   🆕 New
│   │   └── time-tracking.service.ts           🆕 New
│   │
│   ├── scheduling/
│   │   ├── schedule-calendar/                 🆕 New
│   │   ├── schedule-form/                     🆕 New
│   │   ├── shift-assignment/                  🆕 New
│   │   └── scheduling.service.ts              🆕 New
│   │
│   ├── tax/
│   │   ├── tax-jurisdiction-list/             🆕 New
│   │   ├── tax-jurisdiction-form/             🆕 New
│   │   ├── tax-rate-management/               🆕 New
│   │   └── tax.service.ts                     🆕 New
│   │
│   ├── inventory-transfers/
│   │   ├── transfer-list/                     🆕 New
│   │   ├── transfer-form/                     🆕 New
│   │   ├── transfer-approval/                 🆕 New
│   │   └── inventory-transfer.service.ts      🆕 New
│   │
│   ├── audit/
│   │   ├── audit-log-list/                    🆕 New
│   │   ├── audit-log-details/                 🆕 New
│   │   └── audit.service.ts                   🆕 New
│   │
│   └── admin/
│       ├── user-management/                   🆕 New
│       ├── system-settings/                   🆕 New
│       └── system-health/                     🆕 New
│
└── shared/
    ├── components/
    │   ├── layout/                            ✅ Keep (enhance)
    │   ├── icon/                              ✅ Keep
    │   ├── toast/                             🆕 New
    │   ├── loading-spinner/                   🆕 New
    │   ├── data-table/                        🆕 New
    │   ├── modal/                             🆕 New
    │   ├── form-field/                        🆕 New
    │   ├── search-bar/                        🆕 New
    │   ├── pagination/                        🆕 New
    │   ├── breadcrumb/                        🆕 New
    │   ├── badge/                             🆕 New
    │   ├── card/                              🆕 New
    │   └── confirmation-dialog/               🆕 New
    │
    ├── directives/
    │   ├── debounce.directive.ts              🆕 New
    │   ├── click-outside.directive.ts         🆕 New
    │   └── currency-input.directive.ts        🆕 New
    │
    ├── pipes/
    │   ├── currency.pipe.ts                   🆕 New
    │   ├── date.pipe.ts                       🆕 New
    │   ├── phone.pipe.ts                      🆕 New
    │   └── status.pipe.ts                     🆕 New
    │
    └── validators/
        ├── custom-validators.ts               🆕 New
        └── form-validators.ts                 🆕 New
```

---

## Routing Structure

```typescript
// App Routes
const routes: Routes = [
  // Public Routes
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Protected Routes (requires authGuard)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Dashboard (All roles)
      { path: 'dashboard', component: DashboardComponent },

      // POS (Cashier+)
      { path: 'pos', component: PosComponent },

      // Inventory (Manager+)
      {
        path: 'inventory',
        canActivate: [roleGuard(['admin', 'manager', 'assistant_manager'])],
        children: [
          { path: '', component: InventoryListComponent },
          { path: 'add', component: ProductFormComponent },
          { path: 'edit/:id', component: ProductFormComponent },
          { path: 'low-stock', component: LowStockAlertComponent },
          { path: 'adjust/:id', component: StockAdjustmentComponent }
        ]
      },

      // Fuel (Manager+)
      {
        path: 'fuel',
        canActivate: [roleGuard(['admin', 'manager'])],
        children: [
          { path: '', component: FuelListComponent },
          { path: 'tanks', component: TankManagementComponent },
          { path: 'pricing', component: FuelPricingComponent },
          { path: 'delivery', component: FuelDeliveryComponent }
        ]
      },

      // Customers (All roles)
      {
        path: 'customers',
        children: [
          { path: '', component: CustomerListComponent },
          { path: 'add', component: CustomerFormComponent },
          { path: 'edit/:id', component: CustomerFormComponent },
          { path: ':id', component: CustomerDetailsComponent },
          { path: ':id/loyalty', component: LoyaltyProgramComponent }
        ]
      },

      // Shifts (All roles)
      {
        path: 'shifts',
        children: [
          { path: '', component: ShiftListComponent },
          { path: ':id', component: ShiftDetailsComponent }
        ]
      },

      // Reports (Manager+)
      {
        path: 'reports',
        canActivate: [roleGuard(['admin', 'manager'])],
        children: [
          { path: '', component: ReportSelectorComponent },
          { path: 'sales', component: SalesReportComponent },
          { path: 'inventory', component: InventoryReportComponent },
          { path: 'employee', component: EmployeeReportComponent },
          { path: 'financial', component: FinancialReportComponent }
        ]
      },

      // Locations (Admin+)
      {
        path: 'locations',
        canActivate: [roleGuard(['admin', 'manager'])],
        children: [
          { path: '', component: LocationListComponent },
          { path: 'add', component: LocationFormComponent },
          { path: 'edit/:id', component: LocationFormComponent },
          { path: ':id', component: LocationDetailsComponent },
          { path: ':id/settings', component: LocationSettingsComponent }
        ]
      },

      // Suppliers (Manager+)
      {
        path: 'suppliers',
        canActivate: [roleGuard(['admin', 'manager'])],
        children: [
          { path: '', component: SupplierListComponent },
          { path: 'add', component: SupplierFormComponent },
          { path: 'edit/:id', component: SupplierFormComponent },
          { path: ':id', component: SupplierDetailsComponent }
        ]
      },

      // Fleet Accounts (Manager+)
      {
        path: 'fleet-accounts',
        canActivate: [roleGuard(['admin', 'manager'])],
        children: [
          { path: '', component: FleetAccountListComponent },
          { path: 'add', component: FleetAccountFormComponent },
          { path: 'edit/:id', component: FleetAccountFormComponent },
          { path: ':id', component: FleetAccountDetailsComponent },
          { path: ':id/vehicles', component: VehicleManagementComponent },
          { path: ':id/drivers', component: DriverManagementComponent },
          { path: ':id/cards', component: CardManagementComponent }
        ]
      },

      // Purchase Orders (Manager+)
      {
        path: 'purchase-orders',
        canActivate: [roleGuard(['admin', 'manager'])],
        children: [
          { path: '', component: PurchaseOrderListComponent },
          { path: 'add', component: PurchaseOrderFormComponent },
          { path: 'edit/:id', component: PurchaseOrderFormComponent },
          { path: ':id', component: PurchaseOrderDetailsComponent }
        ]
      },

      // Promotions (Manager+)
      {
        path: 'promotions',
        canActivate: [roleGuard(['admin', 'manager'])],
        children: [
          { path: '', component: PromotionListComponent },
          { path: 'add', component: PromotionFormComponent },
          { path: 'edit/:id', component: PromotionFormComponent },
          { path: ':id', component: PromotionDetailsComponent }
        ]
      },

      // Gift Cards (Cashier+)
      {
        path: 'gift-cards',
        children: [
          { path: '', component: GiftCardListComponent },
          { path: 'issue', component: GiftCardFormComponent },
          { path: 'lookup', component: GiftCardLookupComponent },
          { path: ':id', component: GiftCardDetailsComponent }
        ]
      },

      // Invoicing (Manager+)
      {
        path: 'invoicing',
        canActivate: [roleGuard(['admin', 'manager'])],
        children: [
          { path: '', component: InvoiceListComponent },
          { path: 'add', component: InvoiceFormComponent },
          { path: ':id', component: InvoiceDetailsComponent }
        ]
      },

      // Time Tracking (All roles)
      {
        path: 'time-tracking',
        children: [
          { path: '', component: TimeClockComponent },
          { path: 'entries', component: TimeEntryListComponent },
          { path: 'adjust/:id', component: TimeAdjustmentComponent }
        ]
      },

      // Scheduling (Manager+)
      {
        path: 'scheduling',
        canActivate: [roleGuard(['admin', 'manager', 'assistant_manager'])],
        children: [
          { path: '', component: ScheduleCalendarComponent },
          { path: 'add', component: ScheduleFormComponent },
          { path: 'assign/:id', component: ShiftAssignmentComponent }
        ]
      },

      // Tax Management (Admin+)
      {
        path: 'tax',
        canActivate: [roleGuard(['admin', 'manager'])],
        children: [
          { path: '', component: TaxJurisdictionListComponent },
          { path: 'add', component: TaxJurisdictionFormComponent },
          { path: 'edit/:id', component: TaxJurisdictionFormComponent },
          { path: ':id/rates', component: TaxRateManagementComponent }
        ]
      },

      // Inventory Transfers (Manager+)
      {
        path: 'inventory-transfers',
        canActivate: [roleGuard(['admin', 'manager'])],
        children: [
          { path: '', component: TransferListComponent },
          { path: 'add', component: TransferFormComponent },
          { path: ':id', component: TransferApprovalComponent }
        ]
      },

      // Audit Logs (Admin only)
      {
        path: 'audit',
        canActivate: [roleGuard(['admin'])],
        children: [
          { path: '', component: AuditLogListComponent },
          { path: ':id', component: AuditLogDetailsComponent }
        ]
      },

      // Admin (Admin only)
      {
        path: 'admin',
        canActivate: [roleGuard(['admin'])],
        children: [
          { path: 'users', component: UserManagementComponent },
          { path: 'settings', component: SystemSettingsComponent },
          { path: 'health', component: SystemHealthComponent }
        ]
      }
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'dashboard' }
];
```

---

## Navigation Structure

### Sidebar Menu (Role-Based)

```typescript
interface MenuItem {
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard',
    roles: ['all']
  },
  {
    label: 'POS Terminal',
    path: '/pos',
    icon: 'pos',
    roles: ['all']
  },

  // Operations Section
  {
    label: 'Inventory',
    path: '/inventory',
    icon: 'inventory',
    roles: ['admin', 'manager', 'assistant_manager']
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
    roles: ['all']
  },
  {
    label: 'Shifts',
    path: '/shifts',
    icon: 'clock',
    roles: ['all']
  },

  // Commercial Section
  {
    label: 'Fleet Accounts',
    path: '/fleet-accounts',
    icon: 'truck',
    roles: ['admin', 'manager']
  },
  {
    label: 'Invoicing',
    path: '/invoicing',
    icon: 'receipt',
    roles: ['admin', 'manager']
  },

  // Procurement Section
  {
    label: 'Purchase Orders',
    path: '/purchase-orders',
    icon: 'shopping-cart',
    roles: ['admin', 'manager']
  },
  {
    label: 'Suppliers',
    path: '/suppliers',
    icon: 'package',
    roles: ['admin', 'manager']
  },
  {
    label: 'Inventory Transfers',
    path: '/inventory-transfers',
    icon: 'transfer',
    roles: ['admin', 'manager']
  },

  // Marketing Section
  {
    label: 'Promotions',
    path: '/promotions',
    icon: 'tag',
    roles: ['admin', 'manager']
  },
  {
    label: 'Gift Cards',
    path: '/gift-cards',
    icon: 'gift',
    roles: ['all']
  },

  // HR Section
  {
    label: 'Time Tracking',
    path: '/time-tracking',
    icon: 'clock',
    roles: ['all']
  },
  {
    label: 'Scheduling',
    path: '/scheduling',
    icon: 'calendar',
    roles: ['admin', 'manager', 'assistant_manager']
  },

  // Analytics Section
  {
    label: 'Reports',
    path: '/reports',
    icon: 'chart',
    roles: ['admin', 'manager']
  },

  // Settings Section
  {
    label: 'Locations',
    path: '/locations',
    icon: 'map-pin',
    roles: ['admin', 'manager']
  },
  {
    label: 'Tax Management',
    path: '/tax',
    icon: 'calculator',
    roles: ['admin', 'manager']
  },
  {
    label: 'Audit Logs',
    path: '/audit',
    icon: 'shield',
    roles: ['admin']
  },
  {
    label: 'Admin',
    path: '/admin',
    icon: 'settings',
    roles: ['admin'],
    children: [
      { label: 'Users', path: '/admin/users', icon: 'user', roles: ['admin'] },
      { label: 'Settings', path: '/admin/settings', icon: 'cog', roles: ['admin'] },
      { label: 'System Health', path: '/admin/health', icon: 'activity', roles: ['admin'] }
    ]
  }
];
```

---

## UI/UX Design Patterns

### Design System
- **Color Palette**: Stone-based (luxury, minimalist)
- **Typography**: SF Pro Display, Inter, system fonts
- **Components**: Card-based, clean borders, subtle shadows
- **Animations**: Smooth transitions, fade-in-up, scale-in
- **Responsive**: Mobile-first, breakpoints at 768px, 1024px

### Component Patterns

1. **List Pages**
   - Search bar at top
   - Filter/sort controls
   - Data table with pagination
   - Bulk actions (select all, delete, export)
   - "Add New" button in header

2. **Form Pages**
   - Clean 2-column layout on desktop
   - Grouped sections with headings
   - Inline validation with error messages
   - Auto-save drafts (localStorage)
   - Cancel/Save buttons always visible

3. **Detail Pages**
   - Header with key info and actions
   - Tab-based navigation for sections
   - Activity timeline
   - Related data cards
   - Quick edit capabilities

4. **Dashboard Widgets**
   - Grid layout (1-2-4 cols responsive)
   - Stat cards with trend indicators
   - Charts (line, bar, donut)
   - Alert lists
   - Recent activity

---

## State Management Strategy

### Service-Based Signals

```typescript
// Example: Product Service
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  // State
  private productsSignal = signal<Product[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  readonly products = this.productsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed values
  readonly lowStockProducts = computed(() =>
    this.productsSignal().filter(p => p.stockQuantity <= p.minStockLevel)
  );

  readonly productsByCategory = computed(() => {
    const products = this.productsSignal();
    return products.reduce((acc, product) => {
      if (!acc[product.category]) acc[product.category] = [];
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  });

  // Actions
  async loadProducts() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const products = await firstValueFrom(
        this.http.get<Product[]>('/api/products')
      );
      this.productsSignal.set(products);
    } catch (error) {
      this.errorSignal.set('Failed to load products');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async addProduct(product: CreateProductDto) {
    const newProduct = await firstValueFrom(
      this.http.post<Product>('/api/products', product)
    );
    this.productsSignal.update(products => [...products, newProduct]);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>) {
    const updated = await firstValueFrom(
      this.http.patch<Product>(`/api/products/${id}`, updates)
    );
    this.productsSignal.update(products =>
      products.map(p => p._id === id ? updated : p)
    );
    return updated;
  }

  async deleteProduct(id: string) {
    await firstValueFrom(this.http.delete(`/api/products/${id}`));
    this.productsSignal.update(products =>
      products.filter(p => p._id !== id)
    );
  }
}
```

### Global State Services

```typescript
// Loading Service
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingSignal = signal(false);
  readonly loading = this.loadingSignal.asReadonly();

  show() { this.loadingSignal.set(true); }
  hide() { this.loadingSignal.set(false); }
}

// Toast Service
@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  success(message: string) {
    this.addToast({ message, type: 'success' });
  }

  error(message: string) {
    this.addToast({ message, type: 'error' });
  }

  info(message: string) {
    this.addToast({ message, type: 'info' });
  }

  private addToast(toast: Toast) {
    const id = Date.now().toString();
    this.toastsSignal.update(toasts => [...toasts, { ...toast, id }]);
    setTimeout(() => this.removeToast(id), 5000);
  }

  removeToast(id: string) {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }
}
```

---

## Implementation Phases

### Phase 1: Foundation (Days 1-2)
- ✅ Set up new shared components (toast, loading, modal, data-table)
- ✅ Create all service files with basic structure
- ✅ Create all model files
- ✅ Enhance existing components (Dashboard, POS, Inventory)
- ✅ Add global error handling

### Phase 2: Core Operations (Days 3-5)
- ✅ Complete Fuel Management module
- ✅ Complete Customer Management module
- ✅ Enhance Shift Management
- ✅ Build Reports module (all 4 types)
- ✅ Build Gift Cards module

### Phase 3: Commercial Features (Days 6-8)
- ✅ Build Fleet Accounts module (complex)
- ✅ Build Invoicing module
- ✅ Build Purchase Orders module
- ✅ Build Suppliers module
- ✅ Build Promotions module

### Phase 4: HR & Compliance (Days 9-10)
- ✅ Build Time Tracking module
- ✅ Build Scheduling module
- ✅ Build Tax Management module
- ✅ Build Inventory Transfers module
- ✅ Build Audit Logs module

### Phase 5: Admin & Multi-location (Days 11-12)
- ✅ Build Locations module
- ✅ Build User Management
- ✅ Build System Settings
- ✅ Build System Health dashboard
- ✅ Add multi-location support throughout

### Phase 6: Polish & Testing (Days 13-14)
- ✅ Add comprehensive form validation
- ✅ Add receipt printing
- ✅ Add PDF export for reports
- ✅ Add barcode generation
- ✅ Responsive design testing
- ✅ Cross-browser testing
- ✅ Performance optimization
- ✅ Accessibility audit

---

## Key Features to Implement

### 1. Toast Notification System
Replace all `alert()` calls with elegant toasts

### 2. Global Loading Indicator
Top progress bar for all HTTP requests

### 3. Data Tables
Sortable, filterable, paginated tables for all list views

### 4. Form Validation
Comprehensive reactive form validation with custom validators

### 5. Receipt Printing
Print receipts from POS using browser print API

### 6. PDF Export
Export reports and invoices as PDFs

### 7. Barcode Generation
Generate barcodes for products and gift cards

### 8. Multi-location Selector
Global location selector in header (for multi-location users)

### 9. Advanced Search
Global search across all modules

### 10. Keyboard Shortcuts
Shortcuts for common POS operations

---

## Technical Debt to Address

1. ❌ Replace `alert()` with toast service
2. ❌ Add comprehensive error handling
3. ❌ Add loading states to all API calls
4. ❌ Add form validation to all forms
5. ❌ Add unit tests (aim for 70%+ coverage)
6. ❌ Add E2E tests for critical paths
7. ❌ Optimize bundle size (code splitting)
8. ❌ Add service worker for offline support
9. ❌ Add analytics tracking
10. ❌ Add accessibility improvements

---

## Success Criteria

- ✅ All 21 backend modules have frontend UIs
- ✅ Role-based access control working correctly
- ✅ All CRUD operations functional
- ✅ Responsive design on mobile, tablet, desktop
- ✅ No console errors
- ✅ Fast load times (<2s initial load)
- ✅ Intuitive UX (minimal training needed)
- ✅ Comprehensive error handling
- ✅ Clean, maintainable code

---

## Estimated Timeline

**Total: 14 days** (assuming 1 developer working full-time)

- Foundation: 2 days
- Core Operations: 3 days
- Commercial Features: 3 days
- HR & Compliance: 2 days
- Admin & Multi-location: 2 days
- Polish & Testing: 2 days

---

## Next Steps

1. Review and approve this plan
2. Start with Phase 1 (Foundation)
3. Implement phase by phase
4. Test thoroughly after each phase
5. Deploy to production

---

*Last Updated: 2025-11-21*

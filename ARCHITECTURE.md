# Rocky POS - Gas Station & Minimart Application Architecture

## Overview
A comprehensive Point of Sale system for gas stations with minimart operations, built with Angular 21 and modern web technologies.

## Tech Stack
- **Frontend**: Angular 21 with standalone components
- **Styling**: Tailwind CSS 4
- **State Management**: Angular Signals + RxJS
- **Backend**: Express.js (Node.js)
- **Database**: Initially localStorage, scalable to PostgreSQL/MySQL
- **Authentication**: JWT-based authentication

## Application Structure

### Core Modules

#### 1. Authentication Module
- User login/logout
- Role-based access control (Admin, Manager, Cashier)
- Session management
- Password management

#### 2. Dashboard Module
- Real-time sales overview
- Inventory alerts (low stock, fuel levels)
- Quick stats (daily revenue, transactions count)
- Shift summary

#### 3. POS Terminal Module
- Quick sale interface
- Product barcode scanning
- Fuel sale transactions
- Payment processing (Cash, Card, Mobile)
- Receipt generation
- Return/refund handling

#### 4. Inventory Management Module
##### Minimart Inventory
- Product catalog management
- Stock tracking
- Category management
- Supplier management
- Purchase orders
- Stock alerts

##### Fuel Inventory
- Tank level monitoring
- Fuel type management (Regular, Premium, Diesel)
- Price management
- Delivery tracking
- Tank reconciliation

#### 5. Customer Management Module
- Customer database
- Loyalty program
- Points system
- Customer purchase history
- Promotional offers

#### 6. Shift Management Module
- Shift opening/closing
- Cash drawer management
- Shift reports
- Cashier assignment
- Cash reconciliation

#### 7. Reporting & Analytics Module
- Daily sales reports
- Inventory reports
- Fuel sales analytics
- Product performance
- Profit/loss statements
- Employee performance
- Custom date range reports
- Export functionality (PDF, Excel)

## Data Models

### User
```typescript
{
  id: string
  username: string
  email: string
  role: 'admin' | 'manager' | 'cashier'
  firstName: string
  lastName: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Product (Minimart)
```typescript
{
  id: string
  barcode: string
  name: string
  description: string
  category: string
  price: number
  cost: number
  stockQuantity: number
  minStockLevel: number
  unit: string
  supplier: string
  taxable: boolean
  taxRate: number
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}
```

### FuelProduct
```typescript
{
  id: string
  name: string
  type: 'regular' | 'premium' | 'diesel'
  pricePerGallon: number
  currentStock: number
  tankCapacity: number
  minLevel: number
  lastDelivery?: Date
  lastDeliveryAmount?: number
}
```

### Transaction
```typescript
{
  id: string
  transactionNumber: string
  type: 'sale' | 'return' | 'void'
  items: TransactionItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: 'cash' | 'card' | 'mobile'
  cashReceived?: number
  changeGiven?: number
  customerId?: string
  cashierId: string
  shiftId: string
  createdAt: Date
}
```

### TransactionItem
```typescript
{
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
  isFuel: boolean
  fuelGallons?: number
}
```

### Shift
```typescript
{
  id: string
  shiftNumber: string
  cashierId: string
  startTime: Date
  endTime?: Date
  openingBalance: number
  closingBalance?: number
  expectedCash?: number
  actualCash?: number
  variance?: number
  status: 'open' | 'closed'
  transactions: string[]
}
```

### Customer
```typescript
{
  id: string
  name: string
  email?: string
  phone?: string
  loyaltyPoints: number
  totalSpent: number
  visitCount: number
  createdAt: Date
  lastVisit?: Date
}
```

## User Roles & Permissions

### Admin
- Full system access
- User management
- System configuration
- All reports
- Inventory management
- Pricing management

### Manager
- Inventory management
- Reports viewing
- Shift management
- Customer management
- Cannot modify users or system settings

### Cashier
- POS terminal access
- Process sales
- View own shift data
- Basic customer lookup
- Cannot access inventory or reports

## UI/UX Design Principles
1. **Speed**: Fast transaction processing with keyboard shortcuts
2. **Simplicity**: Clean, intuitive interface
3. **Responsive**: Works on tablets and desktop
4. **Accessibility**: Keyboard navigation, screen reader support
5. **Visual Feedback**: Clear status indicators and confirmations

## Security Considerations
1. JWT token-based authentication
2. Role-based access control
3. Encrypted sensitive data
4. Audit logging for critical operations
5. Session timeout
6. Secure payment processing

## Scalability Path
1. **Phase 1**: localStorage for MVP
2. **Phase 2**: Backend API with database
3. **Phase 3**: Multi-location support
4. **Phase 4**: Cloud deployment
5. **Phase 5**: Mobile apps (iOS/Android)

## Key Features by Priority

### P0 (Must Have)
- User authentication
- Basic POS terminal
- Product catalog
- Inventory tracking
- Sales transactions
- Cash/card payments
- Basic reports

### P1 (Should Have)
- Fuel sales management
- Shift management
- Receipt printing
- Low stock alerts
- Daily reports

### P2 (Nice to Have)
- Customer loyalty program
- Advanced analytics
- Barcode scanning
- Mobile payments
- Supplier management

### P3 (Future)
- Multi-location support
- Mobile apps
- Online ordering integration
- Advanced forecasting
- API integrations

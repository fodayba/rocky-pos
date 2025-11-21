// Sales Report DTOs
export interface SalesReportDto {
  startDate: Date | string;
  endDate: Date | string;
  locationId?: string;
  groupBy?: 'day' | 'week' | 'month' | 'product' | 'category';
}

export interface SalesReportData {
  totalSales: number;
  totalTransactions: number;
  averageTransactionValue: number;
  totalTax: number;
  totalDiscount: number;
  salesByPaymentMethod: {
    cash: number;
    credit: number;
    debit: number;
    check: number;
    giftCard: number;
  };
  salesByCategory?: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  salesByProduct?: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  dailySales?: Array<{
    date: string;
    sales: number;
    transactions: number;
  }>;
}

// Inventory Report DTOs
export interface InventoryReportDto {
  locationId?: string;
  lowStockOnly?: boolean;
  category?: string;
}

export interface InventoryReportData {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  products: Array<{
    _id: string;
    name: string;
    sku: string;
    category: string;
    stock: number;
    minStock: number;
    price: number;
    value: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
  }>;
}

// Employee Report DTOs
export interface EmployeeReportDto {
  startDate: Date | string;
  endDate: Date | string;
  employeeId?: string;
  locationId?: string;
}

export interface EmployeeReportData {
  totalEmployees: number;
  totalHoursWorked: number;
  totalSales: number;
  employees: Array<{
    _id: string;
    name: string;
    role: string;
    shiftsWorked: number;
    hoursWorked: number;
    sales: number;
    transactions: number;
    averageTransactionValue: number;
  }>;
}

// Financial Report DTOs
export interface FinancialReportDto {
  startDate: Date | string;
  endDate: Date | string;
  locationId?: string;
  reportType?: 'summary' | 'detailed' | 'profit-loss' | 'cash-flow';
}

export interface FinancialReportData {
  revenue: {
    total: number;
    fuel: number;
    products: number;
    services: number;
  };
  expenses: {
    total: number;
    cost_of_goods: number;
    labor: number;
    utilities: number;
    rent: number;
    other: number;
  };
  profit: {
    gross: number;
    net: number;
    margin: number;
  };
  tax: {
    collected: number;
    paid: number;
  };
  cashFlow: {
    inflow: number;
    outflow: number;
    net: number;
  };
}

// Fuel Report
export interface FuelReportData {
  totalGallonsSold: number;
  totalRevenue: number;
  averagePricePerGallon: number;
  products: Array<{
    _id: string;
    name: string;
    type: string;
    gallonsSold: number;
    revenue: number;
    averagePrice: number;
    deliveries: number;
    stockLevel: number;
  }>;
}

// Dashboard Metrics
export interface DashboardMetrics {
  today: {
    sales: number;
    transactions: number;
    customers: number;
    fuelGallons: number;
  };
  week: {
    sales: number;
    transactions: number;
    customers: number;
    fuelGallons: number;
  };
  month: {
    sales: number;
    transactions: number;
    customers: number;
    fuelGallons: number;
  };
  activeShifts: number;
  lowStockItems: number;
  lowFuelTanks: number;
  recentTransactions: Array<{
    _id: string;
    total: number;
    paymentMethod: string;
    createdAt: Date;
  }>;
}

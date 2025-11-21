export interface SalesReport {
  startDate: Date;
  endDate: Date;
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  cashSales: number;
  cardSales: number;
  mobileSales: number;
  fuelSales: number;
  minimartSales: number;
  topProducts: ProductSales[];
  hourlyBreakdown: HourlySales[];
}

export interface ProductSales {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface HourlySales {
  hour: number;
  sales: number;
  transactions: number;
}

export interface InventoryReport {
  date: Date;
  products: InventoryReportItem[];
  lowStockItems: InventoryReportItem[];
  totalValue: number;
}

export interface InventoryReportItem {
  productId: string;
  productName: string;
  currentStock: number;
  minStockLevel: number;
  value: number;
  status: 'ok' | 'low' | 'out';
}

export interface FuelReport {
  startDate: Date;
  endDate: Date;
  fuelSales: FuelSalesBreakdown[];
  totalGallonsSold: number;
  totalRevenue: number;
  averagePricePerGallon: number;
}

export interface FuelSalesBreakdown {
  fuelType: string;
  gallonsSold: number;
  revenue: number;
  averagePrice: number;
}

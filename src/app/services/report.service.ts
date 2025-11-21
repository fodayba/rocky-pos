import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  locationId?: string;
  categoryId?: string;
  employeeId?: string;
  [key: string]: any;
}

export interface SalesReport {
  totalSales: number;
  totalTransactions: number;
  averageTransactionValue: number;
  paymentMethodBreakdown: Record<string, number>;
  salesByCategory: Array<{ category: string; amount: number }>;
  salesByHour: Array<{ hour: number; amount: number }>;
  topSellingProducts: Array<{ name: string; quantity: number; revenue: number }>;
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockItems: Array<{ name: string; currentStock: number; minLevel: number }>;
  expiringItems: Array<{ name: string; expirationDate: Date }>;
  categoryBreakdown: Array<{ category: string; count: number; value: number }>;
}

export interface EmployeeReport {
  totalEmployees: number;
  totalHoursWorked: number;
  totalLaborCost: number;
  employeePerformance: Array<{
    name: string;
    hoursWorked: number;
    transactionsProcessed: number;
    sales: number;
  }>;
}

export interface FinancialReport {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  grossMargin: number;
  revenueBySource: Record<string, number>;
  expensesByCategory: Record<string, number>;
}

export interface DashboardMetrics {
  todaySales: number;
  todayTransactions: number;
  averageTransactionValue: number;
  paymentMethodBreakdown: Record<string, number>;
  topSellingProducts: Array<{ name: string; quantity: number }>;
  lowStockAlerts: number;
  openShifts: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  async getSalesReport(filters: ReportFilters) {
    return firstValueFrom(
      this.http.post<SalesReport>(`${this.apiUrl}/sales`, filters)
    );
  }

  async getInventoryReport(filters: ReportFilters) {
    return firstValueFrom(
      this.http.post<InventoryReport>(`${this.apiUrl}/inventory`, filters)
    );
  }

  async getEmployeeReport(filters: ReportFilters) {
    return firstValueFrom(
      this.http.post<EmployeeReport>(`${this.apiUrl}/employee`, filters)
    );
  }

  async getFinancialReport(filters: ReportFilters) {
    return firstValueFrom(
      this.http.post<FinancialReport>(`${this.apiUrl}/financial`, filters)
    );
  }

  async getFuelReport(filters: ReportFilters) {
    return firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/fuel`, { params: filters as any })
    );
  }

  async getDashboardMetrics() {
    return firstValueFrom(
      this.http.get<DashboardMetrics>(`${this.apiUrl}/dashboard`)
    );
  }
}

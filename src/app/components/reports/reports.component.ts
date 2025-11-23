import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon/icon.component';
import { ReportService } from '../../services/report.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import {
  SalesReportDto,
  SalesReportData,
  InventoryReportDto,
  InventoryReportData,
  EmployeeReportDto,
  EmployeeReportData,
  FinancialReportDto,
  FinancialReportData,
  FuelReportData
} from '../../models/report.model';

type ReportTab = 'sales' | 'inventory' | 'employee' | 'financial' | 'fuel';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);

  activeTab = signal<ReportTab>('sales');

  // Sales Report
  salesDto = signal<SalesReportDto>({
    startDate: this.getFirstDayOfMonth(),
    endDate: this.getToday(),
    groupBy: 'day'
  });
  salesData = signal<SalesReportData | null>(null);

  // Inventory Report
  inventoryDto = signal<InventoryReportDto>({
    lowStockOnly: false
  });
  inventoryData = signal<InventoryReportData | null>(null);

  // Employee Report
  employeeDto = signal<EmployeeReportDto>({
    startDate: this.getFirstDayOfMonth(),
    endDate: this.getToday()
  });
  employeeData = signal<EmployeeReportData | null>(null);

  // Financial Report
  financialDto = signal<FinancialReportDto>({
    startDate: this.getFirstDayOfMonth(),
    endDate: this.getToday(),
    reportType: 'summary'
  });
  financialData = signal<FinancialReportData | null>(null);

  // Fuel Report
  fuelData = signal<FuelReportData | null>(null);

  ngOnInit() {
    this.loadSalesReport();
  }

  setActiveTab(tab: ReportTab) {
    this.activeTab.set(tab);

    switch (tab) {
      case 'sales':
        if (!this.salesData()) this.loadSalesReport();
        break;
      case 'inventory':
        if (!this.inventoryData()) this.loadInventoryReport();
        break;
      case 'employee':
        if (!this.employeeData()) this.loadEmployeeReport();
        break;
      case 'financial':
        if (!this.financialData()) this.loadFinancialReport();
        break;
      case 'fuel':
        if (!this.fuelData()) this.loadFuelReport();
        break;
    }
  }

  loadSalesReport() {
    this.loadingService.show();
    this.reportService.getSalesReport(this.salesDto()).subscribe({
      next: (data) => {
        this.salesData.set(data);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load sales report');
        console.error('Error loading sales report:', error);
        this.loadingService.hide();
      }
    });
  }

  loadInventoryReport() {
    this.loadingService.show();
    this.reportService.getInventoryReport(this.inventoryDto()).subscribe({
      next: (data) => {
        this.inventoryData.set(data);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load inventory report');
        console.error('Error loading inventory report:', error);
        this.loadingService.hide();
      }
    });
  }

  loadEmployeeReport() {
    this.loadingService.show();
    this.reportService.getEmployeeReport(this.employeeDto()).subscribe({
      next: (data) => {
        this.employeeData.set(data);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load employee report');
        console.error('Error loading employee report:', error);
        this.loadingService.hide();
      }
    });
  }

  loadFinancialReport() {
    this.loadingService.show();
    this.reportService.getFinancialReport(this.financialDto()).subscribe({
      next: (data) => {
        this.financialData.set(data);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load financial report');
        console.error('Error loading financial report:', error);
        this.loadingService.hide();
      }
    });
  }

  loadFuelReport() {
    this.loadingService.show();
    this.reportService.getFuelReport().subscribe({
      next: (data) => {
        this.fuelData.set(data);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load fuel report');
        console.error('Error loading fuel report:', error);
        this.loadingService.hide();
      }
    });
  }

  updateSalesDto(field: keyof SalesReportDto, value: any) {
    this.salesDto.update(dto => ({ ...dto, [field]: value }));
  }

  updateInventoryDto(field: keyof InventoryReportDto, value: any) {
    this.inventoryDto.update(dto => ({ ...dto, [field]: value }));
  }

  updateEmployeeDto(field: keyof EmployeeReportDto, value: any) {
    this.employeeDto.update(dto => ({ ...dto, [field]: value }));
  }

  updateFinancialDto(field: keyof FinancialReportDto, value: any) {
    this.financialDto.update(dto => ({ ...dto, [field]: value }));
  }

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getFirstDayOfMonth(): string {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

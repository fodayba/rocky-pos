import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  SalesReportDto,
  SalesReportData,
  InventoryReportDto,
  InventoryReportData,
  EmployeeReportDto,
  EmployeeReportData,
  FinancialReportDto,
  FinancialReportData,
  FuelReportData,
  DashboardMetrics
} from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  getSalesReport(dto: SalesReportDto): Observable<SalesReportData> {
    return this.http.post<SalesReportData>(`${this.apiUrl}/sales`, dto);
  }

  getInventoryReport(dto: InventoryReportDto): Observable<InventoryReportData> {
    return this.http.post<InventoryReportData>(`${this.apiUrl}/inventory`, dto);
  }

  getEmployeeReport(dto: EmployeeReportDto): Observable<EmployeeReportData> {
    return this.http.post<EmployeeReportData>(`${this.apiUrl}/employee`, dto);
  }

  getFinancialReport(dto: FinancialReportDto): Observable<FinancialReportData> {
    return this.http.post<FinancialReportData>(`${this.apiUrl}/financial`, dto);
  }

  getFuelReport(locationId?: string): Observable<FuelReportData> {
    let params = new HttpParams();
    if (locationId) {
      params = params.set('locationId', locationId);
    }
    return this.http.get<FuelReportData>(`${this.apiUrl}/fuel`, { params });
  }

  getDashboardMetrics(locationId?: string): Observable<DashboardMetrics> {
    let params = new HttpParams();
    if (locationId) {
      params = params.set('locationId', locationId);
    }
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/dashboard`, { params });
  }
}

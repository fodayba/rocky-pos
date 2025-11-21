import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { SalesReportDto } from './dto/sales-report.dto';
import { InventoryReportDto } from './dto/inventory-report.dto';
import { EmployeeReportDto } from './dto/employee-report.dto';
import { FinancialReportDto } from './dto/financial-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Post('sales')
  @Roles('admin', 'manager')
  getSalesReport(@Body() dto: SalesReportDto) {
    return this.service.getSalesReport(dto);
  }

  @Post('inventory')
  @Roles('admin', 'manager')
  getInventoryReport(@Body() dto: InventoryReportDto) {
    return this.service.getInventoryReport(dto);
  }

  @Post('employee')
  @Roles('admin', 'manager')
  getEmployeeReport(@Body() dto: EmployeeReportDto) {
    return this.service.getEmployeeReport(dto);
  }

  @Post('financial')
  @Roles('admin', 'manager')
  getFinancialReport(@Body() dto: FinancialReportDto) {
    return this.service.getFinancialReport(dto);
  }

  @Get('fuel')
  @Roles('admin', 'manager')
  getFuelReport(@Query('locationId') locationId?: string) {
    return this.service.getFuelReport(locationId);
  }

  @Get('dashboard')
  @Roles('admin', 'manager', 'cashier')
  getDashboardMetrics(@Query('locationId') locationId?: string) {
    return this.service.getDashboardMetrics(locationId);
  }
}

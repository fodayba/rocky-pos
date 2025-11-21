import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { SalesReportDto } from './dto/sales-report.dto';
import { InventoryReportDto } from './dto/inventory-report.dto';
import { EmployeeReportDto } from './dto/employee-report.dto';
import { FinancialReportDto } from './dto/financial-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Post('sales')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getSalesReport(@Body() dto: SalesReportDto) {
    return this.service.getSalesReport(dto);
  }

  @Post('inventory')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getInventoryReport(@Body() dto: InventoryReportDto) {
    return this.service.getInventoryReport(dto);
  }

  @Post('employee')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getEmployeeReport(@Body() dto: EmployeeReportDto) {
    return this.service.getEmployeeReport(dto);
  }

  @Post('financial')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getFinancialReport(@Body() dto: FinancialReportDto) {
    return this.service.getFinancialReport(dto);
  }

  @Get('fuel')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getFuelReport(@Query('locationId') locationId?: string) {
    return this.service.getFuelReport(locationId);
  }

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER)
  getDashboardMetrics(@Query('locationId') locationId?: string) {
    return this.service.getDashboardMetrics(locationId);
  }
}

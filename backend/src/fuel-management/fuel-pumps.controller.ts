import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { FuelPumpsService } from './fuel-pumps.service';
import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';
import { AuthorizePumpDto } from './dto/authorize-pump.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PumpStatus } from '../schemas/fuel-pump.schema';

@Controller('fuel-pumps')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FuelPumpsController {
  constructor(private readonly service: FuelPumpsService) {}

  @Post()
  @Roles('admin', 'manager')
  create(@Body() createDto: CreatePumpDto, @Request() req) {
    return this.service.create(createDto, req.user.userId);
  }

  @Get()
  @Roles('admin', 'manager', 'cashier')
  findAll(@Query() filters: any) {
    return this.service.findAll(filters);
  }

  @Get('available/:locationId')
  @Roles('admin', 'manager', 'cashier')
  getAvailable(@Param('locationId') locationId: string) {
    return this.service.getAvailablePumps(locationId);
  }

  @Get('location/:locationId')
  @Roles('admin', 'manager', 'cashier')
  findByLocation(@Param('locationId') locationId: string) {
    return this.service.findByLocation(locationId);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'cashier')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  update(@Param('id') id: string, @Body() updateDto: UpdatePumpDto, @Request() req) {
    return this.service.update(id, updateDto, req.user.userId);
  }

  @Patch(':id/status/:status')
  @Roles('admin', 'manager')
  updateStatus(@Param('id') id: string, @Param('status') status: PumpStatus, @Request() req) {
    return this.service.updateStatus(id, status, req.user.userId);
  }

  @Post(':id/authorize')
  @Roles('admin', 'manager', 'cashier')
  authorize(@Param('id') id: string, @Body() authorizeDto: AuthorizePumpDto, @Request() req) {
    return this.service.authorize(id, authorizeDto, req.user.userId);
  }

  @Post(':id/start')
  @Roles('admin', 'manager', 'cashier')
  startTransaction(
    @Param('id') id: string,
    @Body() body: { transactionId: string },
    @Request() req
  ) {
    return this.service.startTransaction(id, body.transactionId, req.user.userId);
  }

  @Post(':id/end')
  @Roles('admin', 'manager', 'cashier')
  endTransaction(
    @Param('id') id: string,
    @Body() body: { gallons: number; amount: number },
    @Request() req
  ) {
    return this.service.endTransaction(id, body.gallons, body.amount, req.user.userId);
  }

  @Post(':id/cancel-authorization')
  @Roles('admin', 'manager', 'cashier')
  cancelAuthorization(@Param('id') id: string, @Request() req) {
    return this.service.cancelAuthorization(id, req.user.userId);
  }

  @Post('reset-daily-metrics')
  @Roles('admin', 'manager')
  resetDailyMetrics(@Query('locationId') locationId?: string) {
    return this.service.resetDailyMetrics(locationId);
  }

  @Patch(':id/maintenance/schedule')
  @Roles('admin', 'manager')
  scheduleMaintenance(
    @Param('id') id: string,
    @Body() body: { maintenanceDate: Date },
    @Request() req
  ) {
    return this.service.scheduleMaintenance(id, body.maintenanceDate, req.user.userId);
  }

  @Post(':id/maintenance/record')
  @Roles('admin', 'manager')
  recordMaintenance(@Param('id') id: string, @Request() req) {
    return this.service.recordMaintenance(id, req.user.userId);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

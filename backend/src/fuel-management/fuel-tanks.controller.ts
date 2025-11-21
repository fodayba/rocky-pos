import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { FuelTanksService } from './fuel-tanks.service';
import { CreateTankDto } from './dto/create-tank.dto';
import { UpdateTankDto } from './dto/update-tank.dto';
import { TankReadingDto } from './dto/tank-reading.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TankStatus } from '../schemas/fuel-tank.schema';

@Controller('fuel-tanks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FuelTanksController {
  constructor(private readonly service: FuelTanksService) {}

  @Post()
  @Roles('admin', 'manager')
  create(@Body() createDto: CreateTankDto, @Request() req) {
    return this.service.create(createDto, req.user.userId);
  }

  @Get()
  @Roles('admin', 'manager')
  findAll(@Query() filters: any) {
    return this.service.findAll(filters);
  }

  @Get('low-level')
  @Roles('admin', 'manager')
  getLowLevelTanks(@Query('locationId') locationId?: string) {
    return this.service.getLowLevelTanks(locationId);
  }

  @Get('alerts/:locationId')
  @Roles('admin', 'manager')
  getAlerts(@Param('locationId') locationId: string) {
    return this.service.getAlertsForLocation(locationId);
  }

  @Get('location/:locationId')
  @Roles('admin', 'manager', 'cashier')
  findByLocation(@Param('locationId') locationId: string) {
    return this.service.findByLocation(locationId);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  update(@Param('id') id: string, @Body() updateDto: UpdateTankDto, @Request() req) {
    return this.service.update(id, updateDto, req.user.userId);
  }

  @Patch(':id/reading')
  @Roles('admin', 'manager')
  updateReading(@Param('id') id: string, @Body() readingDto: TankReadingDto, @Request() req) {
    return this.service.updateReading(id, readingDto, req.user.userId);
  }

  @Post(':id/add-fuel')
  @Roles('admin', 'manager')
  addFuel(
    @Param('id') id: string,
    @Body() body: { gallons: number },
    @Request() req
  ) {
    return this.service.addFuel(id, body.gallons, req.user.userId);
  }

  @Post(':id/remove-fuel')
  @Roles('admin', 'manager')
  removeFuel(
    @Param('id') id: string,
    @Body() body: { gallons: number },
    @Request() req
  ) {
    return this.service.removeFuel(id, body.gallons, req.user.userId);
  }

  @Patch(':id/status/:status')
  @Roles('admin', 'manager')
  updateStatus(@Param('id') id: string, @Param('status') status: TankStatus, @Request() req) {
    return this.service.updateStatus(id, status, req.user.userId);
  }

  @Post(':id/inspection')
  @Roles('admin', 'manager')
  recordInspection(@Param('id') id: string, @Request() req) {
    return this.service.recordInspection(id, req.user.userId);
  }

  @Post(':id/leak-test')
  @Roles('admin', 'manager')
  recordLeakTest(
    @Param('id') id: string,
    @Body() body: { leakDetected: boolean },
    @Request() req
  ) {
    return this.service.recordLeakTest(id, body.leakDetected, req.user.userId);
  }

  @Post(':id/cathodic-test')
  @Roles('admin', 'manager')
  recordCathodicTest(@Param('id') id: string, @Request() req) {
    return this.service.recordCathodicTest(id, req.user.userId);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

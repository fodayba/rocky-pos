import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('locations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @Roles('admin')
  create(@Body() createLocationDto: CreateLocationDto, @Request() req) {
    return this.locationsService.create(createLocationDto, req.user.userId);
  }

  @Get()
  @Roles('admin', 'manager', 'cashier')
  findAll(@Query() filters: any) {
    return this.locationsService.findAll(filters);
  }

  @Get('statistics')
  @Roles('admin', 'manager')
  getStatistics() {
    return this.locationsService.getStatistics();
  }

  @Get('active')
  @Roles('admin', 'manager', 'cashier')
  findActive() {
    return this.locationsService.findActive();
  }

  @Get('with-fuel')
  @Roles('admin', 'manager')
  findWithFuel() {
    return this.locationsService.findWithFuel();
  }

  @Get('with-minimart')
  @Roles('admin', 'manager')
  findWithMiniMart() {
    return this.locationsService.findWithMiniMart();
  }

  @Get('expiring-licenses')
  @Roles('admin', 'manager')
  findExpiringLicenses(@Query('days') days?: number) {
    return this.locationsService.findExpiringLicenses(days ? parseInt(days) : 30);
  }

  @Get('due-for-inspection')
  @Roles('admin', 'manager')
  findDueForInspection() {
    return this.locationsService.findDueForInspection();
  }

  @Get('search')
  @Roles('admin', 'manager', 'cashier')
  search(@Query('q') searchTerm: string) {
    return this.locationsService.search(searchTerm);
  }

  @Get('nearby')
  @Roles('admin', 'manager', 'cashier')
  findNearby(
    @Query('lat') latitude: string,
    @Query('lon') longitude: string,
    @Query('distance') distance?: string,
  ) {
    return this.locationsService.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      distance ? parseInt(distance) : undefined,
    );
  }

  @Get('region/:regionId')
  @Roles('admin', 'manager')
  findByRegion(@Param('regionId') regionId: string) {
    return this.locationsService.findByRegion(regionId);
  }

  @Get('district/:districtId')
  @Roles('admin', 'manager')
  findByDistrict(@Param('districtId') districtId: string) {
    return this.locationsService.findByDistrict(districtId);
  }

  @Get('state/:state')
  @Roles('admin', 'manager')
  findByState(@Param('state') state: string) {
    return this.locationsService.findByState(state);
  }

  @Get('type/:locationType')
  @Roles('admin', 'manager')
  findByType(@Param('locationType') locationType: string) {
    return this.locationsService.findByType(locationType);
  }

  @Get('format/:storeFormat')
  @Roles('admin', 'manager')
  findByStoreFormat(@Param('storeFormat') storeFormat: string) {
    return this.locationsService.findByStoreFormat(storeFormat);
  }

  @Get('store-number/:storeNumber')
  @Roles('admin', 'manager', 'cashier')
  findByStoreNumber(@Param('storeNumber') storeNumber: string) {
    return this.locationsService.findByStoreNumber(storeNumber);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'cashier')
  findById(@Param('id') id: string) {
    return this.locationsService.findById(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto, @Request() req) {
    return this.locationsService.update(id, updateLocationDto, req.user.userId);
  }

  @Patch(':id/status')
  @Roles('admin')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
    @Request() req,
  ) {
    return this.locationsService.updateStatus(id, body.status, body.reason, req.user.userId);
  }

  @Patch(':id/metrics')
  @Roles('admin', 'manager')
  updateMetrics(@Param('id') id: string, @Body() metrics: any) {
    return this.locationsService.updateMetrics(id, metrics);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }
}

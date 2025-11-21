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
import { UserRole } from '../schemas/user.schema';

@Controller('locations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createLocationDto: CreateLocationDto, @Request() req) {
    return this.locationsService.create(createLocationDto, req.user.userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER)
  findAll(@Query() filters: any) {
    return this.locationsService.findAll(filters);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getStatistics() {
    return this.locationsService.getStatistics();
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER)
  findActive() {
    return this.locationsService.findActive();
  }

  @Get('with-fuel')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findWithFuel() {
    return this.locationsService.findWithFuel();
  }

  @Get('with-minimart')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findWithMiniMart() {
    return this.locationsService.findWithMiniMart();
  }

  @Get('expiring-licenses')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findExpiringLicenses(@Query('days') days?: string) {
    return this.locationsService.findExpiringLicenses(days ? parseInt(days, 10) : undefined);
  }

  @Get('due-for-inspection')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findDueForInspection() {
    return this.locationsService.findDueForInspection();
  }

  @Get('search')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER)
  search(@Query('q') searchTerm: string) {
    return this.locationsService.search(searchTerm);
  }

  @Get('nearby')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER)
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
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findByRegion(@Param('regionId') regionId: string) {
    return this.locationsService.findByRegion(regionId);
  }

  @Get('district/:districtId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findByDistrict(@Param('districtId') districtId: string) {
    return this.locationsService.findByDistrict(districtId);
  }

  @Get('state/:state')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findByState(@Param('state') state: string) {
    return this.locationsService.findByState(state);
  }

  @Get('type/:locationType')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findByType(@Param('locationType') locationType: string) {
    return this.locationsService.findByType(locationType);
  }

  @Get('format/:storeFormat')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findByStoreFormat(@Param('storeFormat') storeFormat: string) {
    return this.locationsService.findByStoreFormat(storeFormat);
  }

  @Get('store-number/:storeNumber')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER)
  findByStoreNumber(@Param('storeNumber') storeNumber: string) {
    return this.locationsService.findByStoreNumber(storeNumber);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER)
  findById(@Param('id') id: string) {
    return this.locationsService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto, @Request() req) {
    return this.locationsService.update(id, updateLocationDto, req.user.userId);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
    @Request() req,
  ) {
    return this.locationsService.updateStatus(id, body.status, body.reason, req.user.userId);
  }

  @Patch(':id/metrics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateMetrics(@Param('id') id: string, @Body() metrics: any) {
    return this.locationsService.updateMetrics(id, metrics);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }
}

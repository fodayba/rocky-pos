import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TaxService } from './tax.service';
import { CreateJurisdictionDto } from './dto/create-jurisdiction.dto';
import { UpdateJurisdictionDto } from './dto/update-jurisdiction.dto';
import { CalculateTaxDto } from './dto/calculate-tax.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';

@Controller('tax')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaxController {
  constructor(private readonly service: TaxService) {}

  @Post('jurisdictions')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createDto: CreateJurisdictionDto, @Request() req) {
    return this.service.create(createDto, req.user.userId);
  }

  @Get('jurisdictions')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll(@Query() filters: any) {
    return this.service.findAll(filters);
  }

  @Get('jurisdictions/code/:code')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findByCode(@Param('code') code: string) {
    return this.service.findByCode(code);
  }

  @Get('jurisdictions/zip/:zipCode')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER)
  findByZipCode(@Param('zipCode') zipCode: string) {
    return this.service.findByZipCode(zipCode);
  }

  @Get('jurisdictions/location')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findByLocation(
    @Query('state') state: string,
    @Query('county') county?: string,
    @Query('city') city?: string,
  ) {
    return this.service.findByLocation(state, county, city);
  }

  @Get('jurisdictions/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch('jurisdictions/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateDto: UpdateJurisdictionDto, @Request() req) {
    return this.service.update(id, updateDto, req.user.userId);
  }

  @Post('jurisdictions/:id/rates')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  addTaxRate(@Param('id') id: string, @Body() taxRateDto: any, @Request() req) {
    return this.service.addTaxRate(id, taxRateDto, req.user.userId);
  }

  @Delete('jurisdictions/:id/rates/:rateIndex')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  removeTaxRate(
    @Param('id') id: string,
    @Param('rateIndex') rateIndex: number,
    @Request() req
  ) {
    return this.service.removeTaxRate(id, Number(rateIndex), req.user.userId);
  }

  @Post('calculate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER)
  calculateTax(@Body() calculateDto: CalculateTaxDto) {
    return this.service.calculateTax(calculateDto);
  }

  @Get('jurisdictions/:id/filing-report')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getFilingReport(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.service.getFilingReport(id, new Date(startDate), new Date(endDate));
  }

  @Post('jurisdictions/:id/activate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  activate(@Param('id') id: string, @Request() req) {
    return this.service.activate(id, req.user.userId);
  }

  @Post('jurisdictions/:id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  deactivate(@Param('id') id: string, @Request() req) {
    return this.service.deactivate(id, req.user.userId);
  }

  @Delete('jurisdictions/:id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

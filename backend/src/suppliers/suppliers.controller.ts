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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Roles('admin', 'manager')
  create(@Body() createSupplierDto: CreateSupplierDto, @Request() req) {
    return this.suppliersService.create(createSupplierDto, req.user.userId);
  }

  @Get()
  @Roles('admin', 'manager')
  findAll(@Query() filters: any) {
    return this.suppliersService.findAll(filters);
  }

  @Get('statistics')
  @Roles('admin', 'manager')
  getStatistics() {
    return this.suppliersService.getStatistics();
  }

  @Get('active')
  @Roles('admin', 'manager')
  findActive() {
    return this.suppliersService.findActive();
  }

  @Get('preferred')
  @Roles('admin', 'manager')
  findPreferred() {
    return this.suppliersService.findPreferred();
  }

  @Get('search')
  @Roles('admin', 'manager')
  search(@Query('q') searchTerm: string) {
    return this.suppliersService.search(searchTerm);
  }

  @Get('type/:type')
  @Roles('admin', 'manager')
  findByType(@Param('type') type: string) {
    return this.suppliersService.findByType(type);
  }

  @Get('code/:supplierCode')
  @Roles('admin', 'manager')
  findByCode(@Param('supplierCode') supplierCode: string) {
    return this.suppliersService.findByCode(supplierCode);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  findById(@Param('id') id: string) {
    return this.suppliersService.findById(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @Request() req,
  ) {
    return this.suppliersService.update(id, updateSupplierDto, req.user.userId);
  }

  @Patch(':id/balance')
  @Roles('admin', 'manager')
  updateBalance(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.suppliersService.updateBalance(id, body.amount);
  }

  @Patch(':id/performance')
  @Roles('admin', 'manager')
  updatePerformance(
    @Param('id') id: string,
    @Body() body: { onTimeRate: number; qualityRating: number },
  ) {
    return this.suppliersService.updatePerformanceMetrics(
      id,
      body.onTimeRate,
      body.qualityRating,
    );
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}

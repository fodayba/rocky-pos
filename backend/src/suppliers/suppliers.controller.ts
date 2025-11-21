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
import { UserRole } from '../schemas/user.schema';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createSupplierDto: CreateSupplierDto, @Request() req) {
    return this.suppliersService.create(createSupplierDto, req.user.userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll(@Query() filters: any) {
    return this.suppliersService.findAll(filters);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getStatistics() {
    return this.suppliersService.getStatistics();
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findActive() {
    return this.suppliersService.findActive();
  }

  @Get('preferred')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findPreferred() {
    return this.suppliersService.findPreferred();
  }

  @Get('search')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  search(@Query('q') searchTerm: string) {
    return this.suppliersService.search(searchTerm);
  }

  @Get('type/:type')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findByType(@Param('type') type: string) {
    return this.suppliersService.findByType(type);
  }

  @Get('code/:supplierCode')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findByCode(@Param('supplierCode') supplierCode: string) {
    return this.suppliersService.findByCode(supplierCode);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findById(@Param('id') id: string) {
    return this.suppliersService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @Request() req,
  ) {
    return this.suppliersService.update(id, updateSupplierDto, req.user.userId);
  }

  @Patch(':id/balance')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateBalance(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.suppliersService.updateBalance(id, body.amount);
  }

  @Patch(':id/performance')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
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
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}

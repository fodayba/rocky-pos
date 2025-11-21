import { Controller, Get, Patch, Post, Param, Body, UseGuards } from '@nestjs/common';
import { FuelService } from './fuel.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../schemas/user.schema';

@Controller('fuel')
@UseGuards(JwtAuthGuard)
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Get()
  findAll() {
    return this.fuelService.findAll();
  }

  @Get('low-level')
  findLowLevel() {
    return this.fuelService.findLowLevel();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fuelService.findOne(id);
  }

  @Patch(':id/price')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updatePrice(@CurrentUser() user: User, @Param('id') id: string, @Body('price') price: number) {
    return this.fuelService.updatePrice(id, price, user._id.toString());
  }

  @Post(':id/delivery')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  recordDelivery(@CurrentUser() user: User, @Param('id') id: string, @Body('amount') amount: number) {
    return this.fuelService.recordDelivery(id, amount, user._id.toString());
  }
}

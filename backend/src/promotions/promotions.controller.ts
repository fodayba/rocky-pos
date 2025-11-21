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
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @Roles('admin', 'manager')
  create(@Body() createDto: CreatePromotionDto, @Request() req) {
    return this.promotionsService.create(createDto, req.user.userId);
  }

  @Get()
  @Roles('admin', 'manager')
  findAll(@Query() filters: any) {
    return this.promotionsService.findAll(filters);
  }

  @Get('statistics')
  @Roles('admin', 'manager')
  getStatistics() {
    return this.promotionsService.getStatistics();
  }

  @Get('active')
  @Roles('admin', 'manager', 'cashier')
  findActive() {
    return this.promotionsService.findActive();
  }

  @Get('location/:locationId')
  @Roles('admin', 'manager', 'cashier')
  findByLocation(@Param('locationId') locationId: string) {
    return this.promotionsService.findByLocation(locationId);
  }

  @Get('coupon/:code')
  @Roles('admin', 'manager', 'cashier')
  findByCouponCode(@Param('code') code: string) {
    return this.promotionsService.findByCouponCode(code);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  findById(@Param('id') id: string) {
    return this.promotionsService.findById(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  update(@Param('id') id: string, @Body() updateDto: UpdatePromotionDto, @Request() req) {
    return this.promotionsService.update(id, updateDto, req.user.userId);
  }

  @Patch(':id/activate')
  @Roles('admin', 'manager')
  activate(@Param('id') id: string) {
    return this.promotionsService.activate(id);
  }

  @Patch(':id/pause')
  @Roles('admin', 'manager')
  pause(@Param('id') id: string) {
    return this.promotionsService.pause(id);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { InventoryTransfersService } from './inventory-transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('inventory-transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryTransfersController {
  constructor(private readonly service: InventoryTransfersService) {}

  @Post()
  @Roles('admin', 'manager')
  create(@Body() createDto: CreateTransferDto, @Request() req) {
    return this.service.create(createDto, req.user.userId);
  }

  @Get()
  @Roles('admin', 'manager')
  findAll(@Query() filters: any) {
    return this.service.findAll(filters);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/approve')
  @Roles('admin', 'manager')
  approve(@Param('id') id: string, @Request() req) {
    return this.service.approve(id, req.user.userId);
  }

  @Patch(':id/ship')
  @Roles('admin', 'manager')
  ship(@Param('id') id: string, @Request() req) {
    return this.service.ship(id, req.user.userId);
  }

  @Patch(':id/receive')
  @Roles('admin', 'manager')
  receive(@Param('id') id: string, @Request() req) {
    return this.service.receive(id, req.user.userId);
  }

  @Patch(':id/reject')
  @Roles('admin', 'manager')
  reject(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.service.reject(id, body.reason);
  }
}

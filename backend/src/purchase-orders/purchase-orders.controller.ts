import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ReceiveItemsDto } from './dto/receive-items.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @Roles('admin', 'manager')
  create(@Body() createDto: CreatePurchaseOrderDto, @Request() req) {
    return this.purchaseOrdersService.create(createDto, req.user.userId);
  }

  @Get()
  @Roles('admin', 'manager')
  findAll(@Query() filters: any) {
    return this.purchaseOrdersService.findAll(filters);
  }

  @Get('statistics')
  @Roles('admin', 'manager')
  getStatistics() {
    return this.purchaseOrdersService.getStatistics();
  }

  @Get('pending')
  @Roles('admin', 'manager')
  findPending() {
    return this.purchaseOrdersService.findPending();
  }

  @Get('location/:locationId')
  @Roles('admin', 'manager')
  findByLocation(@Param('locationId') locationId: string) {
    return this.purchaseOrdersService.findByLocation(locationId);
  }

  @Get('supplier/:supplierId')
  @Roles('admin', 'manager')
  findBySupplier(@Param('supplierId') supplierId: string) {
    return this.purchaseOrdersService.findBySupplier(supplierId);
  }

  @Get('po-number/:poNumber')
  @Roles('admin', 'manager')
  findByPONumber(@Param('poNumber') poNumber: string) {
    return this.purchaseOrdersService.findByPONumber(poNumber);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  findById(@Param('id') id: string) {
    return this.purchaseOrdersService.findById(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  update(@Param('id') id: string, @Body() updateDto: UpdatePurchaseOrderDto, @Request() req) {
    return this.purchaseOrdersService.update(id, updateDto, req.user.userId);
  }

  @Patch(':id/submit')
  @Roles('admin', 'manager')
  submit(@Param('id') id: string) {
    return this.purchaseOrdersService.submit(id);
  }

  @Patch(':id/approve')
  @Roles('admin', 'manager')
  approve(@Param('id') id: string, @Request() req) {
    return this.purchaseOrdersService.approve(id, req.user.userId);
  }

  @Patch(':id/send')
  @Roles('admin', 'manager')
  sendToSupplier(@Param('id') id: string) {
    return this.purchaseOrdersService.sendToSupplier(id);
  }

  @Post(':id/receive')
  @Roles('admin', 'manager')
  receiveItems(@Param('id') id: string, @Body() receiveDto: ReceiveItemsDto, @Request() req) {
    return this.purchaseOrdersService.receiveItems(id, receiveDto, req.user.userId);
  }

  @Patch(':id/cancel')
  @Roles('admin', 'manager')
  cancel(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.purchaseOrdersService.cancel(id, body.reason);
  }
}

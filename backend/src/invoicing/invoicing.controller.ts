import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { InvoicingService } from './invoicing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicingController {
  constructor(private readonly service: InvoicingService) {}

  @Post()
  @Roles('admin', 'manager')
  create(@Body() createDto: CreateInvoiceDto, @Request() req) {
    return this.service.create(createDto, req.user.userId);
  }

  @Post('generate')
  @Roles('admin', 'manager')
  generateFromTransactions(@Body() generateDto: GenerateInvoiceDto, @Request() req) {
    return this.service.generateFromFleetTransactions(generateDto, req.user.userId);
  }

  @Get()
  @Roles('admin', 'manager')
  findAll(@Query() filters: any) {
    return this.service.findAll(filters);
  }

  @Get('overdue')
  @Roles('admin', 'manager')
  getOverdue(@Query('fleetAccountId') fleetAccountId?: string) {
    return this.service.getOverdueInvoices(fleetAccountId);
  }

  @Get('account-summary/:fleetAccountId')
  @Roles('admin', 'manager')
  getAccountSummary(@Param('fleetAccountId') fleetAccountId: string) {
    return this.service.getAccountSummary(fleetAccountId);
  }

  @Get('number/:invoiceNumber')
  @Roles('admin', 'manager')
  findByInvoiceNumber(@Param('invoiceNumber') invoiceNumber: string) {
    return this.service.findByInvoiceNumber(invoiceNumber);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  update(@Param('id') id: string, @Body() updateDto: UpdateInvoiceDto, @Request() req) {
    return this.service.update(id, updateDto, req.user.userId);
  }

  @Post(':id/send')
  @Roles('admin', 'manager')
  send(@Param('id') id: string, @Body() body: { emailAddress: string }, @Request() req) {
    return this.service.send(id, body.emailAddress, req.user.userId);
  }

  @Post(':id/viewed')
  markAsViewed(@Param('id') id: string) {
    return this.service.markAsViewed(id);
  }

  @Post(':id/payment')
  @Roles('admin', 'manager')
  recordPayment(@Param('id') id: string, @Body() paymentDto: RecordPaymentDto, @Request() req) {
    return this.service.recordPayment(id, paymentDto, req.user.userId);
  }

  @Post(':id/late-fee')
  @Roles('admin', 'manager')
  applyLateFee(@Param('id') id: string, @Body() body: { amount: number }, @Request() req) {
    return this.service.applyLateFee(id, body.amount, req.user.userId);
  }

  @Patch(':id/cancel')
  @Roles('admin', 'manager')
  cancel(@Param('id') id: string, @Request() req) {
    return this.service.cancel(id, req.user.userId);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

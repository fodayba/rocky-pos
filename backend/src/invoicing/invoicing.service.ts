import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceStatus } from '../schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';

@Injectable()
export class InvoicingService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
  ) {}

  async create(createDto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate totals from line items
    const subtotal = createDto.lineItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = createDto.lineItems.reduce((sum, item) => sum + (item.tax || 0), 0);
    const totalAmount = createDto.lineItems.reduce((sum, item) => sum + item.total, 0);

    const invoice = new this.invoiceModel({
      ...createDto,
      invoiceNumber,
      subtotal,
      tax,
      totalAmount,
      balance: totalAmount,
      createdBy: userId,
      updatedBy: userId,
    });

    return invoice.save();
  }

  async generateFromFleetTransactions(generateDto: GenerateInvoiceDto, userId: string): Promise<Invoice> {
    // This would fetch transactions from the fleet account for the period
    // For now, we'll return a placeholder implementation
    // In production, you'd integrate with TransactionsService

    const invoiceNumber = await this.generateInvoiceNumber();
    const invoiceDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (generateDto.paymentTermsDays || 30));

    // TODO: Fetch actual transactions for the fleet account in the date range
    // const transactions = await this.transactionsService.findByFleetAccountAndDateRange(...)

    const invoice = new this.invoiceModel({
      invoiceNumber,
      fleetAccountId: generateDto.fleetAccountId,
      accountNumber: 'TEMP', // Would come from fleet account
      companyName: 'TEMP', // Would come from fleet account
      invoiceDate,
      dueDate,
      periodStartDate: generateDto.periodStartDate,
      periodEndDate: generateDto.periodEndDate,
      lineItems: [], // Would be populated from transactions
      subtotal: 0,
      tax: 0,
      totalAmount: 0,
      balance: 0,
      notes: generateDto.notes,
      createdBy: userId,
      updatedBy: userId,
    });

    return invoice.save();
  }

  async findAll(filters?: any): Promise<Invoice[]> {
    const query: any = {};
    if (filters?.fleetAccountId) query.fleetAccountId = filters.fleetAccountId;
    if (filters?.status) query.status = filters.status;
    if (filters?.locationId) query.locationId = filters.locationId;

    return this.invoiceModel
      .find(query)
      .populate('fleetAccountId', 'accountNumber companyName contactName')
      .populate('locationId', 'name storeNumber')
      .sort({ invoiceDate: -1 })
      .exec();
  }

  async findById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceModel
      .findById(id)
      .populate('fleetAccountId', 'accountNumber companyName contactName email phone billingAddress')
      .populate('locationId', 'name storeNumber address')
      .populate('createdBy updatedBy', 'fullName email')
      .exec();

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice> {
    const invoice = await this.invoiceModel
      .findOne({ invoiceNumber })
      .populate('fleetAccountId', 'accountNumber companyName contactName email')
      .exec();

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceNumber} not found`);
    }

    return invoice;
  }

  async update(id: string, updateDto: UpdateInvoiceDto, userId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) throw new NotFoundException();

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Can only update draft invoices');
    }

    // Recalculate totals if line items changed
    if (updateDto.lineItems) {
      const subtotal = updateDto.lineItems.reduce((sum, item) => sum + item.amount, 0);
      const tax = updateDto.lineItems.reduce((sum, item) => sum + (item.tax || 0), 0);
      const totalAmount = updateDto.lineItems.reduce((sum, item) => sum + item.total, 0);

      Object.assign(invoice, updateDto, {
        subtotal,
        tax,
        totalAmount,
        balance: totalAmount - invoice.amountPaid,
      });
    } else {
      Object.assign(invoice, updateDto);
    }

    invoice.updatedBy = userId as any;
    return invoice.save();
  }

  async send(id: string, emailAddress: string, userId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) throw new NotFoundException();

    invoice.status = InvoiceStatus.SENT;
    invoice.emailSent = true;
    invoice.emailSentDate = new Date();
    invoice.emailAddress = emailAddress;
    invoice.updatedBy = userId as any;

    // TODO: Integrate with email service to actually send the invoice

    return invoice.save();
  }

  async markAsViewed(id: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) throw new NotFoundException();

    if (!invoice.viewed) {
      invoice.viewed = true;
      invoice.viewedDate = new Date();
      if (invoice.status === InvoiceStatus.SENT) {
        invoice.status = InvoiceStatus.VIEWED;
      }
      return invoice.save();
    }

    return invoice;
  }

  async recordPayment(id: string, paymentDto: RecordPaymentDto, userId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) throw new NotFoundException();

    if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot record payment for this invoice');
    }

    // Add payment to payments array
    invoice.payments.push({
      ...paymentDto,
      recordedBy: userId as any,
    } as any);

    // Update amounts
    invoice.amountPaid = (invoice.amountPaid || 0) + paymentDto.amount;
    invoice.balance = invoice.totalAmount - invoice.amountPaid;

    // Update status
    if (invoice.balance <= 0) {
      invoice.status = InvoiceStatus.PAID;
      invoice.paidDate = new Date();
    } else if (invoice.amountPaid > 0) {
      invoice.status = InvoiceStatus.PARTIAL_PAYMENT;
    }

    invoice.updatedBy = userId as any;
    return invoice.save();
  }

  async applyLateFee(id: string, amount: number, userId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) throw new NotFoundException();

    if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot apply late fee to this invoice');
    }

    invoice.lateFee = (invoice.lateFee || 0) + amount;
    invoice.lateFeeAppliedDate = new Date();
    invoice.totalAmount += amount;
    invoice.balance += amount;
    invoice.updatedBy = userId as any;

    return invoice.save();
  }

  async cancel(id: string, userId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) throw new NotFoundException();

    if (invoice.amountPaid > 0) {
      throw new BadRequestException('Cannot cancel invoice with payments. Issue refund first.');
    }

    invoice.status = InvoiceStatus.CANCELLED;
    invoice.updatedBy = userId as any;

    return invoice.save();
  }

  async getOverdueInvoices(fleetAccountId?: string): Promise<Invoice[]> {
    const query: any = {
      dueDate: { $lt: new Date() },
      status: { $in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.PARTIAL_PAYMENT] },
    };

    if (fleetAccountId) {
      query.fleetAccountId = fleetAccountId;
    }

    const invoices = await this.invoiceModel
      .find(query)
      .populate('fleetAccountId', 'accountNumber companyName contactName email')
      .sort({ dueDate: 1 })
      .exec();

    // Update status to overdue if not already
    for (const invoice of invoices) {
      if (invoice.status !== InvoiceStatus.OVERDUE) {
        invoice.status = InvoiceStatus.OVERDUE;
        await invoice.save();
      }
    }

    return invoices;
  }

  async getAccountSummary(fleetAccountId: string): Promise<any> {
    const invoices = await this.invoiceModel.find({ fleetAccountId }).exec();

    const summary = {
      totalInvoices: invoices.length,
      totalBilled: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      totalPaid: invoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
      totalOutstanding: invoices.reduce((sum, inv) => sum + inv.balance, 0),
      overdueAmount: 0,
      overdueCount: 0,
      byStatus: {
        draft: 0,
        sent: 0,
        viewed: 0,
        paid: 0,
        partialPayment: 0,
        overdue: 0,
        cancelled: 0,
      },
    };

    const now = new Date();
    invoices.forEach(invoice => {
      summary.byStatus[invoice.status]++;

      if (invoice.dueDate < now && invoice.balance > 0) {
        summary.overdueAmount += invoice.balance;
        summary.overdueCount++;
      }
    });

    return summary;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const count = await this.invoiceModel.countDocuments();
    const date = new Date();
    return `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(5, '0')}`;
  }

  async delete(id: string): Promise<void> {
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) throw new NotFoundException();

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft invoices');
    }

    await this.invoiceModel.deleteOne({ _id: id });
  }
}

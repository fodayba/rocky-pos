import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shift, ShiftStatus } from '../schemas/shift.schema';
import { Transaction, PaymentMethod } from '../schemas/transaction.schema';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectModel(Shift.name) private shiftModel: Model<Shift>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async openShift(
    userId: string,
    openingCash: number,
    registerNumber: string,
  ): Promise<Shift> {
    // Check if there's already an open shift
    const existingOpenShift = await this.shiftModel.findOne({
      status: ShiftStatus.OPEN,
    }).exec();

    if (existingOpenShift) {
      throw new BadRequestException('There is already an open shift. Please close it first.');
    }

    // Generate shift number (SHIFT-YYYYMMDD-XXX)
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const todayShifts = await this.shiftModel.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });
    const shiftNumber = `SHIFT-${today}-${String(todayShifts + 1).padStart(3, '0')}`;

    const shift = new this.shiftModel({
      shiftNumber,
      user: userId,
      openingCash,
      registerNumber,
      status: ShiftStatus.OPEN,
      startTime: new Date(),
    });

    return shift.save();
  }

  async closeShift(
    id: string,
    actualCash: number,
    notes?: string,
  ): Promise<Shift> {
    const shift = await this.shiftModel.findById(id).populate('user').exec();

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    if (shift.status !== ShiftStatus.OPEN) {
      throw new BadRequestException('Shift is already closed');
    }

    shift.status = ShiftStatus.CLOSED;
    shift.endTime = new Date();
    shift.closingCash = actualCash;
    shift.cashVariance = actualCash - (shift.expectedCash || shift.openingCash);

    if (notes) {
      shift.notes = notes;
    }

    return shift.save();
  }

  async findAll(): Promise<Shift[]> {
    return this.shiftModel
      .find()
      .populate('user')
      .sort({ startTime: -1 })
      .exec();
  }

  async getCurrentShift(): Promise<Shift | null> {
    return this.shiftModel
      .findOne({ status: ShiftStatus.OPEN })
      .populate('user')
      .exec();
  }

  async findOne(id: string): Promise<Shift> {
    const shift = await this.shiftModel.findById(id).populate('user').exec();
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
    return shift;
  }

  async getCurrentShiftSummary() {
    const shift = await this.getCurrentShift();

    if (!shift) {
      return null;
    }

    // Get all transactions for this shift
    const transactions = await this.transactionModel
      .find({ shiftId: shift._id })
      .exec();

    const totalTransactions = transactions.length;
    const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
    const cashSales = transactions
      .filter(t => t.paymentMethod === PaymentMethod.CASH)
      .reduce((sum, t) => sum + t.total, 0);
    const cardSales = transactions
      .filter(t => t.paymentMethod === PaymentMethod.DEBIT_CARD || t.paymentMethod === PaymentMethod.CREDIT_CARD)
      .reduce((sum, t) => sum + t.total, 0);
    const mobileSales = transactions
      .filter(t => t.paymentMethod === PaymentMethod.MOBILE)
      .reduce((sum, t) => sum + t.total, 0);

    // Calculate fuel and minimart sales
    const fuelSales = transactions.reduce((sum, t) => {
      const fuelItems = t.items.filter(item => item.isFuel);
      return sum + fuelItems.reduce((itemSum, item) => itemSum + item.subtotal, 0);
    }, 0);

    const minimartSales = transactions.reduce((sum, t) => {
      const minimartItems = t.items.filter(item => !item.isFuel);
      return sum + minimartItems.reduce((itemSum, item) => itemSum + item.subtotal, 0);
    }, 0);

    const returns = transactions
      .filter(t => t.type === 'return')
      .reduce((sum, t) => sum + t.total, 0);

    return {
      shift,
      totalTransactions,
      totalSales,
      cashSales,
      cardSales,
      mobileSales,
      fuelSales,
      minimartSales,
      returns,
    };
  }
}

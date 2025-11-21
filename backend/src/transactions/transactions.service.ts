import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from '../schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    // Generate transaction number (TXN-YYYYMMDD-XXXXX)
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const todayTransactions = await this.transactionModel.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });
    const transactionNumber = `TXN-${today}-${String(todayTransactions + 1).padStart(5, '0')}`;

    const transaction = new this.transactionModel({
      ...createTransactionDto,
      transactionNumber,
    });

    return transaction.save();
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionModel
      .find()
      .populate('user')
      .populate('customer')
      .populate('shift')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByShift(shiftId: string): Promise<Transaction[]> {
    return this.transactionModel
      .find({ shift: shiftId })
      .populate('user')
      .populate('customer')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.transactionModel
      .find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .populate('user')
      .populate('customer')
      .populate('shift')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionModel
      .findById(id)
      .populate('user')
      .populate('customer')
      .populate('shift')
      .exec();

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }
}

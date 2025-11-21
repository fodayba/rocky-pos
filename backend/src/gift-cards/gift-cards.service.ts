import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GiftCard, GiftCardStatus } from '../schemas/gift-card.schema';
import { CreateGiftCardDto } from './dto/create-gift-card.dto';
import { ReloadGiftCardDto } from './dto/reload-gift-card.dto';

@Injectable()
export class GiftCardsService {
  constructor(
    @InjectModel(GiftCard.name) private giftCardModel: Model<GiftCard>,
  ) {}

  async create(createDto: CreateGiftCardDto, locationId: string, userId: string): Promise<GiftCard> {
    const cardNumber = await this.generateCardNumber();
    const lastFourDigits = cardNumber.slice(-4);

    const giftCard = new this.giftCardModel({
      ...createDto,
      cardNumber,
      lastFourDigits,
      balance: createDto.initialValue,
      totalLoaded: createDto.initialValue,
      issueDate: new Date(),
      issuedLocationId: locationId,
      issuedBy: userId,
      createdBy: userId,
      updatedBy: userId,
    });

    giftCard.transactions.push({
      timestamp: new Date(),
      type: 'issue',
      amount: createDto.initialValue,
      balanceAfter: createDto.initialValue,
      locationId,
      userId,
    } as any);

    return giftCard.save();
  }

  async findAll(filters?: any): Promise<GiftCard[]> {
    const query = this.buildQuery(filters);
    return this.giftCardModel
      .find(query)
      .populate('issuedLocationId', 'name storeNumber')
      .populate('customerId', 'name email')
      .sort({ issueDate: -1 })
      .exec();
  }

  async findById(id: string): Promise<GiftCard> {
    const card = await this.giftCardModel
      .findById(id)
      .populate('issuedLocationId', 'name storeNumber')
      .populate('customerId', 'name email phone')
      .exec();

    if (!card) {
      throw new NotFoundException(`Gift card with ID ${id} not found`);
    }

    return card;
  }

  async findByCardNumber(cardNumber: string): Promise<GiftCard> {
    const card = await this.giftCardModel.findOne({ cardNumber }).exec();
    if (!card) {
      throw new NotFoundException(`Gift card ${cardNumber} not found`);
    }
    return card;
  }

  async checkBalance(cardNumber: string): Promise<number> {
    const card = await this.findByCardNumber(cardNumber);
    return card.balance;
  }

  async reload(cardNumber: string, reloadDto: ReloadGiftCardDto, locationId: string, userId: string): Promise<GiftCard> {
    const card = await this.findByCardNumber(cardNumber);

    if (card.status !== GiftCardStatus.ACTIVE) {
      throw new BadRequestException('Card is not active');
    }

    card.balance += reloadDto.amount;
    card.totalLoaded += reloadDto.amount;

    card.transactions.push({
      timestamp: new Date(),
      type: 'reload',
      amount: reloadDto.amount,
      balanceAfter: card.balance,
      locationId,
      userId,
    } as any);

    return card.save();
  }

  async purchase(cardNumber: string, amount: number, locationId: string, transactionId: string, userId: string): Promise<GiftCard> {
    const card = await this.findByCardNumber(cardNumber);

    if (card.status !== GiftCardStatus.ACTIVE) {
      throw new BadRequestException('Card is not active');
    }

    if (card.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    card.balance -= amount;
    card.totalSpent += amount;
    card.usageCount += 1;
    card.lastUsedDate = new Date();
    card.lastUsedLocationId = locationId as any;

    card.transactions.push({
      timestamp: new Date(),
      type: 'purchase',
      amount: -amount,
      balanceAfter: card.balance,
      locationId,
      transactionId,
      userId,
    } as any);

    return card.save();
  }

  async deactivate(cardNumber: string): Promise<GiftCard> {
    const card = await this.findByCardNumber(cardNumber);
    card.status = GiftCardStatus.INACTIVE;
    return card.save();
  }

  async reportLost(cardNumber: string): Promise<GiftCard> {
    const card = await this.findByCardNumber(cardNumber);
    card.reportedLost = true;
    card.lostReportDate = new Date();
    card.status = GiftCardStatus.SUSPENDED;
    return card.save();
  }

  async getStatistics(): Promise<any> {
    const total = await this.giftCardModel.countDocuments();
    const active = await this.giftCardModel.countDocuments({ status: GiftCardStatus.ACTIVE });

    const totalValue = await this.giftCardModel.aggregate([
      { $match: { status: GiftCardStatus.ACTIVE } },
      { $group: { _id: null, total: { $sum: '$balance' } } },
    ]);

    const totalLoaded = await this.giftCardModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalLoaded' } } },
    ]);

    const totalSpent = await this.giftCardModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalSpent' } } },
    ]);

    return {
      total,
      active,
      totalOutstanding: totalValue[0]?.total || 0,
      totalLoaded: totalLoaded[0]?.total || 0,
      totalSpent: totalSpent[0]?.total || 0,
    };
  }

  private async generateCardNumber(): Promise<string> {
    let cardNumber: string;
    let exists = true;

    while (exists) {
      cardNumber = '6100' + Math.random().toString().slice(2, 14);
      exists = !!(await this.giftCardModel.findOne({ cardNumber }));
    }

    return cardNumber;
  }

  private buildQuery(filters: any = {}): any {
    const query: any = {};
    if (filters.status) query.status = filters.status;
    if (filters.customerId) query.customerId = filters.customerId;
    return query;
  }
}

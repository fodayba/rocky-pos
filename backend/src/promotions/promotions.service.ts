import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Promotion, PromotionStatus } from '../schemas/promotion.schema';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(Promotion.name) private promotionModel: Model<Promotion>,
  ) {}

  async create(createDto: CreatePromotionDto, userId: string): Promise<Promotion> {
    if (createDto.couponCode) {
      const existing = await this.promotionModel.findOne({ couponCode: createDto.couponCode });
      if (existing) {
        throw new ConflictException(`Coupon code ${createDto.couponCode} already exists`);
      }
    }

    const promotion = new this.promotionModel({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return promotion.save();
  }

  async findAll(filters?: any): Promise<Promotion[]> {
    const query = this.buildQuery(filters);
    return this.promotionModel
      .find(query)
      .populate('createdBy updatedBy', 'fullName email')
      .sort({ startDate: -1 })
      .exec();
  }

  async findById(id: string): Promise<Promotion> {
    const promotion = await this.promotionModel
      .findById(id)
      .populate('createdBy updatedBy', 'fullName email')
      .exec();

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    return promotion;
  }

  async findByCouponCode(code: string): Promise<Promotion> {
    const promotion = await this.promotionModel.findOne({ couponCode: code }).exec();
    if (!promotion) {
      throw new NotFoundException(`Promotion with coupon code ${code} not found`);
    }
    return promotion;
  }

  async update(id: string, updateDto: UpdatePromotionDto, userId: string): Promise<Promotion> {
    const promotion = await this.promotionModel.findByIdAndUpdate(
      id,
      { ...updateDto, updatedBy: userId },
      { new: true },
    ).exec();

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    return promotion;
  }

  async remove(id: string): Promise<void> {
    const result = await this.promotionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
  }

  async activate(id: string): Promise<Promotion> {
    return this.updateStatus(id, PromotionStatus.ACTIVE);
  }

  async pause(id: string): Promise<Promotion> {
    return this.updateStatus(id, PromotionStatus.PAUSED);
  }

  async findActive(): Promise<Promotion[]> {
    const now = new Date();
    return this.promotionModel.find({
      status: PromotionStatus.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).exec();
  }

  async findByLocation(locationId: string): Promise<Promotion[]> {
    const now = new Date();
    return this.promotionModel.find({
      status: PromotionStatus.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { applicableLocations: { $size: 0 } },
        { applicableLocations: locationId },
      ],
    }).exec();
  }

  async incrementUsage(id: string): Promise<Promotion> {
    const promotion = await this.promotionModel.findById(id);
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    promotion.currentUsageCount += 1;
    return promotion.save();
  }

  async getStatistics(): Promise<any> {
    const total = await this.promotionModel.countDocuments();
    const active = await this.promotionModel.countDocuments({ status: PromotionStatus.ACTIVE });
    const expired = await this.promotionModel.countDocuments({ status: PromotionStatus.EXPIRED });

    const totalRevenue = await this.promotionModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalRevenue' } } },
    ]);

    const totalDiscount = await this.promotionModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalDiscount' } } },
    ]);

    return {
      total,
      active,
      expired,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalDiscount: totalDiscount[0]?.total || 0,
    };
  }

  private async updateStatus(id: string, status: PromotionStatus): Promise<Promotion> {
    const promotion = await this.promotionModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).exec();

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    return promotion;
  }

  private buildQuery(filters: any = {}): any {
    const query: any = {};
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    return query;
  }
}

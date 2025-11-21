import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier } from '../schemas/supplier.schema';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Supplier.name) private supplierModel: Model<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto, userId: string): Promise<Supplier> {
    // Check if supplier code already exists
    const existing = await this.supplierModel.findOne({
      supplierCode: createSupplierDto.supplierCode
    });

    if (existing) {
      throw new ConflictException(`Supplier with code ${createSupplierDto.supplierCode} already exists`);
    }

    const supplier = new this.supplierModel({
      ...createSupplierDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return supplier.save();
  }

  async findAll(filters?: any): Promise<Supplier[]> {
    const query = this.buildQuery(filters);
    return this.supplierModel
      .find(query)
      .populate('createdBy updatedBy', 'email fullName')
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string): Promise<Supplier> {
    const supplier = await this.supplierModel
      .findById(id)
      .populate('createdBy updatedBy', 'email fullName')
      .exec();

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async findByCode(supplierCode: string): Promise<Supplier> {
    const supplier = await this.supplierModel
      .findOne({ supplierCode })
      .populate('createdBy updatedBy', 'email fullName')
      .exec();

    if (!supplier) {
      throw new NotFoundException(`Supplier with code ${supplierCode} not found`);
    }

    return supplier;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto, userId: string): Promise<Supplier> {
    // If updating supplier code, check for conflicts
    if (updateSupplierDto.supplierCode) {
      const existing = await this.supplierModel.findOne({
        supplierCode: updateSupplierDto.supplierCode,
        _id: { $ne: id }
      });

      if (existing) {
        throw new ConflictException(`Supplier with code ${updateSupplierDto.supplierCode} already exists`);
      }
    }

    const supplier = await this.supplierModel.findByIdAndUpdate(
      id,
      { ...updateSupplierDto, updatedBy: userId },
      { new: true },
    ).exec();

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async remove(id: string): Promise<void> {
    const result = await this.supplierModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
  }

  async findByType(type: string): Promise<Supplier[]> {
    return this.supplierModel.find({ type, active: true }).exec();
  }

  async findActive(): Promise<Supplier[]> {
    return this.supplierModel.find({ active: true }).sort({ name: 1 }).exec();
  }

  async findPreferred(): Promise<Supplier[]> {
    return this.supplierModel.find({ active: true, preferred: true }).sort({ name: 1 }).exec();
  }

  async search(searchTerm: string): Promise<Supplier[]> {
    const regex = new RegExp(searchTerm, 'i');
    return this.supplierModel.find({
      $or: [
        { name: regex },
        { supplierCode: regex },
        { contactPerson: regex },
        { email: regex },
      ],
    }).exec();
  }

  async updateBalance(id: string, amount: number): Promise<Supplier> {
    const supplier = await this.supplierModel.findById(id);

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    supplier.currentBalance += amount;
    return supplier.save();
  }

  async recordPurchase(id: string, amount: number): Promise<Supplier> {
    const supplier = await this.supplierModel.findById(id);

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    supplier.totalPurchases += amount;
    supplier.lastOrderDate = new Date();
    return supplier.save();
  }

  async recordDelivery(id: string): Promise<Supplier> {
    const supplier = await this.supplierModel.findById(id);

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    supplier.lastDeliveryDate = new Date();
    return supplier.save();
  }

  async updatePerformanceMetrics(
    id: string,
    onTimeRate: number,
    qualityRating: number
  ): Promise<Supplier> {
    const supplier = await this.supplierModel.findByIdAndUpdate(
      id,
      { onTimeDeliveryRate: onTimeRate, qualityRating },
      { new: true }
    ).exec();

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async getStatistics(): Promise<any> {
    const total = await this.supplierModel.countDocuments();
    const active = await this.supplierModel.countDocuments({ active: true });
    const preferred = await this.supplierModel.countDocuments({ preferred: true });

    const byType = await this.supplierModel.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const totalPurchases = await this.supplierModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPurchases' } } },
    ]);

    const totalBalance = await this.supplierModel.aggregate([
      { $group: { _id: null, total: { $sum: '$currentBalance' } } },
    ]);

    return {
      total,
      active,
      preferred,
      byType,
      totalPurchases: totalPurchases[0]?.total || 0,
      totalOutstanding: totalBalance[0]?.total || 0,
    };
  }

  private buildQuery(filters: any = {}): any {
    const query: any = {};

    if (filters.type) query.type = filters.type;
    if (filters.active !== undefined) query.active = filters.active === 'true';
    if (filters.preferred !== undefined) query.preferred = filters.preferred === 'true';
    if (filters.state) query.state = filters.state;

    return query;
  }
}

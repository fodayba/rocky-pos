import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FuelProduct } from '../schemas/fuel-product.schema';

@Injectable()
export class FuelService {
  constructor(
    @InjectModel(FuelProduct.name) private fuelProductModel: Model<FuelProduct>,
  ) {}

  async findAll(): Promise<FuelProduct[]> {
    return this.fuelProductModel.find().exec();
  }

  async findOne(id: string): Promise<FuelProduct> {
    const fuel = await this.fuelProductModel.findById(id).exec();
    if (!fuel) {
      throw new NotFoundException(`Fuel product with ID ${id} not found`);
    }
    return fuel;
  }

  async updatePrice(id: string, price: number, userId: string): Promise<FuelProduct> {
    const fuel = await this.fuelProductModel.findByIdAndUpdate(
      id,
      { pricePerGallon: price, updatedBy: userId },
      { new: true },
    ).exec();

    if (!fuel) {
      throw new NotFoundException(`Fuel product with ID ${id} not found`);
    }

    return fuel;
  }

  async recordDelivery(id: string, amount: number, userId: string): Promise<FuelProduct> {
    const fuel = await this.findOne(id);
    fuel.currentStock += amount;
    fuel.lastDelivery = new Date();
    fuel.lastDeliveryAmount = amount;
    fuel.updatedBy = userId as any;
    return fuel.save();
  }

  async recordSale(id: string, gallons: number): Promise<FuelProduct> {
    const fuel = await this.findOne(id);
    if (fuel.currentStock < gallons) {
      throw new NotFoundException('Insufficient fuel in tank');
    }
    fuel.currentStock -= gallons;
    return fuel.save();
  }

  async findLowLevel(): Promise<FuelProduct[]> {
    return this.fuelProductModel.find({
      $expr: { $lte: ['$currentStock', '$minLevel'] },
    }).exec();
  }
}

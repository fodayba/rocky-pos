#!/bin/bash

# Fuel Module
cat > src/fuel/fuel.service.ts <<'EOF'
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

  async updatePrice(id: string, price: number): Promise<FuelProduct> {
    const fuel = await this.fuelProductModel.findByIdAndUpdate(
      id,
      { pricePerGallon: price },
      { new: true },
    ).exec();

    if (!fuel) {
      throw new NotFoundException(`Fuel product with ID ${id} not found`);
    }

    return fuel;
  }

  async recordDelivery(id: string, amount: number): Promise<FuelProduct> {
    const fuel = await this.findOne(id);
    fuel.currentStock += amount;
    fuel.lastDelivery = new Date();
    fuel.lastDeliveryAmount = amount;
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
EOF

cat > src/fuel/fuel.controller.ts <<'EOF'
import { Controller, Get, Patch, Post, Param, Body, UseGuards } from '@nestjs/common';
import { FuelService } from './fuel.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';

@Controller('fuel')
@UseGuards(JwtAuthGuard)
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Get()
  findAll() {
    return this.fuelService.findAll();
  }

  @Get('low-level')
  findLowLevel() {
    return this.fuelService.findLowLevel();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fuelService.findOne(id);
  }

  @Patch(':id/price')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updatePrice(@Param('id') id: string, @Body('price') price: number) {
    return this.fuelService.updatePrice(id, price);
  }

  @Post(':id/delivery')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  recordDelivery(@Param('id') id: string, @Body('amount') amount: number) {
    return this.fuelService.recordDelivery(id, amount);
  }
}
EOF

cat > src/fuel/fuel.module.ts <<'EOF'
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FuelService } from './fuel.service';
import { FuelController } from './fuel.controller';
import { FuelProduct, FuelProductSchema } from '../schemas/fuel-product.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: FuelProduct.name, schema: FuelProductSchema }])],
  controllers: [FuelController],
  providers: [FuelService],
  exports: [FuelService],
})
export class FuelModule {}
EOF

echo "Fuel module created!"

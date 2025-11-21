import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findByBarcode(barcode: string): Promise<Product> {
    const product = await this.productModel.findOne({ barcode }).exec();
    if (!product) {
      throw new NotFoundException(`Product with barcode ${barcode} not found`);
    }
    return product;
  }

  async findLowStock(): Promise<Product[]> {
    return this.productModel.find({
      $expr: { $lte: ['$stockQuantity', '$minStockLevel'] },
    }).exec();
  }

  async create(createProductDto: CreateProductDto, userId: string): Promise<Product> {
    const existing = await this.productModel.findOne({
      barcode: createProductDto.barcode,
    }).exec();

    if (existing) {
      throw new ConflictException('Product with this barcode already exists');
    }

    const product = new this.productModel({
      ...createProductDto,
      createdBy: userId,
      updatedBy: userId,
    });
    return product.save();
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      { ...updateProductDto, updatedBy: userId },
      { new: true },
    ).exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    product.stockQuantity += quantity;

    if (product.stockQuantity < 0) {
      throw new ConflictException('Insufficient stock');
    }

    return product.save();
  }
}

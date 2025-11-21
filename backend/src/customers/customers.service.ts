import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from '../schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, userId: string): Promise<Customer> {
    const customer = new this.customerModel({
      ...createCustomerDto,
      createdBy: userId,
      updatedBy: userId,
    });
    return customer.save();
  }

  async findAll(): Promise<Customer[]> {
    return this.customerModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerModel.findById(id).exec();
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string): Promise<Customer> {
    const customer = await this.customerModel.findByIdAndUpdate(
      id,
      { ...updateCustomerDto, updatedBy: userId },
      { new: true },
    ).exec();

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async recordPurchase(id: string, amount: number): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.totalSpent += amount;
    customer.visitCount += 1;
    customer.loyaltyPoints += Math.floor(amount); // 1 point per dollar
    customer.lastVisit = new Date();
    return customer.save();
  }

  async redeemPoints(id: string, points: number): Promise<Customer> {
    const customer = await this.findOne(id);
    if (customer.loyaltyPoints < points) {
      throw new NotFoundException('Insufficient loyalty points');
    }
    customer.loyaltyPoints -= points;
    return customer.save();
  }

  async search(query: string): Promise<Customer[]> {
    return this.customerModel.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') },
        { phone: new RegExp(query, 'i') },
      ],
    }).exec();
  }
}

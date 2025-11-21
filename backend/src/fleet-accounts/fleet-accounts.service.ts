import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FleetAccount } from '../schemas/fleet-account.schema';
import { CreateFleetAccountDto } from './dto/create-fleet-account.dto';
import { UpdateFleetAccountDto } from './dto/update-fleet-account.dto';
import { AddVehicleDto } from './dto/add-vehicle.dto';
import { AddDriverDto } from './dto/add-driver.dto';
import { AddCardDto } from './dto/add-card.dto';

@Injectable()
export class FleetAccountsService {
  constructor(
    @InjectModel(FleetAccount.name) private fleetAccountModel: Model<FleetAccount>,
  ) {}

  async create(createDto: CreateFleetAccountDto, userId: string): Promise<FleetAccount> {
    const existing = await this.fleetAccountModel.findOne({
      accountNumber: createDto.accountNumber
    });

    if (existing) {
      throw new ConflictException(`Fleet account ${createDto.accountNumber} already exists`);
    }

    const account = new this.fleetAccountModel({
      ...createDto,
      availableCredit: createDto.creditLimit,
      accountOpenDate: new Date(),
      createdBy: userId,
      updatedBy: userId,
    });

    return account.save();
  }

  async findAll(filters?: any): Promise<FleetAccount[]> {
    const query = this.buildQuery(filters);
    return this.fleetAccountModel
      .find(query)
      .populate('createdBy updatedBy approvedBy', 'email fullName')
      .sort({ companyName: 1 })
      .exec();
  }

  async findById(id: string): Promise<FleetAccount> {
    const account = await this.fleetAccountModel
      .findById(id)
      .populate('createdBy updatedBy approvedBy', 'email fullName')
      .populate('allowedLocations', 'name storeNumber')
      .exec();

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${id} not found`);
    }

    return account;
  }

  async findByAccountNumber(accountNumber: string): Promise<FleetAccount> {
    const account = await this.fleetAccountModel
      .findOne({ accountNumber })
      .populate('createdBy updatedBy', 'email fullName')
      .exec();

    if (!account) {
      throw new NotFoundException(`Fleet account ${accountNumber} not found`);
    }

    return account;
  }

  async findByCardNumber(cardNumber: string): Promise<FleetAccount> {
    const account = await this.fleetAccountModel
      .findOne({ 'cards.cardNumber': cardNumber })
      .exec();

    if (!account) {
      throw new NotFoundException(`No account found for card ${cardNumber}`);
    }

    return account;
  }

  async update(id: string, updateDto: UpdateFleetAccountDto, userId: string): Promise<FleetAccount> {
    const account = await this.fleetAccountModel.findByIdAndUpdate(
      id,
      { ...updateDto, updatedBy: userId },
      { new: true },
    ).exec();

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${id} not found`);
    }

    return account;
  }

  async remove(id: string): Promise<void> {
    const result = await this.fleetAccountModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Fleet account with ID ${id} not found`);
    }
  }

  // Vehicle management
  async addVehicle(accountId: string, vehicleDto: AddVehicleDto): Promise<FleetAccount> {
    const account = await this.fleetAccountModel.findById(accountId);

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${accountId} not found`);
    }

    // Check if vehicle number already exists
    const exists = account.vehicles.some(v => v.vehicleNumber === vehicleDto.vehicleNumber);
    if (exists) {
      throw new ConflictException(`Vehicle ${vehicleDto.vehicleNumber} already exists`);
    }

    account.vehicles.push(vehicleDto as any);
    return account.save();
  }

  async updateVehicle(accountId: string, vehicleNumber: string, vehicleDto: Partial<AddVehicleDto>): Promise<FleetAccount> {
    const account = await this.fleetAccountModel.findById(accountId);

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${accountId} not found`);
    }

    const vehicle = account.vehicles.find(v => v.vehicleNumber === vehicleNumber);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${vehicleNumber} not found`);
    }

    Object.assign(vehicle, vehicleDto);
    return account.save();
  }

  async removeVehicle(accountId: string, vehicleNumber: string): Promise<FleetAccount> {
    const account = await this.fleetAccountModel.findById(accountId);

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${accountId} not found`);
    }

    account.vehicles = account.vehicles.filter(v => v.vehicleNumber !== vehicleNumber);
    return account.save();
  }

  // Driver management
  async addDriver(accountId: string, driverDto: AddDriverDto): Promise<FleetAccount> {
    const account = await this.fleetAccountModel.findById(accountId);

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${accountId} not found`);
    }

    const exists = account.drivers.some(d => d.driverNumber === driverDto.driverNumber);
    if (exists) {
      throw new ConflictException(`Driver ${driverDto.driverNumber} already exists`);
    }

    account.drivers.push(driverDto as any);
    return account.save();
  }

  async updateDriver(accountId: string, driverNumber: string, driverDto: Partial<AddDriverDto>): Promise<FleetAccount> {
    const account = await this.fleetAccountModel.findById(accountId);

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${accountId} not found`);
    }

    const driver = account.drivers.find(d => d.driverNumber === driverNumber);
    if (!driver) {
      throw new NotFoundException(`Driver ${driverNumber} not found`);
    }

    Object.assign(driver, driverDto);
    return account.save();
  }

  async removeDriver(accountId: string, driverNumber: string): Promise<FleetAccount> {
    const account = await this.fleetAccountModel.findById(accountId);

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${accountId} not found`);
    }

    account.drivers = account.drivers.filter(d => d.driverNumber !== driverNumber);
    return account.save();
  }

  // Card management
  async addCard(accountId: string, cardDto: AddCardDto): Promise<FleetAccount> {
    const account = await this.fleetAccountModel.findById(accountId);

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${accountId} not found`);
    }

    const exists = account.cards.some(c => c.cardNumber === cardDto.cardNumber);
    if (exists) {
      throw new ConflictException(`Card ${cardDto.cardNumber} already exists`);
    }

    const card: any = {
      ...cardDto,
      lastFourDigits: cardDto.cardNumber.slice(-4),
      issueDate: new Date(),
    };

    account.cards.push(card);
    return account.save();
  }

  async updateCard(accountId: string, cardNumber: string, cardDto: Partial<AddCardDto>): Promise<FleetAccount> {
    const account = await this.fleetAccountModel.findById(accountId);

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${accountId} not found`);
    }

    const card = account.cards.find(c => c.cardNumber === cardNumber);
    if (!card) {
      throw new NotFoundException(`Card ${cardNumber} not found`);
    }

    Object.assign(card, cardDto);
    return account.save();
  }

  async deactivateCard(accountId: string, cardNumber: string): Promise<FleetAccount> {
    return this.updateCard(accountId, cardNumber, { active: false });
  }

  async removeCard(accountId: string, cardNumber: string): Promise<FleetAccount> {
    const account = await this.fleetAccountModel.findById(accountId);

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${accountId} not found`);
    }

    account.cards = account.cards.filter(c => c.cardNumber !== cardNumber);
    return account.save();
  }

  // Balance and credit management
  async updateBalance(accountId: string, amount: number): Promise<FleetAccount> {
    const account = await this.fleetAccountModel.findById(accountId);

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${accountId} not found`);
    }

    account.currentBalance += amount;
    account.availableCredit = account.creditLimit - account.currentBalance;

    if (account.availableCredit < 0) {
      account.availableCredit = 0;
    }

    return account.save();
  }

  async recordPayment(accountId: string, amount: number): Promise<FleetAccount> {
    const account = await this.fleetAccountModel.findById(accountId);

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${accountId} not found`);
    }

    account.currentBalance -= amount;
    if (account.currentBalance < 0) account.currentBalance = 0;

    account.availableCredit = account.creditLimit - account.currentBalance;
    account.lastPaymentDate = new Date();
    account.lastPaymentAmount = amount;

    return account.save();
  }

  async checkCreditAvailable(accountId: string, amount: number): Promise<boolean> {
    const account = await this.fleetAccountModel.findById(accountId);

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${accountId} not found`);
    }

    if (account.status !== 'active') {
      return false;
    }

    return account.availableCredit >= amount;
  }

  // Status management
  async approveAccount(accountId: string, userId: string): Promise<FleetAccount> {
    const account = await this.fleetAccountModel.findByIdAndUpdate(
      accountId,
      {
        status: 'active',
        approvedBy: userId,
        approvalDate: new Date(),
      },
      { new: true },
    ).exec();

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${accountId} not found`);
    }

    return account;
  }

  async suspendAccount(accountId: string, reason: string): Promise<FleetAccount> {
    const account = await this.fleetAccountModel.findByIdAndUpdate(
      accountId,
      {
        status: 'suspended',
        suspensionReason: reason,
      },
      { new: true },
    ).exec();

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${accountId} not found`);
    }

    return account;
  }

  async closeAccount(accountId: string, reason: string): Promise<FleetAccount> {
    const account = await this.fleetAccountModel.findByIdAndUpdate(
      accountId,
      {
        status: 'closed',
        closureReason: reason,
      },
      { new: true },
    ).exec();

    if (!account) {
      throw new NotFoundException(`Fleet account with ID ${accountId} not found`);
    }

    return account;
  }

  // Query methods
  async findActive(): Promise<FleetAccount[]> {
    return this.fleetAccountModel.find({ status: 'active' }).exec();
  }

  async findPendingApproval(): Promise<FleetAccount[]> {
    return this.fleetAccountModel.find({ status: 'pending_approval' }).exec();
  }

  async findOverdue(): Promise<FleetAccount[]> {
    return this.fleetAccountModel.find({
      status: 'active',
      pastDueAmount: { $gt: 0 },
    }).exec();
  }

  async search(searchTerm: string): Promise<FleetAccount[]> {
    const regex = new RegExp(searchTerm, 'i');
    return this.fleetAccountModel.find({
      $or: [
        { companyName: regex },
        { accountNumber: regex },
        { contactName: regex },
        { email: regex },
      ],
    }).exec();
  }

  async getStatistics(): Promise<any> {
    const total = await this.fleetAccountModel.countDocuments();
    const active = await this.fleetAccountModel.countDocuments({ status: 'active' });
    const pending = await this.fleetAccountModel.countDocuments({ status: 'pending_approval' });
    const suspended = await this.fleetAccountModel.countDocuments({ status: 'suspended' });

    const totalCredit = await this.fleetAccountModel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$creditLimit' } } },
    ]);

    const totalOutstanding = await this.fleetAccountModel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$currentBalance' } } },
    ]);

    const totalOverdue = await this.fleetAccountModel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$pastDueAmount' } } },
    ]);

    return {
      total,
      active,
      pending,
      suspended,
      totalCreditLimit: totalCredit[0]?.total || 0,
      totalOutstanding: totalOutstanding[0]?.total || 0,
      totalOverdue: totalOverdue[0]?.total || 0,
    };
  }

  private buildQuery(filters: any = {}): any {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.paymentTerms) query.paymentTerms = filters.paymentTerms;

    return query;
  }
}

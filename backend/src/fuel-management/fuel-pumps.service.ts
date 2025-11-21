import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FuelPump, PumpStatus } from '../schemas/fuel-pump.schema';
import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';
import { AuthorizePumpDto } from './dto/authorize-pump.dto';

@Injectable()
export class FuelPumpsService {
  constructor(
    @InjectModel(FuelPump.name) private pumpModel: Model<FuelPump>,
  ) {}

  async create(createDto: CreatePumpDto, userId: string): Promise<FuelPump> {
    const pump = new this.pumpModel({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return pump.save();
  }

  async findAll(filters?: any): Promise<FuelPump[]> {
    const query: any = {};
    if (filters?.locationId) query.locationId = filters.locationId;
    if (filters?.status) query.status = filters.status;

    return this.pumpModel
      .find(query)
      .populate('locationId', 'name storeNumber')
      .populate('nozzles.tankId', 'tankNumber fuelType currentLevel')
      .sort({ pumpNumber: 1 })
      .exec();
  }

  async findById(id: string): Promise<FuelPump> {
    const pump = await this.pumpModel
      .findById(id)
      .populate('locationId', 'name storeNumber address')
      .populate('nozzles.tankId', 'tankNumber fuelType currentLevel capacity')
      .populate('currentTransactionId')
      .exec();

    if (!pump) {
      throw new NotFoundException(`Pump with ID ${id} not found`);
    }

    return pump;
  }

  async findByLocation(locationId: string): Promise<FuelPump[]> {
    return this.pumpModel
      .find({ locationId })
      .populate('nozzles.tankId', 'tankNumber fuelType currentLevel')
      .sort({ pumpNumber: 1 })
      .exec();
  }

  async findByPumpNumber(locationId: string, pumpNumber: string): Promise<FuelPump> {
    const pump = await this.pumpModel
      .findOne({ locationId, pumpNumber })
      .populate('nozzles.tankId', 'tankNumber fuelType currentLevel')
      .exec();

    if (!pump) {
      throw new NotFoundException(`Pump ${pumpNumber} not found at this location`);
    }

    return pump;
  }

  async update(id: string, updateDto: UpdatePumpDto, userId: string): Promise<FuelPump> {
    const pump = await this.pumpModel.findById(id);
    if (!pump) throw new NotFoundException();

    Object.assign(pump, updateDto);
    pump.updatedBy = userId as any;

    return pump.save();
  }

  async updateStatus(id: string, status: PumpStatus, userId: string): Promise<FuelPump> {
    const pump = await this.pumpModel.findById(id);
    if (!pump) throw new NotFoundException();

    pump.status = status;
    pump.updatedBy = userId as any;

    // Clear authorization if setting to available or out of service
    if (status === PumpStatus.AVAILABLE || status === PumpStatus.OUT_OF_SERVICE) {
      pump.authorizedAmount = null as any;
      pump.authorizationTime = null as any;
      pump.currentTransactionId = null as any;
    }

    return pump.save();
  }

  async authorize(id: string, authorizeDto: AuthorizePumpDto, userId: string): Promise<FuelPump> {
    const pump = await this.pumpModel.findById(id);
    if (!pump) throw new NotFoundException();

    if (pump.status !== PumpStatus.AVAILABLE) {
      throw new BadRequestException('Pump is not available for authorization');
    }

    pump.status = PumpStatus.AUTHORIZED;
    pump.authorizedAmount = authorizeDto.authorizedAmount;
    pump.authorizationTime = new Date();
    if (authorizeDto.transactionId) {
      pump.currentTransactionId = authorizeDto.transactionId as any;
    }
    pump.updatedBy = userId as any;

    return pump.save();
  }

  async startTransaction(id: string, transactionId: string, userId: string): Promise<FuelPump> {
    const pump = await this.pumpModel.findById(id);
    if (!pump) throw new NotFoundException();

    if (pump.status !== PumpStatus.AUTHORIZED && pump.status !== PumpStatus.AVAILABLE) {
      throw new BadRequestException('Pump is not available to start transaction');
    }

    pump.status = PumpStatus.IN_USE;
    pump.currentTransactionId = transactionId as any;
    pump.updatedBy = userId as any;

    return pump.save();
  }

  async endTransaction(id: string, gallons: number, amount: number, userId: string): Promise<FuelPump> {
    const pump = await this.pumpModel.findById(id);
    if (!pump) throw new NotFoundException();

    if (pump.status !== PumpStatus.IN_USE) {
      throw new BadRequestException('Pump is not in use');
    }

    // Update metrics
    pump.todaySales = (pump.todaySales || 0) + amount;
    pump.todayTransactions = (pump.todayTransactions || 0) + 1;
    pump.totalSales = (pump.totalSales || 0) + amount;
    pump.totalTransactions = (pump.totalTransactions || 0) + 1;

    // Reset status
    pump.status = PumpStatus.AVAILABLE;
    pump.currentTransactionId = null as any;
    pump.authorizedAmount = null as any;
    pump.authorizationTime = null as any;
    pump.updatedBy = userId as any;

    return pump.save();
  }

  async cancelAuthorization(id: string, userId: string): Promise<FuelPump> {
    const pump = await this.pumpModel.findById(id);
    if (!pump) throw new NotFoundException();

    if (pump.status !== PumpStatus.AUTHORIZED) {
      throw new BadRequestException('Pump is not authorized');
    }

    pump.status = PumpStatus.AVAILABLE;
    pump.authorizedAmount = null as any;
    pump.authorizationTime = null as any;
    pump.currentTransactionId = null as any;
    pump.updatedBy = userId as any;

    return pump.save();
  }

  async resetDailyMetrics(locationId?: string): Promise<void> {
    const query = locationId ? { locationId } : {};

    await this.pumpModel.updateMany(query, {
      $set: {
        todaySales: 0,
        todayTransactions: 0,
        'nozzles.$[].todayGallons': 0,
      },
    });
  }

  async scheduleMaintenance(id: string, maintenanceDate: Date, userId: string): Promise<FuelPump> {
    const pump = await this.pumpModel.findById(id);
    if (!pump) throw new NotFoundException();

    pump.nextMaintenanceDate = maintenanceDate;
    pump.updatedBy = userId as any;

    return pump.save();
  }

  async recordMaintenance(id: string, userId: string): Promise<FuelPump> {
    const pump = await this.pumpModel.findById(id);
    if (!pump) throw new NotFoundException();

    pump.lastMaintenanceDate = new Date();
    pump.status = PumpStatus.AVAILABLE; // Assume maintenance completes successfully
    pump.updatedBy = userId as any;

    return pump.save();
  }

  async getAvailablePumps(locationId: string): Promise<FuelPump[]> {
    return this.pumpModel
      .find({
        locationId,
        status: { $in: [PumpStatus.AVAILABLE, PumpStatus.AUTHORIZED] }
      })
      .populate('nozzles.tankId', 'tankNumber fuelType currentLevel')
      .sort({ pumpNumber: 1 })
      .exec();
  }

  async delete(id: string): Promise<void> {
    const result = await this.pumpModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Pump with ID ${id} not found`);
    }
  }
}

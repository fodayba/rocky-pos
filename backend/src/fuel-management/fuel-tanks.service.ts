import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FuelTank, TankStatus } from '../schemas/fuel-tank.schema';
import { CreateTankDto } from './dto/create-tank.dto';
import { UpdateTankDto } from './dto/update-tank.dto';
import { TankReadingDto } from './dto/tank-reading.dto';

@Injectable()
export class FuelTanksService {
  constructor(
    @InjectModel(FuelTank.name) private tankModel: Model<FuelTank>,
  ) {}

  async create(createDto: CreateTankDto, userId: string): Promise<FuelTank> {
    const tank = new this.tankModel({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return tank.save();
  }

  async findAll(filters?: any): Promise<FuelTank[]> {
    const query: any = {};
    if (filters?.locationId) query.locationId = filters.locationId;
    if (filters?.status) query.status = filters.status;
    if (filters?.fuelType) query.fuelType = filters.fuelType;

    return this.tankModel
      .find(query)
      .populate('locationId', 'name storeNumber')
      .sort({ tankNumber: 1 })
      .exec();
  }

  async findById(id: string): Promise<FuelTank> {
    const tank = await this.tankModel
      .findById(id)
      .populate('locationId', 'name storeNumber address')
      .exec();

    if (!tank) {
      throw new NotFoundException(`Tank with ID ${id} not found`);
    }

    return tank;
  }

  async findByLocation(locationId: string): Promise<FuelTank[]> {
    return this.tankModel
      .find({ locationId })
      .sort({ tankNumber: 1 })
      .exec();
  }

  async findByTankNumber(locationId: string, tankNumber: string): Promise<FuelTank> {
    const tank = await this.tankModel
      .findOne({ locationId, tankNumber })
      .exec();

    if (!tank) {
      throw new NotFoundException(`Tank ${tankNumber} not found at this location`);
    }

    return tank;
  }

  async update(id: string, updateDto: UpdateTankDto, userId: string): Promise<FuelTank> {
    const tank = await this.tankModel.findById(id);
    if (!tank) throw new NotFoundException();

    Object.assign(tank, updateDto);
    tank.updatedBy = userId as any;

    return tank.save();
  }

  async updateReading(id: string, readingDto: TankReadingDto, userId: string): Promise<FuelTank> {
    const tank = await this.tankModel.findById(id);
    if (!tank) throw new NotFoundException();

    // Update current readings
    tank.currentLevel = readingDto.currentLevel;
    if (readingDto.currentTemperature !== undefined) {
      tank.currentTemperature = readingDto.currentTemperature;
    }
    if (readingDto.waterLevel !== undefined) {
      tank.waterLevel = readingDto.waterLevel;
    }
    if (readingDto.waterDetected !== undefined) {
      tank.waterDetected = readingDto.waterDetected;
    }
    if (readingDto.leakDetected !== undefined) {
      tank.leakDetected = readingDto.leakDetected;
    }
    if (readingDto.ullage !== undefined) {
      tank.ullage = readingDto.ullage;
    }

    // Check for alerts
    if (tank.currentLevel < tank.minLevel) {
      // Low level alert - would integrate with notification system
    }
    if (tank.currentLevel > tank.maxSafeLevel) {
      // Overfill alert
    }
    if (tank.currentTemperature && tank.maxTemperature && tank.currentTemperature > tank.maxTemperature) {
      // High temperature alert
    }
    if (tank.waterDetected) {
      // Water detected alert
    }
    if (tank.leakDetected) {
      // Leak detected alert - critical
    }

    tank.updatedBy = userId as any;
    return tank.save();
  }

  async addFuel(id: string, gallons: number, userId: string): Promise<FuelTank> {
    const tank = await this.tankModel.findById(id);
    if (!tank) throw new NotFoundException();

    const newLevel = tank.currentLevel + gallons;

    if (newLevel > tank.capacity) {
      throw new BadRequestException(`Cannot add ${gallons} gallons. Tank capacity exceeded.`);
    }

    tank.currentLevel = newLevel;
    tank.ullage = tank.capacity - newLevel;
    tank.updatedBy = userId as any;

    return tank.save();
  }

  async removeFuel(id: string, gallons: number, userId: string): Promise<FuelTank> {
    const tank = await this.tankModel.findById(id);
    if (!tank) throw new NotFoundException();

    const newLevel = tank.currentLevel - gallons;

    if (newLevel < 0) {
      throw new BadRequestException(`Cannot remove ${gallons} gallons. Insufficient fuel in tank.`);
    }

    tank.currentLevel = newLevel;
    tank.ullage = tank.capacity - newLevel;
    tank.updatedBy = userId as any;

    return tank.save();
  }

  async updateStatus(id: string, status: TankStatus, userId: string): Promise<FuelTank> {
    const tank = await this.tankModel.findById(id);
    if (!tank) throw new NotFoundException();

    tank.status = status;
    tank.updatedBy = userId as any;

    return tank.save();
  }

  async recordInspection(id: string, userId: string): Promise<FuelTank> {
    const tank = await this.tankModel.findById(id);
    if (!tank) throw new NotFoundException();

    tank.lastInspectionDate = new Date();
    // Schedule next inspection in 1 year (EPA requirement)
    const nextInspection = new Date();
    nextInspection.setFullYear(nextInspection.getFullYear() + 1);
    tank.nextInspectionDate = nextInspection;
    tank.updatedBy = userId as any;

    return tank.save();
  }

  async recordLeakTest(id: string, leakDetected: boolean, userId: string): Promise<FuelTank> {
    const tank = await this.tankModel.findById(id);
    if (!tank) throw new NotFoundException();

    tank.lastLeakTest = new Date();
    tank.leakDetected = leakDetected;

    // Schedule next leak test in 30 days
    const nextTest = new Date();
    nextTest.setDate(nextTest.getDate() + 30);
    tank.nextLeakTestDue = nextTest;

    if (leakDetected) {
      tank.status = TankStatus.MAINTENANCE;
    }

    tank.updatedBy = userId as any;
    return tank.save();
  }

  async recordCathodicTest(id: string, userId: string): Promise<FuelTank> {
    const tank = await this.tankModel.findById(id);
    if (!tank) throw new NotFoundException();

    if (!tank.hasCathodicProtection) {
      throw new BadRequestException('Tank does not have cathodic protection system');
    }

    tank.lastCathodicTest = new Date();
    tank.updatedBy = userId as any;

    return tank.save();
  }

  async getLowLevelTanks(locationId?: string): Promise<FuelTank[]> {
    const query: any = {
      $expr: { $lt: ['$currentLevel', '$minLevel'] },
      status: TankStatus.ACTIVE,
    };

    if (locationId) {
      query.locationId = locationId;
    }

    return this.tankModel
      .find(query)
      .populate('locationId', 'name storeNumber')
      .sort({ currentLevel: 1 })
      .exec();
  }

  async getAlertsForLocation(locationId: string): Promise<any> {
    const tanks = await this.tankModel.find({ locationId }).exec();

    const alerts = {
      lowLevel: [],
      highTemperature: [],
      waterDetected: [],
      leaksDetected: [],
      inspectionDue: [],
      leakTestDue: [],
    };

    const now = new Date();

    tanks.forEach(tank => {
      if (tank.currentLevel < tank.minLevel) {
        alerts.lowLevel.push(tank);
      }
      if (tank.currentTemperature && tank.maxTemperature && tank.currentTemperature > tank.maxTemperature) {
        alerts.highTemperature.push(tank);
      }
      if (tank.waterDetected) {
        alerts.waterDetected.push(tank);
      }
      if (tank.leakDetected) {
        alerts.leaksDetected.push(tank);
      }
      if (tank.nextInspectionDate && tank.nextInspectionDate < now) {
        alerts.inspectionDue.push(tank);
      }
      if (tank.nextLeakTestDue && tank.nextLeakTestDue < now) {
        alerts.leakTestDue.push(tank);
      }
    });

    return alerts;
  }

  async delete(id: string): Promise<void> {
    const result = await this.tankModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Tank with ID ${id} not found`);
    }
  }
}

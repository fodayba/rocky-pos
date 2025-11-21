import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location, LocationDocument } from '../schemas/location.schema';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
  ) {}

  async create(createLocationDto: CreateLocationDto, userId: string): Promise<Location> {
    // Check if store number already exists
    const existing = await this.locationModel.findOne({ storeNumber: createLocationDto.storeNumber });
    if (existing) {
      throw new ConflictException(`Location with store number ${createLocationDto.storeNumber} already exists`);
    }

    const location = new this.locationModel({
      ...createLocationDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return location.save();
  }

  async findAll(filters?: any): Promise<Location[]> {
    const query = this.buildQuery(filters);
    return this.locationModel.find(query).populate('createdBy updatedBy', 'email fullName').exec();
  }

  async findById(id: string): Promise<Location> {
    const location = await this.locationModel
      .findById(id)
      .populate('createdBy updatedBy', 'email fullName')
      .populate('parentLocationId', 'storeNumber name')
      .populate('inventorySourceLocationId', 'storeNumber name')
      .exec();

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  async findByStoreNumber(storeNumber: string): Promise<Location> {
    const location = await this.locationModel
      .findOne({ storeNumber })
      .populate('createdBy updatedBy', 'email fullName')
      .exec();

    if (!location) {
      throw new NotFoundException(`Location with store number ${storeNumber} not found`);
    }

    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto, userId: string): Promise<Location> {
    // If updating store number, check for conflicts
    if (updateLocationDto.storeNumber) {
      const existing = await this.locationModel.findOne({
        storeNumber: updateLocationDto.storeNumber,
        _id: { $ne: id }
      });
      if (existing) {
        throw new ConflictException(`Location with store number ${updateLocationDto.storeNumber} already exists`);
      }
    }

    const location = await this.locationModel.findByIdAndUpdate(
      id,
      { ...updateLocationDto, updatedBy: userId },
      { new: true },
    ).exec();

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  async remove(id: string): Promise<void> {
    const result = await this.locationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
  }

  // Get locations by region
  async findByRegion(regionId: string): Promise<Location[]> {
    return this.locationModel.find({ regionId }).exec();
  }

  // Get locations by district
  async findByDistrict(districtId: string): Promise<Location[]> {
    return this.locationModel.find({ districtId }).exec();
  }

  // Get active locations
  async findActive(): Promise<Location[]> {
    return this.locationModel.find({ status: 'active' }).exec();
  }

  // Get locations by state
  async findByState(state: string): Promise<Location[]> {
    return this.locationModel.find({ state }).exec();
  }

  // Get locations by type
  async findByType(locationType: string): Promise<Location[]> {
    return this.locationModel.find({ locationType }).exec();
  }

  // Get locations by store format
  async findByStoreFormat(storeFormat: string): Promise<Location[]> {
    return this.locationModel.find({ storeFormat }).exec();
  }

  // Get locations with fuel pumps
  async findWithFuel(): Promise<Location[]> {
    return this.locationModel.find({ hasFuelPumps: true }).exec();
  }

  // Get locations with mini mart
  async findWithMiniMart(): Promise<Location[]> {
    return this.locationModel.find({ hasMiniMart: true }).exec();
  }

  // Update location metrics (called by analytics service)
  async updateMetrics(id: string, metrics: any): Promise<Location> {
    const location = await this.locationModel.findByIdAndUpdate(
      id,
      {
        metrics: {
          ...metrics,
          lastUpdated: new Date(),
        }
      },
      { new: true },
    ).exec();

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  // Search locations
  async search(searchTerm: string): Promise<Location[]> {
    const regex = new RegExp(searchTerm, 'i');
    return this.locationModel.find({
      $or: [
        { name: regex },
        { storeNumber: regex },
        { address: regex },
        { city: regex },
        { state: regex },
        { zipCode: regex },
      ],
    }).exec();
  }

  // Get locations near coordinates (for mobile apps, delivery, etc.)
  async findNearby(latitude: number, longitude: number, maxDistance: number = 50000): Promise<Location[]> {
    // maxDistance in meters (50000m = 50km)
    return this.locationModel.find({
      latitude: { $exists: true },
      longitude: { $exists: true },
      $where: function() {
        // Simple distance calculation (Haversine formula would be better for production)
        const latDiff = Math.abs(this.latitude - latitude);
        const lonDiff = Math.abs(this.longitude - longitude);
        return latDiff < 0.5 && lonDiff < 0.5; // Rough approximation
      }
    }).exec();
  }

  // Get locations with expiring licenses
  async findExpiringLicenses(daysAhead: number = 30): Promise<Location[]> {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() + daysAhead);

    return this.locationModel.find({
      $or: [
        { businessLicenseExpiry: { $lte: checkDate, $gte: new Date() } },
        { fuelLicenseExpiry: { $lte: checkDate, $gte: new Date() } },
        { tobaccoLicenseExpiry: { $lte: checkDate, $gte: new Date() } },
        { alcoholLicenseExpiry: { $lte: checkDate, $gte: new Date() } },
      ],
    }).exec();
  }

  // Get locations due for inspection
  async findDueForInspection(): Promise<Location[]> {
    const today = new Date();
    return this.locationModel.find({
      nextInspectionDate: { $lte: today },
    }).exec();
  }

  // Deactivate/activate location
  async updateStatus(id: string, status: string, reason?: string, userId?: string): Promise<Location> {
    const updateData: any = { status };
    if (reason) updateData.statusReason = reason;
    if (userId) updateData.updatedBy = userId;

    const location = await this.locationModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    ).exec();

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  // Helper method to build query from filters
  private buildQuery(filters: any = {}): any {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.state) query.state = filters.state;
    if (filters.city) query.city = filters.city;
    if (filters.regionId) query.regionId = filters.regionId;
    if (filters.districtId) query.districtId = filters.districtId;
    if (filters.locationType) query.locationType = filters.locationType;
    if (filters.storeFormat) query.storeFormat = filters.storeFormat;
    if (filters.hasFuelPumps !== undefined) query.hasFuelPumps = filters.hasFuelPumps === 'true';
    if (filters.hasMiniMart !== undefined) query.hasMiniMart = filters.hasMiniMart === 'true';

    return query;
  }

  // Get location statistics
  async getStatistics(): Promise<any> {
    const total = await this.locationModel.countDocuments();
    const active = await this.locationModel.countDocuments({ status: 'active' });
    const inactive = await this.locationModel.countDocuments({ status: 'inactive' });
    const withFuel = await this.locationModel.countDocuments({ hasFuelPumps: true });
    const withMiniMart = await this.locationModel.countDocuments({ hasMiniMart: true });

    const byState = await this.locationModel.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byFormat = await this.locationModel.aggregate([
      { $group: { _id: '$storeFormat', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return {
      total,
      active,
      inactive,
      withFuel,
      withMiniMart,
      byState,
      byFormat,
    };
  }
}

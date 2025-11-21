import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule } from '../schemas/schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AddShiftDto } from './dto/add-shift.dto';

@Injectable()
export class SchedulingService {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
  ) {}

  async create(createDto: CreateScheduleDto, userId: string): Promise<Schedule> {
    const schedule = new this.scheduleModel({
      ...createDto,
      status: 'draft',
      createdBy: userId,
      updatedBy: userId,
    });

    return schedule.save();
  }

  async findAll(filters?: any): Promise<Schedule[]> {
    const query: any = {};
    if (filters?.locationId) query.locationId = filters.locationId;
    if (filters?.status) query.status = filters.status;
    if (filters?.weekStartDate) query.weekStartDate = { $gte: new Date(filters.weekStartDate) };

    return this.scheduleModel
      .find(query)
      .populate('locationId', 'name storeNumber')
      .populate('shifts.employeeId', 'fullName email')
      .populate('shifts.replacementEmployeeId', 'fullName email')
      .sort({ weekStartDate: -1 })
      .exec();
  }

  async findById(id: string): Promise<Schedule> {
    const schedule = await this.scheduleModel
      .findById(id)
      .populate('locationId', 'name storeNumber address')
      .populate('shifts.employeeId', 'fullName email phone position')
      .populate('shifts.replacementEmployeeId', 'fullName email phone')
      .populate('publishedBy', 'fullName email')
      .exec();

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async findByLocation(locationId: string, startDate?: Date, endDate?: Date): Promise<Schedule[]> {
    const query: any = { locationId };

    if (startDate && endDate) {
      query.$or = [
        { weekStartDate: { $gte: startDate, $lte: endDate } },
        { weekEndDate: { $gte: startDate, $lte: endDate } },
      ];
    }

    return this.scheduleModel
      .find(query)
      .populate('shifts.employeeId', 'fullName email position')
      .sort({ weekStartDate: 1 })
      .exec();
  }

  async findByEmployee(employeeId: string, startDate?: Date, endDate?: Date): Promise<Schedule[]> {
    const query: any = { 'shifts.employeeId': employeeId };

    if (startDate && endDate) {
      query.$or = [
        { weekStartDate: { $gte: startDate, $lte: endDate } },
        { weekEndDate: { $gte: startDate, $lte: endDate } },
      ];
    }

    return this.scheduleModel
      .find(query)
      .populate('locationId', 'name storeNumber')
      .sort({ weekStartDate: 1 })
      .exec();
  }

  async findForWeek(locationId: string, weekStartDate: Date): Promise<Schedule> {
    const schedule = await this.scheduleModel
      .findOne({ locationId, weekStartDate })
      .populate('shifts.employeeId', 'fullName email position')
      .exec();

    if (!schedule) {
      throw new NotFoundException('Schedule not found for this week');
    }

    return schedule;
  }

  async update(id: string, updateDto: UpdateScheduleDto, userId: string): Promise<Schedule> {
    const schedule = await this.scheduleModel.findById(id);
    if (!schedule) throw new NotFoundException();

    if (schedule.status === 'finalized') {
      throw new BadRequestException('Cannot update finalized schedule');
    }

    Object.assign(schedule, updateDto);
    schedule.updatedBy = userId as any;

    return schedule.save();
  }

  async addShift(id: string, shiftDto: AddShiftDto, userId: string): Promise<Schedule> {
    const schedule = await this.scheduleModel.findById(id);
    if (!schedule) throw new NotFoundException();

    if (schedule.status === 'finalized') {
      throw new BadRequestException('Cannot modify finalized schedule');
    }

    schedule.shifts.push(shiftDto as any);
    schedule.updatedBy = userId as any;

    return schedule.save();
  }

  async updateShift(id: string, shiftIndex: number, shiftDto: Partial<AddShiftDto>, userId: string): Promise<Schedule> {
    const schedule = await this.scheduleModel.findById(id);
    if (!schedule) throw new NotFoundException();

    if (schedule.status === 'finalized') {
      throw new BadRequestException('Cannot modify finalized schedule');
    }

    if (shiftIndex < 0 || shiftIndex >= schedule.shifts.length) {
      throw new BadRequestException('Invalid shift index');
    }

    Object.assign(schedule.shifts[shiftIndex], shiftDto);
    schedule.updatedBy = userId as any;

    return schedule.save();
  }

  async removeShift(id: string, shiftIndex: number, userId: string): Promise<Schedule> {
    const schedule = await this.scheduleModel.findById(id);
    if (!schedule) throw new NotFoundException();

    if (schedule.status === 'finalized') {
      throw new BadRequestException('Cannot modify finalized schedule');
    }

    if (shiftIndex < 0 || shiftIndex >= schedule.shifts.length) {
      throw new BadRequestException('Invalid shift index');
    }

    schedule.shifts.splice(shiftIndex, 1);
    schedule.updatedBy = userId as any;

    return schedule.save();
  }

  async markCallOff(id: string, shiftIndex: number, reason: string, userId: string): Promise<Schedule> {
    const schedule = await this.scheduleModel.findById(id);
    if (!schedule) throw new NotFoundException();

    if (shiftIndex < 0 || shiftIndex >= schedule.shifts.length) {
      throw new BadRequestException('Invalid shift index');
    }

    schedule.shifts[shiftIndex].callOff = true;
    schedule.shifts[shiftIndex].callOffReason = reason;
    schedule.updatedBy = userId as any;

    return schedule.save();
  }

  async assignReplacement(id: string, shiftIndex: number, replacementEmployeeId: string, userId: string): Promise<Schedule> {
    const schedule = await this.scheduleModel.findById(id);
    if (!schedule) throw new NotFoundException();

    if (shiftIndex < 0 || shiftIndex >= schedule.shifts.length) {
      throw new BadRequestException('Invalid shift index');
    }

    schedule.shifts[shiftIndex].replacementEmployeeId = replacementEmployeeId as any;
    schedule.updatedBy = userId as any;

    return schedule.save();
  }

  async publish(id: string, userId: string): Promise<Schedule> {
    const schedule = await this.scheduleModel.findById(id);
    if (!schedule) throw new NotFoundException();

    if (schedule.status !== 'draft') {
      throw new BadRequestException('Can only publish draft schedules');
    }

    schedule.status = 'published';
    schedule.publishedDate = new Date();
    schedule.publishedBy = userId as any;
    schedule.updatedBy = userId as any;

    // TODO: Send notifications to all scheduled employees

    return schedule.save();
  }

  async finalize(id: string, userId: string): Promise<Schedule> {
    const schedule = await this.scheduleModel.findById(id);
    if (!schedule) throw new NotFoundException();

    if (schedule.status !== 'published') {
      throw new BadRequestException('Can only finalize published schedules');
    }

    schedule.status = 'finalized';
    schedule.updatedBy = userId as any;

    return schedule.save();
  }

  async getEmployeeHours(scheduleId: string): Promise<any> {
    const schedule = await this.scheduleModel
      .findById(scheduleId)
      .populate('shifts.employeeId', 'fullName')
      .exec();

    if (!schedule) throw new NotFoundException();

    const hoursMap = new Map<string, { employeeName: string; totalHours: number; shifts: number }>();

    schedule.shifts.forEach(shift => {
      const employeeId = shift.employeeId.toString();
      const startTime = new Date(shift.startTime);
      const endTime = new Date(shift.endTime);
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      if (hoursMap.has(employeeId)) {
        const existing = hoursMap.get(employeeId)!;
        existing.totalHours += hours;
        existing.shifts += 1;
      } else {
        hoursMap.set(employeeId, {
          employeeName: shift.employeeName || '',
          totalHours: hours,
          shifts: 1,
        });
      }
    });

    return Array.from(hoursMap.entries()).map(([employeeId, data]) => ({
      employeeId,
      ...data,
    }));
  }

  async delete(id: string): Promise<void> {
    const schedule = await this.scheduleModel.findById(id);
    if (!schedule) throw new NotFoundException();

    if (schedule.status === 'finalized') {
      throw new BadRequestException('Cannot delete finalized schedule');
    }

    await this.scheduleModel.deleteOne({ _id: id });
  }
}

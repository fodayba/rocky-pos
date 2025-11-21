import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimeEntry, TimeEntryStatus } from '../schemas/time-entry.schema';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { AdjustTimeDto } from './dto/adjust-time.dto';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';

@Injectable()
export class TimeTrackingService {
  constructor(
    @InjectModel(TimeEntry.name) private timeEntryModel: Model<TimeEntry>,
  ) {}

  async clockIn(employeeId: string, clockInDto: ClockInDto, ipAddress: string): Promise<TimeEntry> {
    // Check if employee is already clocked in
    const existingActiveEntry = await this.timeEntryModel
      .findOne({ employeeId, status: TimeEntryStatus.ACTIVE })
      .exec();

    if (existingActiveEntry) {
      throw new BadRequestException('Employee is already clocked in');
    }

    const timeEntry = new this.timeEntryModel({
      employeeId,
      locationId: clockInDto.locationId,
      clockIn: new Date(),
      status: TimeEntryStatus.ACTIVE,
      clockInMethod: clockInDto.clockInMethod || 'pos',
      clockInIpAddress: ipAddress,
      shiftId: clockInDto.shiftId,
      hourlyRate: clockInDto.hourlyRate,
      notes: clockInDto.notes,
      createdBy: employeeId,
    });

    return timeEntry.save();
  }

  async clockOut(employeeId: string, clockOutDto: ClockOutDto, ipAddress: string): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryModel
      .findOne({ employeeId, status: TimeEntryStatus.ACTIVE })
      .exec();

    if (!timeEntry) {
      throw new NotFoundException('No active clock-in found for employee');
    }

    timeEntry.clockOut = new Date();
    timeEntry.clockOutMethod = clockOutDto.clockOutMethod || 'pos';
    timeEntry.clockOutIpAddress = ipAddress;
    timeEntry.status = TimeEntryStatus.COMPLETED;

    if (clockOutDto.notes) {
      timeEntry.notes = timeEntry.notes ? `${timeEntry.notes}\n${clockOutDto.notes}` : clockOutDto.notes;
    }

    // Calculate hours
    this.calculateHours(timeEntry);

    return timeEntry.save();
  }

  async startBreak(employeeId: string): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryModel
      .findOne({ employeeId, status: TimeEntryStatus.ACTIVE })
      .exec();

    if (!timeEntry) {
      throw new NotFoundException('No active clock-in found');
    }

    // Check if there's an ongoing break
    const ongoingBreak = timeEntry.breaks.find(b => !b.end);
    if (ongoingBreak) {
      throw new BadRequestException('Break already in progress');
    }

    timeEntry.breaks.push({
      start: new Date(),
      paid: false,
    } as any);

    return timeEntry.save();
  }

  async endBreak(employeeId: string, paid: boolean = false): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryModel
      .findOne({ employeeId, status: TimeEntryStatus.ACTIVE })
      .exec();

    if (!timeEntry) {
      throw new NotFoundException('No active clock-in found');
    }

    const ongoingBreak = timeEntry.breaks.find(b => !b.end);
    if (!ongoingBreak) {
      throw new BadRequestException('No break in progress');
    }

    ongoingBreak.end = new Date();
    ongoingBreak.duration = Math.floor((ongoingBreak.end.getTime() - ongoingBreak.start.getTime()) / (1000 * 60));
    ongoingBreak.paid = paid;

    // Update total break minutes
    timeEntry.totalBreakMinutes = timeEntry.breaks.reduce((sum, b) => sum + (b.duration || 0), 0);

    return timeEntry.save();
  }

  async create(createDto: CreateTimeEntryDto, userId: string): Promise<TimeEntry> {
    const timeEntry = new this.timeEntryModel({
      ...createDto,
      status: createDto.clockOut ? TimeEntryStatus.COMPLETED : TimeEntryStatus.ACTIVE,
      createdBy: userId,
    });

    if (createDto.clockOut) {
      this.calculateHours(timeEntry);
    }

    return timeEntry.save();
  }

  async findAll(filters?: any): Promise<TimeEntry[]> {
    const query: any = {};
    if (filters?.employeeId) query.employeeId = filters.employeeId;
    if (filters?.locationId) query.locationId = filters.locationId;
    if (filters?.status) query.status = filters.status;
    if (filters?.startDate && filters?.endDate) {
      query.clockIn = { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) };
    }

    return this.timeEntryModel
      .find(query)
      .populate('employeeId', 'fullName email position')
      .populate('locationId', 'name storeNumber')
      .populate('approvedBy', 'fullName')
      .sort({ clockIn: -1 })
      .exec();
  }

  async findById(id: string): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryModel
      .findById(id)
      .populate('employeeId', 'fullName email position hourlyRate')
      .populate('locationId', 'name storeNumber address')
      .populate('shiftId')
      .populate('approvedBy adjustedBy', 'fullName email')
      .exec();

    if (!timeEntry) {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }

    return timeEntry;
  }

  async getCurrentClockIn(employeeId: string): Promise<TimeEntry | null> {
    return this.timeEntryModel
      .findOne({ employeeId, status: TimeEntryStatus.ACTIVE })
      .populate('locationId', 'name storeNumber')
      .exec();
  }

  async getByEmployee(employeeId: string, startDate?: Date, endDate?: Date): Promise<TimeEntry[]> {
    const query: any = { employeeId };

    if (startDate && endDate) {
      query.clockIn = { $gte: startDate, $lte: endDate };
    }

    return this.timeEntryModel
      .find(query)
      .populate('locationId', 'name storeNumber')
      .sort({ clockIn: -1 })
      .exec();
  }

  async adjust(id: string, adjustDto: AdjustTimeDto, userId: string, reason: string): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryModel.findById(id);
    if (!timeEntry) throw new NotFoundException();

    if (timeEntry.status === TimeEntryStatus.APPROVED) {
      throw new BadRequestException('Cannot adjust approved time entries');
    }

    // Store original values
    if (!timeEntry.adjusted) {
      timeEntry.originalClockIn = timeEntry.clockIn;
      timeEntry.originalClockOut = timeEntry.clockOut;
    }

    timeEntry.clockIn = adjustDto.clockIn;
    timeEntry.clockOut = adjustDto.clockOut;
    timeEntry.adjusted = true;
    timeEntry.adjustmentReason = reason;
    timeEntry.adjustedBy = userId as any;
    timeEntry.updatedBy = userId as any;

    this.calculateHours(timeEntry);

    return timeEntry.save();
  }

  async approve(id: string, userId: string): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryModel.findById(id);
    if (!timeEntry) throw new NotFoundException();

    if (timeEntry.status !== TimeEntryStatus.COMPLETED) {
      throw new BadRequestException('Can only approve completed time entries');
    }

    timeEntry.status = TimeEntryStatus.APPROVED;
    timeEntry.approvedBy = userId as any;
    timeEntry.approvalDate = new Date();
    timeEntry.updatedBy = userId as any;

    return timeEntry.save();
  }

  async dispute(id: string, reason: string, userId: string): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryModel.findById(id);
    if (!timeEntry) throw new NotFoundException();

    timeEntry.status = TimeEntryStatus.DISPUTED;
    timeEntry.notes = timeEntry.notes ? `${timeEntry.notes}\nDisputed: ${reason}` : `Disputed: ${reason}`;
    timeEntry.updatedBy = userId as any;

    return timeEntry.save();
  }

  async getHoursSummary(employeeId: string, startDate: Date, endDate: Date): Promise<any> {
    const entries = await this.timeEntryModel
      .find({
        employeeId,
        clockIn: { $gte: startDate, $lte: endDate },
        status: { $in: [TimeEntryStatus.COMPLETED, TimeEntryStatus.APPROVED] },
      })
      .exec();

    const summary = {
      totalHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      totalBreakMinutes: 0,
      totalGrossPay: 0,
      daysWorked: entries.length,
    };

    entries.forEach(entry => {
      summary.totalHours += entry.totalHours || 0;
      summary.regularHours += entry.regularHours || 0;
      summary.overtimeHours += entry.overtimeHours || 0;
      summary.totalBreakMinutes += entry.totalBreakMinutes || 0;
      summary.totalGrossPay += entry.grossPay || 0;
    });

    return summary;
  }

  async delete(id: string): Promise<void> {
    const timeEntry = await this.timeEntryModel.findById(id);
    if (!timeEntry) throw new NotFoundException();

    if (timeEntry.status === TimeEntryStatus.APPROVED) {
      throw new BadRequestException('Cannot delete approved time entries');
    }

    await this.timeEntryModel.deleteOne({ _id: id });
  }

  private calculateHours(timeEntry: TimeEntry): void {
    if (!timeEntry.clockOut) return;

    const clockInTime = new Date(timeEntry.clockIn).getTime();
    const clockOutTime = new Date(timeEntry.clockOut).getTime();
    const totalMilliseconds = clockOutTime - clockInTime;
    const totalMinutes = totalMilliseconds / (1000 * 60);
    const breakMinutes = timeEntry.totalBreakMinutes || 0;
    const workedMinutes = totalMinutes - breakMinutes;
    const totalHours = workedMinutes / 60;

    timeEntry.totalHours = Number(totalHours.toFixed(2));

    // Calculate overtime (hours over 8 per day or 40 per week would need more logic)
    if (totalHours > 8) {
      timeEntry.regularHours = 8;
      timeEntry.overtimeHours = Number((totalHours - 8).toFixed(2));
    } else {
      timeEntry.regularHours = Number(totalHours.toFixed(2));
      timeEntry.overtimeHours = 0;
    }

    // Calculate gross pay
    if (timeEntry.hourlyRate) {
      const regularPay = timeEntry.regularHours * timeEntry.hourlyRate;
      const overtimePay = timeEntry.overtimeHours * timeEntry.hourlyRate * 1.5; // 1.5x for overtime
      timeEntry.grossPay = Number((regularPay + overtimePay).toFixed(2));
    }
  }
}

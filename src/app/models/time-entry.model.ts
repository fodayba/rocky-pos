export enum TimeEntryStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  APPROVED = 'approved',
  DISPUTED = 'disputed',
}

export interface BreakPeriod {
  start: Date;
  end?: Date;
  duration?: number;
  paid: boolean;
}

export interface TimeEntry {
  _id: string;
  employeeId: string;
  employeeName: string;
  locationId: string;
  clockIn: Date;
  clockOut?: Date;
  breaks: BreakPeriod[];
  totalBreakMinutes?: number;
  totalHours?: number;
  regularHours?: number;
  overtimeHours?: number;
  hourlyRate?: number;
  grossPay?: number;
  status: TimeEntryStatus;
  clockInMethod?: string;
  clockOutMethod?: string;
  clockInIpAddress?: string;
  clockOutIpAddress?: string;
  approvedBy?: string;
  approvalDate?: Date;
  adjusted: boolean;
  adjustmentReason?: string;
  adjustedBy?: string;
  originalClockIn?: Date;
  originalClockOut?: Date;
  shiftId?: string;
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClockInDto {
  employeeId: string;
  locationId: string;
  clockInMethod?: string;
}

export interface ClockOutDto {
  clockOutMethod?: string;
}

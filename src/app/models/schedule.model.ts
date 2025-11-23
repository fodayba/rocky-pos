export enum ShiftStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export interface Shift {
  _id: string;
  employeeId: string;
  employeeName: string;
  locationId: string;
  locationName: string;
  date: Date;
  startTime: string;
  endTime: string;
  breakDuration: number;
  position: string;
  status: ShiftStatus;
  notes?: string;
  swapRequested: boolean;
  swapRequestedBy?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateShiftDto {
  employeeId: string;
  locationId: string;
  date: Date;
  startTime: string;
  endTime: string;
  breakDuration?: number;
  position: string;
  notes?: string;
}

export interface UpdateShiftDto {
  employeeId?: string;
  locationId?: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
  breakDuration?: number;
  position?: string;
  notes?: string;
}

export interface ScheduleStatistics {
  totalShifts: number;
  scheduledShifts: number;
  inProgressShifts: number;
  completedShifts: number;
  cancelledShifts: number;
  noShowShifts: number;
  totalEmployeesScheduled: number;
  averageShiftsPerEmployee: number;
}

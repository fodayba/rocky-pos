export enum LocationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TEMPORARILY_CLOSED = 'temporarily_closed',
  UNDER_MAINTENANCE = 'under_maintenance',
}

export enum LocationType {
  RETAIL = 'retail',
  WAREHOUSE = 'warehouse',
  DISTRIBUTION_CENTER = 'distribution_center',
  HEADQUARTERS = 'headquarters',
}

export interface LocationAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface LocationOperatingHours {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Location {
  _id: string;
  locationCode: string;
  name: string;
  type: LocationType;
  status: LocationStatus;
  address: LocationAddress;
  phone: string;
  email?: string;
  managerName?: string;
  managerId?: string;
  operatingHours: LocationOperatingHours[];
  timezone: string;
  totalEmployees: number;
  activeEmployees: number;
  squareFootage?: number;
  numberOfPumps?: number;
  hasFuel: boolean;
  hasConvenienceStore: boolean;
  hasCarWash: boolean;
  taxRate: number;
  salesTaxId?: string;
  businessLicenseNumber?: string;
  lastInventoryDate?: Date;
  nextMaintenanceDate?: Date;
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLocationDto {
  locationCode: string;
  name: string;
  type: LocationType;
  address: LocationAddress;
  phone: string;
  email?: string;
  managerName?: string;
  managerId?: string;
  operatingHours: LocationOperatingHours[];
  timezone: string;
  squareFootage?: number;
  numberOfPumps?: number;
  hasFuel?: boolean;
  hasConvenienceStore?: boolean;
  hasCarWash?: boolean;
  taxRate: number;
  salesTaxId?: string;
  businessLicenseNumber?: string;
  notes?: string;
}

export interface UpdateLocationDto {
  name?: string;
  type?: LocationType;
  address?: LocationAddress;
  phone?: string;
  email?: string;
  managerName?: string;
  managerId?: string;
  operatingHours?: LocationOperatingHours[];
  timezone?: string;
  squareFootage?: number;
  numberOfPumps?: number;
  hasFuel?: boolean;
  hasConvenienceStore?: boolean;
  hasCarWash?: boolean;
  taxRate?: number;
  salesTaxId?: string;
  businessLicenseNumber?: string;
  notes?: string;
}

export interface LocationStatistics {
  totalLocations: number;
  totalActive: number;
  totalInactive: number;
  totalTemporarilyClosed: number;
  totalEmployees: number;
  averageEmployeesPerLocation: number;
  locationsWithFuel: number;
  totalPumps: number;
}

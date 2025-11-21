import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum, IsObject, IsArray, Min, Max, IsEmail } from 'class-validator';
import { LocationType, StoreFormat, LocationStatus } from '../../schemas/location.schema';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  storeNumber: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(LocationType)
  @IsOptional()
  locationType?: LocationType;

  @IsEnum(StoreFormat)
  @IsNotEmpty()
  storeFormat: StoreFormat;

  // Address Information
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  // Contact Information
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  managerName?: string;

  @IsString()
  @IsOptional()
  managerPhone?: string;

  @IsEmail()
  @IsOptional()
  managerEmail?: string;

  // Operating Hours
  @IsObject()
  @IsOptional()
  operatingHours?: any;

  @IsBoolean()
  @IsOptional()
  is24Hours?: boolean;

  // Timezone
  @IsString()
  @IsOptional()
  timezone?: string;

  // Status
  @IsEnum(LocationStatus)
  @IsOptional()
  status?: LocationStatus;

  @IsString()
  @IsOptional()
  statusReason?: string;

  // Regional Hierarchy
  @IsString()
  @IsOptional()
  regionId?: string;

  @IsString()
  @IsOptional()
  districtId?: string;

  @IsString()
  @IsOptional()
  parentLocationId?: string;

  // Tax Configuration
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  defaultTaxRate?: number;

  @IsOptional()
  taxRatesByCategory?: { [key: string]: number };

  @IsString()
  @IsOptional()
  taxJurisdictionId?: string;

  // Fuel-Specific Settings
  @IsBoolean()
  @IsOptional()
  hasFuelPumps?: boolean;

  @IsNumber()
  @IsOptional()
  numberOfPumps?: number;

  @IsNumber()
  @IsOptional()
  numberOfTanks?: number;

  @IsBoolean()
  @IsOptional()
  hasCarWash?: boolean;

  @IsBoolean()
  @IsOptional()
  hasAirPump?: boolean;

  @IsBoolean()
  @IsOptional()
  hasVacuum?: boolean;

  // C-Store Settings
  @IsBoolean()
  @IsOptional()
  hasMiniMart?: boolean;

  @IsNumber()
  @IsOptional()
  squareFootage?: number;

  @IsBoolean()
  @IsOptional()
  hasDeli?: boolean;

  @IsBoolean()
  @IsOptional()
  hasBakery?: boolean;

  @IsBoolean()
  @IsOptional()
  hasRestrooms?: boolean;

  @IsBoolean()
  @IsOptional()
  hasAtm?: boolean;

  // Payment Settings
  @IsArray()
  @IsOptional()
  acceptedPaymentMethods?: string[];

  @IsBoolean()
  @IsOptional()
  acceptsEBT?: boolean;

  @IsBoolean()
  @IsOptional()
  acceptsFleetCards?: boolean;

  // POS Settings
  @IsNumber()
  @IsOptional()
  numberOfRegisters?: number;

  @IsString()
  @IsOptional()
  posSystemType?: string;

  // Compliance & Licensing
  @IsString()
  @IsOptional()
  businessLicenseNumber?: string;

  @IsOptional()
  businessLicenseExpiry?: Date;

  @IsString()
  @IsOptional()
  fuelLicenseNumber?: string;

  @IsOptional()
  fuelLicenseExpiry?: Date;

  @IsString()
  @IsOptional()
  tobaccoLicenseNumber?: string;

  @IsOptional()
  tobaccoLicenseExpiry?: Date;

  @IsString()
  @IsOptional()
  alcoholLicenseNumber?: string;

  @IsOptional()
  alcoholLicenseExpiry?: Date;

  @IsArray()
  @IsOptional()
  epaComplianceIds?: string[];

  // Financial Settings
  @IsString()
  @IsOptional()
  bankAccountNumber?: string;

  @IsString()
  @IsOptional()
  bankRoutingNumber?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsNumber()
  @IsOptional()
  defaultOpeningCash?: number;

  @IsNumber()
  @IsOptional()
  maxCashInDrawer?: number;

  // Features
  @IsBoolean()
  @IsOptional()
  supportsOnlineOrdering?: boolean;

  @IsBoolean()
  @IsOptional()
  supportsDelivery?: boolean;

  @IsBoolean()
  @IsOptional()
  supportsLoyaltyProgram?: boolean;

  @IsBoolean()
  @IsOptional()
  supportsGiftCards?: boolean;

  @IsBoolean()
  @IsOptional()
  supportsAgeVerification?: boolean;

  @IsBoolean()
  @IsOptional()
  hasSecurityCameras?: boolean;

  @IsString()
  @IsOptional()
  cameraSystemType?: string;

  // Inventory Settings
  @IsBoolean()
  @IsOptional()
  managesOwnInventory?: boolean;

  @IsString()
  @IsOptional()
  inventorySourceLocationId?: string;

  @IsBoolean()
  @IsOptional()
  allowsInventoryTransfers?: boolean;

  // Notes
  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}

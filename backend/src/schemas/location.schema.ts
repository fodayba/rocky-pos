import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type LocationDocument = Location & Document;

export enum LocationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  TEMPORARILY_CLOSED = 'temporarily_closed',
}

export enum LocationType {
  CORPORATE = 'corporate',
  FRANCHISE = 'franchise',
  DEALER_OWNED = 'dealer_owned',
}

export enum StoreFormat {
  FULL_SERVICE = 'full_service', // Gas + Large C-store
  EXPRESS = 'express', // Gas + Small C-store
  FUEL_ONLY = 'fuel_only', // Gas station only
  TRUCK_STOP = 'truck_stop', // Full service + truck facilities
  MINI_MART = 'mini_mart', // C-store only, no gas
}

@Schema({ timestamps: true })
export class Location {
  @Prop({ required: true, unique: true })
  storeNumber: string; // e.g., "STORE-001", "LOC-NYC-001"

  @Prop({ required: true })
  name: string; // e.g., "Rocky's Gas - Main Street"

  @Prop({ type: String, enum: LocationType, default: LocationType.CORPORATE })
  locationType: LocationType;

  @Prop({ type: String, enum: StoreFormat, required: true })
  storeFormat: StoreFormat;

  // Address Information
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  // Contact Information
  @Prop({ required: true })
  phone: string;

  @Prop()
  email: string;

  @Prop()
  managerName: string;

  @Prop()
  managerPhone: string;

  @Prop()
  managerEmail: string;

  // Operating Hours
  @Prop({ type: Object })
  operatingHours: {
    monday: { open: string; close: string; is24Hours: boolean };
    tuesday: { open: string; close: string; is24Hours: boolean };
    wednesday: { open: string; close: string; is24Hours: boolean };
    thursday: { open: string; close: string; is24Hours: boolean };
    friday: { open: string; close: string; is24Hours: boolean };
    saturday: { open: string; close: string; is24Hours: boolean };
    sunday: { open: string; close: string; is24Hours: boolean };
  };

  @Prop({ default: false })
  is24Hours: boolean;

  // Timezone
  @Prop({ required: true, default: 'America/New_York' })
  timezone: string; // IANA timezone identifier

  // Status
  @Prop({ type: String, enum: LocationStatus, default: LocationStatus.ACTIVE })
  status: LocationStatus;

  @Prop()
  statusReason: string; // Reason for inactive/maintenance status

  @Prop()
  reopenDate: Date; // Expected reopen date if temporarily closed

  // Regional Hierarchy
  @Prop()
  regionId: string; // For grouping stores by region

  @Prop()
  districtId: string; // For grouping stores by district

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Location' })
  parentLocationId: MongooseSchema.Types.ObjectId; // For franchise relationships

  // Tax Configuration
  @Prop({ required: true, default: 0.08 })
  defaultTaxRate: number;

  @Prop({ type: Map, of: Number })
  taxRatesByCategory: Map<string, number>; // e.g., { 'food': 0.04, 'tobacco': 0.15 }

  @Prop()
  taxJurisdictionId: string; // Reference to detailed tax jurisdiction

  // Fuel-Specific Settings
  @Prop({ default: false })
  hasFuelPumps: boolean;

  @Prop({ default: 0 })
  numberOfPumps: number;

  @Prop({ default: 0 })
  numberOfTanks: number;

  @Prop({ default: false })
  hasCarWash: boolean;

  @Prop({ default: false })
  hasAirPump: boolean;

  @Prop({ default: false })
  hasVacuum: boolean;

  // C-Store Settings
  @Prop({ default: false })
  hasMiniMart: boolean;

  @Prop({ default: 0 })
  squareFootage: number;

  @Prop({ default: false })
  hasDeli: boolean;

  @Prop({ default: false })
  hasBakery: boolean;

  @Prop({ default: false })
  hasRestrooms: boolean;

  @Prop({ default: false })
  hasAtm: boolean;

  // Payment Settings
  @Prop({ type: [String], default: ['cash', 'card', 'mobile', 'fleet'] })
  acceptedPaymentMethods: string[];

  @Prop({ default: false })
  acceptsEBT: boolean;

  @Prop({ default: false })
  acceptsFleetCards: boolean;

  // Point of Sale Settings
  @Prop({ default: 1 })
  numberOfRegisters: number;

  @Prop()
  posSystemType: string; // Type of POS hardware/software

  // Compliance & Licensing
  @Prop()
  businessLicenseNumber: string;

  @Prop()
  businessLicenseExpiry: Date;

  @Prop()
  fuelLicenseNumber: string;

  @Prop()
  fuelLicenseExpiry: Date;

  @Prop()
  tobaccoLicenseNumber: string;

  @Prop()
  tobaccoLicenseExpiry: Date;

  @Prop()
  alcoholLicenseNumber: string;

  @Prop()
  alcoholLicenseExpiry: Date;

  @Prop({ type: [String], default: [] })
  epaComplianceIds: string[]; // EPA facility IDs for environmental compliance

  // Financial Settings
  @Prop()
  bankAccountNumber: string; // Encrypted

  @Prop()
  bankRoutingNumber: string; // Encrypted

  @Prop()
  bankName: string;

  @Prop({ default: 200 }) // Default opening cash for each register
  defaultOpeningCash: number;

  @Prop({ default: 1000 }) // Maximum cash allowed in drawer before mandatory drop
  maxCashInDrawer: number;

  // Features & Capabilities
  @Prop({ default: false })
  supportsOnlineOrdering: boolean;

  @Prop({ default: false })
  supportsDelivery: boolean;

  @Prop({ default: false })
  supportsLoyaltyProgram: boolean;

  @Prop({ default: false })
  supportsGiftCards: boolean;

  @Prop({ default: false })
  supportsAgeVerification: boolean; // For tobacco/alcohol

  @Prop({ default: false })
  hasSecurityCameras: boolean;

  @Prop()
  cameraSystemType: string;

  // Inventory Settings
  @Prop({ default: false })
  managesOwnInventory: boolean; // True if location controls its own ordering

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Location' })
  inventorySourceLocationId: MongooseSchema.Types.ObjectId; // If inventory comes from another location

  @Prop({ default: true })
  allowsInventoryTransfers: boolean;

  // Performance Metrics (cached for quick access)
  @Prop({ type: Object })
  metrics: {
    dailyAverageSales: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    fuelGallonsSoldMonthly: number;
    lastUpdated: Date;
  };

  // Notes & Additional Info
  @Prop()
  notes: string;

  @Prop({ type: [String], default: [] })
  tags: string[]; // For categorization: 'high-volume', 'rural', 'urban', etc.

  // Audit Fields
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  updatedBy: MongooseSchema.Types.ObjectId;

  @Prop()
  lastInspectionDate: Date;

  @Prop()
  nextInspectionDate: Date;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

// Indexes for better query performance
LocationSchema.index({ storeNumber: 1 });
LocationSchema.index({ status: 1 });
LocationSchema.index({ state: 1, city: 1 });
LocationSchema.index({ regionId: 1 });
LocationSchema.index({ districtId: 1 });
LocationSchema.index({ locationType: 1 });
LocationSchema.index({ storeFormat: 1 });

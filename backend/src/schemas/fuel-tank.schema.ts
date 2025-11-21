import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FuelType } from './fuel-product.schema';

export enum TankStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  DECOMMISSIONED = 'decommissioned',
}

@Schema({ timestamps: true })
export class FuelTank extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  locationId: Types.ObjectId;

  @Prop({ required: true })
  tankNumber: string;

  @Prop({ required: true, enum: FuelType })
  fuelType: FuelType;

  @Prop({ required: true, type: Number })
  capacity: number; // Gallons

  @Prop({ required: true, type: Number, default: 0 })
  currentLevel: number; // Gallons

  @Prop({ type: Number })
  minLevel: number;

  @Prop({ type: Number })
  maxSafeLevel: number;

  // Temperature monitoring
  @Prop({ type: Number })
  currentTemperature: number;

  @Prop({ type: Number })
  maxTemperature: number;

  // Water detection
  @Prop({ type: Number, default: 0 })
  waterLevel: number; // Inches

  @Prop({ default: false })
  waterDetected: boolean;

  // Tank details
  @Prop()
  manufacturer: string;

  @Prop()
  installationDate: Date;

  @Prop()
  lastInspectionDate: Date;

  @Prop()
  nextInspectionDate: Date;

  @Prop()
  serialNumber: string;

  @Prop()
  epaId: string;

  // Leak detection
  @Prop({ default: false })
  hasLeakDetection: boolean;

  @Prop({ default: false })
  leakDetected: boolean;

  @Prop()
  lastLeakTest: Date;

  @Prop()
  nextLeakTestDue: Date;

  // Cathodic protection (corrosion prevention)
  @Prop({ default: false })
  hasCathodicProtection: boolean;

  @Prop()
  lastCathodicTest: Date;

  // Ullage (empty space)
  @Prop({ type: Number })
  ullage: number;

  // Status
  @Prop({ type: String, enum: TankStatus, default: TankStatus.ACTIVE })
  status: TankStatus;

  @Prop()
  notes: string;

  // Audit
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const FuelTankSchema = SchemaFactory.createForClass(FuelTank);

FuelTankSchema.index({ locationId: 1, tankNumber: 1 }, { unique: true });
FuelTankSchema.index({ status: 1 });
FuelTankSchema.index({ fuelType: 1 });

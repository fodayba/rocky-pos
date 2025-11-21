import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PumpStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  AUTHORIZED = 'authorized',
  OUT_OF_SERVICE = 'out_of_service',
  MAINTENANCE = 'maintenance',
}

export class PumpNozzle {
  @Prop({ required: true })
  nozzleNumber: string; // e.g., "1A", "1B"

  @Prop({ type: Types.ObjectId, ref: 'FuelType', required: true })
  fuelType: string;

  @Prop({ type: Types.ObjectId, ref: 'FuelTank' })
  tankId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  todayGallons: number;

  @Prop({ type: Number, default: 0 })
  totalGallons: number;

  @Prop({ default: true })
  active: boolean;
}

@Schema({ timestamps: true })
export class FuelPump extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  locationId: Types.ObjectId;

  @Prop({ required: true })
  pumpNumber: string;

  @Prop({ type: String, enum: PumpStatus, default: PumpStatus.AVAILABLE })
  status: PumpStatus;

  @Prop({ type: [PumpNozzle], default: [] })
  nozzles: PumpNozzle[];

  // Current transaction
  @Prop({ type: Types.ObjectId, ref: 'Transaction' })
  currentTransactionId: Types.ObjectId;

  @Prop({ type: Number })
  authorizedAmount: number; // Pre-authorized amount

  @Prop()
  authorizationTime: Date;

  // Equipment details
  @Prop()
  manufacturer: string;

  @Prop()
  pumpModel: string;

  @Prop()
  serialNumber: string;

  @Prop()
  installationDate: Date;

  @Prop()
  lastMaintenanceDate: Date;

  @Prop()
  nextMaintenanceDate: Date;

  // Performance metrics
  @Prop({ type: Number, default: 0 })
  todaySales: number;

  @Prop({ type: Number, default: 0 })
  todayTransactions: number;

  @Prop({ type: Number, default: 0 })
  totalSales: number;

  @Prop({ type: Number, default: 0 })
  totalTransactions: number;

  // Features
  @Prop({ default: false })
  hasCardReader: boolean;

  @Prop({ default: false })
  hasContactless: boolean;

  @Prop({ default: false })
  hasPrinter: boolean;

  @Prop()
  notes: string;

  // Audit
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const FuelPumpSchema = SchemaFactory.createForClass(FuelPump);

FuelPumpSchema.index({ locationId: 1, pumpNumber: 1 }, { unique: true });
FuelPumpSchema.index({ status: 1 });

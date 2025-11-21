import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TaxType {
  SALES_TAX = 'sales_tax',
  FUEL_TAX = 'fuel_tax',
  TOBACCO_TAX = 'tobacco_tax',
  ALCOHOL_TAX = 'alcohol_tax',
  PREPARED_FOOD_TAX = 'prepared_food_tax',
}

export class TaxRate {
  @Prop({ required: true, enum: TaxType })
  taxType: TaxType;

  @Prop({ required: true, type: Number })
  rate: number;

  @Prop()
  description: string;

  @Prop({ type: Date })
  effectiveDate: Date;

  @Prop({ type: Date })
  expiryDate: Date;
}

@Schema({ timestamps: true })
export class TaxJurisdiction extends Document {
  @Prop({ required: true, unique: true })
  jurisdictionCode: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string; // 'federal', 'state', 'county', 'city', 'district'

  // Geographic details
  @Prop()
  state: string;

  @Prop()
  county: string;

  @Prop()
  city: string;

  @Prop({ type: [String], default: [] })
  zipCodes: string[];

  // Tax rates
  @Prop({ type: [TaxRate], default: [] })
  taxRates: TaxRate[];

  // Composite rate (sum of all applicable rates)
  @Prop({ type: Number, default: 0 })
  compositeSalesTaxRate: number;

  // Special rules
  @Prop({ default: false })
  hasFoodTaxExemption: boolean;

  @Prop({ type: Number })
  foodTaxRate: number;

  @Prop({ default: false })
  hasPreparedFoodTax: boolean;

  @Prop({ type: Number })
  preparedFoodTaxRate: number;

  @Prop({ default: false })
  hasTaxHolidays: boolean;

  @Prop({ type: [Object], default: [] })
  taxHolidays: Array<{ name: string; startDate: Date; endDate: Date; categories: string[] }>;

  // Filing information
  @Prop()
  filingFrequency: string; // 'monthly', 'quarterly', 'annually'

  @Prop()
  filingDueDay: number; // Day of month

  @Prop()
  taxAuthorityName: string;

  @Prop()
  taxAuthorityWebsite: string;

  @Prop()
  accountNumber: string; // Tax account number with authority

  // Status
  @Prop({ default: true })
  active: boolean;

  @Prop()
  notes: string;

  // Audit
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const TaxJurisdictionSchema = SchemaFactory.createForClass(TaxJurisdiction);

TaxJurisdictionSchema.index({ jurisdictionCode: 1 }, { unique: true });
TaxJurisdictionSchema.index({ state: 1 });
TaxJurisdictionSchema.index({ zipCodes: 1 });

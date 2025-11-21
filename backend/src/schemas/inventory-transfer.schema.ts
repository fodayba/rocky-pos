import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TransferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export class TransferItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop()
  barcode: string;

  @Prop({ required: true, type: Number })
  quantityRequested: number;

  @Prop({ type: Number })
  quantityApproved: number;

  @Prop({ type: Number })
  quantityShipped: number;

  @Prop({ type: Number })
  quantityReceived: number;

  @Prop({ type: Number })
  unitCost: number;

  @Prop()
  notes: string;
}

@Schema({ timestamps: true })
export class InventoryTransfer extends Document {
  @Prop({ required: true, unique: true })
  transferNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  fromLocationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  toLocationId: Types.ObjectId;

  @Prop({ type: String, enum: TransferStatus, default: TransferStatus.PENDING })
  status: TransferStatus;

  @Prop({ required: true, type: Date })
  requestDate: Date;

  @Prop()
  approvalDate: Date;

  @Prop()
  shipDate: Date;

  @Prop()
  expectedArrivalDate: Date;

  @Prop()
  receivedDate: Date;

  @Prop({ type: [TransferItem], default: [] })
  items: TransferItem[];

  // Users involved
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requestedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  shippedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  receivedBy: Types.ObjectId;

  // Reason for transfer
  @Prop({ required: true })
  reason: string; // e.g., "Low stock", "Overstocked", "Location closure"

  @Prop()
  notes: string;

  @Prop()
  rejectionReason: string;

  // Shipping details
  @Prop()
  trackingNumber: string;

  @Prop()
  carrier: string;

  // Audit
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const InventoryTransferSchema = SchemaFactory.createForClass(InventoryTransfer);

// Indexes
InventoryTransferSchema.index({ transferNumber: 1 }, { unique: true });
InventoryTransferSchema.index({ fromLocationId: 1, requestDate: -1 });
InventoryTransferSchema.index({ toLocationId: 1, requestDate: -1 });
InventoryTransferSchema.index({ status: 1 });

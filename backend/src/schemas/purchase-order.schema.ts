import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum POStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  SENT_TO_SUPPLIER = 'sent_to_supplier',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export class POItem {
  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop()
  productCode: string;

  @Prop({ required: true, type: Number })
  quantityOrdered: number;

  @Prop({ type: Number, default: 0 })
  quantityReceived: number;

  @Prop({ required: true, type: Number })
  unitCost: number;

  @Prop({ required: true, type: Number })
  totalCost: number;

  @Prop()
  notes: string;
}

@Schema({ timestamps: true })
export class PurchaseOrder extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  locationId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  poNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Supplier', required: true })
  supplierId: Types.ObjectId;

  @Prop({ required: true })
  supplierName: string;

  @Prop({ type: String, enum: POStatus, default: POStatus.DRAFT })
  status: POStatus;

  @Prop({ required: true, type: Date })
  orderDate: Date;

  @Prop()
  expectedDeliveryDate: Date;

  @Prop()
  actualDeliveryDate: Date;

  @Prop({ type: [POItem], default: [] })
  items: POItem[];

  @Prop({ required: true, type: Number })
  subtotal: number;

  @Prop({ type: Number, default: 0 })
  tax: number;

  @Prop({ type: Number, default: 0 })
  shippingCost: number;

  @Prop({ required: true, type: Number })
  totalAmount: number;

  // Approval workflow
  @Prop({ type: Types.ObjectId, ref: 'User' })
  requestedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId;

  @Prop()
  approvalDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  receivedBy: Types.ObjectId;

  @Prop()
  receivedDate: Date;

  // Tracking
  @Prop()
  trackingNumber: string;

  @Prop()
  carrier: string;

  @Prop()
  invoiceNumber: string;

  @Prop({ default: false })
  invoiceReceived: boolean;

  @Prop({ default: false })
  paid: boolean;

  @Prop()
  paymentDate: Date;

  @Prop()
  notes: string;

  // Audit
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);

// Indexes
PurchaseOrderSchema.index({ poNumber: 1 }, { unique: true });
PurchaseOrderSchema.index({ locationId: 1, orderDate: -1 });
PurchaseOrderSchema.index({ supplierId: 1, orderDate: -1 });
PurchaseOrderSchema.index({ status: 1 });

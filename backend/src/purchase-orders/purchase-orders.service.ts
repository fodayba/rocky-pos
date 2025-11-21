import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurchaseOrder, POStatus } from '../schemas/purchase-order.schema';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ReceiveItemsDto } from './dto/receive-items.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectModel(PurchaseOrder.name) private poModel: Model<PurchaseOrder>,
  ) {}

  async create(createDto: CreatePurchaseOrderDto, userId: string): Promise<PurchaseOrder> {
    const poNumber = await this.generatePONumber();

    const items = createDto.items.map(item => ({
      ...item,
      totalCost: item.quantityOrdered * item.unitCost,
      quantityReceived: 0,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.totalCost, 0);
    const tax = createDto.tax || 0;
    const shippingCost = createDto.shippingCost || 0;
    const totalAmount = subtotal + tax + shippingCost;

    const po = new this.poModel({
      ...createDto,
      poNumber,
      items,
      subtotal,
      tax,
      shippingCost,
      totalAmount,
      status: POStatus.DRAFT,
      requestedBy: userId,
      createdBy: userId,
      updatedBy: userId,
    });

    return po.save();
  }

  async findAll(filters?: any): Promise<PurchaseOrder[]> {
    const query = this.buildQuery(filters);
    return this.poModel
      .find(query)
      .populate('locationId', 'name storeNumber')
      .populate('supplierId', 'name supplierCode')
      .populate('requestedBy approvedBy receivedBy', 'fullName email')
      .sort({ orderDate: -1 })
      .exec();
  }

  async findById(id: string): Promise<PurchaseOrder> {
    const po = await this.poModel
      .findById(id)
      .populate('locationId', 'name storeNumber')
      .populate('supplierId', 'name supplierCode contactPerson phone email')
      .populate('requestedBy approvedBy receivedBy', 'fullName email')
      .exec();

    if (!po) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    return po;
  }

  async findByPONumber(poNumber: string): Promise<PurchaseOrder> {
    const po = await this.poModel.findOne({ poNumber }).exec();
    if (!po) {
      throw new NotFoundException(`Purchase order ${poNumber} not found`);
    }
    return po;
  }

  async update(id: string, updateDto: UpdatePurchaseOrderDto, userId: string): Promise<PurchaseOrder> {
    const po = await this.poModel.findById(id);
    if (!po) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    if (po.status !== POStatus.DRAFT) {
      throw new BadRequestException('Can only update draft purchase orders');
    }

    Object.assign(po, updateDto);
    po.updatedBy = userId as any;
    return po.save();
  }

  async submit(id: string): Promise<PurchaseOrder> {
    const po = await this.poModel.findById(id);
    if (!po) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    if (po.status !== POStatus.DRAFT) {
      throw new BadRequestException('Can only submit draft purchase orders');
    }

    po.status = POStatus.SUBMITTED;
    return po.save();
  }

  async approve(id: string, userId: string): Promise<PurchaseOrder> {
    const po = await this.poModel.findById(id);
    if (!po) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    if (po.status !== POStatus.SUBMITTED) {
      throw new BadRequestException('Can only approve submitted purchase orders');
    }

    po.status = POStatus.APPROVED;
    po.approvedBy = userId as any;
    po.approvalDate = new Date();
    return po.save();
  }

  async sendToSupplier(id: string): Promise<PurchaseOrder> {
    const po = await this.poModel.findById(id);
    if (!po) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    if (po.status !== POStatus.APPROVED) {
      throw new BadRequestException('Can only send approved purchase orders');
    }

    po.status = POStatus.SENT_TO_SUPPLIER;
    return po.save();
  }

  async receiveItems(id: string, receiveDto: ReceiveItemsDto, userId: string): Promise<PurchaseOrder> {
    const po = await this.poModel.findById(id);
    if (!po) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    if (po.status !== POStatus.SENT_TO_SUPPLIER && po.status !== POStatus.PARTIALLY_RECEIVED) {
      throw new BadRequestException('Can only receive items from sent purchase orders');
    }

    for (const receivedItem of receiveDto.items) {
      const poItem = po.items.find(item => item.productId.toString() === receivedItem.productId);
      if (poItem) {
        poItem.quantityReceived = (poItem.quantityReceived || 0) + receivedItem.quantityReceived;
      }
    }

    const allReceived = po.items.every(item => item.quantityReceived >= item.quantityOrdered);
    const anyReceived = po.items.some(item => item.quantityReceived > 0);

    if (allReceived) {
      po.status = POStatus.RECEIVED;
      po.actualDeliveryDate = new Date();
      po.receivedBy = userId as any;
      po.receivedDate = new Date();
    } else if (anyReceived) {
      po.status = POStatus.PARTIALLY_RECEIVED;
    }

    return po.save();
  }

  async cancel(id: string, reason: string): Promise<PurchaseOrder> {
    const po = await this.poModel.findById(id);
    if (!po) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    if (po.status === POStatus.RECEIVED) {
      throw new BadRequestException('Cannot cancel received purchase orders');
    }

    po.status = POStatus.CANCELLED;
    po.notes = (po.notes || '') + `\nCancelled: ${reason}`;
    return po.save();
  }

  async findByLocation(locationId: string): Promise<PurchaseOrder[]> {
    return this.poModel.find({ locationId }).sort({ orderDate: -1 }).exec();
  }

  async findBySupplier(supplierId: string): Promise<PurchaseOrder[]> {
    return this.poModel.find({ supplierId }).sort({ orderDate: -1 }).exec();
  }

  async findPending(): Promise<PurchaseOrder[]> {
    return this.poModel.find({
      status: { $in: [POStatus.SUBMITTED, POStatus.APPROVED, POStatus.SENT_TO_SUPPLIER] }
    }).exec();
  }

  async getStatistics(): Promise<any> {
    const total = await this.poModel.countDocuments();
    const byStatus = await this.poModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const totalValue = await this.poModel.aggregate([
      { $match: { status: { $ne: POStatus.CANCELLED } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    return {
      total,
      byStatus,
      totalValue: totalValue[0]?.total || 0,
    };
  }

  private async generatePONumber(): Promise<string> {
    const count = await this.poModel.countDocuments();
    const date = new Date();
    return `PO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(5, '0')}`;
  }

  private buildQuery(filters: any = {}): any {
    const query: any = {};
    if (filters.status) query.status = filters.status;
    if (filters.locationId) query.locationId = filters.locationId;
    if (filters.supplierId) query.supplierId = filters.supplierId;
    return query;
  }
}

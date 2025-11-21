import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryTransfer, TransferStatus } from '../schemas/inventory-transfer.schema';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Injectable()
export class InventoryTransfersService {
  constructor(
    @InjectModel(InventoryTransfer.name) private transferModel: Model<InventoryTransfer>,
  ) {}

  async create(createDto: CreateTransferDto, userId: string): Promise<InventoryTransfer> {
    const transferNumber = await this.generateTransferNumber();

    const transfer = new this.transferModel({
      ...createDto,
      transferNumber,
      requestDate: new Date(),
      status: TransferStatus.PENDING,
      requestedBy: userId,
      createdBy: userId,
      updatedBy: userId,
    });

    return transfer.save();
  }

  async findAll(filters?: any): Promise<InventoryTransfer[]> {
    const query: any = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.fromLocationId) query.fromLocationId = filters.fromLocationId;
    if (filters?.toLocationId) query.toLocationId = filters.toLocationId;

    return this.transferModel
      .find(query)
      .populate('fromLocationId toLocationId', 'name storeNumber')
      .populate('requestedBy approvedBy shippedBy receivedBy', 'fullName email')
      .sort({ requestDate: -1 })
      .exec();
  }

  async findById(id: string): Promise<InventoryTransfer> {
    const transfer = await this.transferModel
      .findById(id)
      .populate('fromLocationId toLocationId', 'name storeNumber address')
      .populate('requestedBy approvedBy shippedBy receivedBy', 'fullName email')
      .exec();

    if (!transfer) {
      throw new NotFoundException(`Transfer with ID ${id} not found`);
    }

    return transfer;
  }

  async approve(id: string, userId: string): Promise<InventoryTransfer> {
    const transfer = await this.transferModel.findById(id);
    if (!transfer) throw new NotFoundException();
    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException('Can only approve pending transfers');
    }

    transfer.status = TransferStatus.APPROVED;
    transfer.approvedBy = userId as any;
    transfer.approvalDate = new Date();
    return transfer.save();
  }

  async ship(id: string, userId: string): Promise<InventoryTransfer> {
    const transfer = await this.transferModel.findById(id);
    if (!transfer) throw new NotFoundException();
    if (transfer.status !== TransferStatus.APPROVED) {
      throw new BadRequestException('Can only ship approved transfers');
    }

    transfer.status = TransferStatus.IN_TRANSIT;
    transfer.shippedBy = userId as any;
    transfer.shipDate = new Date();
    return transfer.save();
  }

  async receive(id: string, userId: string): Promise<InventoryTransfer> {
    const transfer = await this.transferModel.findById(id);
    if (!transfer) throw new NotFoundException();
    if (transfer.status !== TransferStatus.IN_TRANSIT) {
      throw new BadRequestException('Can only receive in-transit transfers');
    }

    transfer.status = TransferStatus.RECEIVED;
    transfer.receivedBy = userId as any;
    transfer.receivedDate = new Date();
    return transfer.save();
  }

  async reject(id: string, reason: string): Promise<InventoryTransfer> {
    const transfer = await this.transferModel.findById(id);
    if (!transfer) throw new NotFoundException();

    transfer.status = TransferStatus.REJECTED;
    transfer.rejectionReason = reason;
    return transfer.save();
  }

  private async generateTransferNumber(): Promise<string> {
    const count = await this.transferModel.countDocuments();
    const date = new Date();
    return `TRF-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(5, '0')}`;
  }
}

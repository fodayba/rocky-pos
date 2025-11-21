import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryTransfersService } from './inventory-transfers.service';
import { InventoryTransfersController } from './inventory-transfers.controller';
import { InventoryTransfer, InventoryTransferSchema } from '../schemas/inventory-transfer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: InventoryTransfer.name, schema: InventoryTransferSchema }]),
  ],
  controllers: [InventoryTransfersController],
  providers: [InventoryTransfersService],
  exports: [InventoryTransfersService],
})
export class InventoryTransfersModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Transaction, TransactionSchema } from '../schemas/transaction.schema';
import { Product, ProductSchema } from '../schemas/product.schema';
import { TimeEntry, TimeEntrySchema } from '../schemas/time-entry.schema';
import { Invoice, InvoiceSchema } from '../schemas/invoice.schema';
import { FuelTank, FuelTankSchema } from '../schemas/fuel-tank.schema';
import { FuelPump, FuelPumpSchema } from '../schemas/fuel-pump.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Product.name, schema: ProductSchema },
      { name: TimeEntry.name, schema: TimeEntrySchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: FuelTank.name, schema: FuelTankSchema },
      { name: FuelPump.name, schema: FuelPumpSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}

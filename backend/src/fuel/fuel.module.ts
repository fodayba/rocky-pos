import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FuelService } from './fuel.service';
import { FuelController } from './fuel.controller';
import { FuelProduct, FuelProductSchema } from '../schemas/fuel-product.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: FuelProduct.name, schema: FuelProductSchema }])],
  controllers: [FuelController],
  providers: [FuelService],
  exports: [FuelService],
})
export class FuelModule {}

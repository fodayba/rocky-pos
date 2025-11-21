import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaxService } from './tax.service';
import { TaxController } from './tax.controller';
import { TaxJurisdiction, TaxJurisdictionSchema } from '../schemas/tax-jurisdiction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TaxJurisdiction.name, schema: TaxJurisdictionSchema }]),
  ],
  controllers: [TaxController],
  providers: [TaxService],
  exports: [TaxService],
})
export class TaxModule {}

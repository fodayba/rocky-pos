import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FuelPumpsService } from './fuel-pumps.service';
import { FuelTanksService } from './fuel-tanks.service';
import { FuelPumpsController } from './fuel-pumps.controller';
import { FuelTanksController } from './fuel-tanks.controller';
import { FuelPump, FuelPumpSchema } from '../schemas/fuel-pump.schema';
import { FuelTank, FuelTankSchema } from '../schemas/fuel-tank.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FuelPump.name, schema: FuelPumpSchema },
      { name: FuelTank.name, schema: FuelTankSchema },
    ]),
  ],
  controllers: [FuelPumpsController, FuelTanksController],
  providers: [FuelPumpsService, FuelTanksService],
  exports: [FuelPumpsService, FuelTanksService],
})
export class FuelManagementModule {}

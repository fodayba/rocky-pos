import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FleetAccountsService } from './fleet-accounts.service';
import { FleetAccountsController } from './fleet-accounts.controller';
import { FleetAccount, FleetAccountSchema } from '../schemas/fleet-account.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FleetAccount.name, schema: FleetAccountSchema }]),
  ],
  controllers: [FleetAccountsController],
  providers: [FleetAccountsService],
  exports: [FleetAccountsService],
})
export class FleetAccountsModule {}

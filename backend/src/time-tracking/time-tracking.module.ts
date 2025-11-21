import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimeTrackingService } from './time-tracking.service';
import { TimeTrackingController } from './time-tracking.controller';
import { TimeEntry, TimeEntrySchema } from '../schemas/time-entry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TimeEntry.name, schema: TimeEntrySchema }]),
  ],
  controllers: [TimeTrackingController],
  providers: [TimeTrackingService],
  exports: [TimeTrackingService],
})
export class TimeTrackingModule {}

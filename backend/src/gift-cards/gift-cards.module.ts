import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GiftCardsService } from './gift-cards.service';
import { GiftCardsController } from './gift-cards.controller';
import { GiftCard, GiftCardSchema } from '../schemas/gift-card.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GiftCard.name, schema: GiftCardSchema }]),
  ],
  controllers: [GiftCardsController],
  providers: [GiftCardsService],
  exports: [GiftCardsService],
})
export class GiftCardsModule {}

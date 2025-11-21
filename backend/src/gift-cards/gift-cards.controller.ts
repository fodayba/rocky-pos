import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { GiftCardsService } from './gift-cards.service';
import { CreateGiftCardDto } from './dto/create-gift-card.dto';
import { ReloadGiftCardDto } from './dto/reload-gift-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('gift-cards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GiftCardsController {
  constructor(private readonly giftCardsService: GiftCardsService) {}

  @Post()
  @Roles('admin', 'manager', 'cashier')
  create(@Body() createDto: CreateGiftCardDto, @Body('locationId') locationId: string, @Request() req) {
    return this.giftCardsService.create(createDto, locationId, req.user.userId);
  }

  @Get()
  @Roles('admin', 'manager')
  findAll(@Query() filters: any) {
    return this.giftCardsService.findAll(filters);
  }

  @Get('statistics')
  @Roles('admin', 'manager')
  getStatistics() {
    return this.giftCardsService.getStatistics();
  }

  @Get('card/:cardNumber')
  @Roles('admin', 'manager', 'cashier')
  findByCardNumber(@Param('cardNumber') cardNumber: string) {
    return this.giftCardsService.findByCardNumber(cardNumber);
  }

  @Get('card/:cardNumber/balance')
  @Roles('admin', 'manager', 'cashier')
  checkBalance(@Param('cardNumber') cardNumber: string) {
    return this.giftCardsService.checkBalance(cardNumber);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  findById(@Param('id') id: string) {
    return this.giftCardsService.findById(id);
  }

  @Post('card/:cardNumber/reload')
  @Roles('admin', 'manager', 'cashier')
  reload(
    @Param('cardNumber') cardNumber: string,
    @Body() reloadDto: ReloadGiftCardDto,
    @Body('locationId') locationId: string,
    @Request() req,
  ) {
    return this.giftCardsService.reload(cardNumber, reloadDto, locationId, req.user.userId);
  }

  @Patch('card/:cardNumber/deactivate')
  @Roles('admin', 'manager')
  deactivate(@Param('cardNumber') cardNumber: string) {
    return this.giftCardsService.deactivate(cardNumber);
  }

  @Patch('card/:cardNumber/report-lost')
  @Roles('admin', 'manager', 'cashier')
  reportLost(@Param('cardNumber') cardNumber: string) {
    return this.giftCardsService.reportLost(cardNumber);
  }
}

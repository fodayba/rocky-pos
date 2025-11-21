import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../schemas/user.schema';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto, user._id.toString());
  }

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.customersService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateCustomerDto, user._id.toString());
  }

  @Post(':id/purchase')
  recordPurchase(@Param('id') id: string, @Body('amount') amount: number) {
    return this.customersService.recordPurchase(id, amount);
  }

  @Post(':id/redeem')
  redeemPoints(@Param('id') id: string, @Body('points') points: number) {
    return this.customersService.redeemPoints(id, points);
  }
}

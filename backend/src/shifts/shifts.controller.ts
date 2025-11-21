import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../schemas/user.schema';

@Controller('shifts')
@UseGuards(JwtAuthGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post('open')
  openShift(
    @CurrentUser() user: User,
    @Body('openingCash') openingCash: number,
    @Body('registerNumber') registerNumber: string,
  ) {
    return this.shiftsService.openShift(
      user._id.toString(),
      openingCash,
      registerNumber,
    );
  }

  @Post(':id/close')
  closeShift(
    @Param('id') id: string,
    @Body('actualCash') actualCash: number,
    @Body('notes') notes?: string,
  ) {
    return this.shiftsService.closeShift(id, actualCash, notes);
  }

  @Get()
  findAll() {
    return this.shiftsService.findAll();
  }

  @Get('current')
  getCurrentShift() {
    return this.shiftsService.getCurrentShift();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(id);
  }
}

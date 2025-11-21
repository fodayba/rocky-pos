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
    @Body('cashierId') cashierId: string,
    @Body('cashierName') cashierName: string,
    @Body('openingCash') openingCash: number,
  ) {
    return this.shiftsService.openShift(
      cashierId || user._id.toString(),
      openingCash,
      cashierName || 'Register 1',
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

  @Get('current/summary')
  getCurrentShiftSummary() {
    return this.shiftsService.getCurrentShiftSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(id);
  }
}

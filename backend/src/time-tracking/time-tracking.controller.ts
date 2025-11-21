import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, Ip } from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { AdjustTimeDto } from './dto/adjust-time.dto';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('time-tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimeTrackingController {
  constructor(private readonly service: TimeTrackingService) {}

  @Post('clock-in')
  clockIn(@Body() clockInDto: ClockInDto, @Request() req, @Ip() ip: string) {
    return this.service.clockIn(req.user.userId, clockInDto, ip);
  }

  @Post('clock-out')
  clockOut(@Body() clockOutDto: ClockOutDto, @Request() req, @Ip() ip: string) {
    return this.service.clockOut(req.user.userId, clockOutDto, ip);
  }

  @Post('break/start')
  startBreak(@Request() req) {
    return this.service.startBreak(req.user.userId);
  }

  @Post('break/end')
  endBreak(@Body() body: { paid?: boolean }, @Request() req) {
    return this.service.endBreak(req.user.userId, body.paid);
  }

  @Get('current')
  getCurrentClockIn(@Request() req) {
    return this.service.getCurrentClockIn(req.user.userId);
  }

  @Post()
  @Roles('admin', 'manager')
  create(@Body() createDto: CreateTimeEntryDto, @Request() req) {
    return this.service.create(createDto, req.user.userId);
  }

  @Get()
  @Roles('admin', 'manager')
  findAll(@Query() filters: any) {
    return this.service.findAll(filters);
  }

  @Get('employee/:employeeId')
  @Roles('admin', 'manager')
  getByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getByEmployee(
      employeeId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('my-entries')
  getMyEntries(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getByEmployee(
      req.user.userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('summary/:employeeId')
  @Roles('admin', 'manager')
  getHoursSummary(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.service.getHoursSummary(employeeId, new Date(startDate), new Date(endDate));
  }

  @Get('my-summary')
  getMySummary(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.service.getHoursSummary(req.user.userId, new Date(startDate), new Date(endDate));
  }

  @Get(':id')
  @Roles('admin', 'manager')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/adjust')
  @Roles('admin', 'manager')
  adjust(
    @Param('id') id: string,
    @Body() adjustDto: AdjustTimeDto,
    @Request() req
  ) {
    return this.service.adjust(id, adjustDto, req.user.userId, adjustDto.adjustmentReason);
  }

  @Post(':id/approve')
  @Roles('admin', 'manager')
  approve(@Param('id') id: string, @Request() req) {
    return this.service.approve(id, req.user.userId);
  }

  @Post(':id/dispute')
  dispute(@Param('id') id: string, @Body() body: { reason: string }, @Request() req) {
    return this.service.dispute(id, body.reason, req.user.userId);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AddShiftDto } from './dto/add-shift.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulingController {
  constructor(private readonly service: SchedulingService) {}

  @Post()
  @Roles('admin', 'manager')
  create(@Body() createDto: CreateScheduleDto, @Request() req) {
    return this.service.create(createDto, req.user.userId);
  }

  @Get()
  @Roles('admin', 'manager')
  findAll(@Query() filters: any) {
    return this.service.findAll(filters);
  }

  @Get('location/:locationId')
  @Roles('admin', 'manager', 'cashier')
  findByLocation(
    @Param('locationId') locationId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.findByLocation(
      locationId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('employee/:employeeId')
  findByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.findByEmployee(
      employeeId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('week/:locationId/:weekStartDate')
  @Roles('admin', 'manager', 'cashier')
  findForWeek(
    @Param('locationId') locationId: string,
    @Param('weekStartDate') weekStartDate: string,
  ) {
    return this.service.findForWeek(locationId, new Date(weekStartDate));
  }

  @Get(':id')
  @Roles('admin', 'manager', 'cashier')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get(':id/hours')
  @Roles('admin', 'manager')
  getEmployeeHours(@Param('id') id: string) {
    return this.service.getEmployeeHours(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  update(@Param('id') id: string, @Body() updateDto: UpdateScheduleDto, @Request() req) {
    return this.service.update(id, updateDto, req.user.userId);
  }

  @Post(':id/shifts')
  @Roles('admin', 'manager')
  addShift(@Param('id') id: string, @Body() shiftDto: AddShiftDto, @Request() req) {
    return this.service.addShift(id, shiftDto, req.user.userId);
  }

  @Patch(':id/shifts/:shiftIndex')
  @Roles('admin', 'manager')
  updateShift(
    @Param('id') id: string,
    @Param('shiftIndex') shiftIndex: number,
    @Body() shiftDto: Partial<AddShiftDto>,
    @Request() req
  ) {
    return this.service.updateShift(id, Number(shiftIndex), shiftDto, req.user.userId);
  }

  @Delete(':id/shifts/:shiftIndex')
  @Roles('admin', 'manager')
  removeShift(
    @Param('id') id: string,
    @Param('shiftIndex') shiftIndex: number,
    @Request() req
  ) {
    return this.service.removeShift(id, Number(shiftIndex), req.user.userId);
  }

  @Post(':id/shifts/:shiftIndex/call-off')
  @Roles('admin', 'manager', 'cashier')
  markCallOff(
    @Param('id') id: string,
    @Param('shiftIndex') shiftIndex: number,
    @Body() body: { reason: string },
    @Request() req
  ) {
    return this.service.markCallOff(id, Number(shiftIndex), body.reason, req.user.userId);
  }

  @Post(':id/shifts/:shiftIndex/replacement')
  @Roles('admin', 'manager')
  assignReplacement(
    @Param('id') id: string,
    @Param('shiftIndex') shiftIndex: number,
    @Body() body: { replacementEmployeeId: string },
    @Request() req
  ) {
    return this.service.assignReplacement(id, Number(shiftIndex), body.replacementEmployeeId, req.user.userId);
  }

  @Post(':id/publish')
  @Roles('admin', 'manager')
  publish(@Param('id') id: string, @Request() req) {
    return this.service.publish(id, req.user.userId);
  }

  @Post(':id/finalize')
  @Roles('admin', 'manager')
  finalize(@Param('id') id: string, @Request() req) {
    return this.service.finalize(id, req.user.userId);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

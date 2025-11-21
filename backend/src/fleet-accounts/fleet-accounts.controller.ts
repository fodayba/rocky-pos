import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FleetAccountsService } from './fleet-accounts.service';
import { CreateFleetAccountDto } from './dto/create-fleet-account.dto';
import { UpdateFleetAccountDto } from './dto/update-fleet-account.dto';
import { AddVehicleDto } from './dto/add-vehicle.dto';
import { AddDriverDto } from './dto/add-driver.dto';
import { AddCardDto } from './dto/add-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';

@Controller('fleet-accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FleetAccountsController {
  constructor(private readonly fleetAccountsService: FleetAccountsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createDto: CreateFleetAccountDto, @Request() req) {
    return this.fleetAccountsService.create(createDto, req.user.userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll(@Query() filters: any) {
    return this.fleetAccountsService.findAll(filters);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getStatistics() {
    return this.fleetAccountsService.getStatistics();
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findActive() {
    return this.fleetAccountsService.findActive();
  }

  @Get('pending-approval')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findPendingApproval() {
    return this.fleetAccountsService.findPendingApproval();
  }

  @Get('overdue')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findOverdue() {
    return this.fleetAccountsService.findOverdue();
  }

  @Get('search')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER)
  search(@Query('q') searchTerm: string) {
    return this.fleetAccountsService.search(searchTerm);
  }

  @Get('account-number/:accountNumber')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER)
  findByAccountNumber(@Param('accountNumber') accountNumber: string) {
    return this.fleetAccountsService.findByAccountNumber(accountNumber);
  }

  @Get('card/:cardNumber')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER)
  findByCardNumber(@Param('cardNumber') cardNumber: string) {
    return this.fleetAccountsService.findByCardNumber(cardNumber);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER)
  findById(@Param('id') id: string) {
    return this.fleetAccountsService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateDto: UpdateFleetAccountDto, @Request() req) {
    return this.fleetAccountsService.update(id, updateDto, req.user.userId);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  approveAccount(@Param('id') id: string, @Request() req) {
    return this.fleetAccountsService.approveAccount(id, req.user.userId);
  }

  @Patch(':id/suspend')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  suspendAccount(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.fleetAccountsService.suspendAccount(id, body.reason);
  }

  @Patch(':id/close')
  @Roles(UserRole.ADMIN)
  closeAccount(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.fleetAccountsService.closeAccount(id, body.reason);
  }

  // Vehicle endpoints
  @Post(':id/vehicles')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  addVehicle(@Param('id') id: string, @Body() vehicleDto: AddVehicleDto) {
    return this.fleetAccountsService.addVehicle(id, vehicleDto);
  }

  @Patch(':id/vehicles/:vehicleNumber')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateVehicle(
    @Param('id') id: string,
    @Param('vehicleNumber') vehicleNumber: string,
    @Body() vehicleDto: Partial<AddVehicleDto>,
  ) {
    return this.fleetAccountsService.updateVehicle(id, vehicleNumber, vehicleDto);
  }

  @Delete(':id/vehicles/:vehicleNumber')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeVehicle(@Param('id') id: string, @Param('vehicleNumber') vehicleNumber: string) {
    return this.fleetAccountsService.removeVehicle(id, vehicleNumber);
  }

  // Driver endpoints
  @Post(':id/drivers')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  addDriver(@Param('id') id: string, @Body() driverDto: AddDriverDto) {
    return this.fleetAccountsService.addDriver(id, driverDto);
  }

  @Patch(':id/drivers/:driverNumber')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateDriver(
    @Param('id') id: string,
    @Param('driverNumber') driverNumber: string,
    @Body() driverDto: Partial<AddDriverDto>,
  ) {
    return this.fleetAccountsService.updateDriver(id, driverNumber, driverDto);
  }

  @Delete(':id/drivers/:driverNumber')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDriver(@Param('id') id: string, @Param('driverNumber') driverNumber: string) {
    return this.fleetAccountsService.removeDriver(id, driverNumber);
  }

  // Card endpoints
  @Post(':id/cards')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  addCard(@Param('id') id: string, @Body() cardDto: AddCardDto) {
    return this.fleetAccountsService.addCard(id, cardDto);
  }

  @Patch(':id/cards/:cardNumber')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateCard(
    @Param('id') id: string,
    @Param('cardNumber') cardNumber: string,
    @Body() cardDto: Partial<AddCardDto>,
  ) {
    return this.fleetAccountsService.updateCard(id, cardNumber, cardDto);
  }

  @Patch(':id/cards/:cardNumber/deactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  deactivateCard(@Param('id') id: string, @Param('cardNumber') cardNumber: string) {
    return this.fleetAccountsService.deactivateCard(id, cardNumber);
  }

  @Delete(':id/cards/:cardNumber')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCard(@Param('id') id: string, @Param('cardNumber') cardNumber: string) {
    return this.fleetAccountsService.removeCard(id, cardNumber);
  }

  // Financial endpoints
  @Patch(':id/balance')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateBalance(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.fleetAccountsService.updateBalance(id, body.amount);
  }

  @Post(':id/payment')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  recordPayment(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.fleetAccountsService.recordPayment(id, body.amount);
  }

  @Get(':id/check-credit')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER)
  checkCredit(@Param('id') id: string, @Query('amount') amount: string) {
    return this.fleetAccountsService.checkCreditAvailable(id, parseFloat(amount));
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.fleetAccountsService.remove(id);
  }
}

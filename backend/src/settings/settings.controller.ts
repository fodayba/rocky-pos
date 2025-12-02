import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  private checkUserAccess(requestedUserId: string, currentUser: User): void {
    if (requestedUserId !== currentUser._id.toString() && currentUser.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Cannot access other user settings');
    }
  }

  @Get(':id/settings')
  async getUserSettings(@Param('id') userId: string, @CurrentUser() user: User) {
    this.checkUserAccess(userId, user);
    return this.settingsService.getUserSettings(userId);
  }

  @Patch(':id/profile')
  async updateProfile(
    @Param('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() user: User,
  ) {
    this.checkUserAccess(userId, user);
    return this.settingsService.updateProfile(userId, updateProfileDto);
  }

  @Post(':id/password')
  async changePassword(
    @Param('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: User,
    @Req() req: Request,
  ) {
    this.checkUserAccess(userId, user);
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.settingsService.changePassword(userId, changePasswordDto, ipAddress);
  }

  @Patch(':id/preferences')
  async updatePreferences(
    @Param('id') userId: string,
    @Body() updatePreferencesDto: UpdatePreferencesDto,
    @CurrentUser() user: User,
  ) {
    this.checkUserAccess(userId, user);
    return this.settingsService.updatePreferences(userId, updatePreferencesDto);
  }

  @Patch(':id/notifications')
  async updateNotifications(
    @Param('id') userId: string,
    @Body() updateNotificationsDto: UpdateNotificationsDto,
    @CurrentUser() user: User,
  ) {
    this.checkUserAccess(userId, user);
    return this.settingsService.updateNotifications(userId, updateNotificationsDto);
  }

  @Post(':id/sessions/logout-all')
  async logoutAllSessions(@Param('id') userId: string, @CurrentUser() user: User, @Req() req: Request) {
    this.checkUserAccess(userId, user);
    // Extract token from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.settingsService.logoutAllSessions(userId, token);
  }

  @Get(':id/activity')
  async getRecentActivity(
    @Param('id') userId: string,
    @Query('limit') limit: string,
    @CurrentUser() user: User,
  ) {
    this.checkUserAccess(userId, user);
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.settingsService.getRecentActivity(userId, limitNum);
  }

  @Post(':id/export')
  async exportData(@Param('id') userId: string, @CurrentUser() user: User, @Req() req: Request) {
    this.checkUserAccess(userId, user);
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.settingsService.exportData(userId, ipAddress);
  }

  @Post(':id/delete')
  async deleteAccount(
    @Param('id') userId: string,
    @Body() deleteAccountDto: DeleteAccountDto,
    @CurrentUser() user: User,
    @Req() req: Request,
  ) {
    this.checkUserAccess(userId, user);
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.settingsService.deleteAccount(userId, deleteAccountDto.password, ipAddress);
  }
}

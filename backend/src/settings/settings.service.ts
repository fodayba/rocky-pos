import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../schemas/user.schema';
import { ActivityLog } from '../schemas/activity-log.schema';
import { Session } from '../schemas/session.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ActivityLog.name) private activityLogModel: Model<ActivityLog>,
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}

  async getUserSettings(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('primaryLocation')
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get active sessions count
    const activeSessions = await this.sessionModel.countDocuments({
      userId: user._id,
      revoked: false,
      expiresAt: { $gt: new Date() },
    });

    // Get recent activity
    const recentActivity = await this.activityLogModel
      .find({ userId: user._id })
      .sort({ timestamp: -1 })
      .limit(10)
      .exec();

    return {
      profile: {
        email: user.email,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        employeeId: user.employeeId,
        primaryLocation: user.primaryLocation,
        createdAt: (user as any).createdAt,
        lastLogin: user.lastLogin,
      },
      preferences: user.preferences || {
        theme: 'system',
        displayDensity: 'comfortable',
        rememberMe: false,
        sessionTimeout: 3600,
      },
      notifications: user.notificationPreferences || {
        email: { sales: true, inventory: true, system: true, security: true },
        inApp: { sales: true, inventory: true, system: true, security: true },
      },
      security: {
        lastPasswordChange: user.lastPasswordChange,
        activeSessions,
        twoFactorEnabled: false,
        lastLoginIp: user.lastLoginIp,
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity._id,
        action: activity.action,
        timestamp: activity.timestamp,
        details: activity.details,
        ipAddress: activity.ipAddress,
      })),
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it's already in use
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({ email: updateProfileDto.email }).exec();
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    // Update fields
    if (updateProfileDto.fullName !== undefined) user.fullName = updateProfileDto.fullName;
    if (updateProfileDto.firstName !== undefined) user.firstName = updateProfileDto.firstName;
    if (updateProfileDto.lastName !== undefined) user.lastName = updateProfileDto.lastName;
    if (updateProfileDto.email !== undefined) user.email = updateProfileDto.email;
    if (updateProfileDto.phone !== undefined) user.phone = updateProfileDto.phone;

    await user.save();

    // Log activity
    await this.logActivity(userId, 'profile_update', { fields: Object.keys(updateProfileDto) });

    return {
      email: user.email,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto, ipAddress?: string) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Verify password confirmation matches
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;
    user.lastPasswordChange = new Date();

    await user.save();

    // Log activity
    await this.logActivity(userId, 'password_change', {}, ipAddress);

    return { message: 'Password changed successfully' };
  }

  async updatePreferences(userId: string, updatePreferencesDto: UpdatePreferencesDto) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Initialize preferences if not exists
    if (!user.preferences) {
      user.preferences = {
        theme: 'system',
        displayDensity: 'comfortable',
        rememberMe: false,
        sessionTimeout: 3600,
      };
    }

    // Update preferences
    if (updatePreferencesDto.locale !== undefined) user.locale = updatePreferencesDto.locale;
    if (updatePreferencesDto.theme !== undefined) user.preferences.theme = updatePreferencesDto.theme;
    if (updatePreferencesDto.displayDensity !== undefined)
      user.preferences.displayDensity = updatePreferencesDto.displayDensity;
    if (updatePreferencesDto.rememberMe !== undefined)
      user.preferences.rememberMe = updatePreferencesDto.rememberMe;
    if (updatePreferencesDto.sessionTimeout !== undefined)
      user.preferences.sessionTimeout = updatePreferencesDto.sessionTimeout;

    await user.save();

    // Log activity
    await this.logActivity(userId, 'preferences_update', { fields: Object.keys(updatePreferencesDto) });

    return {
      locale: user.locale,
      ...user.preferences,
    };
  }

  async updateNotifications(userId: string, updateNotificationsDto: UpdateNotificationsDto) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Initialize notification preferences if not exists
    if (!user.notificationPreferences) {
      user.notificationPreferences = {
        email: { sales: true, inventory: true, system: true, security: true },
        inApp: { sales: true, inventory: true, system: true, security: true },
      };
    }

    // Update notification preferences
    if (updateNotificationsDto.email) {
      user.notificationPreferences.email = {
        ...user.notificationPreferences.email,
        ...updateNotificationsDto.email,
      };
    }

    if (updateNotificationsDto.inApp) {
      user.notificationPreferences.inApp = {
        ...user.notificationPreferences.inApp,
        ...updateNotificationsDto.inApp,
      };
    }

    await user.save();

    // Log activity
    await this.logActivity(userId, 'notifications_update', {});

    return user.notificationPreferences;
  }

  async logoutAllSessions(userId: string, currentToken?: string) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Revoke all sessions except current one
    const result = await this.sessionModel.updateMany(
      {
        userId: user._id,
        revoked: false,
        ...(currentToken && { token: { $ne: currentToken } }),
      },
      {
        $set: { revoked: true },
      },
    );

    // Log activity
    await this.logActivity(userId, 'logout_all_sessions', { count: result.modifiedCount });

    return { count: result.modifiedCount };
  }

  async getRecentActivity(userId: string, limit: number = 10) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activities = await this.activityLogModel
      .find({ userId: user._id })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    return activities.map(activity => ({
      id: activity._id,
      action: activity.action,
      timestamp: activity.timestamp,
      details: activity.details,
      ipAddress: activity.ipAddress,
    }));
  }

  async exportData(userId: string, ipAddress?: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('primaryLocation')
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get all activity history
    const activities = await this.activityLogModel.find({ userId: user._id }).sort({ timestamp: -1 }).exec();

    const exportData = {
      profile: {
        email: user.email,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        employeeId: user.employeeId,
        primaryLocation: user.primaryLocation,
        createdAt: (user as any).createdAt,
      },
      preferences: user.preferences,
      notificationPreferences: user.notificationPreferences,
      activityHistory: activities.map(activity => ({
        action: activity.action,
        timestamp: activity.timestamp,
        details: activity.details,
        ipAddress: activity.ipAddress,
      })),
      exportedAt: new Date(),
    };

    // Log the export request
    await this.logActivity(userId, 'data_export', {}, ipAddress);

    // In a real implementation, this would upload to S3 or similar and return a download URL
    // For now, we'll return the data directly
    return {
      downloadUrl: `/api/users/${userId}/export/download`,
      data: exportData,
    };
  }

  async deleteAccount(userId: string, password: string, ipAddress?: string) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    // Mark account for deletion (30 days from now)
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    user.markedForDeletion = true;
    user.deletionScheduledFor = deletionDate;
    user.active = false;

    await user.save();

    // Revoke all sessions
    await this.sessionModel.updateMany(
      { userId: user._id, revoked: false },
      { $set: { revoked: true } },
    );

    // Log activity
    await this.logActivity(userId, 'account_deletion_requested', { scheduledFor: deletionDate }, ipAddress);

    // In a real implementation, send recovery email here
    // await this.emailService.sendAccountDeletionEmail(user.email, deletionDate);

    return {
      message: 'Account marked for deletion',
      scheduledFor: deletionDate,
    };
  }

  private async logActivity(
    userId: string,
    action: string,
    details: Record<string, any> = {},
    ipAddress?: string,
  ) {
    const activityLog = new this.activityLogModel({
      userId,
      action,
      details,
      ipAddress,
      timestamp: new Date(),
    });

    await activityLog.save();
  }
}

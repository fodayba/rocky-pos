import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as fc from 'fast-check';
import { vi } from 'vitest';
import { SettingsService } from './settings.service';
import { User } from '../schemas/user.schema';
import { ActivityLog } from '../schemas/activity-log.schema';
import { Session } from '../schemas/session.schema';
import { Types } from 'mongoose';

// Mock bcrypt at module level
vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
  compare: vi.fn(),
  hash: vi.fn(),
}));

describe('SettingsService - Property-Based Tests', () => {
  let service: SettingsService;
  let userModel: any;
  let activityLogModel: any;
  let sessionModel: any;

  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    fullName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    role: 'cashier',
    password: 'hashedPassword',
    preferences: {
      theme: 'system',
      displayDensity: 'comfortable',
      rememberMe: false,
      sessionTimeout: 3600,
    },
    notificationPreferences: {
      email: { sales: true, inventory: true, system: true, security: true },
      inApp: { sales: true, inventory: true, system: true, security: true },
    },
    save: vi.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const mockUserModel = {
      findById: vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue(mockUser),
          }),
        }),
        exec: vi.fn().mockResolvedValue(mockUser),
      }),
      findOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      }),
      countDocuments: vi.fn().mockResolvedValue(2),
    };

    class MockActivityLogModel {
      save = vi.fn().mockResolvedValue(true);
      static find = vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue([]),
          }),
          exec: vi.fn().mockResolvedValue([]),
        }),
      });
    }

    const mockSessionModel = {
      countDocuments: vi.fn().mockResolvedValue(2),
      updateMany: vi.fn().mockResolvedValue({ modifiedCount: 2 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(ActivityLog.name),
          useValue: MockActivityLogModel,
        },
        {
          provide: getModelToken(Session.name),
          useValue: mockSessionModel,
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    userModel = mockUserModel;
    activityLogModel = MockActivityLogModel;
    sessionModel = mockSessionModel;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Feature: settings-page, Property 2: Profile updates persist to backend
   * Validates: Requirements 2.4
   */
  describe('Property 2: Profile updates persist to backend', () => {
    it('should save any valid profile update to the database', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            fullName: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
            firstName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
            lastName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
            email: fc.option(fc.emailAddress()),
            phone: fc.option(fc.string({ minLength: 10, maxLength: 15 })),
          }),
          async (profileData) => {
            // Filter out null values
            const updateDto = Object.fromEntries(
              Object.entries(profileData).filter(([_, v]) => v !== null),
            );

            // Skip if no fields to update
            fc.pre(Object.keys(updateDto).length > 0);

            const userId = new Types.ObjectId().toString();

            await service.updateProfile(userId, updateDto);

            // Verify save was called
            expect(mockUser.save).toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Feature: settings-page, Property 3: Email validation before save
   * Validates: Requirements 2.5
   */
  describe('Property 3: Email validation before save', () => {
    it('should reject duplicate emails', async () => {
      await fc.assert(
        fc.asyncProperty(fc.emailAddress(), async (email) => {
          const userId = new Types.ObjectId().toString();

          // Mock that email already exists
          userModel.findOne = vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue({ _id: new Types.ObjectId(), email }),
          });

          await expect(service.updateProfile(userId, { email })).rejects.toThrow(ConflictException);
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Feature: settings-page, Property 4: Password change requires current password
   * Validates: Requirements 3.2
   */
  describe('Property 4: Password change requires current password', () => {
    it('should reject password change with incorrect current password', async () => {
      const bcrypt = await import('bcrypt');

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 50 }),
          fc.string({ minLength: 8, maxLength: 50 }),
          async (wrongPassword, newPassword) => {
            const userId = new Types.ObjectId().toString();

            // Mock bcrypt to always return false for wrong password
            vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

            await expect(
              service.changePassword(userId, {
                currentPassword: wrongPassword,
                newPassword,
                confirmPassword: newPassword,
              }),
            ).rejects.toThrow(UnauthorizedException);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Feature: settings-page, Property 5: Password confirmation must match
   * Validates: Requirements 3.3, 3.4
   */
  describe('Property 5: Password confirmation must match', () => {
    it('should reject password change when confirmation does not match', async () => {
      const bcrypt = await import('bcrypt');

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 50 }),
          fc.string({ minLength: 8, maxLength: 50 }),
          fc.string({ minLength: 8, maxLength: 50 }),
          async (currentPassword, newPassword, confirmPassword) => {
            // Ensure they don't match
            fc.pre(newPassword !== confirmPassword);

            const userId = new Types.ObjectId().toString();

            // Mock bcrypt to return true for current password
            vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

            await expect(
              service.changePassword(userId, {
                currentPassword,
                newPassword,
                confirmPassword,
              }),
            ).rejects.toThrow(BadRequestException);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Feature: settings-page, Property 14: Logout all sessions invalidates sessions
   * Validates: Requirements 8.5
   */
  describe('Property 14: Logout all sessions invalidates sessions', () => {
    it('should invalidate all sessions for any user', async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 0, max: 100 }), async (seed) => {
          const userId = new Types.ObjectId().toString();
          const sessionCount = Math.floor(Math.random() * 10) + 1;

          sessionModel.updateMany.mockResolvedValue({ modifiedCount: sessionCount });

          const result = await service.logoutAllSessions(userId);

          expect(sessionModel.updateMany).toHaveBeenCalled();
          expect(result.count).toBeGreaterThanOrEqual(0);
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Feature: settings-page, Property 17: Data export generates complete JSON
   * Validates: Requirements 10.2, 10.4
   */
  describe('Property 17: Data export generates complete JSON', () => {
    it('should include all required sections in export', async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 0, max: 100 }), async (seed) => {
          const userId = new Types.ObjectId().toString();

          const result = await service.exportData(userId);

          expect(result.data).toHaveProperty('profile');
          expect(result.data).toHaveProperty('preferences');
          expect(result.data).toHaveProperty('notificationPreferences');
          expect(result.data).toHaveProperty('activityHistory');
          expect(result.data).toHaveProperty('exportedAt');
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Feature: settings-page, Property 20: Account deletion requires password
   * Validates: Requirements 11.2
   */
  describe('Property 20: Account deletion requires password', () => {
    it('should reject deletion with incorrect password', async () => {
      const bcrypt = await import('bcrypt');

      await fc.assert(
        fc.asyncProperty(fc.string({ minLength: 8, maxLength: 50 }), async (wrongPassword) => {
          const userId = new Types.ObjectId().toString();

          // Mock bcrypt to return false for wrong password
          vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

          await expect(service.deleteAccount(userId, wrongPassword)).rejects.toThrow(UnauthorizedException);
        }),
        { numRuns: 100 },
      );
    });
  });
});

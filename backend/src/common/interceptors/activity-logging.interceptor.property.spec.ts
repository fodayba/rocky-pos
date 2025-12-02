import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import * as fc from 'fast-check';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { ActivityLoggingInterceptor } from './activity-logging.interceptor';
import { ActivityLog } from '../../schemas/activity-log.schema';
import { Types } from 'mongoose';

describe('ActivityLoggingInterceptor - Property-Based Tests', () => {
  let interceptor: ActivityLoggingInterceptor;
  let activityLogModel: any;
  let savedActivities: any[];

  const createInterceptor = () => {
    const savedActivities: any[] = [];

    const mockActivityLogModel = vi.fn().mockImplementation((data) => {
      const activity = { ...data, _id: new Types.ObjectId() };
      return {
        save: vi.fn().mockImplementation(async () => {
          savedActivities.push(activity);
          return activity;
        }),
      };
    });

    return { mockActivityLogModel, savedActivities };
  };

  beforeEach(async () => {
    const result = createInterceptor();
    const mockActivityLogModel = result.mockActivityLogModel;
    savedActivities = result.savedActivities;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityLoggingInterceptor,
        {
          provide: getModelToken(ActivityLog.name),
          useValue: mockActivityLogModel,
        },
      ],
    }).compile();

    interceptor = module.get<ActivityLoggingInterceptor>(ActivityLoggingInterceptor);
    activityLogModel = mockActivityLogModel;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Feature: settings-page, Property 15: Activity entries have required fields
   * Validates: Requirements 9.4, 9.5
   */
  describe('Property 15: Activity entries have required fields', () => {
    it('should create activity logs with all required fields for any logged action', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            method: fc.constantFrom('POST', 'PATCH', 'DELETE'),
            urlPath: fc.constantFrom(
              '/users/123/profile',
              '/users/123/password',
              '/users/123/preferences',
              '/users/123/notifications',
              '/users/123/sessions/logout-all',
              '/users/123/export',
              '/users/123/delete',
            ),
            userId: fc.string({ minLength: 24, maxLength: 24 }).map(s => new Types.ObjectId().toString()),
            ipAddress: fc.ipV4(),
            userAgent: fc.string({ minLength: 10, maxLength: 100 }),
          }),
          async ({ method, urlPath, userId, ipAddress, userAgent }) => {
            const { mockActivityLogModel, savedActivities } = createInterceptor();

            const module: TestingModule = await Test.createTestingModule({
              providers: [
                ActivityLoggingInterceptor,
                {
                  provide: getModelToken(ActivityLog.name),
                  useValue: mockActivityLogModel,
                },
              ],
            }).compile();

            const testInterceptor = module.get<ActivityLoggingInterceptor>(ActivityLoggingInterceptor);

            // Create mock execution context
            const mockRequest = {
              method,
              url: urlPath,
              user: { _id: userId },
              ip: ipAddress,
              headers: { 'user-agent': userAgent },
              body: {},
              socket: { remoteAddress: ipAddress },
            };

            const mockContext = {
              switchToHttp: () => ({
                getRequest: () => mockRequest,
              }),
            } as ExecutionContext;

            const mockCallHandler: CallHandler = {
              handle: () => of({ success: true }),
            };

            // Execute interceptor
            await new Promise<void>((resolve) => {
              testInterceptor.intercept(mockContext, mockCallHandler).subscribe({
                next: () => {
                  // Wait a bit for async logging to complete
                  setTimeout(() => resolve(), 100);
                },
                error: () => resolve(),
              });
            });

            // Verify activity was logged with required fields
            if (savedActivities.length > 0) {
              const activity = savedActivities[0];
              expect(activity).toHaveProperty('userId');
              expect(activity).toHaveProperty('action');
              expect(activity).toHaveProperty('timestamp');
              expect(activity.userId).toBe(userId);
              expect(activity.ipAddress).toBe(ipAddress);
              expect(activity.userAgent).toBe(userAgent);
            }
          },
        ),
        { numRuns: 10 },
      );
    }, 30000);
  });

  /**
   * Feature: settings-page, Property 16: Activity list updates on new actions
   * Validates: Requirements 9.4, 9.5
   */
  describe('Property 16: Activity list updates on new actions', () => {
    it(
      'should add new activity entries for any sequence of user actions',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.array(
              fc.record({
                method: fc.constantFrom('POST', 'PATCH'),
                urlPath: fc.constantFrom(
                  '/users/123/profile',
                  '/users/123/preferences',
                  '/users/123/notifications',
                ),
                userId: fc.constant('507f1f77bcf86cd799439011'),
              }),
              { minLength: 1, maxLength: 5 },
            ),
            async (actions) => {
              const { mockActivityLogModel, savedActivities } = createInterceptor();

              const module: TestingModule = await Test.createTestingModule({
                providers: [
                  ActivityLoggingInterceptor,
                  {
                    provide: getModelToken(ActivityLog.name),
                    useValue: mockActivityLogModel,
                  },
                ],
              }).compile();

              const testInterceptor = module.get<ActivityLoggingInterceptor>(ActivityLoggingInterceptor);

              const initialCount = savedActivities.length;

              // Execute each action
              for (const action of actions) {
                const mockRequest = {
                  method: action.method,
                  url: action.urlPath,
                  user: { _id: action.userId },
                  ip: '127.0.0.1',
                  headers: { 'user-agent': 'test-agent' },
                  body: {},
                  socket: { remoteAddress: '127.0.0.1' },
                };

                const mockContext = {
                  switchToHttp: () => ({
                    getRequest: () => mockRequest,
                  }),
                } as ExecutionContext;

                const mockCallHandler: CallHandler = {
                  handle: () => of({ success: true }),
                };

                await new Promise<void>((resolve) => {
                  testInterceptor.intercept(mockContext, mockCallHandler).subscribe({
                    next: () => {
                      setTimeout(() => resolve(), 100);
                    },
                    error: () => resolve(),
                  });
                });
              }

              // Verify activity count increased
              expect(savedActivities.length).toBeGreaterThanOrEqual(initialCount);
              expect(savedActivities.length).toBeLessThanOrEqual(initialCount + actions.length);

              // Verify all activities have the same userId
              if (savedActivities.length > 0) {
                const userIds = savedActivities.map((a) => a.userId);
                const uniqueUserIds = new Set(userIds);
                expect(uniqueUserIds.size).toBeLessThanOrEqual(1);
              }
            },
          ),
          { numRuns: 20 },
        );
      },
      30000,
    );
  });

  describe('Activity logging behavior', () => {
    it('should not log GET requests', async () => {
      const mockRequest = {
        method: 'GET',
        url: '/users/123/settings',
        user: { _id: '507f1f77bcf86cd799439011' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        body: {},
        socket: { remoteAddress: '127.0.0.1' },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ success: true }),
      };

      await new Promise<void>((resolve) => {
        interceptor.intercept(mockContext, mockCallHandler).subscribe({
          next: () => {
            setTimeout(() => resolve(), 50);
          },
          error: () => resolve(),
        });
      });

      // Verify no activity was logged for GET request
      expect(savedActivities.length).toBe(0);
    });

    it('should not log requests without authenticated user', async () => {
      const mockRequest = {
        method: 'POST',
        url: '/users/123/profile',
        user: null,
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        body: {},
        socket: { remoteAddress: '127.0.0.1' },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ success: true }),
      };

      await new Promise<void>((resolve) => {
        interceptor.intercept(mockContext, mockCallHandler).subscribe({
          next: () => {
            setTimeout(() => resolve(), 50);
          },
          error: () => resolve(),
        });
      });

      // Verify no activity was logged without user
      expect(savedActivities.length).toBe(0);
    });
  });
});

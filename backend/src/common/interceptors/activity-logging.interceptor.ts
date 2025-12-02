import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityLog } from '../../schemas/activity-log.schema';

@Injectable()
export class ActivityLoggingInterceptor implements NestInterceptor {
  constructor(
    @InjectModel(ActivityLog.name)
    private activityLogModel: Model<ActivityLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    // Only log for authenticated requests with a user
    if (!user || !user._id) {
      return next.handle();
    }

    // Determine action based on method and URL
    const action = this.determineAction(method, url);

    // Skip logging if action is not relevant
    if (!action) {
      return next.handle();
    }

    const ipAddress = ip || request.socket?.remoteAddress;
    const userAgent = headers['user-agent'];
    const userId = user._id.toString ? user._id.toString() : user._id;

    return next.handle().pipe(
      tap({
        next: async (response) => {
          // Log successful actions
          try {
            await this.logActivity(
              userId,
              action,
              this.extractDetails(method, url, request.body, response),
              ipAddress,
              userAgent,
            );
          } catch (error) {
            // Don't fail the request if logging fails
            console.error('Failed to log activity:', error);
          }
        },
        error: (error) => {
          // Optionally log failed actions
          // For now, we only log successful actions
        },
      }),
    );
  }

  private determineAction(method: string, url: string): string | null {
    // Login/Logout
    if (url.includes('/auth/login')) return 'login';
    if (url.includes('/auth/logout')) return 'logout';

    // Settings operations
    if (url.includes('/profile') && method === 'PATCH') return 'profile_update';
    if (url.includes('/password') && method === 'POST') return 'password_change';
    if (url.includes('/preferences') && method === 'PATCH')
      return 'preferences_update';
    if (url.includes('/notifications') && method === 'PATCH')
      return 'notifications_update';
    if (url.includes('/sessions/logout-all') && method === 'POST')
      return 'logout_all_sessions';
    if (url.includes('/export') && method === 'POST') return 'data_export';
    if (url.includes('/delete') && method === 'POST')
      return 'account_deletion_requested';

    // Product operations
    if (url.includes('/products') && method === 'POST') return 'product_created';
    if (url.includes('/products') && method === 'PATCH') return 'product_updated';
    if (url.includes('/products') && method === 'DELETE')
      return 'product_deleted';

    // Transaction operations
    if (url.includes('/transactions') && method === 'POST')
      return 'transaction_created';

    // Customer operations
    if (url.includes('/customers') && method === 'POST') return 'customer_created';
    if (url.includes('/customers') && method === 'PATCH')
      return 'customer_updated';

    // Shift operations
    if (url.includes('/shifts/clock-in') && method === 'POST') return 'clock_in';
    if (url.includes('/shifts/clock-out') && method === 'POST') return 'clock_out';

    // Return null for GET requests and other operations we don't want to log
    if (method === 'GET') return null;

    return null;
  }

  private extractDetails(
    method: string,
    url: string,
    body: any,
    response: any,
  ): Record<string, any> {
    const details: Record<string, any> = {};

    // Extract relevant details based on action type
    if (body) {
      // For profile updates, log which fields were changed
      if (url.includes('/profile')) {
        details.fields = Object.keys(body);
      }

      // For preferences, log what was changed
      if (url.includes('/preferences')) {
        details.fields = Object.keys(body);
      }

      // For notifications, log categories changed
      if (url.includes('/notifications')) {
        details.categories = Object.keys(body);
      }
    }

    // Extract response details if relevant
    if (response) {
      if (url.includes('/logout-all') && response.count !== undefined) {
        details.sessionsRevoked = response.count;
      }

      if (url.includes('/delete') && response.scheduledFor) {
        details.scheduledFor = response.scheduledFor;
      }
    }

    return details;
  }

  private async logActivity(
    userId: string,
    action: string,
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const activityLog = new this.activityLogModel({
      userId,
      action,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });

    await activityLog.save();
  }
}

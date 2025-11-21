import { Controller, Get, UseGuards, Query, Param } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query() filters: any) {
    return this.auditService.findAll(filters);
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findByUser(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.auditService.findByUser(userId, limit ? parseInt(limit) : 100);
  }

  @Get('resource/:resource/:resourceId')
  @Roles(UserRole.ADMIN)
  findByResource(@Param('resource') resource: string, @Param('resourceId') resourceId: string) {
    return this.auditService.findByResource(resource, resourceId);
  }

  @Get('security-events')
  @Roles(UserRole.ADMIN)
  findSecurityEvents() {
    return this.auditService.findSecurityEvents();
  }

  @Get('flagged')
  @Roles(UserRole.ADMIN)
  findFlaggedForReview() {
    return this.auditService.findFlaggedForReview();
  }
}

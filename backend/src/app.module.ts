import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { FuelModule } from './fuel/fuel.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ShiftsModule } from './shifts/shifts.module';
import { CustomersModule } from './customers/customers.module';
import { LocationsModule } from './locations/locations.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { FleetAccountsModule } from './fleet-accounts/fleet-accounts.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { PromotionsModule } from './promotions/promotions.module';
import { GiftCardsModule } from './gift-cards/gift-cards.module';
import { AuditModule } from './audit/audit.module';
import { InventoryTransfersModule } from './inventory-transfers/inventory-transfers.module';
import { FuelManagementModule } from './fuel-management/fuel-management.module';
import { InvoicingModule } from './invoicing/invoicing.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { TimeTrackingModule } from './time-tracking/time-tracking.module';
import { TaxModule } from './tax/tax.module';
import { ReportsModule } from './reports/reports.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { SettingsModule } from './settings/settings.module';
import { ActivityLoggingInterceptor } from './common/interceptors/activity-logging.interceptor';
import { ActivityLog, ActivityLogSchema } from './schemas/activity-log.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: ActivityLog.name, schema: ActivityLogSchema },
    ]),
    AuthModule,
    ProductsModule,
    FuelModule,
    TransactionsModule,
    ShiftsModule,
    CustomersModule,
    LocationsModule,
    SuppliersModule,
    FleetAccountsModule,
    PurchaseOrdersModule,
    PromotionsModule,
    GiftCardsModule,
    AuditModule,
    InventoryTransfersModule,
    FuelManagementModule,
    InvoicingModule,
    SchedulingModule,
    TimeTrackingModule,
    TaxModule,
    ReportsModule,
    OnboardingModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLoggingInterceptor,
    },
  ],
})
export class AppModule {}

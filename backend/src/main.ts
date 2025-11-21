import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Rocky POS API')
    .setDescription('Enterprise-grade Point of Sale system for gas stations with integrated minimart operations')
    .setVersion('2.0')
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Locations', 'Multi-location store management')
    .addTag('Products', 'Minimart inventory management')
    .addTag('Fuel', 'Fuel products and pricing')
    .addTag('Transactions', 'Sales transactions')
    .addTag('Shifts', 'Cashier shift management')
    .addTag('Customers', 'Customer loyalty program')
    .addTag('Suppliers', 'Supplier management')
    .addTag('Fleet Accounts', 'Fleet and commercial accounts')
    .addTag('Purchase Orders', 'Procurement workflow')
    .addTag('Promotions', 'Promotions and discounts')
    .addTag('Gift Cards', 'Gift card management')
    .addTag('Audit', 'Audit logging and compliance')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();

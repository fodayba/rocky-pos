import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './schemas/user.schema';
import { Product } from './schemas/product.schema';
import { FuelProduct, FuelType } from './schemas/fuel-product.schema';
import { Customer } from './schemas/customer.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Get models
    const userModel = app.get<Model<User>>(getModelToken(User.name));
    const productModel = app.get<Model<Product>>(getModelToken(Product.name));
    const fuelModel = app.get<Model<FuelProduct>>(getModelToken(FuelProduct.name));
    const customerModel = app.get<Model<Customer>>(getModelToken(Customer.name));

    // Clear existing data
    console.log('Clearing existing data...');
    await userModel.deleteMany({});
    await productModel.deleteMany({});
    await fuelModel.deleteMany({});
    await customerModel.deleteMany({});

    // Create users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    await userModel.create([
      {
        username: 'admin',
        password: hashedPassword,
        fullName: 'System Administrator',
        email: 'admin@rockypos.com',
        role: UserRole.ADMIN,
        active: true,
      },
      {
        username: 'manager',
        password: hashedPassword,
        fullName: 'Store Manager',
        email: 'manager@rockypos.com',
        role: UserRole.MANAGER,
        active: true,
      },
      {
        username: 'cashier',
        password: hashedPassword,
        fullName: 'John Cashier',
        email: 'cashier@rockypos.com',
        role: UserRole.CASHIER,
        active: true,
      },
    ]);
    console.log('✓ Created 3 users (admin, manager, cashier) - password: password123');

    // Create fuel products
    console.log('Creating fuel products...');
    await fuelModel.create([
      {
        name: 'Regular Unleaded',
        fuelType: FuelType.REGULAR,
        pricePerGallon: 3.49,
        currentStock: 5000,
        capacity: 10000,
        minLevel: 2000,
        lastDelivery: new Date(),
        lastDeliveryAmount: 5000,
      },
      {
        name: 'Premium Unleaded',
        fuelType: FuelType.PREMIUM,
        pricePerGallon: 3.89,
        currentStock: 3500,
        capacity: 8000,
        minLevel: 1500,
        lastDelivery: new Date(),
        lastDeliveryAmount: 3500,
      },
      {
        name: 'Diesel',
        fuelType: FuelType.DIESEL,
        pricePerGallon: 3.69,
        currentStock: 4000,
        capacity: 8000,
        minLevel: 1500,
        lastDelivery: new Date(),
        lastDeliveryAmount: 4000,
      },
    ]);
    console.log('✓ Created 3 fuel products');

    // Create minimart products
    console.log('Creating minimart products...');
    await productModel.create([
      // Beverages
      {
        barcode: '012000000010',
        name: 'Coca-Cola 20oz',
        description: 'Classic Coca-Cola',
        category: 'Beverages',
        price: 2.29,
        cost: 1.20,
        stockQuantity: 100,
        minStockLevel: 20,
        unit: 'bottle',
        supplier: 'Coca-Cola Distributor',
        taxable: true,
        taxRate: 0.08,
      },
      {
        barcode: '012000000027',
        name: 'Pepsi 20oz',
        description: 'Pepsi Cola',
        category: 'Beverages',
        price: 2.29,
        cost: 1.20,
        stockQuantity: 80,
        minStockLevel: 20,
        unit: 'bottle',
        supplier: 'Pepsi Distributor',
        taxable: true,
        taxRate: 0.08,
      },
      {
        barcode: '012000000034',
        name: 'Water 16.9oz',
        description: 'Bottled Water',
        category: 'Beverages',
        price: 1.49,
        cost: 0.60,
        stockQuantity: 150,
        minStockLevel: 30,
        unit: 'bottle',
        supplier: 'Nestle Waters',
        taxable: true,
        taxRate: 0.08,
      },
      {
        barcode: '012000000041',
        name: 'Monster Energy',
        description: 'Energy Drink',
        category: 'Beverages',
        price: 3.29,
        cost: 1.80,
        stockQuantity: 60,
        minStockLevel: 15,
        unit: 'can',
        supplier: 'Monster Beverage',
        taxable: true,
        taxRate: 0.08,
      },
      // Snacks
      {
        barcode: '028400000000',
        name: "Lay's Classic Chips",
        description: 'Regular size potato chips',
        category: 'Snacks',
        price: 2.49,
        cost: 1.30,
        stockQuantity: 75,
        minStockLevel: 20,
        unit: 'bag',
        supplier: 'Frito-Lay',
        taxable: true,
        taxRate: 0.08,
      },
      {
        barcode: '028400000017',
        name: 'Doritos Nacho Cheese',
        description: 'Nacho cheese flavored tortilla chips',
        category: 'Snacks',
        price: 2.49,
        cost: 1.30,
        stockQuantity: 65,
        minStockLevel: 20,
        unit: 'bag',
        supplier: 'Frito-Lay',
        taxable: true,
        taxRate: 0.08,
      },
      {
        barcode: '028400000024',
        name: "Snickers Bar",
        description: 'Chocolate candy bar',
        category: 'Candy',
        price: 1.79,
        cost: 0.90,
        stockQuantity: 120,
        minStockLevel: 25,
        unit: 'bar',
        supplier: 'Mars Inc',
        taxable: true,
        taxRate: 0.08,
      },
      // Tobacco (higher tax rate)
      {
        barcode: '028200000000',
        name: 'Marlboro Red',
        description: 'Cigarettes pack',
        category: 'Tobacco',
        price: 9.99,
        cost: 6.50,
        stockQuantity: 40,
        minStockLevel: 10,
        unit: 'pack',
        supplier: 'Philip Morris',
        taxable: true,
        taxRate: 0.25,
      },
      // Automotive
      {
        barcode: '079400000000',
        name: 'Motor Oil 5W-30',
        description: 'Synthetic motor oil 1 quart',
        category: 'Automotive',
        price: 7.99,
        cost: 4.50,
        stockQuantity: 30,
        minStockLevel: 10,
        unit: 'bottle',
        supplier: 'Valvoline',
        taxable: true,
        taxRate: 0.08,
      },
      {
        barcode: '079400000017',
        name: 'Windshield Washer Fluid',
        description: 'All-season washer fluid 1 gallon',
        category: 'Automotive',
        price: 4.99,
        cost: 2.50,
        stockQuantity: 25,
        minStockLevel: 8,
        unit: 'gallon',
        supplier: 'Rain-X',
        taxable: true,
        taxRate: 0.08,
      },
      // Grocery
      {
        barcode: '040000000000',
        name: 'White Bread',
        description: 'Loaf of white bread',
        category: 'Grocery',
        price: 3.49,
        cost: 1.80,
        stockQuantity: 20,
        minStockLevel: 5,
        unit: 'loaf',
        supplier: 'Wonder Bread',
        taxable: false,
        taxRate: 0,
      },
      {
        barcode: '040000000017',
        name: 'Milk Gallon',
        description: 'Whole milk 1 gallon',
        category: 'Grocery',
        price: 4.99,
        cost: 2.80,
        stockQuantity: 15,
        minStockLevel: 5,
        unit: 'gallon',
        supplier: 'Local Dairy',
        taxable: false,
        taxRate: 0,
      },
      {
        barcode: '040000000024',
        name: 'Hot Dog',
        description: 'Ready to eat hot dog',
        category: 'Food Service',
        price: 2.99,
        cost: 1.20,
        stockQuantity: 50,
        minStockLevel: 15,
        unit: 'each',
        supplier: 'Oscar Mayer',
        taxable: true,
        taxRate: 0.08,
      },
      {
        barcode: '040000000031',
        name: 'Coffee Medium',
        description: 'Fresh brewed coffee medium',
        category: 'Food Service',
        price: 1.99,
        cost: 0.40,
        stockQuantity: 200,
        minStockLevel: 50,
        unit: 'cup',
        supplier: 'Local Coffee Roaster',
        taxable: true,
        taxRate: 0.08,
      },
    ]);
    console.log('✓ Created 14 minimart products');

    // Create sample customers
    console.log('Creating sample customers...');
    await customerModel.create([
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '555-0101',
        loyaltyPoints: 150,
        totalSpent: 450.75,
      },
      {
        name: 'Jane Doe',
        email: 'jane.doe@email.com',
        phone: '555-0102',
        loyaltyPoints: 230,
        totalSpent: 780.50,
      },
      {
        name: 'Bob Johnson',
        phone: '555-0103',
        loyaltyPoints: 50,
        totalSpent: 125.00,
      },
    ]);
    console.log('✓ Created 3 sample customers');

    console.log('\n=================================');
    console.log('Seed completed successfully!');
    console.log('=================================');
    console.log('\nTest credentials:');
    console.log('  Admin: admin / password123');
    console.log('  Manager: manager / password123');
    console.log('  Cashier: cashier / password123');
    console.log('\nDatabase ready for testing!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

seed();

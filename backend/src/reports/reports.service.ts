import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from '../schemas/transaction.schema';
import { Product } from '../schemas/product.schema';
import { TimeEntry } from '../schemas/time-entry.schema';
import { Invoice } from '../schemas/invoice.schema';
import { FuelTank } from '../schemas/fuel-tank.schema';
import { FuelPump } from '../schemas/fuel-pump.schema';
import { SalesReportDto } from './dto/sales-report.dto';
import { InventoryReportDto } from './dto/inventory-report.dto';
import { EmployeeReportDto } from './dto/employee-report.dto';
import { FinancialReportDto } from './dto/financial-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(TimeEntry.name) private timeEntryModel: Model<TimeEntry>,
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
    @InjectModel(FuelTank.name) private fuelTankModel: Model<FuelTank>,
    @InjectModel(FuelPump.name) private fuelPumpModel: Model<FuelPump>,
  ) {}

  async getSalesReport(dto: SalesReportDto): Promise<any> {
    const query: any = {
      createdAt: {
        $gte: new Date(dto.startDate),
        $lte: new Date(dto.endDate),
      },
    };

    if (dto.locationId) {
      query.locationId = dto.locationId;
    }

    const transactions = await this.transactionModel
      .find(query)
      .populate('items.productId', 'name category')
      .exec();

    const report = {
      period: {
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
      summary: {
        totalTransactions: transactions.length,
        totalSales: 0,
        totalTax: 0,
        totalDiscount: 0,
        averageTransaction: 0,
      },
      breakdown: {
        byPaymentMethod: {},
        byCategory: {},
        byHour: {},
      },
      topProducts: [],
    };

    // Calculate totals
    transactions.forEach(txn => {
      report.summary.totalSales += txn.total;
      report.summary.totalTax += txn.tax;
      report.summary.totalDiscount += txn.discountTotal || 0;

      // By payment method
      const method = txn.paymentMethod || 'unknown';
      if (!report.breakdown.byPaymentMethod[method]) {
        report.breakdown.byPaymentMethod[method] = { count: 0, amount: 0 };
      }
      report.breakdown.byPaymentMethod[method].count++;
      report.breakdown.byPaymentMethod[method].amount += txn.total;

      // By hour
      const hour = new Date((txn as any).createdAt).getHours();
      if (!report.breakdown.byHour[hour]) {
        report.breakdown.byHour[hour] = { count: 0, amount: 0 };
      }
      report.breakdown.byHour[hour].count++;
      report.breakdown.byHour[hour].amount += txn.total;
    });

    report.summary.averageTransaction =
      transactions.length > 0 ? report.summary.totalSales / transactions.length : 0;

    return report;
  }

  async getInventoryReport(dto: InventoryReportDto): Promise<any> {
    const query: any = {};

    if (dto.locationId) {
      query.locationId = dto.locationId;
    }

    if (dto.category) {
      query.category = dto.category;
    }

    const products = await this.productModel
      .find(query)
      .populate('locationId', 'name storeNumber')
      .exec();

    const report: {
      totalProducts: number;
      totalValue: number;
      lowStockItems: any[];
      outOfStock: any[];
      overStock: any[];
      categories: Record<string, any>;
    } = {
      totalProducts: products.length,
      totalValue: 0,
      lowStockItems: [],
      outOfStock: [],
      overStock: [],
      categories: {},
    };

    products.forEach(product => {
      const value = product.stockQuantity * product.cost;
      report.totalValue += value;

      // Category breakdown
      const category = product.category || 'Uncategorized';
      if (!report.categories[category]) {
        report.categories[category] = { count: 0, quantity: 0, value: 0 };
      }
      report.categories[category].count++;
      report.categories[category].quantity += product.stockQuantity;
      report.categories[category].value += value;

      // Stock levels
      if (product.stockQuantity === 0) {
        report.outOfStock.push({
          barcode: product.barcode,
          name: product.name,
          category: product.category,
        });
      } else if (product.minStockLevel && product.stockQuantity < product.minStockLevel) {
        report.lowStockItems.push({
          barcode: product.barcode,
          name: product.name,
          category: product.category,
          currentStock: product.stockQuantity,
          minStock: product.minStockLevel,
          reorderNeeded: product.minStockLevel - product.stockQuantity,
        });
      }
      // Note: Overstock detection removed - Product schema doesn't have maxStock property
    });

    if (dto.lowStockOnly) {
      return {
        lowStockItems: report.lowStockItems,
        outOfStock: report.outOfStock,
      };
    }

    return report;
  }

  async getEmployeeReport(dto: EmployeeReportDto): Promise<any> {
    const query: any = {
      clockIn: {
        $gte: new Date(dto.startDate),
        $lte: new Date(dto.endDate),
      },
    };

    if (dto.employeeId) {
      query.employeeId = dto.employeeId;
    }

    if (dto.locationId) {
      query.locationId = dto.locationId;
    }

    const timeEntries = await this.timeEntryModel
      .find(query)
      .populate('employeeId', 'fullName position')
      .populate('locationId', 'name')
      .exec();

    const report = {
      period: {
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
      summary: {
        totalEmployees: 0,
        totalHours: 0,
        totalRegularHours: 0,
        totalOvertimeHours: 0,
        totalGrossPay: 0,
      },
      byEmployee: {},
    };

    timeEntries.forEach(entry => {
      const employeeId = entry.employeeId.toString();

      if (!report.byEmployee[employeeId]) {
        report.byEmployee[employeeId] = {
          employeeName: entry.employeeName || 'Unknown',
          totalHours: 0,
          regularHours: 0,
          overtimeHours: 0,
          grossPay: 0,
          shifts: 0,
        };
      }

      report.byEmployee[employeeId].totalHours += entry.totalHours || 0;
      report.byEmployee[employeeId].regularHours += entry.regularHours || 0;
      report.byEmployee[employeeId].overtimeHours += entry.overtimeHours || 0;
      report.byEmployee[employeeId].grossPay += entry.grossPay || 0;
      report.byEmployee[employeeId].shifts++;

      report.summary.totalHours += entry.totalHours || 0;
      report.summary.totalRegularHours += entry.regularHours || 0;
      report.summary.totalOvertimeHours += entry.overtimeHours || 0;
      report.summary.totalGrossPay += entry.grossPay || 0;
    });

    report.summary.totalEmployees = Object.keys(report.byEmployee).length;

    return report;
  }

  async getFinancialReport(dto: FinancialReportDto): Promise<any> {
    const query: any = {
      createdAt: {
        $gte: new Date(dto.startDate),
        $lte: new Date(dto.endDate),
      },
    };

    if (dto.locationId) {
      query.locationId = dto.locationId;
    }

    const transactions = await this.transactionModel.find(query).exec();
    const invoices = await this.invoiceModel
      .find({
        invoiceDate: {
          $gte: new Date(dto.startDate),
          $lte: new Date(dto.endDate),
        },
      })
      .exec();

    const report = {
      period: {
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
      revenue: {
        retailSales: 0,
        fuelSales: 0,
        fleetInvoicing: 0,
        totalRevenue: 0,
      },
      expenses: {
        labor: 0,
        // Additional expense categories would come from other data sources
      },
      tax: {
        collected: 0,
        remitted: 0,
        outstanding: 0,
      },
      profitLoss: {
        grossProfit: 0,
        netProfit: 0,
        profitMargin: 0,
      },
    };

    // Calculate revenue from transactions
    transactions.forEach(txn => {
      // Note: All transactions counted as retail sales (Transaction schema doesn't have transactionType)
      report.revenue.retailSales += txn.total;
      report.tax.collected += txn.tax;
    });

    // Calculate revenue from fleet invoicing
    invoices.forEach(invoice => {
      report.revenue.fleetInvoicing += invoice.totalAmount;
    });

    report.revenue.totalRevenue =
      report.revenue.retailSales +
      report.revenue.fuelSales +
      report.revenue.fleetInvoicing;

    // Calculate labor expenses from time entries
    const laborQuery: any = {
      clockIn: {
        $gte: new Date(dto.startDate),
        $lte: new Date(dto.endDate),
      },
    };

    if (dto.locationId) {
      laborQuery.locationId = dto.locationId;
    }

    const timeEntries = await this.timeEntryModel.find(laborQuery).exec();
    report.expenses.labor = timeEntries.reduce((sum, entry) => sum + (entry.grossPay || 0), 0);

    // Calculate profit
    report.profitLoss.grossProfit = report.revenue.totalRevenue;
    report.profitLoss.netProfit = report.revenue.totalRevenue - report.expenses.labor;
    report.profitLoss.profitMargin =
      report.revenue.totalRevenue > 0
        ? (report.profitLoss.netProfit / report.revenue.totalRevenue) * 100
        : 0;

    return report;
  }

  async getFuelReport(locationId?: string): Promise<any> {
    const tankQuery: any = {};
    const pumpQuery: any = {};

    if (locationId) {
      tankQuery.locationId = locationId;
      pumpQuery.locationId = locationId;
    }

    const tanks = await this.fuelTankModel.find(tankQuery).exec();
    const pumps = await this.fuelPumpModel.find(pumpQuery).exec();

    const report = {
      tanks: {
        total: tanks.length,
        totalCapacity: 0,
        totalCurrentLevel: 0,
        utilizationPercent: 0,
        alerts: {
          lowLevel: 0,
          leakDetected: 0,
          waterDetected: 0,
        },
        byFuelType: {},
      },
      pumps: {
        total: pumps.length,
        available: 0,
        inUse: 0,
        outOfService: 0,
        todaySales: 0,
        todayTransactions: 0,
      },
    };

    tanks.forEach(tank => {
      report.tanks.totalCapacity += tank.capacity;
      report.tanks.totalCurrentLevel += tank.currentLevel;

      if (tank.currentLevel < tank.minLevel) report.tanks.alerts.lowLevel++;
      if (tank.leakDetected) report.tanks.alerts.leakDetected++;
      if (tank.waterDetected) report.tanks.alerts.waterDetected++;

      const fuelType = tank.fuelType;
      if (!report.tanks.byFuelType[fuelType]) {
        report.tanks.byFuelType[fuelType] = {
          count: 0,
          capacity: 0,
          currentLevel: 0,
        };
      }
      report.tanks.byFuelType[fuelType].count++;
      report.tanks.byFuelType[fuelType].capacity += tank.capacity;
      report.tanks.byFuelType[fuelType].currentLevel += tank.currentLevel;
    });

    report.tanks.utilizationPercent =
      report.tanks.totalCapacity > 0
        ? (report.tanks.totalCurrentLevel / report.tanks.totalCapacity) * 100
        : 0;

    pumps.forEach(pump => {
      if (pump.status === 'available') report.pumps.available++;
      else if (pump.status === 'in_use') report.pumps.inUse++;
      else if (pump.status === 'out_of_service') report.pumps.outOfService++;

      report.pumps.todaySales += pump.todaySales || 0;
      report.pumps.todayTransactions += pump.todayTransactions || 0;
    });

    return report;
  }

  async getDashboardMetrics(locationId?: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query: any = {
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    };

    if (locationId) {
      query.locationId = locationId;
    }

    const todayTransactions = await this.transactionModel.find(query).exec();

    const metrics = {
      today: {
        sales: 0,
        transactions: todayTransactions.length,
        averageTransaction: 0,
        customersServed: new Set(),
      },
      alerts: {
        lowInventory: 0,
        lowFuelTanks: 0,
        overdueInvoices: 0,
        pendingApprovals: 0,
      },
      quickStats: {
        activeEmployees: 0,
        activePumps: 0,
      },
    };

    todayTransactions.forEach(txn => {
      metrics.today.sales += txn.total;
      if (txn.customerId) {
        metrics.today.customersServed.add(txn.customerId.toString());
      }
    });

    metrics.today.averageTransaction =
      todayTransactions.length > 0
        ? metrics.today.sales / todayTransactions.length
        : 0;

    // Get inventory alerts
    const lowStockProducts = await this.productModel
      .find({
        $expr: { $lt: ['$quantity', '$minStock'] },
      })
      .countDocuments();
    metrics.alerts.lowInventory = lowStockProducts;

    // Get fuel tank alerts
    const lowFuelTanks = await this.fuelTankModel
      .find({
        $expr: { $lt: ['$currentLevel', '$minLevel'] },
      })
      .countDocuments();
    metrics.alerts.lowFuelTanks = lowFuelTanks;

    // Get overdue invoices
    const overdueInvoices = await this.invoiceModel
      .find({
        dueDate: { $lt: new Date() },
        status: { $in: ['sent', 'viewed', 'partial_payment'] },
      })
      .countDocuments();
    metrics.alerts.overdueInvoices = overdueInvoices;

    // Get active employees (clocked in)
    const activeEmployees = await this.timeEntryModel
      .find({ status: 'active' })
      .countDocuments();
    metrics.quickStats.activeEmployees = activeEmployees;

    // Get active pumps
    const activePumps = await this.fuelPumpModel
      .find({ status: { $in: ['available', 'authorized', 'in_use'] } })
      .countDocuments();
    metrics.quickStats.activePumps = activePumps;

    return {
      ...metrics,
      today: {
        ...metrics.today,
        customersServed: metrics.today.customersServed.size,
      },
    };
  }
}

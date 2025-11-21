import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaxJurisdiction, TaxType } from '../schemas/tax-jurisdiction.schema';
import { CreateJurisdictionDto } from './dto/create-jurisdiction.dto';
import { UpdateJurisdictionDto } from './dto/update-jurisdiction.dto';
import { CalculateTaxDto, TaxableItemDto } from './dto/calculate-tax.dto';

@Injectable()
export class TaxService {
  constructor(
    @InjectModel(TaxJurisdiction.name) private jurisdictionModel: Model<TaxJurisdiction>,
  ) {}

  async create(createDto: CreateJurisdictionDto, userId: string): Promise<TaxJurisdiction> {
    const jurisdiction = new this.jurisdictionModel({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return jurisdiction.save();
  }

  async findAll(filters?: any): Promise<TaxJurisdiction[]> {
    const query: any = {};
    if (filters?.state) query.state = filters.state;
    if (filters?.type) query.type = filters.type;
    if (filters?.active !== undefined) query.active = filters.active;

    return this.jurisdictionModel
      .find(query)
      .sort({ state: 1, type: 1, name: 1 })
      .exec();
  }

  async findById(id: string): Promise<TaxJurisdiction> {
    const jurisdiction = await this.jurisdictionModel.findById(id).exec();

    if (!jurisdiction) {
      throw new NotFoundException(`Tax jurisdiction with ID ${id} not found`);
    }

    return jurisdiction;
  }

  async findByCode(jurisdictionCode: string): Promise<TaxJurisdiction> {
    const jurisdiction = await this.jurisdictionModel
      .findOne({ jurisdictionCode })
      .exec();

    if (!jurisdiction) {
      throw new NotFoundException(`Tax jurisdiction ${jurisdictionCode} not found`);
    }

    return jurisdiction;
  }

  async findByZipCode(zipCode: string): Promise<TaxJurisdiction[]> {
    return this.jurisdictionModel
      .find({ zipCodes: zipCode, active: true })
      .sort({ type: 1 }) // Federal, state, county, city order
      .exec();
  }

  async findByLocation(state: string, county?: string, city?: string): Promise<TaxJurisdiction[]> {
    const query: any = { state, active: true };
    if (county) query.county = county;
    if (city) query.city = city;

    return this.jurisdictionModel
      .find(query)
      .sort({ type: 1 })
      .exec();
  }

  async update(id: string, updateDto: UpdateJurisdictionDto, userId: string): Promise<TaxJurisdiction> {
    const jurisdiction = await this.jurisdictionModel.findById(id);
    if (!jurisdiction) throw new NotFoundException();

    Object.assign(jurisdiction, updateDto);
    jurisdiction.updatedBy = userId as any;

    return jurisdiction.save();
  }

  async addTaxRate(id: string, taxRateDto: any, userId: string): Promise<TaxJurisdiction> {
    const jurisdiction = await this.jurisdictionModel.findById(id);
    if (!jurisdiction) throw new NotFoundException();

    jurisdiction.taxRates.push(taxRateDto);
    jurisdiction.updatedBy = userId as any;

    // Recalculate composite rate
    this.recalculateCompositeRate(jurisdiction);

    return jurisdiction.save();
  }

  async removeTaxRate(id: string, taxRateIndex: number, userId: string): Promise<TaxJurisdiction> {
    const jurisdiction = await this.jurisdictionModel.findById(id);
    if (!jurisdiction) throw new NotFoundException();

    if (taxRateIndex < 0 || taxRateIndex >= jurisdiction.taxRates.length) {
      throw new NotFoundException('Tax rate not found');
    }

    jurisdiction.taxRates.splice(taxRateIndex, 1);
    jurisdiction.updatedBy = userId as any;

    // Recalculate composite rate
    this.recalculateCompositeRate(jurisdiction);

    return jurisdiction.save();
  }

  async calculateTax(calculateDto: CalculateTaxDto): Promise<any> {
    // Find applicable jurisdictions
    const jurisdictions = await this.findByZipCode(calculateDto.zipCode);

    if (jurisdictions.length === 0) {
      // Fallback to state if zip code not found
      if (calculateDto.state) {
        const stateJurisdictions = await this.findByLocation(calculateDto.state);
        jurisdictions.push(...stateJurisdictions);
      }
    }

    const taxBreakdown = {
      subtotal: 0,
      taxDetails: [],
      totalTax: 0,
      grandTotal: 0,
    };

    // Calculate subtotal
    calculateDto.items.forEach(item => {
      if (!item.taxExempt) {
        taxBreakdown.subtotal += item.amount;
      }
    });

    // Calculate tax for each item category
    const categoryTotals = this.groupItemsByCategory(calculateDto.items);

    jurisdictions.forEach(jurisdiction => {
      jurisdiction.taxRates.forEach(taxRate => {
        // Check if tax rate is currently effective
        if (!this.isTaxRateEffective(taxRate, calculateDto.transactionDate)) {
          return;
        }

        let applicableAmount = 0;

        switch (taxRate.taxType) {
          case TaxType.SALES_TAX:
            applicableAmount = categoryTotals.general || 0;
            break;
          case TaxType.FUEL_TAX:
            applicableAmount = categoryTotals.fuel || 0;
            break;
          case TaxType.TOBACCO_TAX:
            applicableAmount = categoryTotals.tobacco || 0;
            break;
          case TaxType.ALCOHOL_TAX:
            applicableAmount = categoryTotals.alcohol || 0;
            break;
          case TaxType.PREPARED_FOOD_TAX:
            applicableAmount = categoryTotals.prepared_food || 0;
            break;
        }

        if (applicableAmount > 0) {
          const taxAmount = Number((applicableAmount * taxRate.rate).toFixed(2));

          taxBreakdown.taxDetails.push({
            jurisdiction: jurisdiction.name,
            jurisdictionType: jurisdiction.type,
            taxType: taxRate.taxType,
            rate: taxRate.rate,
            applicableAmount,
            taxAmount,
          });

          taxBreakdown.totalTax += taxAmount;
        }
      });

      // Handle special cases
      if (jurisdiction.hasPreparedFoodTax && categoryTotals.prepared_food) {
        const taxAmount = Number((categoryTotals.prepared_food * jurisdiction.preparedFoodTaxRate).toFixed(2));
        taxBreakdown.taxDetails.push({
          jurisdiction: jurisdiction.name,
          jurisdictionType: jurisdiction.type,
          taxType: 'prepared_food_special',
          rate: jurisdiction.preparedFoodTaxRate,
          applicableAmount: categoryTotals.prepared_food,
          taxAmount,
        });
        taxBreakdown.totalTax += taxAmount;
      }
    });

    taxBreakdown.totalTax = Number(taxBreakdown.totalTax.toFixed(2));
    taxBreakdown.grandTotal = Number((taxBreakdown.subtotal + taxBreakdown.totalTax).toFixed(2));

    return taxBreakdown;
  }

  async getFilingReport(jurisdictionId: string, startDate: Date, endDate: Date): Promise<any> {
    const jurisdiction = await this.findById(jurisdictionId);

    // This would integrate with transactions to get actual sales data
    // For now, returning a placeholder structure
    return {
      jurisdiction: {
        code: jurisdiction.jurisdictionCode,
        name: jurisdiction.name,
        type: jurisdiction.type,
      },
      period: {
        startDate,
        endDate,
      },
      filingInfo: {
        frequency: jurisdiction.filingFrequency,
        dueDay: jurisdiction.filingDueDay,
        authority: jurisdiction.taxAuthorityName,
        accountNumber: jurisdiction.accountNumber,
      },
      summary: {
        grossSales: 0,
        taxableAmount: 0,
        taxCollected: 0,
        exemptSales: 0,
      },
      breakdown: [],
    };
  }

  async activate(id: string, userId: string): Promise<TaxJurisdiction> {
    const jurisdiction = await this.jurisdictionModel.findById(id);
    if (!jurisdiction) throw new NotFoundException();

    jurisdiction.active = true;
    jurisdiction.updatedBy = userId as any;

    return jurisdiction.save();
  }

  async deactivate(id: string, userId: string): Promise<TaxJurisdiction> {
    const jurisdiction = await this.jurisdictionModel.findById(id);
    if (!jurisdiction) throw new NotFoundException();

    jurisdiction.active = false;
    jurisdiction.updatedBy = userId as any;

    return jurisdiction.save();
  }

  async delete(id: string): Promise<void> {
    const result = await this.jurisdictionModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Tax jurisdiction with ID ${id} not found`);
    }
  }

  private recalculateCompositeRate(jurisdiction: TaxJurisdiction): void {
    const salesTaxRates = jurisdiction.taxRates.filter(
      rate => rate.taxType === TaxType.SALES_TAX && this.isTaxRateEffective(rate)
    );

    jurisdiction.compositeSalesTaxRate = salesTaxRates.reduce((sum, rate) => sum + rate.rate, 0);
  }

  private isTaxRateEffective(taxRate: any, transactionDate?: string): boolean {
    const now = transactionDate ? new Date(transactionDate) : new Date();

    if (taxRate.effectiveDate && new Date(taxRate.effectiveDate) > now) {
      return false;
    }

    if (taxRate.expiryDate && new Date(taxRate.expiryDate) < now) {
      return false;
    }

    return true;
  }

  private groupItemsByCategory(items: TaxableItemDto[]): Record<string, number> {
    const totals: Record<string, number> = {};

    items.forEach(item => {
      if (!item.taxExempt) {
        totals[item.category] = (totals[item.category] || 0) + item.amount;
      }
    });

    return totals;
  }
}

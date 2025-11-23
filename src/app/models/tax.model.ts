export enum TaxType {
  SALES_TAX = 'sales_tax',
  FUEL_TAX = 'fuel_tax',
  EXCISE_TAX = 'excise_tax',
  VAT = 'vat',
}

export interface TaxRate {
  _id: string;
  name: string;
  type: TaxType;
  rate: number;
  locationId?: string;
  locationName?: string;
  isDefault: boolean;
  active: boolean;
  effectiveDate: Date;
  expirationDate?: Date;
  description?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaxRateDto {
  name: string;
  type: TaxType;
  rate: number;
  locationId?: string;
  isDefault?: boolean;
  effectiveDate: Date;
  expirationDate?: Date;
  description?: string;
}

export interface UpdateTaxRateDto {
  name?: string;
  rate?: number;
  locationId?: string;
  isDefault?: boolean;
  effectiveDate?: Date;
  expirationDate?: Date;
  description?: string;
}

export interface TaxStatistics {
  totalRates: number;
  activeRates: number;
  defaultRates: number;
  averageRate: number;
}

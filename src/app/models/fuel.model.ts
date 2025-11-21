export type FuelType = 'regular' | 'premium' | 'diesel';

export interface FuelProduct {
  id: string;
  name: string;
  type: FuelType;
  pricePerGallon: number;
  currentStock: number;
  tankCapacity: number;
  minLevel: number;
  lastDelivery?: Date;
  lastDeliveryAmount?: number;
}

export interface FuelDelivery {
  id: string;
  fuelProductId: string;
  amount: number;
  costPerGallon: number;
  totalCost: number;
  deliveryDate: Date;
  invoiceNumber: string;
  supplier: string;
}

export interface TankReading {
  id: string;
  fuelProductId: string;
  reading: number;
  readingDate: Date;
  recordedBy: string;
  notes?: string;
}

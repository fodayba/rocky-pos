export interface FuelProduct {
  _id: string;
  id?: string; // Backwards compatibility
  locationId?: string;
  name: string;
  type: 'regular' | 'midgrade' | 'premium' | 'diesel' | 'e85' | 'kerosene' | 'def';
  pricePerGallon: number;
  cashPricePerGallon?: number;
  cost?: number;
  currentStock: number;
  tankCapacity: number;
  minLevel: number;
  reorderLevel?: number;
  tankNumber: string;
  tankId?: string;
  lastDelivery?: Date;
  lastDeliveryAmount?: number;
  nextScheduledDelivery?: Date;
  supplier?: string;
  todayGallonsSold?: number;
  weekGallonsSold?: number;
  monthGallonsSold?: number;
  lastSalesUpdate?: Date;
  active: boolean;
  outOfStock?: boolean;
  outOfStockSince?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

import { Injectable, signal } from '@angular/core';
import { FuelProduct, FuelDelivery, TankReading } from '../models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class FuelService {
  private readonly FUEL_PRODUCTS_KEY = 'fuel_products';
  private readonly FUEL_DELIVERIES_KEY = 'fuel_deliveries';
  private readonly TANK_READINGS_KEY = 'tank_readings';

  private fuelProductsSignal = signal<FuelProduct[]>([]);
  private deliveriesSignal = signal<FuelDelivery[]>([]);
  private readingsSignal = signal<TankReading[]>([]);

  public readonly fuelProducts = this.fuelProductsSignal.asReadonly();
  public readonly deliveries = this.deliveriesSignal.asReadonly();
  public readonly readings = this.readingsSignal.asReadonly();

  constructor(private storage: StorageService) {
    this.loadFuelProducts();
    this.loadDeliveries();
    this.loadReadings();
  }

  private loadFuelProducts(): void {
    const stored = this.storage.getItem<FuelProduct[]>(this.FUEL_PRODUCTS_KEY);
    if (stored) {
      this.fuelProductsSignal.set(stored);
    } else {
      const mockFuel = this.getMockFuelProducts();
      this.fuelProductsSignal.set(mockFuel);
      this.storage.setItem(this.FUEL_PRODUCTS_KEY, mockFuel);
    }
  }

  private loadDeliveries(): void {
    const stored = this.storage.getItem<FuelDelivery[]>(this.FUEL_DELIVERIES_KEY);
    if (stored) {
      this.deliveriesSignal.set(stored);
    } else {
      this.deliveriesSignal.set([]);
    }
  }

  private loadReadings(): void {
    const stored = this.storage.getItem<TankReading[]>(this.TANK_READINGS_KEY);
    if (stored) {
      this.readingsSignal.set(stored);
    } else {
      this.readingsSignal.set([]);
    }
  }

  updateFuelPrice(id: string, newPrice: number): boolean {
    const products = this.fuelProductsSignal();
    const index = products.findIndex(f => f.id === id);

    if (index === -1) return false;

    const updated = [...products];
    updated[index] = { ...updated[index], pricePerGallon: newPrice };
    this.fuelProductsSignal.set(updated);
    this.storage.setItem(this.FUEL_PRODUCTS_KEY, updated);

    return true;
  }

  recordSale(fuelId: string, gallons: number): boolean {
    const products = this.fuelProductsSignal();
    const index = products.findIndex(f => f.id === fuelId);

    if (index === -1) return false;

    const product = products[index];
    if (product.currentStock < gallons) return false;

    const updated = [...products];
    updated[index] = {
      ...product,
      currentStock: product.currentStock - gallons
    };

    this.fuelProductsSignal.set(updated);
    this.storage.setItem(this.FUEL_PRODUCTS_KEY, updated);

    return true;
  }

  recordDelivery(delivery: Omit<FuelDelivery, 'id'>): FuelDelivery {
    const newDelivery: FuelDelivery = {
      ...delivery,
      id: this.generateId('delivery')
    };

    // Update fuel stock
    const products = this.fuelProductsSignal();
    const index = products.findIndex(f => f.id === delivery.fuelProductId);

    if (index !== -1) {
      const updated = [...products];
      updated[index] = {
        ...updated[index],
        currentStock: updated[index].currentStock + delivery.amount,
        lastDelivery: delivery.deliveryDate,
        lastDeliveryAmount: delivery.amount
      };
      this.fuelProductsSignal.set(updated);
      this.storage.setItem(this.FUEL_PRODUCTS_KEY, updated);
    }

    const deliveries = [...this.deliveriesSignal(), newDelivery];
    this.deliveriesSignal.set(deliveries);
    this.storage.setItem(this.FUEL_DELIVERIES_KEY, deliveries);

    return newDelivery;
  }

  recordTankReading(reading: Omit<TankReading, 'id'>): TankReading {
    const newReading: TankReading = {
      ...reading,
      id: this.generateId('reading')
    };

    const readings = [...this.readingsSignal(), newReading];
    this.readingsSignal.set(readings);
    this.storage.setItem(this.TANK_READINGS_KEY, readings);

    // Update current stock based on reading
    const products = this.fuelProductsSignal();
    const index = products.findIndex(f => f.id === reading.fuelProductId);

    if (index !== -1) {
      const updated = [...products];
      updated[index] = {
        ...updated[index],
        currentStock: reading.reading
      };
      this.fuelProductsSignal.set(updated);
      this.storage.setItem(this.FUEL_PRODUCTS_KEY, updated);
    }

    return newReading;
  }

  getLowFuelProducts(): FuelProduct[] {
    return this.fuelProductsSignal().filter(f => f.currentStock <= f.minLevel);
  }

  getFuelProductById(id: string): FuelProduct | undefined {
    return this.fuelProductsSignal().find(f => f.id === id);
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private getMockFuelProducts(): FuelProduct[] {
    return [
      {
        id: 'fuel_1',
        name: 'Regular Unleaded',
        type: 'regular',
        pricePerGallon: 3.49,
        currentStock: 5000,
        tankCapacity: 10000,
        minLevel: 2000
      },
      {
        id: 'fuel_2',
        name: 'Premium Unleaded',
        type: 'premium',
        pricePerGallon: 3.89,
        currentStock: 3500,
        tankCapacity: 8000,
        minLevel: 1500
      },
      {
        id: 'fuel_3',
        name: 'Diesel',
        type: 'diesel',
        pricePerGallon: 3.99,
        currentStock: 4000,
        tankCapacity: 8000,
        minLevel: 1500
      }
    ];
  }
}

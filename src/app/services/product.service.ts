import { Injectable, signal } from '@angular/core';
import { Product, ProductCategory } from '../models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly PRODUCTS_KEY = 'products';
  private readonly CATEGORIES_KEY = 'categories';

  private productsSignal = signal<Product[]>([]);
  private categoriesSignal = signal<ProductCategory[]>([]);

  public readonly products = this.productsSignal.asReadonly();
  public readonly categories = this.categoriesSignal.asReadonly();

  constructor(private storage: StorageService) {
    this.loadProducts();
    this.loadCategories();
  }

  private loadProducts(): void {
    const stored = this.storage.getItem<Product[]>(this.PRODUCTS_KEY);
    if (stored) {
      this.productsSignal.set(stored);
    } else {
      // Initialize with mock data
      const mockProducts = this.getMockProducts();
      this.productsSignal.set(mockProducts);
      this.storage.setItem(this.PRODUCTS_KEY, mockProducts);
    }
  }

  private loadCategories(): void {
    const stored = this.storage.getItem<ProductCategory[]>(this.CATEGORIES_KEY);
    if (stored) {
      this.categoriesSignal.set(stored);
    } else {
      const mockCategories = this.getMockCategories();
      this.categoriesSignal.set(mockCategories);
      this.storage.setItem(this.CATEGORIES_KEY, mockCategories);
    }
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const current = this.productsSignal();
    this.productsSignal.set([...current, newProduct]);
    this.storage.setItem(this.PRODUCTS_KEY, this.productsSignal());

    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.productsSignal();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) return null;

    const updated = {
      ...products[index],
      ...updates,
      updatedAt: new Date()
    };

    const newProducts = [...products];
    newProducts[index] = updated;
    this.productsSignal.set(newProducts);
    this.storage.setItem(this.PRODUCTS_KEY, newProducts);

    return updated;
  }

  deleteProduct(id: string): boolean {
    const products = this.productsSignal();
    const filtered = products.filter(p => p.id !== id);

    if (filtered.length === products.length) return false;

    this.productsSignal.set(filtered);
    this.storage.setItem(this.PRODUCTS_KEY, filtered);
    return true;
  }

  getProductById(id: string): Product | undefined {
    return this.productsSignal().find(p => p.id === id);
  }

  getProductByBarcode(barcode: string): Product | undefined {
    return this.productsSignal().find(p => p.barcode === barcode);
  }

  getProductsByCategory(category: string): Product[] {
    return this.productsSignal().filter(p => p.category === category);
  }

  getLowStockProducts(): Product[] {
    return this.productsSignal().filter(p => p.stockQuantity <= p.minStockLevel);
  }

  updateStock(id: string, quantity: number): boolean {
    const product = this.getProductById(id);
    if (!product) return false;

    const newQuantity = product.stockQuantity + quantity;
    if (newQuantity < 0) return false;

    this.updateProduct(id, { stockQuantity: newQuantity });
    return true;
  }

  private generateId(): string {
    return 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2);
  }

  private getMockProducts(): Product[] {
    return [
      {
        id: 'prod_1',
        barcode: '1234567890123',
        name: 'Coca Cola 20oz',
        description: '20oz Coca Cola bottle',
        category: 'Beverages',
        price: 2.49,
        cost: 1.20,
        stockQuantity: 100,
        minStockLevel: 20,
        unit: 'bottle',
        supplier: 'Coca Cola Distributor',
        taxable: true,
        taxRate: 0.08,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod_2',
        barcode: '2345678901234',
        name: 'Lay\'s Chips',
        description: 'Classic Lay\'s Potato Chips',
        category: 'Snacks',
        price: 3.99,
        cost: 2.00,
        stockQuantity: 75,
        minStockLevel: 15,
        unit: 'bag',
        supplier: 'Frito Lay',
        taxable: true,
        taxRate: 0.08,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod_3',
        barcode: '3456789012345',
        name: 'Marlboro Red',
        description: 'Marlboro Red Cigarettes',
        category: 'Tobacco',
        price: 8.99,
        cost: 6.50,
        stockQuantity: 200,
        minStockLevel: 50,
        unit: 'pack',
        supplier: 'Tobacco Wholesaler',
        taxable: true,
        taxRate: 0.08,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod_4',
        barcode: '4567890123456',
        name: 'Motor Oil 5W-30',
        description: 'Synthetic Motor Oil 1 Quart',
        category: 'Automotive',
        price: 6.99,
        cost: 4.00,
        stockQuantity: 50,
        minStockLevel: 10,
        unit: 'quart',
        supplier: 'Auto Parts Supplier',
        taxable: true,
        taxRate: 0.08,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod_5',
        barcode: '5678901234567',
        name: 'Red Bull Energy Drink',
        description: 'Red Bull 8.4oz Can',
        category: 'Beverages',
        price: 3.49,
        cost: 1.75,
        stockQuantity: 60,
        minStockLevel: 15,
        unit: 'can',
        supplier: 'Red Bull Distributor',
        taxable: true,
        taxRate: 0.08,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private getMockCategories(): ProductCategory[] {
    return [
      { id: 'cat_1', name: 'Beverages', description: 'Drinks and beverages' },
      { id: 'cat_2', name: 'Snacks', description: 'Chips, candy, and snacks' },
      { id: 'cat_3', name: 'Tobacco', description: 'Cigarettes and tobacco products' },
      { id: 'cat_4', name: 'Automotive', description: 'Car care products' },
      { id: 'cat_5', name: 'Food', description: 'Packaged food items' },
      { id: 'cat_6', name: 'Personal Care', description: 'Health and beauty products' }
    ];
  }
}

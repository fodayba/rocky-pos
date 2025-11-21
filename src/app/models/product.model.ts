export interface Product {
  id: string;
  barcode: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  supplier: string;
  taxable: boolean;
  taxRate: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

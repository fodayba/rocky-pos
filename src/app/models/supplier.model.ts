export enum SupplierType {
  FUEL = 'fuel',
  MERCHANDISE = 'merchandise',
  BOTH = 'both',
  SERVICE = 'service',
}

export enum PaymentTerms {
  NET_30 = 'net_30',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
  COD = 'cod',
  PREPAID = 'prepaid',
}

export interface Supplier {
  _id: string;
  supplierCode: string;
  name: string;
  type: SupplierType;

  // Contact information
  contactPerson: string;
  email: string;
  phone: string;
  fax?: string;
  website?: string;

  // Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Business information
  taxId?: string;
  paymentTerms: PaymentTerms;
  creditLimit: number;
  currentBalance: number;

  // Delivery information
  deliverySchedule?: string;
  minimumOrderAmount?: number;
  leadTimeDays: number;

  // Performance metrics
  totalPurchases: number;
  lastOrderDate?: Date;
  lastDeliveryDate?: Date;
  onTimeDeliveryRate: number;
  qualityRating: number;

  // Status
  active: boolean;
  preferred: boolean;
  notes?: string;
  productCategories: string[];

  // Audit
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupplierDto {
  supplierCode: string;
  name: string;
  type: SupplierType;
  contactPerson: string;
  email: string;
  phone: string;
  fax?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  taxId?: string;
  paymentTerms?: PaymentTerms;
  creditLimit?: number;
  deliverySchedule?: string;
  minimumOrderAmount?: number;
  leadTimeDays?: number;
  preferred?: boolean;
  notes?: string;
  productCategories?: string[];
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {}

export interface SupplierStatistics {
  total: number;
  active: number;
  preferred: number;
  byType: {
    fuel: number;
    merchandise: number;
    both: number;
    service: number;
  };
  totalPurchases: number;
  averageRating: number;
}

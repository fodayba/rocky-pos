import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { FuelService } from '../../services/fuel.service';
import { TransactionService } from '../../services/transaction.service';
import { ShiftService } from '../../services/shift.service';
import { AuthService } from '../../services/auth.service';
import { CustomerService } from '../../services/customer.service';
import { ToastService } from '../../services/toast.service';
import { Product, FuelProduct, TransactionItem, PaymentMethod } from '../../models';
import { IconComponent } from '../shared/icon/icon.component';

interface CartItem extends TransactionItem {
  product?: Product;
  fuelProduct?: FuelProduct;
}

@Component({
  selector: 'app-pos',
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.css'
})
export class PosComponent {
  private productService = inject(ProductService);
  private fuelService = inject(FuelService);
  private transactionService = inject(TransactionService);
  private shiftService = inject(ShiftService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private customerService = inject(CustomerService);
  private router = inject(Router);

  // Make global functions available to template
  parseFloat = parseFloat;

  // Signals
  cart = signal<CartItem[]>([]);
  barcodeInput = signal('');
  fuelGallonsInput = signal('');
  selectedFuel = signal<string>('');
  paymentMethod = signal<PaymentMethod>('cash');
  cashReceived = signal<number>(0);
  searchQuery = signal('');
  showPaymentModal = signal(false);
  processingPayment = signal(false);

  // Services data
  products = this.productService.products;
  fuelProducts = this.fuelService.fuelProducts;
  currentShift = this.shiftService.currentShift;
  hasActiveShift = this.shiftService.hasActiveShift;
  currentUser = this.authService.currentUser;

  // Computed values
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.products().slice(0, 20);
    return this.products().filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.barcode.includes(query)
    );
  });

  subtotal = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.subtotal, 0);
  });

  tax = computed(() => {
    return this.cart().reduce((sum, item) => {
      if (item.product?.taxable) {
        return sum + (item.subtotal * (item.product.taxRate || 0));
      }
      return sum;
    }, 0);
  });

  total = computed(() => {
    return this.subtotal() + this.tax();
  });

  changeAmount = computed(() => {
    if (this.paymentMethod() === 'cash') {
      return Math.max(0, this.cashReceived() - this.total());
    }
    return 0;
  });

  canProcessPayment = computed(() => {
    if (this.cart().length === 0) return false;
    if (this.paymentMethod() === 'cash') {
      return this.cashReceived() >= this.total();
    }
    return true;
  });

  onBarcodeSubmit(): void {
    const barcode = this.barcodeInput().trim();
    if (!barcode) return;

    const product = this.productService.getProductByBarcode(barcode);
    if (product) {
      this.addProductToCart(product);
      this.barcodeInput.set('');
    } else {
      this.toastService.error('Product not found');
    }
  }

  addProductToCart(product: Product, quantity: number = 1): void {
    const existingItem = this.cart().find(item => item.productId === product.id);

    if (existingItem) {
      this.updateCartItemQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      const item: CartItem = {
        id: this.generateId(),
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        subtotal: product.price * quantity,
        isFuel: false,
        product
      };
      this.cart.set([...this.cart(), item]);
    }
  }

  addFuelToCart(): void {
    const fuelId = this.selectedFuel();
    const gallons = parseFloat(this.fuelGallonsInput());

    if (!fuelId || !gallons || gallons <= 0) {
      this.toastService.warning('Please select fuel type and enter gallons');
      return;
    }

    const fuelProduct = this.fuelService.getFuelProductById(fuelId);
    if (!fuelProduct) return;

    if (gallons > fuelProduct.currentStock) {
      this.toastService.error('Insufficient fuel in tank');
      return;
    }

    const item: CartItem = {
      id: this.generateId(),
      productId: fuelId,
      productName: fuelProduct.name,
      quantity: 1,
      unitPrice: fuelProduct.pricePerGallon,
      subtotal: fuelProduct.pricePerGallon * gallons,
      isFuel: true,
      fuelGallons: gallons,
      fuelProduct
    };

    this.cart.set([...this.cart(), item]);
    this.selectedFuel.set('');
    this.fuelGallonsInput.set('');
  }

  updateCartItemQuantity(itemId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    const items = this.cart().map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          subtotal: item.unitPrice * newQuantity
        };
      }
      return item;
    });
    this.cart.set(items);
  }

  removeFromCart(itemId: string): void {
    this.cart.set(this.cart().filter(item => item.id !== itemId));
  }

  clearCart(): void {
    if (this.cart().length > 0 && confirm('Clear all items from cart?')) {
      this.cart.set([]);
    }
  }

  openPaymentModal(): void {
    if (!this.hasActiveShift()) {
      this.toastService.warning('Please start a shift before processing transactions');
      this.router.navigate(['/shifts']);
      return;
    }

    if (this.cart().length === 0) {
      this.toastService.warning('Cart is empty');
      return;
    }

    this.showPaymentModal.set(true);
    if (this.paymentMethod() === 'cash') {
      this.cashReceived.set(this.total());
    }
  }

  closePaymentModal(): void {
    this.showPaymentModal.set(false);
    this.cashReceived.set(0);
  }

  async processPayment(): Promise<void> {
    if (!this.canProcessPayment()) return;

    this.processingPayment.set(true);

    try {
      const shift = this.currentShift();
      const user = this.currentUser();

      if (!shift || !user) {
        throw new Error('No active shift or user');
      }

      const subtotal = this.subtotal();
      const tax = this.tax();
      const total = this.total();

      this.transactionService.createTransaction({
        type: 'sale',
        items: this.cart(),
        subtotal,
        tax,
        total,
        paymentMethod: this.paymentMethod(),
        cashReceived: this.paymentMethod() === 'cash' ? this.cashReceived() : undefined,
        changeGiven: this.paymentMethod() === 'cash' ? this.changeAmount() : undefined,
        cashierId: user.id,
        shiftId: shift.id
      }).subscribe({
        next: (transaction) => {
          const message = this.paymentMethod() === 'cash'
            ? `Transaction completed! Total: $${transaction.total.toFixed(2)} - Change: $${this.changeAmount().toFixed(2)}`
            : `Transaction completed! Total: $${transaction.total.toFixed(2)}`;
          this.toastService.success(message);

          this.cart.set([]);
          this.closePaymentModal();
        },
        error: (error) => {
          this.toastService.error(error.message || 'Failed to process transaction');
        }
      });
    } catch (error) {
      this.toastService.error('Error processing payment: ' + (error as Error).message);
    } finally {
      this.processingPayment.set(false);
    }
  }

  setQuickCash(amount: number): void {
    this.cashReceived.set(amount);
  }

  private generateId(): string {
    return 'cart_' + Date.now() + '_' + Math.random().toString(36).substring(2);
  }
}

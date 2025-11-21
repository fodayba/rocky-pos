import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon/icon.component';
import { ModalComponent } from '../shared/modal/modal.component';
import { FuelService, FuelProduct } from '../../services/fuel.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-fuel',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold" style="color: var(--color-stone-900);">
            Fuel Management
          </h1>
          <p class="text-sm mt-1" style="color: var(--color-stone-500);">
            Monitor tank levels, pricing, and deliveries
          </p>
        </div>
        <button class="btn btn-primary" (click)="openDeliveryModal(null)">
          <app-icon name="plus" [size]="20" />
          Record Delivery
        </button>
      </div>

      <!-- Alert for Low Levels -->
      @if (lowLevelProducts().length > 0) {
        <div class="card" style="background: var(--color-red-50); border-color: var(--color-red-200);">
          <div class="card-body">
            <div class="flex items-start gap-3">
              <app-icon name="alert" [size]="24" customClass="text-red-600" />
              <div>
                <h3 class="font-semibold" style="color: var(--color-red-900);">
                  Low Fuel Levels Detected
                </h3>
                <p class="text-sm mt-1" style="color: var(--color-red-700);">
                  {{ lowLevelProducts().length }} tank(s) need attention
                </p>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Fuel Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (product of fuelService.fuelProducts(); track product._id) {
          <div class="card">
            <div class="card-body space-y-4">
              <!-- Header -->
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-semibold" style="color: var(--color-stone-900);">
                    {{ product.name }}
                  </h3>
                  <p class="text-sm" style="color: var(--color-stone-500);">
                    Tank #{{ product.tankNumber }}
                  </p>
                </div>
                @if (isLowLevel(product)) {
                  <span class="badge bg-red-100 text-red-800">Low</span>
                } @else {
                  <span class="badge bg-green-100 text-green-800">OK</span>
                }
              </div>

              <!-- Tank Level Gauge -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm" style="color: var(--color-stone-600);">
                    Current Level
                  </span>
                  <span class="text-sm font-semibold" style="color: var(--color-stone-900);">
                    {{ product.currentStock?.toLocaleString() || 0 }} / {{ product.tankCapacity?.toLocaleString() }} gal
                  </span>
                </div>
                <div class="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
                  <div
                    class="h-3 rounded-full transition-all"
                    [style.width.%]="getTankPercentage(product)"
                    [class.bg-red-500]="getTankPercentage(product) < 20"
                    [class.bg-yellow-500]="getTankPercentage(product) >= 20 && getTankPercentage(product) < 40"
                    [class.bg-green-500]="getTankPercentage(product) >= 40"
                  ></div>
                </div>
                <p class="text-xs mt-1" style="color: var(--color-stone-500);">
                  {{ getTankPercentage(product) }}% capacity
                </p>
              </div>

              <!-- Pricing -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <p class="text-xs" style="color: var(--color-stone-500);">Regular Price</p>
                  <p class="text-xl font-semibold mt-1" style="color: var(--color-stone-900);">
                    {{ product.pricePerGallon?.toFixed(3) || '0.000' }}
                  </p>
                </div>
                @if (product.cashPricePerGallon) {
                  <div>
                    <p class="text-xs" style="color: var(--color-stone-500);">Cash Price</p>
                    <p class="text-xl font-semibold mt-1" style="color: var(--color-green-600);">
                      {{ product.cashPricePerGallon?.toFixed(3) }}
                    </p>
                  </div>
                }
              </div>

              <!-- Sales Stats -->
              <div class="pt-3 border-t" style="border-color: var(--color-stone-200);">
                <div class="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p class="text-xs" style="color: var(--color-stone-500);">Today</p>
                    <p class="text-sm font-semibold" style="color: var(--color-stone-900);">
                      {{ product.todayGallonsSold || 0 }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs" style="color: var(--color-stone-500);">Week</p>
                    <p class="text-sm font-semibold" style="color: var(--color-stone-900);">
                      {{ product.weekGallonsSold || 0 }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs" style="color: var(--color-stone-500);">Month</p>
                    <p class="text-sm font-semibold" style="color: var(--color-stone-900);">
                      {{ product.monthGallonsSold || 0 }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2">
                <button
                  class="btn btn-sm btn-secondary flex-1"
                  (click)="openPriceModal(product)"
                >
                  <app-icon name="dollar" [size]="16" />
                  Update Price
                </button>
                <button
                  class="btn btn-sm btn-primary flex-1"
                  (click)="openDeliveryModal(product)"
                >
                  <app-icon name="plus" [size]="16" />
                  Delivery
                </button>
              </div>

              <!-- Last Delivery Info -->
              @if (product.lastDelivery) {
                <div class="text-xs" style="color: var(--color-stone-500);">
                  Last delivery: {{ formatDate(product.lastDelivery) }}
                  ({{ product.lastDeliveryAmount?.toLocaleString() }} gal)
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Update Price Modal -->
    <app-modal
      [isOpen]="showPriceModal()"
      [title]="'Update Fuel Price'"
      [size]="'sm'"
      (closed)="closePriceModal()"
    >
      @if (selectedProduct()) {
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
              {{ selectedProduct()!.name }}
            </label>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
              Regular Price (per gallon)
            </label>
            <input
              type="number"
              [(ngModel)]="newPrice"
              step="0.001"
              class="input w-full"
              placeholder="0.000"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
              Cash Price (per gallon) - Optional
            </label>
            <input
              type="number"
              [(ngModel)]="newCashPrice"
              step="0.001"
              class="input w-full"
              placeholder="0.000"
            />
          </div>
        </div>

        <div slot="footer">
          <button class="btn btn-ghost" (click)="closePriceModal()">Cancel</button>
          <button
            class="btn btn-primary"
            (click)="updatePrice()"
            [disabled]="!newPrice || newPrice <= 0"
          >
            Update
          </button>
        </div>
      }
    </app-modal>

    <!-- Record Delivery Modal -->
    <app-modal
      [isOpen]="showDeliveryModal()"
      [title]="'Record Fuel Delivery'"
      [size]="'md'"
      (closed)="closeDeliveryModal()"
    >
      <div class="space-y-4">
        @if (!selectedProduct()) {
          <div>
            <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
              Select Fuel Product
            </label>
            <select class="input w-full" [(ngModel)]="deliveryProductId">
              <option value="">-- Select --</option>
              @for (product of fuelService.fuelProducts(); track product._id) {
                <option [value]="product._id">{{ product.name }} (Tank #{{ product.tankNumber }})</option>
              }
            </select>
          </div>
        } @else {
          <div>
            <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
              Fuel Product
            </label>
            <p class="text-sm font-medium" style="color: var(--color-stone-900);">
              {{ selectedProduct()!.name }} (Tank #{{ selectedProduct()!.tankNumber }})
            </p>
          </div>
        }

        <div>
          <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
            Gallons Delivered
          </label>
          <input
            type="number"
            [(ngModel)]="deliveryAmount"
            step="1"
            class="input w-full"
            placeholder="0"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
            Cost per Gallon
          </label>
          <input
            type="number"
            [(ngModel)]="deliveryCost"
            step="0.01"
            class="input w-full"
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
            Delivery Notes
          </label>
          <textarea
            [(ngModel)]="deliveryNotes"
            rows="3"
            class="input w-full"
            placeholder="Supplier, invoice number, etc..."
          ></textarea>
        </div>
      </div>

      <div slot="footer">
        <button class="btn btn-ghost" (click)="closeDeliveryModal()">Cancel</button>
        <button
          class="btn btn-primary"
          (click)="recordDelivery()"
          [disabled]="!deliveryAmount || deliveryAmount <= 0 || (!selectedProduct() && !deliveryProductId)"
        >
          Record Delivery
        </button>
      </div>
    </app-modal>
  `,
  styles: [`
    .input {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--color-stone-300);
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }

    .input:focus {
      outline: none;
      border-color: var(--color-blue-500);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  `]
})
export class FuelComponent implements OnInit {
  fuelService = inject(FuelService);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);

  lowLevelProducts = signal<FuelProduct[]>([]);

  // Price Modal
  showPriceModal = signal(false);
  selectedProduct = signal<FuelProduct | null>(null);
  newPrice: number = 0;
  newCashPrice: number = 0;

  // Delivery Modal
  showDeliveryModal = signal(false);
  deliveryProductId: string = '';
  deliveryAmount: number = 0;
  deliveryCost: number = 0;
  deliveryNotes: string = '';

  ngOnInit() {
    this.loadFuelProducts();
  }

  loadFuelProducts() {
    this.loadingService.show();
    this.fuelService.loadFuelProducts().subscribe({
      next: () => {
        this.checkLowLevels();
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load fuel products');
        console.error('Error loading fuel products:', error);
        this.loadingService.hide();
      }
    });
  }

  checkLowLevels() {
    this.fuelService.getLowLevelProducts().subscribe({
      next: (products) => {
        this.lowLevelProducts.set(products);
      },
      error: (error) => {
        console.error('Error checking low levels:', error);
      }
    });
  }

  isLowLevel(product: FuelProduct): boolean {
    return this.lowLevelProducts().some(p => p._id === product._id);
  }

  getTankPercentage(product: FuelProduct): number {
    if (!product.currentStock || !product.tankCapacity) return 0;
    return Math.round((product.currentStock / product.tankCapacity) * 100);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Price Modal Methods
  openPriceModal(product: FuelProduct) {
    this.selectedProduct.set(product);
    this.newPrice = product.pricePerGallon || 0;
    this.newCashPrice = product.cashPricePerGallon || 0;
    this.showPriceModal.set(true);
  }

  closePriceModal() {
    this.showPriceModal.set(false);
    this.selectedProduct.set(null);
    this.newPrice = 0;
    this.newCashPrice = 0;
  }

  updatePrice() {
    const product = this.selectedProduct();
    if (!product || !this.newPrice) return;

    this.loadingService.show();
    this.fuelService.updatePrice(product._id, this.newPrice, this.newCashPrice || undefined).subscribe({
      next: () => {
        this.toastService.success('Price updated successfully');
        this.loadFuelProducts();
        this.closePriceModal();
      },
      error: (error) => {
        this.toastService.error('Failed to update price');
        console.error('Error updating price:', error);
        this.loadingService.hide();
      }
    });
  }

  // Delivery Modal Methods
  openDeliveryModal(product: FuelProduct | null) {
    this.selectedProduct.set(product);
    this.deliveryProductId = product?._id || '';
    this.deliveryAmount = 0;
    this.deliveryCost = 0;
    this.deliveryNotes = '';
    this.showDeliveryModal.set(true);
  }

  closeDeliveryModal() {
    this.showDeliveryModal.set(false);
    this.selectedProduct.set(null);
    this.deliveryProductId = '';
    this.deliveryAmount = 0;
    this.deliveryCost = 0;
    this.deliveryNotes = '';
  }

  recordDelivery() {
    const productId = this.selectedProduct()?._id || this.deliveryProductId;
    if (!productId || !this.deliveryAmount) return;

    this.loadingService.show();
    this.fuelService.recordDelivery(productId, {
      amount: this.deliveryAmount,
      cost: this.deliveryCost,
      notes: this.deliveryNotes
    }).subscribe({
      next: () => {
        this.toastService.success('Delivery recorded successfully');
        this.loadFuelProducts();
        this.closeDeliveryModal();
      },
      error: (error) => {
        this.toastService.error('Failed to record delivery');
        console.error('Error recording delivery:', error);
        this.loadingService.hide();
      }
    });
  }
}

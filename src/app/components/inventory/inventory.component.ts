import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight" style="color: var(--color-slate-900);">Inventory Management</h1>
          <p class="mt-1 text-sm" style="color: var(--color-slate-500);">Track and manage your product stock levels</p>
        </div>
      </div>

      <!-- Products Table -->
      <div class="bg-white rounded-xl border" style="border-color: var(--color-slate-200); box-shadow: var(--shadow-sm);">
        <!-- Table Header -->
        <div class="px-6 py-5 border-b" style="border-color: var(--color-slate-200);">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg" style="background: var(--color-slate-100); color: var(--color-slate-600);">
              <app-icon name="package" [size]="20"></app-icon>
            </div>
            <h2 class="text-lg font-semibold" style="color: var(--color-slate-900);">Products</h2>
          </div>
        </div>

        <!-- Table Content -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y" style="border-color: var(--color-slate-200);">
            <thead>
              <tr style="background: var(--color-slate-50);">
                <th class="px-6 py-4 text-left text-xs font-medium tracking-wider" style="color: var(--color-slate-600);">
                  PRODUCT
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium tracking-wider" style="color: var(--color-slate-600);">
                  CATEGORY
                </th>
                <th class="px-6 py-4 text-right text-xs font-medium tracking-wider" style="color: var(--color-slate-600);">
                  PRICE
                </th>
                <th class="px-6 py-4 text-right text-xs font-medium tracking-wider" style="color: var(--color-slate-600);">
                  STOCK
                </th>
                <th class="px-6 py-4 text-center text-xs font-medium tracking-wider" style="color: var(--color-slate-600);">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody class="divide-y" style="border-color: var(--color-slate-200);">
              @for (product of products(); track product.id) {
                <tr class="transition-colors hover:bg-slate-50" style="--tw-bg-opacity: 0.5;">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: var(--color-slate-100);">
                        <app-icon name="package" [size]="18" customClass="text-slate-500"></app-icon>
                      </div>
                      <div>
                        <div class="font-medium" style="color: var(--color-slate-900);">{{ product.name }}</div>
                        <div class="text-xs" style="color: var(--color-slate-500);">SKU: {{ product.barcode }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          style="background: var(--color-slate-100); color: var(--color-slate-700);">
                      {{ product.category }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="font-medium" style="color: var(--color-slate-900);">\${{ product.price.toFixed(2) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="flex flex-col items-end gap-1">
                      <span class="font-medium" style="color: var(--color-slate-900);">{{ product.stockQuantity }}</span>
                      <span class="text-xs" style="color: var(--color-slate-500);">{{ product.unit }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    @if (product.stockQuantity <= product.minStockLevel) {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                            style="background: var(--color-error-light); color: var(--color-error);">
                        <app-icon name="alert" [size]="14"></app-icon>
                        Low Stock
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                            style="background: var(--color-success-light); color: var(--color-success);">
                        <app-icon name="check" [size]="14"></app-icon>
                        In Stock
                      </span>
                    }
                  </td>
                </tr>
              }
              @empty {
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center">
                    <div class="flex flex-col items-center gap-3">
                      <div class="w-16 h-16 rounded-full flex items-center justify-center" style="background: var(--color-slate-100);">
                        <app-icon name="package" [size]="32" customClass="text-slate-400"></app-icon>
                      </div>
                      <div>
                        <p class="font-medium" style="color: var(--color-slate-900);">No products found</p>
                        <p class="text-sm mt-1" style="color: var(--color-slate-500);">Start by adding products to your inventory</p>
                      </div>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Table Footer with Summary -->
        @if (products().length > 0) {
          <div class="px-6 py-4 border-t" style="border-color: var(--color-slate-200); background: var(--color-slate-50);">
            <div class="flex items-center justify-between text-sm">
              <span style="color: var(--color-slate-600);">
                Total Products: <span class="font-medium" style="color: var(--color-slate-900);">{{ products().length }}</span>
              </span>
              <span style="color: var(--color-slate-600);">
                Low Stock Items: <span class="font-medium" style="color: var(--color-error);">{{ getLowStockCount() }}</span>
              </span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    /* Hover state for table rows */
    tr:hover .text-slate-500 {
      color: var(--color-slate-600);
    }

    /* Smooth transitions */
    tr, span, div {
      transition: all var(--transition-fast);
    }

    /* Custom scrollbar for table */
    .overflow-x-auto::-webkit-scrollbar {
      height: 6px;
    }

    .overflow-x-auto::-webkit-scrollbar-track {
      background: var(--color-slate-100);
      border-radius: 3px;
    }

    .overflow-x-auto::-webkit-scrollbar-thumb {
      background: var(--color-slate-300);
      border-radius: 3px;
    }

    .overflow-x-auto::-webkit-scrollbar-thumb:hover {
      background: var(--color-slate-400);
    }

    /* Responsive table adjustments */
    @media (max-width: 768px) {
      .px-6 {
        padding-left: 1rem;
        padding-right: 1rem;
      }

      th, td {
        padding-left: 0.75rem !important;
        padding-right: 0.75rem !important;
      }
    }
  `]
})
export class InventoryComponent {
  private productService = inject(ProductService);
  products = this.productService.products;

  getLowStockCount(): number {
    return this.products().filter(p => p.stockQuantity <= p.minStockLevel).length;
  }
}

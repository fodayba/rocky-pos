import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-gray-800">Inventory Management</h1>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">Products</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-2 text-left">Product</th>
                <th class="px-4 py-2 text-left">Category</th>
                <th class="px-4 py-2 text-right">Price</th>
                <th class="px-4 py-2 text-right">Stock</th>
                <th class="px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (product of products(); track product.id) {
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3">{{ product.name }}</td>
                  <td class="px-4 py-3">{{ product.category }}</td>
                  <td class="px-4 py-3 text-right">\${{ product.price.toFixed(2) }}</td>
                  <td class="px-4 py-3 text-right">{{ product.stockQuantity }}</td>
                  <td class="px-4 py-3 text-center">
                    @if (product.stockQuantity <= product.minStockLevel) {
                      <span class="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Low</span>
                    } @else {
                      <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">OK</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class InventoryComponent {
  private productService = inject(ProductService);
  products = this.productService.products;
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuelService } from '../../services/fuel.service';

@Component({
  selector: 'app-fuel',
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-gray-800">Fuel Management</h1>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @for (fuel of fuelProducts(); track fuel.id) {
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-gray-800">{{ fuel.name }}</h3>
              <span class="text-3xl">⛽</span>
            </div>

            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-600">Price per Gallon</p>
                <p class="text-2xl font-bold text-blue-600">\${{ fuel.pricePerGallon.toFixed(2) }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-600">Current Stock</p>
                <p class="text-lg font-semibold">{{ fuel.currentStock }} gallons</p>
                <div class="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div
                    class="h-3 rounded-full"
                    [class.bg-green-500]="fuel.currentStock > fuel.minLevel * 2"
                    [class.bg-yellow-500]="fuel.currentStock <= fuel.minLevel * 2 && fuel.currentStock > fuel.minLevel"
                    [class.bg-red-500]="fuel.currentStock <= fuel.minLevel"
                    [style.width.%]="(fuel.currentStock / fuel.tankCapacity) * 100"
                  ></div>
                </div>
                <p class="text-xs text-gray-500 mt-1">Capacity: {{ fuel.tankCapacity }} gallons</p>
              </div>

              @if (fuel.currentStock <= fuel.minLevel) {
                <div class="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded-lg text-sm font-semibold">
                  ⚠️ Low Level Alert
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class FuelComponent {
  private fuelService = inject(FuelService);
  fuelProducts = this.fuelService.fuelProducts;
}

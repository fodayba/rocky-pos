import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuelService } from '../../services/fuel.service';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-fuel',
  imports: [CommonModule, IconComponent],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>Fuel Management</h1>
        <p class="subtitle">Monitor fuel levels and tank capacity</p>
      </div>

      <!-- Fuel Cards Grid -->
      <div class="fuel-grid">
        @for (fuel of fuelProducts(); track fuel.id) {
          <div class="fuel-card">
            <!-- Card Header -->
            <div class="card-header">
              <div class="title-section">
                <div class="icon-wrapper">
                  <app-icon name="droplet" [size]="20" customClass="icon" />
                </div>
                <h3 class="fuel-name">{{ fuel.name }}</h3>
              </div>
              @if (fuel.currentStock <= fuel.minLevel) {
                <div class="alert-badge">
                  <app-icon name="alert" [size]="14" customClass="alert-icon" />
                  <span>Low</span>
                </div>
              }
            </div>

            <!-- Card Content -->
            <div class="card-content">
              <!-- Price -->
              <div class="info-block">
                <span class="label">Price per Gallon</span>
                <span class="price">\${{ fuel.pricePerGallon.toFixed(2) }}</span>
              </div>

              <!-- Stock Level -->
              <div class="info-block">
                <div class="stock-header">
                  <span class="label">Current Stock</span>
                  <span class="stock-value">{{ fuel.currentStock }} gal</span>
                </div>

                <!-- Progress Bar -->
                <div class="progress-container">
                  <div
                    class="progress-bar"
                    [class.progress-high]="fuel.currentStock > fuel.minLevel * 2"
                    [class.progress-medium]="fuel.currentStock <= fuel.minLevel * 2 && fuel.currentStock > fuel.minLevel"
                    [class.progress-low]="fuel.currentStock <= fuel.minLevel"
                    [style.width.%]="(fuel.currentStock / fuel.tankCapacity) * 100"
                  >
                    <div class="progress-shine"></div>
                  </div>
                </div>

                <!-- Capacity Info -->
                <div class="capacity-info">
                  <span class="capacity-label">Tank Capacity</span>
                  <span class="capacity-value">{{ fuel.tankCapacity }} gal</span>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: var(--space-xl);
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      margin-bottom: var(--space-2xl);
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--color-slate-900);
      letter-spacing: -0.025em;
      margin-bottom: var(--space-xs);
    }

    .subtitle {
      font-size: 0.9375rem;
      color: var(--color-slate-500);
      font-weight: 400;
    }

    /* Grid Layout */
    .fuel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-lg);
    }

    @media (max-width: 768px) {
      .container {
        padding: var(--space-md);
      }

      .fuel-grid {
        grid-template-columns: 1fr;
        gap: var(--space-md);
      }

      .header h1 {
        font-size: 1.75rem;
      }
    }

    /* Fuel Card */
    .fuel-card {
      background: white;
      border: 1px solid var(--color-slate-200);
      border-radius: var(--radius-xl);
      padding: var(--space-lg);
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-base);
    }

    .fuel-card:hover {
      box-shadow: var(--shadow-md);
      border-color: var(--color-slate-300);
      transform: translateY(-1px);
    }

    /* Card Header */
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-lg);
      padding-bottom: var(--space-md);
      border-bottom: 1px solid var(--color-slate-100);
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--color-teal-50), var(--color-slate-50));
      border: 1px solid var(--color-teal-100);
      border-radius: var(--radius-lg);
      color: var(--color-teal-600);
    }

    .fuel-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-slate-900);
      letter-spacing: -0.015em;
    }

    /* Alert Badge */
    .alert-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: var(--color-error-light);
      border: 1px solid color-mix(in srgb, var(--color-error) 20%, transparent);
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--color-error);
      letter-spacing: 0.01em;
    }

    .alert-badge :global(.alert-icon) {
      color: var(--color-error);
    }

    /* Card Content */
    .card-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }

    .info-block {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--color-slate-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Price Display */
    .price {
      font-size: 2rem;
      font-weight: 600;
      color: var(--color-slate-900);
      letter-spacing: -0.025em;
      line-height: 1;
    }

    /* Stock Header */
    .stock-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stock-value {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--color-slate-700);
    }

    /* Progress Bar */
    .progress-container {
      position: relative;
      width: 100%;
      height: 12px;
      background: var(--color-slate-100);
      border-radius: 999px;
      overflow: hidden;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .progress-bar {
      position: relative;
      height: 100%;
      border-radius: 999px;
      transition: width var(--transition-slow), background-color var(--transition-base);
      overflow: hidden;
    }

    .progress-high {
      background: linear-gradient(90deg, var(--color-success), color-mix(in srgb, var(--color-success) 85%, white));
    }

    .progress-medium {
      background: linear-gradient(90deg, var(--color-warning), color-mix(in srgb, var(--color-warning) 85%, white));
    }

    .progress-low {
      background: linear-gradient(90deg, var(--color-error), color-mix(in srgb, var(--color-error) 85%, white));
    }

    .progress-shine {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), transparent);
      border-radius: 999px 999px 0 0;
    }

    /* Capacity Info */
    .capacity-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: var(--space-xs);
    }

    .capacity-label,
    .capacity-value {
      font-size: 0.75rem;
      color: var(--color-slate-500);
    }

    .capacity-value {
      font-weight: 500;
      color: var(--color-slate-600);
    }
  `]
})
export class FuelComponent {
  private fuelService = inject(FuelService);
  fuelProducts = this.fuelService.fuelProducts;
}

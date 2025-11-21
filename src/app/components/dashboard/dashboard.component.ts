import { Component, computed, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ShiftService } from '../../services/shift.service';
import { TransactionService } from '../../services/transaction.service';
import { ProductService } from '../../services/product.service';
import { FuelService } from '../../services/fuel.service';
import { IconComponent } from '../shared/icon/icon.component';
import { ShiftSummary } from '../../models';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private shiftService = inject(ShiftService);
  private transactionService = inject(TransactionService);
  private productService = inject(ProductService);
  private fuelService = inject(FuelService);

  currentUser = this.authService.currentUser;
  currentShift = this.shiftService.currentShift;
  hasActiveShift = this.shiftService.hasActiveShift;

  private shiftSummarySignal = signal<ShiftSummary | null>(null);
  shiftSummary = this.shiftSummarySignal.asReadonly();

  products = this.productService.products;
  fuelProducts = this.fuelService.fuelProducts;

  lowStockProducts = computed(() => this.productService.getLowStockProducts());
  lowFuelProducts = computed(() => this.fuelService.getLowFuelProducts());

  todayTransactions = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.transactionService.getTransactionsByDateRange(today, tomorrow);
  });

  todayRevenue = computed(() => {
    return this.todayTransactions().reduce((sum: number, t: any) => sum + t.total, 0);
  });

  ngOnInit(): void {
    // Load shift summary
    this.shiftService.getCurrentShiftSummary().subscribe(summary => {
      this.shiftSummarySignal.set(summary);
    });
  }
}

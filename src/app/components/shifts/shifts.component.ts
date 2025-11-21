import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftService } from '../../services/shift.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from '../shared/icon/icon.component';
import { ShiftSummary } from '../../models';

@Component({
  selector: 'app-shifts',
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './shifts.component.html',
  styleUrl: './shifts.component.css'
})
export class ShiftsComponent implements OnInit {
  private shiftService = inject(ShiftService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // Make global functions available to template
  parseFloat = parseFloat;

  currentShift = this.shiftService.currentShift;
  hasActiveShift = this.shiftService.hasActiveShift;
  currentUser = this.authService.currentUser;

  private summarySignal = signal<ShiftSummary | null>(null);
  summary = this.summarySignal.asReadonly();

  openingBalance = signal(0);
  actualCash = signal(0);
  notes = signal('');

  showOpenModal = signal(false);
  showCloseModal = signal(false);

  openShiftModal(): void {
    this.showOpenModal.set(true);
    this.openingBalance.set(0);
  }

  closeShiftModal(): void {
    const shift = this.currentShift();
    if (shift) {
      this.showCloseModal.set(true);
      this.actualCash.set(shift.openingBalance);
      this.notes.set('');
    }
  }

  startShift(): void {
    const user = this.currentUser();
    if (!user) return;

    this.shiftService.openShift(
      user.id,
      `${user.firstName} ${user.lastName}`,
      this.openingBalance()
    ).subscribe({
      next: () => {
        this.showOpenModal.set(false);
        this.toastService.success('Shift started successfully!');
      },
      error: (error) => {
        this.toastService.error(error.message);
      }
    });
  }

  endShift(): void {
    this.shiftService.closeShift(
      this.actualCash(),
      this.notes() || undefined
    ).subscribe({
      next: (closedShift) => {
        this.showCloseModal.set(false);
        const message = `Shift closed! Expected: $${closedShift.expectedCash?.toFixed(2)}, Actual: $${closedShift.actualCash?.toFixed(2)}, Variance: $${closedShift.variance?.toFixed(2)}`;
        this.toastService.success(message);
      },
      error: (error) => {
        this.toastService.error(error.message);
      }
    });
  }

  getShiftSummary() {
    this.shiftService.getCurrentShiftSummary().subscribe(summary => {
      this.summarySignal.set(summary);
    });
  }

  ngOnInit() {
    this.getShiftSummary();
  }
}

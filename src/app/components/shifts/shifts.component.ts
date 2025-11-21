import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftService } from '../../services/shift.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-shifts',
  imports: [CommonModule, FormsModule],
  templateUrl: './shifts.component.html',
  styleUrl: './shifts.component.css'
})
export class ShiftsComponent {
  private shiftService = inject(ShiftService);
  private authService = inject(AuthService);

  // Make global functions available to template
  parseFloat = parseFloat;

  currentShift = this.shiftService.currentShift;
  hasActiveShift = this.shiftService.hasActiveShift;
  currentUser = this.authService.currentUser;

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

    try {
      this.shiftService.openShift(
        user.id,
        `${user.firstName} ${user.lastName}`,
        this.openingBalance()
      );
      this.showOpenModal.set(false);
      alert('Shift started successfully!');
    } catch (error) {
      alert((error as Error).message);
    }
  }

  endShift(): void {
    try {
      const closedShift = this.shiftService.closeShift(
        this.actualCash(),
        this.notes() || undefined
      );

      if (closedShift) {
        this.showCloseModal.set(false);
        alert(
          `Shift closed successfully!\n\n` +
          `Expected Cash: $${closedShift.expectedCash?.toFixed(2)}\n` +
          `Actual Cash: $${closedShift.actualCash?.toFixed(2)}\n` +
          `Variance: $${closedShift.variance?.toFixed(2)}`
        );
      }
    } catch (error) {
      alert((error as Error).message);
    }
  }

  getShiftSummary() {
    return this.shiftService.getCurrentShiftSummary();
  }
}

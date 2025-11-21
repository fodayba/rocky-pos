import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, IconComponent],
  template: `
    <div class="max-w-7xl mx-auto space-y-8">
      <h1 class="text-3xl font-semibold tracking-tight" style="color: var(--color-slate-900);">Reports & Analytics</h1>
      <div class="bg-white rounded-xl p-16 text-center border" style="border-color: var(--color-slate-200); box-shadow: var(--shadow-sm);">
        <div class="inline-flex p-6 rounded-2xl mb-6" style="background: var(--color-slate-100);">
          <app-icon name="chart" [size]="48" customClass="text-slate-400"></app-icon>
        </div>
        <h2 class="text-2xl font-semibold mb-3" style="color: var(--color-slate-900);">Reports & Analytics</h2>
        <p style="color: var(--color-slate-500);">Detailed reports and analytics coming soon</p>
      </div>
    </div>
  `
})
export class ReportsComponent {}
